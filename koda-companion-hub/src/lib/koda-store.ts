import { useSyncExternalStore } from "react";

export type Routine = { id: string; time: string; label: string };

export type ParentNote = { id: string; term: string; meaning: string; at: string };

export type ChildProfile = {
  name: string;
  dob: string;
  pronouns: string;
  traits: string[];
  interests: string;
  siblings: string;
  allergies: string;
  routines: Routine[];
  neurodiversity: string[];
  speechFocus: string[];
  speechNotes: string;
  parentNotes: ParentNote[];
  createdAt: string | null;
};

const defaultProfile: ChildProfile = {
  name: "Mia",
  dob: "2019-05-14",
  pronouns: "She / her",
  traits: ["Inquisitive", "Asks 'why' constantly", "Highly active"],
  interests: "Dinosaurs, painting, Bluey, sea otters, jumping on the trampoline.",
  siblings: "Noah (8) — big brother. Ellie (1) — baby sister.",
  allergies: "Peanut allergy (carries an EpiPen). Mild asthma in cold weather.",
  routines: [
    { id: "r1", time: "07:00", label: "Wake up" },
    { id: "r2", time: "07:30", label: "Breakfast" },
    { id: "r3", time: "19:30", label: "Brush teeth" },
    { id: "r4", time: "20:00", label: "Bedtime story" },
  ],
  neurodiversity: ["Speech delay"],
  speechFocus: ["/s/ sound", "/r/ sound"],
  speechNotes: "Working with an SLP fortnightly. Slower pacing helps a lot.",
  parentNotes: [
    { id: "n1", term: "pa", meaning: "water", at: "Mon" },
    { id: "n2", term: "beebo", meaning: "her stuffed rabbit", at: "Last week" },
  ],
  createdAt: null,
};

let state: ChildProfile = { ...defaultProfile };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setProfile(patch: Partial<ChildProfile>) {
  state = { ...state, ...patch };
  emit();
}

export function useProfile(): ChildProfile {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => state,
    () => state,
  );
}

export function ageFromDob(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function ageTier(age: number | null): string {
  if (age === null) return "Not set";
  if (age <= 5) return "Tier 1 - Early Explorer (4-5)";
  if (age <= 7) return "Tier 2 - Curious Learner (6-7)";
  return "Tier 3 - Junior Thinker (8-10)";
}
