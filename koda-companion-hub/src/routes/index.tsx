import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Check,
  HeartPulse,
  Plus,
  Sparkle,
  Trash2,
  Clock,
} from "lucide-react";
import { ageFromDob, ageTier, setProfile, useProfile, type Routine } from "@/lib/koda-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Set up Koda — AI Voice Companion for Kids" },
      {
        name: "description",
        content:
          "Create your child's Koda profile: name, age tier, personality, interests, siblings, allergies and daily routines.",
      },
      { property: "og:title", content: "Set up Koda — AI Voice Companion for Kids" },
      {
        property: "og:description",
        content: "A three-step setup that teaches Koda who your child is before the first hello.",
      },
    ],
  }),
  component: Onboarding,
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

const STEPS = [
  { n: 1, label: "Basic info", icon: Baby },
  { n: 2, label: "Personality & profile", icon: Sparkle },
  { n: 3, label: "Health & routine", icon: HeartPulse },
];

const NEURO = ["ADHD", "Autism", "Speech delay", "Stutter", "Sensory sensitivity", "None recorded"];
const SPEECH_FOCUS = ["/s/ sound", "/r/ sound", "/th/ sound", "/l/ sound", "Blends", "Slower pacing"];

function Onboarding() {
  const profile = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [routineTime, setRoutineTime] = useState("");
  const [routineLabel, setRoutineLabel] = useState("");

  const age = ageFromDob(profile.dob);

  const toggleTrait = (t: string) =>
    setProfile({
      traits: profile.traits.includes(t)
        ? profile.traits.filter((x) => x !== t)
        : [...profile.traits, t],
    });

  const addRoutine = () => {
    if (!routineLabel.trim()) return;
    const next: Routine = {
      id: crypto.randomUUID(),
      time: routineTime || "--:--",
      label: routineLabel.trim(),
    };
    setProfile({ routines: [...profile.routines, next] });
    setRoutineTime("");
    setRoutineLabel("");
  };

  const finish = () => {
    setProfile({ createdAt: new Date().toISOString() });
    navigate({ to: "/chat" });
  };

  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-koda text-koda-foreground shadow-lg">
            <Sparkle className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-4xl font-bold text-foreground">Let's teach Koda about your child</h1>
          <p className="mt-2 text-muted-foreground">
            Three quick steps. Everything here stays editable later in the Parent Hub.
          </p>
        </header>

        <ol className="mt-8 flex items-center justify-center gap-3">
          {STEPS.map((s) => {
            const active = step === s.n;
            const done = step > s.n;
            return (
              <li key={s.n} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(s.n)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-koda text-koda-foreground shadow"
                      : done
                        ? "bg-accent text-accent-foreground"
                        : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {step === 1 && (
            <div className="animate-rise space-y-5">
              <Field label="Child's name">
                <input
                  className={inputCls}
                  value={profile.name}
                  onChange={(e) => setProfile({ name: e.target.value })}
                  placeholder="e.g. Mia"
                />
              </Field>
              <Field label="Date of birth" hint="Koda uses exact age to tune vocabulary and maturity.">
                <input
                  type="date"
                  className={inputCls}
                  value={profile.dob}
                  onChange={(e) => setProfile({ dob: e.target.value })}
                />
              </Field>
              {age !== null && (
                <p className="rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
                  {age} years old · {ageTier(age)}
                </p>
              )}
              <Field label="Gender / pronouns">
                <div className="flex flex-wrap gap-2">
                  {["She / her", "He / him", "They / them", "Prefer not to say"].map((p) => (
                    <Chip
                      key={p}
                      selected={profile.pronouns === p}
                      onClick={() => setProfile({ pronouns: p })}
                    >
                      {p}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="animate-rise space-y-5">
              <Field label="Personality traits" hint="Pick as many as fit.">
                <div className="flex flex-wrap gap-2">
                  {TRAITS.map((t) => (
                    <Chip key={t} selected={profile.traits.includes(t)} onClick={() => toggleTrait(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="Likes & interests" hint="Hobbies, favourite shows, animals, games.">
                <textarea
                  rows={4}
                  className={inputCls}
                  value={profile.interests}
                  onChange={(e) => setProfile({ interests: e.target.value })}
                />
              </Field>
              <Field label="Sibling information" hint="Names and ages help Koda understand family dynamics.">
                <textarea
                  rows={3}
                  className={inputCls}
                  value={profile.siblings}
                  onChange={(e) => setProfile({ siblings: e.target.value })}
                />
              </Field>

              <Field
                label="Neurodiversity profile"
                hint="Koda adapts pacing, patience and phrasing to match."
              >
                <div className="flex flex-wrap gap-2">
                  {NEURO.map((n) => (
                    <Chip
                      key={n}
                      selected={profile.neurodiversity.includes(n)}
                      onClick={() =>
                        setProfile({
                          neurodiversity: profile.neurodiversity.includes(n)
                            ? profile.neurodiversity.filter((x) => x !== n)
                            : [...profile.neurodiversity, n],
                        })
                      }
                    >
                      {n}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Speech goals & pronunciation focus" hint="Koda gives gentle in-conversation coaching on these.">
                <div className="flex flex-wrap gap-2">
                  {SPEECH_FOCUS.map((s) => (
                    <Chip
                      key={s}
                      selected={profile.speechFocus.includes(s)}
                      onClick={() =>
                        setProfile({
                          speechFocus: profile.speechFocus.includes(s)
                            ? profile.speechFocus.filter((x) => x !== s)
                            : [...profile.speechFocus, s],
                        })
                      }
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
                <textarea
                  rows={2}
                  className={`${inputCls} mt-3`}
                  placeholder="Anything a speech therapist has advised?"
                  value={profile.speechNotes}
                  onChange={(e) => setProfile({ speechNotes: e.target.value })}
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="animate-rise space-y-5">
              <Field
                label="Allergies & medical context"
                hint="Koda will never suggest anything that conflicts with this."
              >
                <textarea
                  rows={3}
                  className={inputCls}
                  value={profile.allergies}
                  onChange={(e) => setProfile({ allergies: e.target.value })}
                />
              </Field>

              <Field label="Daily routines">
                <ul className="space-y-2">
                  {profile.routines.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-3"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="w-16 text-sm font-semibold text-foreground">{r.time}</span>
                      <span className="flex-1 text-sm text-foreground">{r.label}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${r.label}`}
                        onClick={() =>
                          setProfile({ routines: profile.routines.filter((x) => x.id !== r.id) })
                        }
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="time"
                    className={`${inputCls} sm:w-32`}
                    value={routineTime}
                    onChange={(e) => setRoutineTime(e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Add a routine, e.g. Swim class"
                    value={routineLabel}
                    onChange={(e) => setRoutineLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addRoutine()}
                  />
                  <button
                    type="button"
                    onClick={addRoutine}
                    className="inline-flex items-center justify-center gap-1 rounded-2xl bg-koda px-4 py-3 text-sm font-semibold text-koda-foreground transition-opacity hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </Field>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="inline-flex items-center gap-2 rounded-2xl bg-koda px-5 py-3 text-sm font-semibold text-koda-foreground shadow-lg transition-opacity hover:opacity-90"
              >
                Create profile & start Koda <Sparkle className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? "bg-koda text-koda-foreground"
          : "border border-border bg-background text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
