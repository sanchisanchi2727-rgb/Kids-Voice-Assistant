export type Turn = { id: string; speaker: "child" | "koda"; text: string; at: string };

export const seedTranscript: Turn[] = [
  { id: "t1", speaker: "koda", text: "Good morning! I heard you jumping around. Did you sleep well?", at: "08:02" },
  { id: "t2", speaker: "child", text: "Yes! I dreamed I was a triceratops.", at: "08:02" },
  { id: "t3", speaker: "koda", text: "A triceratops! Those had three horns and a big bony frill. If you were one, what would you eat for breakfast?", at: "08:03" },
  { id: "t4", speaker: "child", text: "Leaves. And pancakes.", at: "08:03" },
  { id: "t5", speaker: "koda", text: "Leaf pancakes, delicious. Real triceratops loved ferns. Want a riddle about dinosaurs while you finish breakfast?", at: "08:04" },
];

export const kodaReplies = [
  "Ooh, tell me more about that!",
  "That reminds me of volcanoes - they burp hot rock called lava. Want to hear why?",
  "Great question. Let's figure it out together, one step at a time.",
  "You're really good at noticing things. What do you think happens next?",
  "Here's a riddle: I have a tail and a shell and I carry my house. What am I?",
];

export type Alert = {
  id: string;
  level: "high" | "medium" | "low";
  title: string;
  context: string;
  at: string;
};

export const safetyAlerts: Alert[] = [
  { id: "a1", level: "high", title: "Child expressed sadness about school", context: "\"Nobody played with me at lunch today.\" Koda responded with comfort and suggested talking to a grown-up.", at: "Today, 4:12 PM" },
  { id: "a2", level: "medium", title: "Asked about a restricted topic", context: "Child asked about a scary movie character seen at a friend's house. Koda redirected to a gentle explanation.", at: "Yesterday, 6:48 PM" },
  { id: "a3", level: "low", title: "Repeated bedtime resistance", context: "Three sessions this week continued past the 20:00 bedtime routine reminder.", at: "Mon, 8:21 PM" },
  { id: "a4", level: "medium", title: "Mentioned a food with allergy risk", context: "Child said a classmate shared \"a peanut butter cracker.\" Flagged because of a recorded peanut allergy.", at: "Sun, 12:30 PM" },
];

export type Session = {
  id: string;
  date: string;
  duration: string;
  summary: string;
  transcript: { speaker: "child" | "koda"; text: string }[];
};

export const sessions: Session[] = [
  {
    id: "s1",
    date: "Today, 8:02 AM",
    duration: "12 min",
    summary: "A breakfast chat about dinosaur dreams that turned into a triceratops fact game.",
    transcript: [
      { speaker: "koda", text: "Good morning! Did you sleep well?" },
      { speaker: "child", text: "Yes! I dreamed I was a triceratops." },
      { speaker: "koda", text: "Triceratops had three horns and a big frill. What would you eat?" },
      { speaker: "child", text: "Leaves. And pancakes." },
      { speaker: "koda", text: "Real triceratops loved ferns. Want a dinosaur riddle?" },
    ],
  },
  {
    id: "s2",
    date: "Yesterday, 4:05 PM",
    duration: "23 min",
    summary: "Talked through a lonely lunchtime, then made a plan to invite a friend to play.",
    transcript: [
      { speaker: "child", text: "Nobody played with me at lunch today." },
      { speaker: "koda", text: "That sounds lonely. I'm glad you told me. What did you do instead?" },
      { speaker: "child", text: "I drew a whale." },
      { speaker: "koda", text: "A whale! Maybe tomorrow you could ask someone to draw one with you." },
    ],
  },
  {
    id: "s3",
    date: "Sunday, 10:40 AM",
    duration: "31 min",
    summary: "Volcano questions after a nature show, ending with three solved riddles.",
    transcript: [
      { speaker: "child", text: "Why do volcanoes explode?" },
      { speaker: "koda", text: "Hot melted rock pushes up until the mountain burps it out." },
      { speaker: "child", text: "Is lava hotter than the oven?" },
      { speaker: "koda", text: "Much hotter - about ten times hotter than a baking oven." },
    ],
  },
  {
    id: "s4",
    date: "Saturday, 7:50 PM",
    duration: "9 min",
    summary: "A short bedtime wind-down with a made-up story about a sleepy sea otter.",
    transcript: [
      { speaker: "child", text: "Tell me an otter story." },
      { speaker: "koda", text: "Once there was an otter who held hands with her sister so she wouldn't float away..." },
    ],
  },
];

export const recentInterests = ["Volcanoes", "Triceratops", "Sea otters", "Rainbows", "Trampolines", "Whales"];

export const achievements = [
  { label: "Solved 3 riddles today", detail: "Pattern and animal riddles" },
  { label: "Learned 12 new words", detail: "Including 'eruption' and 'fossil'" },
  { label: "Counted to 100", detail: "First time without help" },
];

export const weeklyPlaytime = [
  { day: "Mon", minutes: 24 },
  { day: "Tue", minutes: 38 },
  { day: "Wed", minutes: 12 },
  { day: "Thu", minutes: 45 },
  { day: "Fri", minutes: 31 },
  { day: "Sat", minutes: 52 },
  { day: "Sun", minutes: 40 },
];

/** Facts Koda extracted asynchronously from sessions (memory vault). */
export const memoryFacts = [
  { fact: "Wants to be a volcanologist 'or a whale doctor'", source: "Sunday session", at: "2 days ago" },
  { fact: "Best friend at school is called Priya", source: "Tuesday session", at: "3 days ago" },
  { fact: "Scared of the vacuum cleaner noise", source: "Saturday session", at: "5 days ago" },
  { fact: "Learned that lava is molten rock", source: "Sunday session", at: "2 days ago" },
];

export const speechMilestones = [
  { label: "Mastered /r/ sound in 'rainbow'", detail: "8 clean productions across 3 sessions", at: "Today" },
  { label: "/s/ blends improving", detail: "'spider' clear in 6 of 9 attempts", at: "Yesterday" },
  { label: "Longer sentences", detail: "Average utterance up from 4 to 6 words", at: "This week" },
];

export const vocabGrowth = [
  { week: "W1", words: 18 },
  { week: "W2", words: 26 },
  { week: "W3", words: 31 },
  { week: "W4", words: 44 },
];

/** Gentle, real-time pronunciation coaching cues shown over the orb. */
export const coachingCues = [
  "Great try on the /s/ sound!",
  "I heard 'rainbow' so clearly — lovely /r/!",
  "Let's say 'spider' slowly together: sss-pider.",
  "Nice long sentence! Six whole words.",
  "Almost! Put your tongue behind your teeth for 'th'.",
];

export const behaviourPatterns = [
  { title: "Emotion trend: more evening frustration", detail: "4 of 7 evening sessions this week included frustration cues, up from 1 last week.", at: "This week" },
  { title: "Pattern: repeated questions about thunderstorms", detail: "Asked 6 times in 3 days — possible anxiety worth a gentle chat.", at: "3 days" },
];

export const developmentReport = {
  period: "1 – 31 July",
  metrics: [
    { label: "Speech intelligibility", value: "82%", change: "+9 pts" },
    { label: "Mean length of utterance", value: "6.1 words", change: "+1.8" },
    { label: "New vocabulary", value: "119 words", change: "+31%" },
    { label: "Turn-taking balance", value: "48 / 52", change: "Healthy" },
  ],
  narrative:
    "Steady gains in expressive language. /r/ and /s/ productions are now largely accurate in single words and improving in blends. Recommend continuing fortnightly SLP sessions with a focus on multisyllabic /s/ clusters.",
};
