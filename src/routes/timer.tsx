import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Play, Pause, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/timer")({
  head: () => ({
    meta: [
      { title: "Timer — Cinematic Scoreboard" },
      { name: "description", content: "Cinematic countdown timer with smooth circular animation." },
    ],
  }),
  component: TimerPage,
});

const RADIUS = 140;
const CIRC = 2 * Math.PI * RADIUS;

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function TimerPage() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);

  const ringRef = useRef<SVGCircleElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const lastTickRef = useRef<number | null>(null);

  // Update ring + number on remaining change
  useEffect(() => {
    if (ringRef.current) {
      const progress = duration > 0 ? remaining / duration : 0;
      gsap.to(ringRef.current, {
        strokeDashoffset: CIRC * (1 - progress),
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [remaining, duration]);

  // Tick loop
  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    let raf = 0;
    const tick = (t: number) => {
      if (lastTickRef.current === null) lastTickRef.current = t;
      const dt = (t - lastTickRef.current) / 1000;
      lastTickRef.current = t;
      setRemaining((r) => {
        const next = Math.max(0, r - dt);
        if (next === 0) setRunning(false);
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // Pulse number when low
  const lowWarning = remaining > 0 && remaining <= 10;
  useEffect(() => {
    if (lowWarning && numRef.current) {
      const tween = gsap.to(numRef.current, { scale: 1.08, duration: 0.5, yoyo: true, repeat: -1, ease: "power1.inOut" });
      return () => { tween.kill(); gsap.set(numRef.current, { scale: 1 }); };
    }
  }, [lowWarning]);

  const start = () => { if (remaining === 0) setRemaining(duration); setRunning(true); };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(duration); };

  const handleSet = (mins: number, secs: number) => {
    const total = Math.max(1, mins * 60 + secs);
    setDuration(total);
    setRemaining(total);
    setRunning(false);
  };

  const ringColor = lowWarning ? "var(--color-destructive)" : "var(--gold)";

  return (
    <div className="px-4 sm:px-6 pb-10 grid place-items-center min-h-[calc(100vh-7rem)]">
      <div className="text-center w-full max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/80 mb-2">Countdown</p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-10">
          The <span className="text-gold">Timer</span>
        </h1>

        <div className="relative grid place-items-center mx-auto w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
          {/* Glow halo */}
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-40 transition-colors"
            style={{ background: lowWarning ? "var(--color-destructive)" : "var(--gold)" }}
          />
          <svg viewBox="0 0 320 320" className="absolute inset-0 -rotate-90 w-full h-full">
            <circle cx="160" cy="160" r={RADIUS} stroke="oklch(1 0 0 / 0.08)" strokeWidth="14" fill="none" />
            <circle
              ref={ringRef}
              cx="160"
              cy="160"
              r={RADIUS}
              stroke={ringColor}
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={0}
              style={{ filter: `drop-shadow(0 0 14px ${lowWarning ? "oklch(0.65 0.24 27)" : "oklch(0.82 0.15 85)"})` }}
            />
          </svg>
          <div ref={numRef} className="relative z-10 text-center">
            <div
              className="font-mono text-6xl sm:text-7xl font-bold tabular-nums tracking-tight"
              style={{ color: lowWarning ? "oklch(0.75 0.24 27)" : "white", textShadow: lowWarning ? "0 0 40px oklch(0.65 0.24 27 / 0.6)" : "0 0 40px oklch(0.82 0.15 85 / 0.5)" }}
            >
              {format(remaining)}
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-2">
              of {format(duration)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={running ? pause : start}
            className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-3 font-semibold text-background shadow-elegant hover:scale-105 transition-transform"
          >
            {running ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> Start</>}
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 font-medium hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        <div className="mt-10 glass rounded-2xl p-5 inline-flex flex-wrap items-center justify-center gap-3 shadow-elegant">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Set time</span>
          <TimeInput onSet={handleSet} initialSeconds={duration} />
          <div className="flex gap-2">
            {[30, 60, 180, 300].map((s) => (
              <button
                key={s}
                onClick={() => handleSet(Math.floor(s / 60), s % 60)}
                className="rounded-full px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 transition-colors"
              >
                {format(s)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeInput({ onSet, initialSeconds }: { onSet: (m: number, s: number) => void; initialSeconds: number }) {
  const [m, setM] = useState(Math.floor(initialSeconds / 60));
  const [s, setS] = useState(initialSeconds % 60);
  return (
    <div className="flex items-center gap-1 font-mono">
      <input
        type="number"
        min={0}
        max={99}
        value={m}
        onChange={(e) => setM(Math.max(0, Math.min(99, +e.target.value || 0)))}
        onBlur={() => onSet(m, s)}
        className="w-12 bg-white/5 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:bg-white/10"
      />
      <span className="text-muted-foreground">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={s}
        onChange={(e) => setS(Math.max(0, Math.min(59, +e.target.value || 0)))}
        onBlur={() => onSet(m, s)}
        className="w-12 bg-white/5 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:bg-white/10"
      />
    </div>
  );
}
