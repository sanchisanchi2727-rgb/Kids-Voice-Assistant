import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, Clock, Lock, Search, Unlock } from "lucide-react";
import { sessions } from "@/lib/koda-mock";

export const Route = createFileRoute("/parent/vault")({
  head: () => ({
    meta: [
      { title: "Conversation Vault — Koda Parent Hub" },
      {
        name: "description",
        content: "Search every past Koda session: date, duration, an AI summary and the full transcript.",
      },
      { property: "og:title", content: "Conversation Vault — Koda Parent Hub" },
      { property: "og:description", content: "A searchable, chronological archive of every conversation." },
    ],
  }),
  component: Vault,
});

function Vault() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [requested, setRequested] = useState<string[]>([]);

  const requestUnlock = (id: string) => {
    setRequested((r) => [...r, id]);
    setTimeout(() => {
      setUnlocked((u) => [...u, id]);
      setRequested((r) => r.filter((x) => x !== id));
    }, 1400);
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sessions;
    return sessions.filter(
      (s) =>
        s.summary.toLowerCase().includes(needle) ||
        s.date.toLowerCase().includes(needle) ||
        s.transcript.some((t) => t.text.toLowerCase().includes(needle)),
    );
  }, [q]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Conversation Vault</h1>
        <p className="text-sm text-muted-foreground">Every session, kept in order and fully searchable.</p>
      </header>

      <div className="relative">
        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search summaries and transcripts…"
          className="w-full rounded-xl border border-border bg-card py-3 pr-4 pl-11 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <ul className="space-y-3">
        {filtered.map((s) => {
          const expanded = open === s.id;
          return (
            <li key={s.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : s.id)}
                className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-secondary/50"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-foreground">{s.date}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {s.duration}
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{s.summary}</p>
                </div>
                <ChevronDown
                  className={`mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>
              {expanded && (
                <div className="animate-rise space-y-3 border-t border-border bg-secondary/30 p-5">
                  {!unlocked.includes(s.id) ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" /> Full transcript is privacy-locked.
                      </p>
                      <button
                        type="button"
                        disabled={requested.includes(s.id)}
                        onClick={() => requestUnlock(s.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        {requested.includes(s.id) ? "Verifying…" : "Request transcript unlock"}
                      </button>
                    </div>
                  ) : (
                    s.transcript.map((t, i) => (
                    <div key={i} className="text-sm">
                      <span
                        className={`mr-2 font-semibold ${t.speaker === "koda" ? "text-koda" : "text-foreground"}`}
                      >
                        {t.speaker === "koda" ? "Koda" : "Child"}:
                      </span>
                      <span className="text-muted-foreground">{t.text}</span>
                    </div>
                    ))
                  )}
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No sessions match "{q}".
          </li>
        )}
      </ul>
    </div>
  );
}
