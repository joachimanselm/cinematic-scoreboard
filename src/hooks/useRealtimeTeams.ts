import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchTeams, type Team } from "@/lib/teams";

export function useRealtimeTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchTeams()
      .then((data) => {
        if (mounted) {
          setTeams(data);
          setLoading(false);
        }
      })
      .catch(() => mounted && setLoading(false));

    const channel = supabase
      .channel("teams-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const next = payload.new as Team;
            setTeams((prev) => {
              const exists = prev.find((t) => t.id === next.id);
              if (exists) return prev.map((t) => (t.id === next.id ? next : t));
              return [...prev, next].sort((a, b) => a.id - b.id);
            });
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { teams, loading };
}
