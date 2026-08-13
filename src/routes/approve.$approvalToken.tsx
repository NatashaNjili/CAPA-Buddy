import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { PinGate } from "@/components/PinGate";
import { getSuggestion, resolveSuggestion, type SuggestionState } from "@/lib/admin.functions";

export const Route = createFileRoute("/approve/$approvalToken")({
  head: () => ({
    meta: [
      { title: "Approve a question — CAPA-Buddy" },
      { name: "description", content: "Staff-only page for approving a new CAPA-Buddy answer." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({ a: String(search["a"] ?? "") }),
  component: ApprovePage,
});

function ApprovePage() {
  const { approvalToken } = Route.useParams();
  const { a: accessToken } = useSearch({ from: "/approve/$approvalToken" });
  const load = useServerFn(getSuggestion);
  const resolve = useServerFn(resolveSuggestion);

  const [state, setState] = useState<SuggestionState | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("General");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    load({ data: { approvalToken } })
      .then((s) => {
        setState(s);
        if (s.state === "pending") setQuestion(s.question);
      })
      .catch(console.error);
  }, [approvalToken, load]);

  if (!state) return <Centered>Loading…</Centered>;
  if (state.state === "invalid") return <Centered>This link is not valid.</Centered>;
  if (state.state === "handled")
    return (
      <Centered>
        This question has already been {state.status === "approved" ? "approved" : "dismissed"} by{" "}
        <strong>{state.by}</strong>.
      </Centered>
    );
  if (done) return <Centered>{done}</Centered>;

  if (!pin)
    return (
      <PinGate
        error={pinError}
        busy={busy}
        onSubmit={async (value) => {
          setBusy(true);
          setPinError(null);
          try {
            const { verifyAdminPin } = await import("@/lib/admin.functions");
            await verifyAdminPin({ data: { accessToken, pin: value } });
            setPin(value);
          } catch (e) {
            setPinError(e instanceof Error ? e.message : "That PIN is not correct.");
          } finally {
            setBusy(false);
          }
        }}
      />
    );

  const act = async (action: "approve" | "dismiss") => {
    setBusy(true);
    try {
      const res = await resolve({
        data: { accessToken, pin, approvalToken, action, question, answer, category },
      });
      setDone(
        action === "approve"
          ? `Thanks ${res.admin} — this answer is now live in CAPA-Buddy.`
          : "This suggestion has been dismissed.",
      );
    } catch (e) {
      setPinError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h1 className="text-2xl font-bold">Answer this question</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Candidates have asked this several times. Your answer goes live immediately.
        </p>

        <label className="mt-6 block text-sm font-semibold">Question (you can rewrite it)</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-accent"
        />

        <label className="mt-4 block text-sm font-semibold">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-accent"
        />

        <label className="mt-4 block text-sm font-semibold">Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={10}
          placeholder="Type the answer here. Markdown (**bold**, lists) is supported."
          className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:border-accent"
        />

        {pinError && <p className="mt-3 text-sm font-semibold text-destructive">{pinError}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            disabled={busy}
            onClick={() => act("approve")}
            className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            Add to FAQ
          </button>
          <button
            disabled={busy}
            onClick={() => act("dismiss")}
            className="rounded-xl border border-border px-5 py-3 font-semibold transition hover:bg-secondary disabled:opacity-40"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-lg text-foreground">
      <p className="max-w-md">{children}</p>
    </div>
  );
}