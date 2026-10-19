import { createFileRoute } from "@tanstack/react-router";
import { Brain, Clock, MessagesSquare, Sparkles, TrendingUp } from "lucide-react";
import {
  achievements,
  memoryFacts,
  recentInterests,
  speechMilestones,
  weeklyPlaytime,
} from "@/lib/koda-mock";
import { ageFromDob, ageTier, useProfile } from "@/lib/koda-store";

export const Route = createFileRoute("/parent/")({
  head: () => ({
    meta: [
      { title: "Overview & Analytics — Koda Parent Hub" },
      {
        name: "description",
        content: "Weekly playtime, age-tier configuration, recent interests and intellectual milestones.",
      },
      { property: "og:title", content: "Overview & Analytics — Koda Parent Hub" },
      { property: "og:description", content: "See what your child has been learning with Koda this week." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const profile = useProfile();
  const age = ageFromDob(profile.dob);
  const total = weeklyPlaytime.reduce((a, b) => a + b.minutes, 0);
  const max = Math.max(...weeklyPlaytime.map((d) => d.minutes));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          {profile.name || "Your child"} · {age ?? "—"} years old
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Clock} label="Playtime this week" value={`${Math.floor(total / 60)}h ${total % 60}m`} sub="+18% vs last week" />
        <Stat icon={TrendingUp} label="Sessions" value="14" sub="Avg 17 min each" />
        <Stat icon={MessagesSquare} label="Vocabulary growth" value="+44 words" sub="+31% this month" />
        <Stat icon={Brain} label="Age tier" value={ageTier(age).split(" - ")[0] ?? "—"} sub={ageTier(age).split(" - ")[1] ?? ""} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">Daily playtime</h2>
        <div className="mt-6 flex h-40 items-end gap-3">
          {weeklyPlaytime.map((d) => (
            <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-medium text-muted-foreground">{d.minutes}m</span>
              <div
                className="w-full rounded-t-lg bg-koda/80"
                style={{ height: `${Math.round((d.minutes / max) * 110)}px` }}
              />
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            <Sparkles className="h-4 w-4" /> Recent interests
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Topics Koda has learned about your child.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {recentInterests.map((i) => (
              <span key={i} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground">
                {i}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            <Brain className="h-4 w-4" /> Intellectual achievements
          </h2>
          <ul className="mt-4 space-y-3">
            {achievements.map((a) => (
              <li key={a.label} className="rounded-xl bg-secondary px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">Memory vault</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Facts Koda extracted and stored after each session.
          </p>
          <ul className="mt-4 space-y-3">
            {memoryFacts.map((f) => (
              <li key={f.fact} className="rounded-xl bg-secondary px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{f.fact}</p>
                <p className="text-xs text-muted-foreground">
                  {f.source} · {f.at}
                </p>
              </li>
            ))}
          </ul>
        </section>

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
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
