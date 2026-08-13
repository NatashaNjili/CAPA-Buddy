import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Auth = { accessToken: z.string().min(10), pin: z.string().min(4).max(40) };
const AuthInput = z.object(Auth);

async function verify(accessToken: string, pin: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.rpc("verify_admin_pin", {
    _access_token: accessToken,
    _pin: pin.trim().toLowerCase(),
  });
  const admin = Array.isArray(data) ? data[0] : null;
  if (!admin) throw new Error("That PIN is not correct.");
  return admin as { id: string; name: string; email: string; role: string };
}

export const verifyAdminPin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AuthInput.parse(d))
  .handler(async ({ data }) => verify(data.accessToken, data.pin));

export const getAdminDashboard = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AuthInput.parse(d))
  .handler(async ({ data }) => {
    const admin = await verify(data.accessToken, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();

    const [faqs, suggestions, unanswered, doc, weekLogs] = await Promise.all([
      supabaseAdmin.from("faqs").select("*").order("category"),
      supabaseAdmin
        .from("suggested_questions")
        .select("*")
        .eq("status", "pending")
        .order("last_asked_at", { ascending: false }),
      supabaseAdmin
        .from("question_log")
        .select("*")
        .eq("match_type", "routed_unanswered")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin.from("reference_document").select("*").limit(1).maybeSingle(),
      supabaseAdmin.from("question_log").select("raw_question_text, intent_key, feedback").gte("created_at", weekAgo),
    ]);

    const logs = weekLogs.data ?? [];
    const counts = new Map<string, { label: string; count: number }>();
    for (const l of logs) {
      const key = l.intent_key ?? l.raw_question_text;
      const entry = counts.get(key) ?? { label: l.raw_question_text, count: 0 };
      entry.count += 1;
      counts.set(key, entry);
    }

    return {
      admin,
      faqs: faqs.data ?? [],
      suggestions: suggestions.data ?? [],
      unanswered: unanswered.data ?? [],
      referenceDoc: doc.data ?? null,
      stats: {
        totalThisWeek: logs.length,
        thumbsDown: logs.filter((l) => l.feedback === "down").length,
        top: [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5),
      },
    };
  });

export const saveFaq = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        ...Auth,
        id: z.string().uuid().optional(),
        category: z.string().min(1).max(120),
        question: z.string().min(1).max(400),
        answer: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await verify(data.accessToken, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      category: data.category,
      question: data.question,
      answer: data.answer,
      updated_at: new Date().toISOString(),
    };
    if (data.id) await supabaseAdmin.from("faqs").update(row).eq("id", data.id);
    else await supabaseAdmin.from("faqs").insert(row);
    return { ok: true };
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ ...Auth, id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await verify(data.accessToken, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("faqs").delete().eq("id", data.id);
    return { ok: true };
  });

export const saveReferenceDoc = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ ...Auth, content: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const admin = await verify(data.accessToken, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("reference_document")
      .select("id")
      .limit(1)
      .maybeSingle();
    const row = {
      content: data.content,
      updated_at: new Date().toISOString(),
      updated_by_admin_id: admin.id,
    };
    if (existing) await supabaseAdmin.from("reference_document").update(row).eq("id", existing.id);
    else await supabaseAdmin.from("reference_document").insert(row);
    return { ok: true };
  });

export type SuggestionState =
  | { state: "pending"; question: string }
  | { state: "handled"; by: string; status: string }
  | { state: "invalid" };

export const getSuggestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ approvalToken: z.string().min(10) }).parse(d))
  .handler(async ({ data }): Promise<SuggestionState> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("suggested_questions")
      .select("representative_question_text, status, approved_by_admin_id")
      .eq("approval_token", data.approvalToken)
      .maybeSingle();
    if (!row) return { state: "invalid" };
    if (row.status === "pending") return { state: "pending", question: row.representative_question_text };
    let by = "another admin";
    if (row.approved_by_admin_id) {
      const { data: a } = await supabaseAdmin
        .from("admins")
        .select("name")
        .eq("id", row.approved_by_admin_id)
        .maybeSingle();
      if (a) by = a.name;
    }
    return { state: "handled", by, status: row.status };
  });

export const resolveSuggestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        ...Auth,
        approvalToken: z.string().min(10),
        action: z.enum(["approve", "dismiss"]),
        question: z.string().min(1).max(400),
        answer: z.string().optional(),
        category: z.string().max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const admin = await verify(data.accessToken, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("suggested_questions")
      .select("id, status")
      .eq("approval_token", data.approvalToken)
      .maybeSingle();
    if (!row) throw new Error("This link is no longer valid.");
    if (row.status !== "pending") throw new Error("This question has already been handled.");

    if (data.action === "approve") {
      if (!data.answer?.trim()) throw new Error("Please type an answer first.");
      await supabaseAdmin.from("faqs").insert({
        category: data.category?.trim() || "General",
        question: data.question,
        answer: data.answer,
      });
    }
    await supabaseAdmin
      .from("suggested_questions")
      .update({
        status: data.action === "approve" ? "approved" : "dismissed",
        approved_by_admin_id: admin.id,
        representative_question_text: data.question,
      })
      .eq("id", row.id);
    return { ok: true, admin: admin.name };
  });