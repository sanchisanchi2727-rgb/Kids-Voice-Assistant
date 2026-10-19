import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Download, LineChart, Stethoscope } from "lucide-react";
import { developmentReport, speechMilestones, vocabGrowth } from "@/lib/koda-mock";
import { useProfile } from "@/lib/koda-store";

export const Route = createFileRoute("/parent/reports")({
  head: () => ({
    meta: [
      { title: "Development & Therapy Reports — Koda Parent Hub" },
      {
        name: "description",
        content:
          "Speech progress and developmental metrics from Koda sessions, exportable for your pediatrician or speech-language pathologist.",
      },
      { property: "og:title", content: "Development & Therapy Reports — Koda Parent Hub" },
      { property: "og:description", content: "A clinician-ready summary of speech and language progress." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const profile = useProfile();
  const [exported, setExported] = useState(false);
  const max = Math.max(...vocabGrowth.map((v) => v.words));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Development & therapy reports</h1>
          <p className="text-sm text-muted-foreground">
            {profile.name || "Your child"} · reporting period {developmentReport.period}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setExported(true);
            setTimeout(() => setExported(false), 2200);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {exported ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          {exported ? "PDF prepared" : "Export PDF for Pediatrician / SLP"}
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {developmentReport.metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{m.label}</p>
            <p className="mt-3 text-2xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.change}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <LineChart className="h-4 w-4" /> New vocabulary per week
        </h2>
        <div className="mt-6 flex h-40 items-end gap-4">
          {vocabGrowth.map((v) => (
            <div key={v.week} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-medium text-muted-foreground">{v.words}</span>
              <div
                className="w-full rounded-t-lg bg-child/80"
                style={{ height: `${Math.round((v.words / max) * 110)}px` }}
              />
              <span className="text-xs text-muted-foreground">{v.week}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">Speech milestones</h2>
          <ul className="mt-4 space-y-3">
            {speechMilestones.map((s) => (
              <li key={s.label} className="rounded-xl bg-secondary px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">
                  {s.detail} · {s.at}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            <Stethoscope className="h-4 w-4" /> Clinician summary
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{developmentReport.narrative}</p>
          {profile.speechFocus.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.speechFocus.map((f) => (
                <span key={f} className="rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground">
                  Focus: {f}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}