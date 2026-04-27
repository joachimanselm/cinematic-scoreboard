
CREATE TABLE public.teams (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#ffffff',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "public can update teams" ON public.teams FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public can insert teams" ON public.teams FOR INSERT WITH CHECK (true);

ALTER TABLE public.teams REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;

INSERT INTO public.teams (id, name, score, color) VALUES
  (1, 'Red Team', 0, '#ef4444'),
  (2, 'Blue Team', 0, '#3b82f6'),
  (3, 'Green Team', 0, '#22c55e'),
  (4, 'Yellow Team', 0, '#eab308');
