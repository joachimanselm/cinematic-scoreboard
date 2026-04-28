import { Link } from "@tanstack/react-router";
import { Church, Timer, Crown, Maximize2 } from "lucide-react";

const links = [
  { to: "/", label: "Scoreboard", icon: Church },
  { to: "/timer", label: "Timer", icon: Timer },
  { to: "/winner", label: "Winner", icon: Crown },
] as const;

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between glass rounded-full px-6 py-3 shadow-elegant">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gold-gradient grid place-items-center">
            <Church className="h-4 w-4 text-background" />
          </div>
          <span className="font-bold tracking-tight text-sm sm:text-base">
            ST PAUL'S <span className="text-gold">VBS</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-white/10 text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-white/5" }}
              className="flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-medium transition-all"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="ml-1 grid place-items-center h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
