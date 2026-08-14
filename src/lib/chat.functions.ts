import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const AskInput = z.object({ question: z.string().min(1).max(1000) });
const FeedbackInput = z.object({
  logId: z.string().uuid(),
  feedback: z.enum(["up", "down"]),
});
const RouteEmailInput = z.object({
  logId: z.string().uuid(),
  question: z.string().min(1).max(1000),
  role: z.string().min(1).max(60),
});

export type MainTopic = { id: string; category: string; answer: string };

export const getMainTopics = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("faqs")
    .select("id, category, answer")
    .eq("is_main_topic", true)
    .order("sort_order");
  return (data ?? []) as MainTopic[];
});

export type AskResult = {
  logId: string;
  kind: "faq" | "reference" | "routed";
  answer: string;
  faqId?: string;
  faqCategory?: string;
  role?: string;
  contacts?: { name: string; email: string }[];
};

export const askCapaBuddy = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AskInput.parse(d))
  .handler(async ({ data }): Promise<AskResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { aiJson } = await import("./ai.server");
    const { ROLE_DESCRIPTIONS, notifyAdminsOfSuggestion, baseUrlFromRequest } = await import(
      "./capa.server"
    );

    const [{ data: faqs }, { data: docRows }, { data: admins }] = await Promise.all([
      supabaseAdmin.from("faqs").select("id, category, question, answer"),
      supabaseAdmin.from("reference_document").select("content").limit(1),
      supabaseAdmin.from("admins").select("id, name, email, role, access_token"),
    ]);

    const faqList = faqs ?? [];
    const referenceDoc = docRows?.[0]?.content ?? "";

    const system = `You are CAPA-Buddy, a friendly helper for young people on a CAPACITI AI training programme. Many have never used a computer before, so answers must be short, warm, plain-English and step-by-step.

Decide how to handle the candidate's question, in this strict order:
1. If it clearly matches one of the FAQ topics, choose "faq" and give its id.
2. Otherwise, if the reference document contains the answer, choose "reference" and write the answer yourself in beginner-friendly language (markdown allowed). Never invent facts.
3. Otherwise choose "route" and pick the best role from: IT Support, Team Development Coach, Digital Tech Mentor, HR.

Role responsibilities:
${Object.entries(ROLE_DESCRIPTIONS)
  .map(([r, d]) => `- ${r}: ${d}`)
  .join("\n")}

Also return "intent_key": a short lowercase snake_case label of the underlying intent (e.g. "certificate_download"), so that differently worded questions with the same meaning get the same key.

Respond ONLY as JSON: {"mode":"faq|reference|route","faq_id":string|null,"answer":string|null,"role":string|null,"intent_key":string}`;

    const user = `FAQ TOPICS:\n${faqList
      .map((f) => `- id: ${f.id} | category: ${f.category} | topic: ${f.question}`)
      .join("\n")}\n\nREFERENCE DOCUMENT:\n${referenceDoc}\n\nCANDIDATE QUESTION:\n${data.question}`;

    type AiOut = {
      mode: string;
      faq_id: string | null;
      answer: string | null;
      role: string | null;
      intent_key: string;
    };
    let ai: AiOut | null = null;
    try {
      ai = await aiJson<AiOut>(system, user);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI_ERROR";
      if (msg === "RATE_LIMIT")
        throw new Error("CAPA-Buddy is very busy right now. Please try again in a moment.");
      if (msg === "NO_CREDITS")
        throw new Error("CAPA-Buddy is temporarily unavailable. Please tell a staff member.");
      throw new Error("Sorry, something went wrong. Please try asking again.");
    }

    const intentKey = (ai?.intent_key || "general_question").slice(0, 80);
    const matchedFaq = faqList.find((f) => f.id === ai?.faq_id) ?? null;

    let result: AskResult;
    let matchType: string;

    if (ai?.mode === "faq" && matchedFaq) {
      matchType = "faq";
      result = {
        logId: "",
        kind: "faq",
        answer: matchedFaq.answer,
        faqId: matchedFaq.id,
        faqCategory: matchedFaq.category,
      };
    } else if (ai?.mode === "reference" && ai.answer) {
      matchType = "reference_doc";
      result = { logId: "", kind: "reference", answer: ai.answer };
    } else {
      matchType = "routed_unanswered";
      const role =
        ai?.role && ROLE_DESCRIPTIONS[ai.role] ? ai.role : "Team Development Coach";
      const contacts = (admins ?? [])
        .filter((a) => a.role === role)
        .map((a) => ({ name: a.name, email: a.email }));
      const who =
        contacts.length > 0
          ? `\n\nYou can speak to ${contacts
              .map((c) => `**${c.name}** (${c.email})`)
              .join(contacts.length === 2 ? " or " : ", ")}.`
          : "";
      result = {
        logId: "",
        kind: "routed",
        role,
        contacts,
        answer: `I don't have an answer for that one yet, so I don't want to guess. This looks like something the **${role}** team can help with.${who}`,
      };
    }

    const { data: logRow } = await supabaseAdmin
      .from("question_log")
      .insert({
        raw_question_text: data.question,
        match_type: matchType,
        matched_id: matchedFaq?.id ?? null,
        intent_key: intentKey,
        routed_role: result.role ?? null,
      })
      .select("id")
      .single();

    result.logId = logRow?.id ?? "";

    // Repeat-question grouping: only for things that are not already an FAQ.
    if (matchType !== "faq") {
      const { count } = await supabaseAdmin
        .from("question_log")
        .select("id", { count: "exact", head: true })
        .eq("intent_key", intentKey)
        .neq("match_type", "faq");

      const asks = count ?? 1;
      const { data: existing } = await supabaseAdmin
        .from("suggested_questions")
        .select("id, status, approval_token")
        .eq("intent_key", intentKey)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("suggested_questions")
          .update({ ask_count: asks, last_asked_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else if (asks >= 3) {
        const { data: created } = await supabaseAdmin
          .from("suggested_questions")
          .insert({
            representative_question_text: data.question,
            intent_key: intentKey,
            ask_count: asks,
          })
          .select("approval_token")
          .single();
        if (created) {
          const baseUrl = baseUrlFromRequest(getRequest());
          await notifyAdminsOfSuggestion(
            admins ?? [],
            data.question,
            created.approval_token,
            baseUrl,
          );
        }
      }
    }

    return result;
  });

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FeedbackInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("question_log")
      .update({ feedback: data.feedback })
      .eq("id", data.logId);
    return { ok: true };
  });

export const emailQuestionToTeam = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RouteEmailInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendEmail, emailShell } = await import("./email.server");
    const { escapeHtml } = await import("./capa.server");

    const { data: admins } = await supabaseAdmin
      .from("admins")
      .select("name, email, role")
      .eq("role", data.role);

    const recipients = (admins ?? []).map((a) => a.email);
    if (recipients.length === 0) return { sent: false, reason: "no_recipients", recipients };

    const res = await sendEmail(
      recipients,
      `CAPA-Buddy: a candidate needs help (${data.role})`,
      emailShell(
        "A candidate asked for help",
        `<p>CAPA-Buddy could not answer this question, and it looks like a <strong>${escapeHtml(data.role)}</strong> matter:</p>
         <blockquote style="border-left:4px solid #e8623c;margin:16px 0;padding:8px 16px;background:#f7f9ff">${escapeHtml(data.question)}</blockquote>
         <p>Please follow up with the candidate at the programme.</p>`,
      ),
    );
    return { sent: res.sent, reason: "reason" in res ? res.reason : null, recipients };
  });