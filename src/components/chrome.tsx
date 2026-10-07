import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="animate-glow absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-accent/20 blur-[130px]" />
      <div className="animate-glow absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="animate-drift-slow absolute -right-16 top-10 h-[680px] w-64 rounded-[40px] border border-border bg-gradient-to-b from-secondary to-transparent backdrop-blur-2xl" />
      <div className="animate-drift-slower absolute -left-24 top-24 h-[520px] w-52 rounded-[40px] border border-border bg-gradient-to-b from-accent/10 to-transparent backdrop-blur-2xl" />
      <div className="animate-drift-slowest absolute right-1/3 bottom-10 h-[420px] w-40 rounded-[40px] border border-border bg-gradient-to-b from-secondary to-transparent backdrop-blur-xl" />
    </div>
  );
}

export function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
      <Link to="/" className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
          W
        </div>
        <span className="font-display text-lg font-bold tracking-tight">Web Provenance Engine</span>
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <Link to="/" className="transition hover:text-foreground">
          Investigate
        </Link>
        <Link to="/" search={{ mode: "trend" }} className="transition hover:text-foreground">
          Trends
        </Link>
      </nav>
      <Link
        to="/"
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
      >
        New analysis
      </Link>
    </header>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-body text-foreground antialiased">
      <BackgroundFX />
      <Header />
      {children}
    </div>
  );
}
