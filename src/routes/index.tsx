import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { Minus, Plus, RotateCcw, Pencil, Check } from "lucide-react";
import { useRealtimeTeams } from "@/hooks/useRealtimeTeams";
import { rankTeams, resetAllScores, updateColor, updateName, updateScore, type Team } from "@/lib/teams";
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

  // Track previous leader to fire confetti on change
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
        particleCount: 140,
        spread: 90,
        origin: { y: 0.4 },
        colors: [leader.color, "#ffffff", "#fbbf24"],
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
      <div className="grid place-items-center h-[70vh] text-muted-foreground">
        Loading scoreboard…
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Live Event</p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mt-1">
              The <span className="text-gold">Scoreboard</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Real-time sync · tap a team name to edit · changes appear on every device.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} rank={ranks.get(team.id) ?? 4} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, rank }: { team: Team; rank: number }) {
  const scoreRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevScoreRef = useRef(team.score);
  const prevRankRef = useRef(rank);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(team.name);
  const [busy, setBusy] = useState(false);

  // Score bounce animation
  useEffect(() => {
    if (prevScoreRef.current !== team.score && scoreRef.current) {
      gsap.fromTo(
        scoreRef.current,
        { scale: 0.7, opacity: 0.4 },
        { scale: 1, opacity: 1, duration: 0.55, ease: "elastic.out(1, 0.5)" }
      );
    }
    prevScoreRef.current = team.score;
  }, [team.score]);

  // Rank change subtle nudge
  useEffect(() => {
    if (prevRankRef.current !== rank && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: rank < prevRankRef.current ? 12 : -12, opacity: 0.6 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
    prevRankRef.current = rank;
  }, [rank]);

  // Entrance
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: team.id * 0.08 }
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
      className={`group relative glass rounded-3xl p-6 sm:p-8 shadow-elegant overflow-hidden transition-transform duration-300 hover:scale-[1.015] ${isLeader ? "glow-pulse" : ""}`}
      style={{
        ["--team-glow" as never]: `${team.color}66`,
        background: `linear-gradient(135deg, ${team.color}22 0%, oklch(1 0 0 / 0.02) 60%)`,
      }}
    >
      {/* Color edge */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${team.color}, transparent)` }}
      />

      {/* Rank badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="grid place-items-center h-10 w-10 rounded-full font-bold text-sm"
            style={{ background: `${team.color}33`, color: team.color, border: `1px solid ${team.color}66` }}
          >
            #{rank}
          </div>
          <span className="text-3xl">{MEDALS[rank - 1]}</span>
        </div>
        <input
          type="color"
          value={team.color}
          onChange={(e) => updateColor(team.id, e.target.value)}
          className="h-7 w-7 rounded-full bg-transparent border border-white/10 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Team color"
        />
      </div>

      {/* Name */}
      <div className="flex items-center gap-2 mb-2 min-h-[36px]">
        {editing ? (
          <>
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              onBlur={saveName}
              className="flex-1 bg-transparent border-b border-white/20 text-xl sm:text-2xl font-semibold focus:outline-none focus:border-white/60 pb-1"
            />
            <button onClick={saveName} className="text-muted-foreground hover:text-foreground">
              <Check className="h-5 w-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => { setNameDraft(team.name); setEditing(true); }}
            className="flex items-center gap-2 text-xl sm:text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            <span style={{ color: team.color, textShadow: `0 0 24px ${team.color}55` }}>{team.name}</span>
            <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
      </div>

      {/* Score */}
      <div
        ref={scoreRef}
        className="font-mono text-7xl sm:text-8xl font-bold leading-none tracking-tighter my-4"
        style={{ color: "white", textShadow: `0 0 40px ${team.color}55` }}
      >
        {team.score}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => change(-1)}
          disabled={busy || team.score <= 0}
          aria-label="Decrease score"
          className="flex-1 grid place-items-center h-14 rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Minus className="h-6 w-6" />
        </button>
        <button
          onClick={() => change(1)}
          disabled={busy}
          aria-label="Increase score"
          className="flex-[2] grid place-items-center h-14 rounded-2xl font-semibold text-background transition-all active:scale-95 disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}cc)`, boxShadow: `0 10px 30px -10px ${team.color}` }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
