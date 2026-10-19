import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, MessageCircleHeart, Mic } from "lucide-react";
import { seedTranscript, kodaReplies, coachingCues, type Turn } from "@/lib/koda-mock";
import { connectKodaSocket, type VoiceState } from "@/lib/koda-socket";
import { useProfile } from "@/lib/koda-store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Talk with Koda — Always-On Voice Companion" },
      {
        name: "description",
        content:
          "Koda's always-listening chat: a living orb that breathes, listens, thinks and speaks, with a live transcript of every word.",
      },
      { property: "og:title", content: "Talk with Koda" },
      {
        property: "og:description",
        content: "An always-on voice friend with a live transcript — no buttons to press.",
      },
    ],
  }),
  component: ChatView,
});

const CYCLE: { state: VoiceState; ms: number }[] = [
  { state: "idle", ms: 3200 },
  { state: "listening", ms: 3000 },
  { state: "processing", ms: 1600 },
  { state: "speaking", ms: 3800 },
];

const STATE_COPY: Record<VoiceState, string> = {
  idle: "Koda is here, listening quietly",
  listening: "Koda is listening to you",
  processing: "Koda is thinking",
  speaking: "Koda is talking",
};

function ChatView() {
  const profile = useProfile();
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [level, setLevel] = useState(0.2);
  const [turns, setTurns] = useState<Turn[]>(seedTranscript);
  const [cue, setCue] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyIndex = useRef(0);

  // Stubbed speech-coaching feed: the FastAPI VAD/ASR pipeline would push these.
  useEffect(() => {
    if (voiceState !== "listening") return;
    const show = setTimeout(
      () => setCue(coachingCues[Math.floor(Math.random() * coachingCues.length)]!),
      900,
    );
    const hide = setTimeout(() => setCue(null), 4200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [voiceState, turns.length]);

  // Stubbed backend session. Swap connectKodaSocket for the FastAPI WebSocket.
  useEffect(() => {
    const socket = connectKodaSocket("/ws/session", {
      onStateChange: setVoiceState,
      onLevel: setLevel,
      onChildTranscript: (text) => pushTurn("child", text),
      onKodaTranscript: (text) => pushTurn("koda", text),
    });
    return () => socket.disconnect();
  }, []);

  const pushTurn = (speaker: Turn["speaker"], text: string) =>
    setTurns((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        speaker,
        text,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

  // Simulated voice-activity loop so the visualiser states can be evaluated now.
  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const phase = CYCLE[i % CYCLE.length]!;
      setVoiceState(phase.state);
      if (phase.state === "listening") {
        pushTurn("child", childLines[replyIndex.current % childLines.length]!);
      }
      if (phase.state === "speaking") {
        pushTurn("koda", kodaReplies[replyIndex.current % kodaReplies.length]!);
        replyIndex.current += 1;
      }
      i += 1;
      timer = setTimeout(step, phase.ms);
    };
    timer = setTimeout(step, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Simulated mic amplitude feed (would come from the WS audio frames).
  useEffect(() => {
    if (voiceState !== "listening" && voiceState !== "speaking") {
      setLevel(0.2);
      return;
    }
    const id = setInterval(() => setLevel(0.35 + Math.random() * 0.65), 120);
    return () => clearInterval(id);
  }, [voiceState]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  return (
    <main className="h-screen bg-cream">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hi {profile.name || "friend"}, Koda is awake
            </h1>
            <p className="text-sm text-muted-foreground">Just talk — nothing to press.</p>
          </div>
          <Link
            to="/parent"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <LayoutDashboard className="h-4 w-4" /> Parent Hub
          </Link>
        </header>

        <section className="mt-6 grid min-h-0 flex-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-card p-8 shadow-sm">
            <div className="relative">
              <Orb state={voiceState} level={level} />
              {cue && (
                <div
                  aria-live="polite"
                  className="animate-rise absolute -top-2 left-1/2 w-max max-w-[16rem] -translate-x-1/2 rounded-2xl bg-accent px-4 py-2 text-center text-xs font-semibold text-accent-foreground shadow-lg"
                >
                  <MessageCircleHeart className="mr-1 inline h-3.5 w-3.5" />
                  {cue}
                </div>
              )}
            </div>
            <p className="mt-8 flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground">
              <Mic className="h-4 w-4 text-koda" />
              {STATE_COPY[voiceState]}
            </p>
          </div>

          <div className="flex min-h-[26rem] flex-col overflow-hidden rounded-[2.5rem] bg-card p-4 shadow-sm sm:p-6">
            <h2 className="px-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
              Live transcript
            </h2>
            <div ref={scrollRef} className="mt-3 flex-1 space-y-3 overflow-y-auto px-1 pb-2">
              {turns.map((t) => (
                <Bubble key={t.id} turn={t} childName={profile.name || "You"} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const childLines = [
  "Koda, why is the sky blue at the top and white near the ground?",
  "I found a rock that looks like a heart!",
  "Can we do a riddle?",
  "My brother says otters hold hands. Is that true?",
  "I want to build a volcano.",
];

function Orb({ state, level }: { state: VoiceState; level: number }) {
  const scale =
    state === "listening" ? 1 + level * 0.22 : state === "speaking" ? 1 + level * 0.1 : 1;

  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full bg-koda/15 blur-2xl transition-transform duration-150"
        style={{ transform: `scale(${scale})` }}
      />
      {state === "processing" && (
        <div className="animate-orbit absolute inset-2 rounded-full border-4 border-transparent border-t-koda border-r-child" />
      )}
      <div
        className={`relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-koda to-child shadow-2xl transition-transform duration-150 ${
          state === "idle" ? "animate-breathe" : ""
        }`}
        style={state === "idle" ? undefined : { transform: `scale(${scale})` }}
      >
        {state === "speaking" ? (
          <div className="flex items-end gap-1.5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-2.5 rounded-full bg-koda-foreground/90 transition-all duration-100"
                style={{ height: `${18 + Math.abs(Math.sin(level * 6 + i)) * 54}px` }}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-6" aria-hidden>
            <Eye closed={state === "processing"} />
            <Eye closed={state === "processing"} />
          </div>
        )}
      </div>
      <span className="sr-only">Koda is {state}</span>
    </div>
  );
}

function Eye({ closed }: { closed: boolean }) {
  return (
    <span
      className="block w-4 rounded-full bg-koda-foreground transition-all duration-300"
      style={{ height: closed ? 4 : 22 }}
    />
  );
}

function Bubble({ turn, childName }: { turn: Turn; childName: string }) {
  const isChild = turn.speaker === "child";
  return (
    <div className={`animate-rise flex items-end gap-2 ${isChild ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isChild ? "bg-child text-child-foreground" : "bg-koda text-koda-foreground"
        }`}
      >
        {isChild ? childName.slice(0, 1).toUpperCase() : "K"}
      </div>
      <div
        className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
          isChild
            ? "rounded-br-md bg-child text-child-foreground"
            : "rounded-bl-md bg-secondary text-foreground"
        }`}
      >
        <p>{turn.text}</p>
        <p className="mt-1 text-[11px] opacity-60">{turn.at}</p>
      </div>
    </div>
  );
}
