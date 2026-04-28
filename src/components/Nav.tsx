import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const { pathname } = useLocation();
  const isScoreboard = pathname === "/";
  const [visible, setVisible] = useState(true);

  // Auto-hide on the scoreboard page after idle
  useEffect(() => {
    if (!isScoreboard) {
      setVisible(true);
      return;
    }
    let timer: number | undefined;
    const show = () => {
      setVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisible(false), 3000);
    };
    show();
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show);
    window.addEventListener("keydown", show);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
      window.removeEventListener("keydown", show);
    };
  }, [isScoreboard]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 px-4 sm:px-6 py-4 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-2.5 shadow-elegant bg-black/60 backdrop-blur-xl border border-white/10">
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
