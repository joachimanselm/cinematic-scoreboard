## Goal

Transform the current glassmorphism scoreboard into a **minimal, edge-to-edge 4-quadrant scoreboard** — solid color blocks, oversized score numbers, almost no chrome. Keep the existing Supabase realtime sync, ST PAUL'S VBS branding, and Timer / Winner pages.

## Layout Reference

```text
┌──────────────────┬──────────────────┐
│  🥇  Team 1      │  🥈  Team 2      │
│                  │                  │
│       42         │       38         │
│                  │                  │
│      − +         │      − +         │
├──────────────────┼──────────────────┤
│  🥉  Team 3      │       Team 4     │
│                  │                  │
│       30         │       12         │
│                  │                  │
│      − +         │      − +         │
└──────────────────┴──────────────────┘
```

## Changes

### 1. Scoreboard page (`src/routes/index.tsx`)
- Remove the centered max-width container, glass cards, color edge bar, and color picker.
- Render a true full-viewport 2x2 CSS grid (`grid-cols-1 md:grid-cols-2`, `grid-rows-2`, `h-[100svh]`).
- Each quadrant fills its cell with the team's solid color (no gradient, no border).
- Inside each quadrant, vertically + horizontally centered:
  1. Small rank pill at top with medal (🥇 🥈 🥉) + "#1"
  2. Team name (medium, click to edit inline) — white text
  3. **Huge** score number (responsive `clamp`, ~`text-[18vw]` on mobile, ~`text-[14vw]` on desktop) with subtle GSAP scale-bounce on change
  4. Minimal `−` / `+` buttons below the score (ghost circles, white/10 background)
- Leader gets a soft inset glow (subtle, not flashy) — inner box-shadow ring in white.
- Keep rank-change GSAP transition and confetti on leader change.

### 2. Team colors (database update via insert tool)
Update the 4 team rows so colors match the spec exactly:
- Team 1 → Red `#ef4444`
- Team 2 → Blue `#3b82f6`
- Team 3 → Green `#22c55e`
- Team 4 → Orange `#f97316`

### 3. Navigation (`src/components/Nav.tsx` + `__root.tsx`)
- Make the nav floating + auto-hide-on-idle so it doesn't compete with the scoreboard. Show it on mouse-move/tap, fade after 3s of idle.
- Remove the `pt-24` top padding from `<main>` so the scoreboard truly fills the screen.
- Keep the Church icon + "ST PAUL'S VBS" wordmark.

### 4. Styles (`src/styles.css`)
- Add a `.quadrant-glow` utility: subtle `inset 0 0 120px rgba(255,255,255,0.15)` for leader emphasis.
- Add Inter font alongside Space Grotesk for the cleaner scoreboard typography.
- Keep all existing tokens (timer + winner pages depend on them).

### 5. Timer + Winner pages
No layout changes — they already match the spec (circular countdown, dramatic reveal, confetti). Just verify they still look right against the simplified nav.

## Technical notes

- Realtime, `useRealtimeTeams`, and `lib/teams.ts` helpers stay as-is.
- Score bounce uses existing GSAP `elastic.out` tween.
- Quadrant background: `style={{ backgroundColor: team.color }}` so DB-driven colors still work.
- Inline name edit: keep current pencil/edit pattern but white-on-color styling.
- Fullscreen toggle button stays in the nav.

## Out of scope
- No changes to auth, RLS, or schema.
- No sound effects (was marked optional and previously deferred).
- No reset/color-picker UI on the scoreboard itself (kept minimal); reset stays accessible from nav area as a small icon button shown when nav is visible.
