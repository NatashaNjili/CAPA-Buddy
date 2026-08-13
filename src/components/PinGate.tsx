import { useState } from "react";
import logo from "@/assets/capabuddy-logo.png.asset.json";

export function PinGate({
  onSubmit,
  error,
  busy,
}: {
  onSubmit: (pin: string) => void;
  error?: string | null;
  busy?: boolean;
}) {
  const [pin, setPin] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(pin);
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-[var(--shadow-soft)]"
      >
        <img src={logo.url} alt="CAPA-Buddy" className="mb-6 h-10 w-auto rounded-md" />
        <h1 className="text-xl font-bold">Enter your personal PIN</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page is private. Use the PIN emailed to you.
        </p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoFocus
          placeholder="e.g. Name123"
          className="mt-5 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg outline-none focus:border-accent"
        />
        {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy || pin.trim().length < 4}
          className="mt-5 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}