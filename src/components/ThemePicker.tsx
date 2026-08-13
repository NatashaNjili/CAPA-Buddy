import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

const THEMES = [
  { id: "capaciti", label: "CAPACITI Navy" },
  { id: "ocean", label: "Ocean" },
  { id: "sunset", label: "Sunset" },
  { id: "forest", label: "Forest" },
  { id: "night", label: "Night" },
];

export function applyStoredTheme() {
  const stored = localStorage.getItem("capabuddy-theme") ?? "capaciti";
  document.documentElement.setAttribute("data-theme", stored);
  return stored;
}

export function ThemePicker() {
  const [theme, setTheme] = useState("capaciti");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTheme(applyStoredTheme());
  }, []);

  const choose = (id: string) => {
    setTheme(id);
    localStorage.setItem("capabuddy-theme", id);
    document.documentElement.setAttribute("data-theme", id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose a colour theme"
        className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground shadow-sm transition hover:bg-secondary"
      >
        <Palette className="size-4" />
        Theme
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => choose(t.id)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-popover-foreground transition hover:bg-secondary ${
                theme === t.id ? "bg-secondary" : ""
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}