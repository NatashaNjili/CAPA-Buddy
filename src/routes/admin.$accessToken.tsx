import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";

import logo from "@/assets/capabuddy-logo.png.asset.json";
import { Markdown } from "@/components/Markdown";
import { PinGate } from "@/components/PinGate";
import { ThemePicker } from "@/components/ThemePicker";
import {
  deleteFaq,
  getAdminDashboard,
  saveFaq,
  saveReferenceDoc,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/$accessToken")({
  head: () => ({
    meta: [
      { title: "CAPA-Buddy admin" },
      { name: "description", content: "Staff-only CAPA-Buddy management area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Dashboard = Awaited<ReturnType<typeof getAdminDashboard>>;
type Faq = Dashboard["faqs"][number];

const TABS = ["FAQs", "Suggestions", "Unanswered", "Reference doc", "Stats"] as const;
type Tab = (typeof TABS)[number];

function AdminPage() {
  const { accessToken } = Route.useParams();
  const load = useServerFn(getAdminDashboard);
  const upsertFaq = useServerFn(saveFaq);
  const removeFaq = useServerFn(deleteFaq);
  const saveDoc = useServerFn(saveReferenceDoc);

  const [pin, setPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Dashboard | null>(null);
  const [tab, setTab] = useState<Tab>("FAQs");
  const [editing, setEditing] = useState<Partial<Faq> | null>(null);
  const [docDraft, setDocDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(
    async (value: string) => {
      const res = await load({ data: { accessToken, pin: value } });
      setData(res);
      setDocDraft(res.referenceDoc?.content ?? "");
      return res;
    },
    [accessToken, load],
  );

  useEffect(() => {
    if (pin) refresh(pin).catch(console.error);
  }, [pin, refresh]);

  if (!pin || !data)
    return (
      <PinGate
        error={pinError}
        busy={busy}
        onSubmit={async (value) => {
          setBusy(true);
          setPinError(null);
          try {
            await refresh(value);
            setPin(value);
          } catch (e) {
            setPinError(e instanceof Error ? e.message : "That PIN is not correct.");
          } finally {
            setBusy(false);
          }
        }}
      />
    );

  const run = async (fn: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await fn();
      await refresh(pin);
      setNotice(message);
      setTimeout(() => setNotice(null), 3000);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="CAPA-Buddy" className="h-9 w-auto rounded-md" />
            <span className="text-sm text-muted-foreground">
              Signed in as <strong className="text-foreground">{data.admin.name}</strong> ·{" "}
              {data.admin.role}
            </span>
          </div>
          <ThemePicker />
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                tab === t ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              {t}
              {t === "Suggestions" && data.suggestions.length > 0 && ` (${data.suggestions.length})`}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        {notice && (
          <div className="rounded-xl border border-border bg-secondary px-4 py-3 font-semibold text-secondary-foreground">
            {notice}
          </div>
        )}

        {tab === "FAQs" && (
          <section className="space-y-4">
            <button
              onClick={() => setEditing({ category: "General", question: "", answer: "" })}
              className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground"
            >
              + Add FAQ
            </button>

            {editing && (
              <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
                <input
                  value={editing.category ?? ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  placeholder="Category"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                />
                <input
                  value={editing.question ?? ""}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  placeholder="Question / topic name"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                />
                <textarea
                  value={editing.answer ?? ""}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  rows={10}
                  placeholder="Answer (markdown supported)"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(
                        () =>
                          upsertFaq({
                            data: {
                              accessToken,
                              pin,
                              ...(editing.id ? { id: editing.id } : {}),
                              category: editing.category || "General",
                              question: editing.question || "",
                              answer: editing.answer || "",
                            },
                          }),
                        "FAQ saved.",
                      ).then(() => setEditing(null))
                    }
                    className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground disabled:opacity-40"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="rounded-lg border border-border px-4 py-2 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {data.faqs.map((f) => (
              <article key={f.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-accent">
                  {f.category}
                </p>
                <h3 className="text-lg font-bold">{f.question}</h3>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    View answer
                  </summary>
                  <div className="mt-2">
                    <Markdown>{f.answer}</Markdown>
                  </div>
                </details>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setEditing(f)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      run(() => removeFaq({ data: { accessToken, pin, id: f.id } }), "FAQ deleted.")
                    }
                    className="rounded-lg border border-destructive px-3 py-1.5 text-sm font-semibold text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === "Suggestions" && (
          <section className="space-y-3">
            {data.suggestions.length === 0 && (
              <p className="text-muted-foreground">Nothing waiting for approval right now.</p>
            )}
            {data.suggestions.map((s) => (
              <article key={s.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-semibold">{s.representative_question_text}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Asked {s.ask_count} times · last {new Date(s.last_asked_at).toLocaleString()}
                </p>
                <a
                  href={`/approve/${s.approval_token}?a=${accessToken}`}
                  className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground"
                >
                  Answer this
                </a>
              </article>
            ))}
          </section>
        )}

        {tab === "Unanswered" && (
          <section className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="p-3">Question</th>
                  <th className="p-3">Routed to</th>
                  <th className="p-3">When</th>
                </tr>
              </thead>
              <tbody>
                {data.unanswered.map((q) => (
                  <tr key={q.id} className="border-b border-border/60">
                    <td className="p-3">{q.raw_question_text}</td>
                    <td className="p-3">{q.routed_role}</td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(q.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tab === "Reference doc" && (
          <section className="space-y-3">
            <textarea
              value={docDraft}
              onChange={(e) => setDocDraft(e.target.value)}
              rows={24}
              className="w-full rounded-2xl border border-input bg-card p-4 font-mono text-sm"
            />
            <button
              disabled={busy}
              onClick={() =>
                run(
                  () => saveDoc({ data: { accessToken, pin, content: docDraft } }),
                  "Reference document saved.",
                )
              }
              className="rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground disabled:opacity-40"
            >
              Save document
            </button>
          </section>
        )}

        {tab === "Stats" && (
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Stat label="Questions this week" value={data.stats.totalThisWeek} />
              <Stat label="Thumbs down this week" value={data.stats.thumbsDown} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 font-bold">Top 5 most-asked</h3>
              <ol className="list-decimal space-y-1 pl-5">
                {data.stats.top.map((t) => (
                  <li key={t.label}>
                    {t.label} — <strong>{t.count}</strong>
                  </li>
                ))}
                {data.stats.top.length === 0 && (
                  <p className="text-muted-foreground">No questions logged yet.</p>
                )}
              </ol>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  );
}