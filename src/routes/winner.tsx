import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { Church, Play, RotateCcw } from "lucide-react";
import { useRealtimeTeams } from "@/hooks/useRealtimeTeams";

export const Route = createFileRoute("/winner")({
  head: () => ({
    meta: [
      { title: "Winner Reveal — ST PAUL'S VBS" },
      { name: "description", content: "Dramatic countdown and cinematic winner announcement." },
    ],
  }),
  component: WinnerPage,
});

type Phase = "idle" | "counting" | "revealed";

function WinnerPage() {
  const { teams } = useRealtimeTeams();
  const winner = useMemo(() => {
    if (teams.length === 0) return null;
    return [...teams].sort((a, b) => b.score - a.score)[0];
  }, [teams]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(10);

  const countRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const trophyRef = useRef<HTMLDivElement>(null);

  // Countdown effect
  useEffect(() => {
    if (phase !== "counting") return;
    if (count <= 0) {
      setPhase("revealed");
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, count]);

  // Animate count number
  useEffect(() => {
    if (phase === "counting" && countRef.current) {
      gsap.fromTo(
        countRef.current,
        { scale: 1.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [count, phase]);

  // Reveal animation + confetti
  useEffect(() => {
    if (phase !== "revealed" || !revealRef.current || !winner) return;

    const tl = gsap.timeline();
    tl.fromTo(
      revealRef.current,
      { opacity: 0, scale: 0.85, filter: "blur(20px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "power3.out" }
    );
    if (trophyRef.current) {
      tl.fromTo(
        trophyRef.current,
        { y: -60, scale: 0.5, rotate: -15, opacity: 0 },
        { y: 0, scale: 1, rotate: 0, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)" },
        "-=0.6"
      );
    }

    // Confetti bursts
    const colors = [winner.color, "#ffd700", "#ffffff"];
    const fire = (x: number) =>
      confetti({ particleCount: 120, spread: 80, origin: { x, y: 0.5 }, colors });
    fire(0.2); setTimeout(() => fire(0.8), 250); setTimeout(() => fire(0.5), 500);
    const interval = setInterval(() => {
      confetti({ particleCount: 50, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 50, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
    }, 1500);
    return () => clearInterval(interval);
  }, [phase, winner]);

  const start = () => { setCount(10); setPhase("counting"); };
  const reset = () => { setPhase("idle"); setCount(10); };

  return (
    <div className="relative px-4 pb-10 min-h-[calc(100vh-7rem)] grid place-items-center overflow-hidden">
      {/* Spotlight overlay during counting/reveal */}
      {phase !== "idle" && <div className="absolute inset-0 spotlight pointer-events-none" />}

      {phase === "idle" && (
        <div className="text-center max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/80 mb-2">The Reveal</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            And the winner <span className="text-gold">is…</span>
          </h1>
          <p className="text-muted-foreground mt-4">
            Press start for a 10-second dramatic countdown, then a cinematic reveal of the leading team.
          </p>
          {winner && (
            <p className="text-sm text-muted-foreground mt-6">
              Currently leading: <span className="font-semibold" style={{ color: winner.color }}>{winner.name}</span> · {winner.score} pts
            </p>
          )}
          <button
            onClick={start}
            disabled={!winner}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-3 font-semibold text-background shadow-elegant hover:scale-105 transition-transform disabled:opacity-40"
          >
            <Play className="h-5 w-5" /> Start the reveal
          </button>
        </div>
      )}

      {phase === "counting" && (
        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gold/80 mb-6">Revealing in</p>
          <div
            ref={countRef}
            className="font-mono font-bold text-[14rem] sm:text-[20rem] leading-none text-gold"
            style={{ textShadow: "0 0 80px oklch(0.82 0.15 85 / 0.6)" }}
          >
            {count}
          </div>
        </div>
      )}

      {phase === "revealed" && winner && (
        <div ref={revealRef} className="relative z-10 text-center">
          <div ref={trophyRef} className="mx-auto mb-6 grid place-items-center h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gold-gradient shadow-elegant">
            <Church className="h-16 w-16 sm:h-20 sm:w-20 text-background" />
          </div>
          <p className="text-xs uppercase tracking-[0.5em] text-gold/90 mb-4">Champion</p>
          <h2
            className="text-6xl sm:text-8xl font-bold tracking-tight"
            style={{ color: winner.color, textShadow: `0 0 60px ${winner.color}80` }}
          >
            {winner.name}
          </h2>
          <p className="font-mono text-3xl sm:text-4xl text-foreground/90 mt-4">
            {winner.score} <span className="text-muted-foreground text-xl">pts</span>
          </p>
          <button
            onClick={reset}
            className="mt-10 inline-flex items-center gap-2 rounded-full glass px-6 py-3 font-medium hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Run again
          </button>
        </div>
      )}
    </div>
  );
}
