import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/chrome";
import { cn } from "@/lib/utils";

type Mode = "claim" | "trend";

const EXAMPLES: Record<Mode, string[]> = {
  claim: [
    "India is the third-largest economy in the world",
    "Electric vehicles are better for the environment",
    "AI agents will replace software developers",
  ],
  trend: ["AI coding agents", "Lab-grown meat", "The rise of digital nomad visas"],
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search["mode"] === "trend" ? "trend" : "claim") as Mode,
  }),
  head: () => ({
    meta: [
      { title: "Web Provenance Engine — Understand where information comes from" },
      {
        name: "description",
        content:
          "Analyze claims, trace sources, detect information echoes, compare evidence, and discover how trends spread across the web.",
      },
      { property: "og:title", content: "Web Provenance Engine" },
      {
        property: "og:description",
        content:
          "Don't just search the web. Understand where the information comes from — evidence analysis, source independence, and provenance graphs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { mode } = Route.useSearch();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const setMode = (m: Mode) => navigate({ to: "/", search: { mode: m } });

  const submit = (q: string) => {
    const value = q.trim();
    if (!value) return;
    navigate({ to: "/analysis", search: { q: value, mode } });
  };

  return (
    <Shell>
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16 md:px-12">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-accent backdrop-blur">
            <span className="relative flex size-2">
              <span className="animate-ping-soft absolute inline-flex size-2 rounded-full bg-accent" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Evidence intelligence
          </div>
          <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight md:text-7xl">
            Don't just search the web.
            <br />
            <span className="text-gradient-accent">Understand where it comes from.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Analyze claims, trace sources, detect information echoes, compare evidence, and discover how
            trends spread across the web.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <button
            onClick={() => setMode("claim")}
            className={cn(
              "glass-panel p-6 text-left transition hover:border-accent/40",
              mode === "claim" && "border-accent/50 ring-1 ring-accent/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold">Investigate a Claim</span>
              {mode === "claim" && <span className="size-2 rounded-full bg-accent" />}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Find supporting and contradicting evidence and trace information back to its sources.
            </p>
          </button>
          <button
            onClick={() => setMode("trend")}
            className={cn(
              "glass-panel p-6 text-left transition hover:border-accent/40",
              mode === "trend" && "border-accent/50 ring-1 ring-accent/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold">Analyze a Trend</span>
              {mode === "trend" && <span className="size-2 rounded-full bg-accent" />}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Discover where a trend started, how it spread, and who amplified it.
            </p>
          </button>
        </div>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
        >
          <div className="glass-panel flex flex-col gap-3 p-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === "claim"
                  ? "Enter a claim you want to investigate…"
                  : "Enter a topic or emerging trend…"
              }
              className="min-h-12 flex-1 rounded-2xl border border-input bg-background/60 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent/50 focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              className="min-h-12 rounded-2xl bg-primary px-7 font-semibold text-primary-foreground transition hover:brightness-110"
            >
              {mode === "claim" ? "Analyze Claim" : "Analyze Trend"}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          {EXAMPLES[mode].map((example) => (
            <button
              key={example}
              onClick={() => submit(example)}
              className="rounded-full border border-border bg-secondary px-4 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:border-accent/40 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>

        <p className="mt-16 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Search results show what is being said. Web Provenance Engine shows where it came from, how
          independently it is supported, and what the evidence actually says.
        </p>
      </main>
    </Shell>
  );
}
