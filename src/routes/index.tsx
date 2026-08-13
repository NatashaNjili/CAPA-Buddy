import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Send, ThumbsDown, ThumbsUp, Mail, User2, Loader2 } from "lucide-react";

import logo from "@/assets/capabuddy-logo.png.asset.json";
import { Markdown } from "@/components/Markdown";
import { ThemePicker } from "@/components/ThemePicker";
import {
  askCapaBuddy,
  emailQuestionToTeam,
  getMainTopics,
  submitFeedback,
  type AskResult,
  type MainTopic,
} from "@/lib/chat.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAPA-Buddy — Your CAPACITI programme helper" },
      {
        name: "description",
        content:
          "Ask CAPA-Buddy about your Unit Standard, submissions, Google AI Essentials and your AI Assistant project. Simple answers, step by step.",
      },
      { property: "og:title", content: "CAPA-Buddy — Your CAPACITI programme helper" },
      {
        property: "og:description",
        content: "Friendly, step-by-step help for CAPACITI AI programme candidates.",
      },
    ],
  }),
  component: ChatPage,
});

const OTHER = "Other — Ask CAPA-Buddy";

type Message = {
  id: string;
  from: "bot" | "user";
  text: string;
  showMenu?: boolean;
  logId?: string;
  routed?: AskResult;
};

let counter = 0;
const nid = () => `m${++counter}`;

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<MainTopic[]>([]);
  const [input, setInput] = useState("");
  const [freeMode, setFreeMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});
  const [emailed, setEmailed] = useState<Record<string, boolean>>({});
  const [showContacts, setShowContacts] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const ask = useServerFn(askCapaBuddy);
  const sendFeedback = useServerFn(submitFeedback);
  const emailTeam = useServerFn(emailQuestionToTeam);
  const loadTopics = useServerFn(getMainTopics);

  useEffect(() => {
    loadTopics().then(setTopics).catch(console.error);
  }, [loadTopics]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const push = (m: Omit<Message, "id">) => setMessages((prev) => [...prev, { ...m, id: nid() }]);

  const started = messages.length > 0;

  const start = (greeting: string) => {
    push({ from: "user", text: greeting });
    push({
      from: "bot",
      text: `👋 **Hello! I'm CAPA-Buddy.**\n\nI'm here to help you with your programme. Tap one of the buttons below and I'll explain everything, step by step.`,
      showMenu: true,
    });
    setFreeMode(false);
  };

  const openTopic = (topic: MainTopic) => {
    push({ from: "user", text: topic.category });
    push({ from: "bot", text: topic.answer, showMenu: true });
    setFreeMode(false);
  };

  const openOther = () => {
    push({ from: "user", text: OTHER });
    push({
      from: "bot",
      text: "No problem 😊 — type your question below in your own words and I'll do my best to help.",
    });
    setFreeMode(true);
  };

  const submit = async () => {
    const question = input.trim();
    if (!question || busy) return;
    if (!started) {
      setInput("");
      start(question);
      return;
    }
    setInput("");
    push({ from: "user", text: question });
    setBusy(true);
    try {
      const res = await ask({ data: { question } });
      push({
        from: "bot",
        text: res.answer,
        logId: res.logId,
        routed: res.kind === "routed" ? res : undefined,
        showMenu: res.kind !== "routed",
      });
    } catch (e) {
      push({
        from: "bot",
        text: e instanceof Error ? e.message : "Sorry, something went wrong. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const rate = async (logId: string, feedback: "up" | "down") => {
    setFeedbackGiven((p) => ({ ...p, [logId]: feedback }));
    try {
      await sendFeedback({ data: { logId, feedback } });
    } catch (e) {
      console.error(e);
    }
  };

  const doEmail = async (m: Message) => {
    if (!m.routed?.role) return;
    const question = [...messages].reverse().find((x) => x.from === "user")?.text ?? "";
    setEmailed((p) => ({ ...p, [m.id]: true }));
    try {
      await emailTeam({ data: { logId: m.logId!, question, role: m.routed.role } });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <img src={logo.url} alt="CAPA-Buddy" className="h-10 w-auto rounded-md" />
          <ThemePicker />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="sr-only">CAPA-Buddy — your CAPACITI programme helper</h1>

        {!started && (
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-soft)] sm:p-10">
            <div
              className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl text-3xl"
              style={{ background: "var(--gradient-hero)" }}
            >
              👋
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Hello! I'm CAPA-Buddy</h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
              I answer your questions about the programme. Say hello to begin — it's that easy.
            </p>
            <button
              onClick={() => start("Hi")}
              className="mt-6 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
            >
              Say hi 👋
            </button>
          </section>
        )}

        <div className="space-y-5">
          {messages.map((m) => (
            <div key={m.id}>
              {m.from === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-3xl rounded-br-md bg-primary px-5 py-3 text-lg font-semibold text-primary-foreground">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <img
                    src={logo.url}
                    alt=""
                    className="mt-1 hidden size-9 shrink-0 rounded-lg object-cover object-left sm:block"
                  />
                  <div className="w-full min-w-0">
                    <div className="rounded-3xl rounded-tl-md border border-border bg-bubble-bot px-5 py-4 text-[1.05rem] text-bubble-bot-foreground shadow-sm">
                      <Markdown>{m.text}</Markdown>

                      {m.routed && (
                        <div className="mt-4 space-y-3 border-t border-border pt-4">
                          {showContacts[m.id] && (
                            <div className="rounded-xl bg-secondary p-4 text-secondary-foreground">
                              <p className="mb-2 font-bold">Please contact:</p>
                              <ul className="space-y-1">
                                {m.routed.contacts?.map((c) => (
                                  <li key={c.email} className="flex flex-wrap items-center gap-2">
                                    <User2 className="size-4" />
                                    <span className="font-semibold">{c.name}</span>
                                    <span className="break-all">{c.email}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {emailed[m.id] ? (
                            <p className="font-semibold text-accent">
                              ✅ Sent! The {m.routed.role} team has your question and will get back
                              to you.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setShowContacts((p) => ({ ...p, [m.id]: true }))}
                                className="rounded-full border border-border px-4 py-2 text-base font-semibold transition hover:bg-secondary"
                              >
                                I'll reach out myself
                              </button>
                              <button
                                onClick={() => doEmail(m)}
                                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-base font-bold text-accent-foreground transition hover:opacity-90"
                              >
                                <Mail className="size-4" /> Email this for me
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {m.logId && (
                      <div className="mt-2 flex items-center gap-2 pl-2 text-sm text-muted-foreground">
                        {feedbackGiven[m.logId] ? (
                          <span>Thank you for your feedback 🙏</span>
                        ) : (
                          <>
                            <span>Was this helpful?</span>
                            <button
                              aria-label="Helpful"
                              onClick={() => rate(m.logId!, "up")}
                              className="rounded-full border border-border p-2 transition hover:bg-secondary"
                            >
                              <ThumbsUp className="size-4" />
                            </button>
                            <button
                              aria-label="Not helpful"
                              onClick={() => rate(m.logId!, "down")}
                              className="rounded-full border border-border p-2 transition hover:bg-secondary"
                            >
                              <ThumbsDown className="size-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {m.showMenu && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {topics.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => openTopic(t)}
                            className="rounded-full border-2 border-primary/25 bg-card px-4 py-3 text-base font-bold text-foreground transition hover:border-accent hover:bg-secondary"
                          >
                            {t.category}
                          </button>
                        ))}
                        <button
                          onClick={openOther}
                          className="rounded-full bg-accent px-4 py-3 text-base font-bold text-accent-foreground transition hover:opacity-90"
                        >
                          {OTHER}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 pl-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> CAPA-Buddy is thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <div className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder={
                started
                  ? freeMode
                    ? "Type your question here…"
                    : "Type a message…"
                  : "Type hi to start…"
              }
              className="min-h-[56px] flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-4 text-lg outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="size-6" />
            </button>
          </form>
          <p className="pt-2 text-center text-xs text-muted-foreground">
            AI-generated content may require human review.
          </p>
        </div>
      </div>
    </div>
  );
}
