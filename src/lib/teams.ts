import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Team = Tables<"teams">;

export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from("teams").select("*").order("id");
  if (error) throw error;
  return data ?? [];
}

export async function updateScore(id: number, score: number) {
  const { error } = await supabase
    .from("teams")
    .update({ score: Math.max(0, score), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function updateName(id: number, name: string) {
  const { error } = await supabase
    .from("teams")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function updateColor(id: number, color: string) {
  const { error } = await supabase
    .from("teams")
    .update({ color, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function resetAllScores() {
  const { error } = await supabase
    .from("teams")
    .update({ score: 0, updated_at: new Date().toISOString() })
    .gte("id", 0);
  if (error) throw error;
}

export function rankTeams(teams: Team[]): Map<number, number> {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const ranks = new Map<number, number>();
  let lastScore = -Infinity;
  let lastRank = 0;
  sorted.forEach((t, i) => {
    if (t.score !== lastScore) {
      lastRank = i + 1;
      lastScore = t.score;
    }
    ranks.set(t.id, lastRank);
  });
  return ranks;
}
