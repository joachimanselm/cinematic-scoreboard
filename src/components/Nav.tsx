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
    <div
      className={`fixed top-1/2 right-3 sm:right-4 -translate-y-1/2 z-50 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-2 rounded-2xl px-2 py-3 shadow-elegant bg-black/60 backdrop-blur-xl border border-white/10">
        <Link to="/" aria-label="ST PAUL'S VBS" className="mb-1">
          <div className="h-9 w-9 rounded-full bg-gold-gradient grid place-items-center">
            <Church className="h-4 w-4 text-background" />
          </div>
        </Link>

        <nav className="flex flex-col items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              title={label}
              aria-label={label}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-white/10 text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-white/5" }}
              className="grid place-items-center h-10 w-10 rounded-full transition-all"
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            title="Fullscreen"
            className="mt-1 grid place-items-center h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
