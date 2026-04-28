import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/Nav";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-3xl p-10 shadow-elegant">
        <h1 className="text-7xl font-bold text-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-gradient px-6 py-2 text-sm font-semibold text-background"
        >
          Go to scoreboard
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ST.PAUL'S VBS DASHBOARD" },
      { name: "description", content: "A premium real-time event scoreboard with cinematic animations." },
      { name: "theme-color", content: "#0b0b14" },
      { property: "og:title", content: "ST.PAUL'S VBS DASHBOARD" },
      { name: "twitter:title", content: "ST.PAUL'S VBS DASHBOARD" },
      { property: "og:description", content: "A premium real-time event scoreboard with cinematic animations." },
      { name: "twitter:description", content: "A premium real-time event scoreboard with cinematic animations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/48f461ed-c2fc-4cf4-b6cc-56ad11e3184f/id-preview-f647a8cd--d47d75d6-ca4e-465a-b42a-1ae36815c800.lovable.app-1777399836100.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/48f461ed-c2fc-4cf4-b6cc-56ad11e3184f/id-preview-f647a8cd--d47d75d6-ca4e-465a-b42a-1ae36815c800.lovable.app-1777399836100.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
