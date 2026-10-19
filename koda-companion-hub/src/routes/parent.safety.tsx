import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { behaviourPatterns, safetyAlerts, type Alert } from "@/lib/koda-mock";

export const Route = createFileRoute("/parent/safety")({
  head: () => ({
    meta: [
      { title: "Safety & Alerts — Koda Parent Hub" },
      {
        name: "description",
        content: "Review flagged interactions, emotional signals and restricted-topic alerts from Koda sessions.",
      },
      { property: "og:title", content: "Safety & Alerts — Koda Parent Hub" },
      { property: "og:description", content: "Every flagged moment, with timestamps and context." },
    ],
  }),
  component: Safety,
});

const LEVEL: Record<Alert["level"], { label: string; cls: string }> = {
  high: { label: "Needs attention", cls: "bg-destructive/10 text-destructive" },
  medium: { label: "Review", cls: "bg-warning/20 text-accent-foreground" },
  low: { label: "Informational", cls: "bg-secondary text-muted-foreground" },
};

function Safety() {
  const [resolved, setResolved] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Safety & Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Koda flags emotional signals, restricted topics and anything touching recorded medical context.
        </p>
      </header>

      <ul className="space-y-3">
        {safetyAlerts.map((a) => {
          const done = resolved.includes(a.id);
          return (
            <li
              key={a.id}
              className={`rounded-2xl border border-border bg-card p-5 transition-opacity ${done ? "opacity-55" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 rounded-lg p-2 ${LEVEL[a.level].cls}`}>
                    {done ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{a.title}</p>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{a.context}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{a.at}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${LEVEL[a.level].cls}`}>
                    {LEVEL[a.level].label}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setResolved((r) => (r.includes(a.id) ? r.filter((x) => x !== a.id) : [...r, a.id]))
                    }
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    {done ? "Reopen" : "Mark reviewed"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <Activity className="h-4 w-4" /> Pattern & emotion trends
        </h2>
        <ul className="mt-4 space-y-3">
          {behaviourPatterns.map((p) => (
            <li key={p.title} className="rounded-xl bg-secondary px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.detail}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.at}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
