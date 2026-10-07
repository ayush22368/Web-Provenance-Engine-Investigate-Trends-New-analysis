import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shell } from "@/components/chrome";
import { EvidenceColumn, Meter, StatCard, EvidenceCard } from "@/components/evidence";
import { ProvenanceGraph } from "@/components/provenance";
import { TrendTimeline, TrendOrigin, AmplificationChain } from "@/components/trend";
import { generateAnalysis, generateTrend } from "@/lib/demo-analysis";
import { cn } from "@/lib/utils";

type Mode = "claim" | "trend";

export const Route = createFileRoute("/analysis")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    mode: (search.mode === "trend" ? "trend" : "claim") as Mode,
  }),
  head: ({ search }) => ({
    meta: [
      { title: `Analysis: ${search.q ?? ""} — Web Provenance Engine` },
      {
        name: "description",
        content: "Evidence analysis, source independence, provenance lineage, and information echo detection.",
      },
      { property: "og:title", content: `Analysis: ${search.q ?? ""}` },
      { property: "og:description", content: "Evidence intelligence from Web Provenance Engine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalysisPage,
});

const verdictTone: Record<string, string> = {
  "Mostly Supported": "bg-support/15 text-support ring-support/30",
  "Partially Supported": "bg-accent/15 text-accent ring-accent/30",
  "Insufficient Evidence": "bg-secondary text-muted-foreground ring-border",
  Contradicted: "bg-contra/15 text-contra ring-contra/30",
};

function AnalysisPage() {
  const { q, mode } = Route.useSearch();

  const claim = useMemo(() => (mode === "claim" && q ? generateAnalysis(q) : null), [q, mode]);
  const trend = useMemo(() => (mode === "trend" && q ? generateTrend(q) : null), [q, mode]);

  if (!q) {
    return (
      <Shell>
        <main className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Nothing to analyze yet</h1>
          <p className="mt-3 text-muted-foreground">Enter a claim or trend on the homepage to begin.</p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Start an analysis
          </Link>
        </main>
      </Shell>
    );
  }

  const data = claim ?? trend!;
  const supporting = data.sources.filter((s) => s.stance === "supporting");
  const contradicting = data.sources.filter((s) => s.stance === "contradicting");
  const neutral = data.sources.filter((s) => s.stance === "neutral");
  const echoTone =
    data.echoLevel === "High" ? "text-contra" : data.echoLevel === "Moderate" ? "text-accent" : "text-support";

  return (
    <Shell>
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        {/* Claim / trend header */}
        <div className="glass-panel animate-rise px-5 py-5 sm:px-7">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            {mode === "claim" ? "Claim under investigation" : "Trend under investigation"}
          </div>
          <h1 className="mt-3 max-w-[26ch] text-balance font-display text-3xl font-bold leading-tight sm:text-4xl">
            {q}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {claim && (
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1",
                  verdictTone[claim.verdict],
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                Verdict · {claim.verdict}
              </span>
            )}
            <span className="rounded-full bg-secondary px-3.5 py-1.5 text-sm text-muted-foreground ring-1 ring-border">
              {data.totalResults} results analyzed
            </span>
            <span className="rounded-full bg-secondary px-3.5 py-1.5 text-sm text-muted-foreground ring-1 ring-border">
              {data.independentCount} independent · {data.derivedCount} derived
            </span>
          </div>
        </div>

        {/* Stat row */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="glass-panel animate-rise p-5" style={{ animationDelay: "80ms" }}>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Evidence strength
            </div>
            <div className="mt-3 font-display text-5xl font-bold tracking-tight">
              {claim ? claim.evidenceStrength : Math.round((data.independentCount / data.totalResults) * 100)}
              <span className="text-2xl text-muted-foreground">%</span>
            </div>
            <div className="mt-4">
              <Meter value={claim ? claim.evidenceStrength : Math.round((data.independentCount / data.totalResults) * 100)} />
            </div>
            {claim && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{claim.verdictReason}</p>}
          </div>
          <StatCard
            label="Source independence"
            delay={140}
            value={
              <>
                {data.independentCount}
                <span className="text-lg text-muted-foreground">/{data.totalResults}</span>
              </>
            }
            sub={`${data.derivedCount} results derive from previously published information — ${data.totalResults} articles repeating a claim is not ${data.totalResults} independent confirmations.`}
          />
          <div className="glass-panel animate-rise p-5" style={{ animationDelay: "200ms" }}>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Information echo
            </div>
            <div className={cn("mt-3 font-display text-4xl font-bold tracking-tight", echoTone)}>
              {data.echoLevel}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{data.echoSummary}</p>
          </div>
        </div>

        {/* Evidence columns */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <EvidenceColumn stance="supporting" sources={supporting} />
          <EvidenceColumn stance="contradicting" sources={contradicting} />
          <EvidenceColumn stance="neutral" sources={neutral} />
        </div>

        {/* Claim-only: provenance + synthesis */}
        {claim && (
          <>
            <div className="mt-5">
              <ProvenanceGraph nodes={claim.provenance} />
            </div>
            <section className="glass-panel animate-rise mt-5 p-6" style={{ animationDelay: "420ms" }}>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                What the evidence says
              </div>
              <p className="mt-3 max-w-4xl text-pretty font-display text-lg leading-relaxed tracking-tight sm:text-xl">
                {claim.synthesis}
              </p>
            </section>
          </>
        )}

        {/* Trend-only sections */}
        {trend && (
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TrendTimeline analysis={trend} />
            <div className="space-y-5">
              <TrendOrigin analysis={trend} />
              <AmplificationChain analysis={trend} />
            </div>
          </div>
        )}

        {/* Sources analyzed */}
        <section className="glass-panel animate-rise mt-5 p-6" style={{ animationDelay: "480ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Sources analyzed
              </div>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
                The underlying webpages, unhidden
              </h2>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {data.sources.length} shown · {data.totalResults} total
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.sources.map((source, i) => (
              <EvidenceCard key={source.id} source={source} delay={i * 60} />
            ))}
          </div>
        </section>
      </main>
    </Shell>
  );
}
