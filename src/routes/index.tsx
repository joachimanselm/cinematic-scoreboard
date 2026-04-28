import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { Minus, Plus, Pencil, Check, RotateCcw } from "lucide-react";
import { useRealtimeTeams } from "@/hooks/useRealtimeTeams";
import { rankTeams, resetAllScores, updateName, updateScore, type Team } from "@/lib/teams";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Scoreboard — ST PAUL'S VBS" },
      { name: "description", content: "Real-time 4-team scoreboard synced across all devices." },
    ],
  }),
  component: ScoreboardPage,
});

const MEDALS = ["🥇", "🥈", "🥉", ""] as const;

function ScoreboardPage() {
  const { teams, loading } = useRealtimeTeams();
  const ranks = useMemo(() => rankTeams(teams), [teams]);

  const prevLeaderRef = useRef<number | null>(null);
  useEffect(() => {
    if (teams.length === 0) return;
    const leader = [...teams].sort((a, b) => b.score - a.score)[0];
    const allZero = teams.every((t) => t.score === 0);
    if (allZero) {
      prevLeaderRef.current = null;
      return;
    }
    if (prevLeaderRef.current !== null && prevLeaderRef.current !== leader.id) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.4 },
        colors: [leader.color, "#ffffff"],
      });
    }
    prevLeaderRef.current = leader.id;
  }, [teams]);

  const handleReset = async () => {
    try {
      await resetAllScores();
      toast.success("All scores reset");
    } catch {
      toast.error("Couldn't reset scores");
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center h-[100svh] text-muted-foreground">
        Loading scoreboard…
      </div>
    );
  }

  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      <div className="grid grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 h-full w-full">
        {teams.map((team) => (
          <Quadrant key={team.id} team={team} rank={ranks.get(team.id) ?? 4} />
        ))}
      </div>

      {/* Floating reset (subtle, bottom right) */}
      <button
        onClick={handleReset}
        aria-label="Reset all scores"
        className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md px-3 py-2 text-xs font-medium text-white/80 hover:bg-black/70 hover:text-white transition-all border border-white/10"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </button>
    </div>
  );
}

function Quadrant({ team, rank }: { team: Team; rank: number }) {
  const scoreRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevScoreRef = useRef(team.score);
  const prevRankRef = useRef(rank);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(team.name);
  const [busy, setBusy] = useState(false);

  // Score bounce
  useEffect(() => {
    if (prevScoreRef.current !== team.score && scoreRef.current) {
      gsap.fromTo(
        scoreRef.current,
        { scale: 0.8, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }
      );
    }
    prevScoreRef.current = team.score;
  }, [team.score]);

  // Rank change subtle nudge
  useEffect(() => {
    if (prevRankRef.current !== rank && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0.7 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
    prevRankRef.current = rank;
  }, [rank]);

  // Entrance
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out", delay: team.id * 0.06 }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLeader = rank === 1 && team.score > 0;

  const change = async (delta: number) => {
    if (busy) return;
    setBusy(true);
    try {
      await updateScore(team.id, team.score + delta);
    } catch {
      toast.error("Couldn't update score");
    } finally {
      setBusy(false);
    }
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim() || team.name;
    setEditing(false);
    if (trimmed !== team.name) {
      try { await updateName(team.id, trimmed); } catch { toast.error("Couldn't save name"); }
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center justify-center text-white p-4 sm:p-6 overflow-hidden ${
        isLeader ? "quadrant-leader" : ""
      }`}
      style={{ backgroundColor: team.color }}
    >
      {/* Top: rank pill */}
      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/20 backdrop-blur-sm px-3 py-1.5 text-xs sm:text-sm font-semibold tracking-wide">
        <span className="text-base sm:text-lg leading-none">{MEDALS[rank - 1] || `#${rank}`}</span>
        {MEDALS[rank - 1] && <span className="opacity-90">#{rank}</span>}
      </div>

      {/* Center stack: name → score → controls */}
      <div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-4">
        {/* Name */}
        <div className="flex items-center gap-2 min-h-[36px]">
          {editing ? (
            <>
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                onBlur={saveName}
                className="bg-transparent border-b border-white/40 text-xl sm:text-3xl font-semibold text-center focus:outline-none focus:border-white pb-1 w-[60vw] max-w-md"
              />
              <button onClick={saveName} className="text-white/80 hover:text-white">
                <Check className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => { setNameDraft(team.name); setEditing(true); }}
              className="group flex items-center gap-2 text-xl sm:text-3xl font-semibold tracking-tight uppercase hover:opacity-90 transition-opacity"
            >
              <span>{team.name}</span>
              <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
            </button>
          )}
        </div>

        {/* Score */}
        <div
          ref={scoreRef}
          className="font-bold leading-none tabular-nums tracking-tighter"
          style={{
            fontSize: "clamp(5rem, 18vw, 16rem)",
            textShadow: isLeader ? "0 0 60px rgba(255,255,255,0.35)" : "0 4px 30px rgba(0,0,0,0.25)",
          }}
        >
          {team.score}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2">
          <button
            onClick={() => change(-1)}
            disabled={busy || team.score <= 0}
            aria-label="Decrease score"
            className="grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={() => change(1)}
            disabled={busy}
            aria-label="Increase score"
            className="grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/25 hover:bg-white/40 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
