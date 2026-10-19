import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookMarked, Check, Clock, Plus, Trash2 } from "lucide-react";
import { ageFromDob, ageTier, setProfile, useProfile } from "@/lib/koda-store";

export const Route = createFileRoute("/parent/settings")({
  head: () => ({
    meta: [
      { title: "Profile Settings — Koda Parent Hub" },
      {
        name: "description",
        content: "Edit your child's Koda profile: interests, personality traits, siblings, allergies and daily routines.",
      },
      { property: "og:title", content: "Profile Settings — Koda Parent Hub" },
      { property: "og:description", content: "Everything from onboarding, editable any time." },
    ],
  }),
  component: SettingsView,
});

const TRAITS = [
  "Shy",
  "Highly active",
  "Inquisitive",
  "Asks 'why' constantly",
  "Sensitive",
  "Silly",
  "Cautious",
  "Chatty",
  "Focused",
  "Imaginative",
];

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

const NEURO = ["ADHD", "Autism", "Speech delay", "Stutter", "Sensory sensitivity", "None recorded"];
const SPEECH_FOCUS = ["/s/ sound", "/r/ sound", "/th/ sound", "/l/ sound", "Blends", "Slower pacing"];

function SettingsView() {
  const profile = useProfile();
  const age = ageFromDob(profile.dob);
  const [saved, setSaved] = useState(false);
  const [time, setTime] = useState("");
  const [label, setLabel] = useState("");
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");

  const addNote = () => {
    if (!term.trim() || !meaning.trim()) return;
    setProfile({
      parentNotes: [
        ...profile.parentNotes,
        { id: crypto.randomUUID(), term: term.trim(), meaning: meaning.trim(), at: "Just now" },
      ],
    });
    setTerm("");
    setMeaning("");
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile settings</h1>
          <p className="text-sm text-muted-foreground">
            Changes apply to Koda's next conversation. Current tier: {ageTier(age)}
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save changes"}
        </button>
      </header>

      <Card title="Basic info">
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Child's name">
            <input className={inputCls} value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
          </Labeled>
          <Labeled label="Date of birth">
            <input type="date" className={inputCls} value={profile.dob} onChange={(e) => setProfile({ dob: e.target.value })} />
          </Labeled>
          <Labeled label="Pronouns">
            <input className={inputCls} value={profile.pronouns} onChange={(e) => setProfile({ pronouns: e.target.value })} />
          </Labeled>
        </div>
      </Card>

      <Card title="Personality & context">
        <Labeled label="Personality traits">
          <div className="flex flex-wrap gap-2">
            {TRAITS.map((t) => {
              const on = profile.traits.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setProfile({
                      traits: on ? profile.traits.filter((x) => x !== t) : [...profile.traits, t],
                    })
                  }
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    on ? "bg-koda text-koda-foreground" : "border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Labeled>
        <Labeled label="Likes & interests">
          <textarea rows={3} className={inputCls} value={profile.interests} onChange={(e) => setProfile({ interests: e.target.value })} />
        </Labeled>
        <Labeled label="Sibling information">
          <textarea rows={3} className={inputCls} value={profile.siblings} onChange={(e) => setProfile({ siblings: e.target.value })} />
        </Labeled>
      </Card>

      <Card title="Neurodiversity & speech goals">
        <Labeled label="Neurodiversity profile">
          <div className="flex flex-wrap gap-2">
            {NEURO.map((n) => {
              const on = profile.neurodiversity.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setProfile({
                      neurodiversity: on
                        ? profile.neurodiversity.filter((x) => x !== n)
                        : [...profile.neurodiversity, n],
                    })
                  }
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    on ? "bg-koda text-koda-foreground" : "border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </Labeled>
        <Labeled label="Pronunciation focus areas">
          <div className="flex flex-wrap gap-2">
            {SPEECH_FOCUS.map((s) => {
              const on = profile.speechFocus.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setProfile({
                      speechFocus: on
                        ? profile.speechFocus.filter((x) => x !== s)
                        : [...profile.speechFocus, s],
                    })
                  }
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    on ? "bg-child text-child-foreground" : "border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Labeled>
        <Labeled label="Therapist notes">
          <textarea rows={2} className={inputCls} value={profile.speechNotes} onChange={(e) => setProfile({ speechNotes: e.target.value })} />
        </Labeled>
      </Card>

      <Card title="Parent note log">
        <p className="-mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <BookMarked className="h-4 w-4" /> Teach Koda your child's own words, e.g. "pa" = "water".
        </p>
        <ul className="space-y-2">
          {profile.parentNotes.map((n) => (
            <li key={n.id} className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-2.5">
              <span className="rounded-lg bg-background px-2 py-1 text-sm font-semibold text-foreground">{n.term}</span>
              <span className="text-sm text-muted-foreground">means</span>
              <span className="flex-1 text-sm text-foreground">{n.meaning}</span>
              <span className="text-xs text-muted-foreground">{n.at}</span>
              <button
                type="button"
                aria-label={`Remove note ${n.term}`}
                onClick={() => setProfile({ parentNotes: profile.parentNotes.filter((x) => x.id !== n.id) })}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className={`${inputCls} sm:w-40`} placeholder="Child's word" value={term} onChange={(e) => setTerm(e.target.value)} />
          <input
            className={inputCls}
            placeholder="What it means"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button
            type="button"
            onClick={addNote}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-koda px-4 py-2.5 text-sm font-semibold text-koda-foreground"
          >
            <Plus className="h-4 w-4" /> Log
          </button>
        </div>
      </Card>

      <Card title="Health & routine">
        <Labeled label="Allergies & medical context">
          <textarea rows={3} className={inputCls} value={profile.allergies} onChange={(e) => setProfile({ allergies: e.target.value })} />
        </Labeled>
        <Labeled label="Daily routines">
          <ul className="space-y-2">
            {profile.routines.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-2.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="time"
                  value={r.time === "--:--" ? "" : r.time}
                  onChange={(e) =>
                    setProfile({
                      routines: profile.routines.map((x) => (x.id === r.id ? { ...x, time: e.target.value } : x)),
                    })
                  }
                  className="rounded-lg bg-background px-2 py-1 text-sm text-foreground"
                />
                <input
                  value={r.label}
                  onChange={(e) =>
                    setProfile({
                      routines: profile.routines.map((x) => (x.id === r.id ? { ...x, label: e.target.value } : x)),
                    })
                  }
                  className="flex-1 bg-transparent text-sm text-foreground outline-none"
                />
                <button
                  type="button"
                  aria-label={`Remove ${r.label}`}
                  onClick={() => setProfile({ routines: profile.routines.filter((x) => x.id !== r.id) })}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input type="time" className={`${inputCls} sm:w-32`} value={time} onChange={(e) => setTime(e.target.value)} />
            <input className={inputCls} placeholder="New routine" value={label} onChange={(e) => setLabel(e.target.value)} />
            <button
              type="button"
              onClick={() => {
                if (!label.trim()) return;
                setProfile({
                  routines: [...profile.routines, { id: crypto.randomUUID(), time: time || "--:--", label: label.trim() }],
                });
                setTime("");
                setLabel("");
              }}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-koda px-4 py-2.5 text-sm font-semibold text-koda-foreground"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </Labeled>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
