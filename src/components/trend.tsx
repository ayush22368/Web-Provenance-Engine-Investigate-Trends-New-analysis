import type { TrendAnalysis } from "@/lib/demo-analysis";
import { cn } from "@/lib/utils";

const kindTone: Record<string, string> = {
  mention: "bg-secondary text-muted-foreground ring-border",
  event: "bg-accent/15 text-accent ring-accent/40",
  spike: "bg-contra/15 text-contra ring-contra/40",
  publication: "bg-support/15 text-support ring-support/40",
  amplification: "bg-indigo-400/15 text-indigo-300 ring-indigo-400/40",
};

export function TrendTimeline({ analysis }: { analysis: TrendAnalysis }) {
  return (
    <section className="glass-panel animate-rise p-6">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Trend timeline</div>
      <h2 className="mt-1 font-display text-xl font-bold tracking-tight">How “{analysis.query}” developed</h2>

      <ol className="relative mt-8 space-y-6 border-l border-border pl-6">
        {analysis.timeline.map((event, i) => (
          <li key={i} className="animate-rise relative" style={{ animationDelay: `${i * 120}ms` }}>
            <span className="absolute -left-[31px] top-1 grid size-4 place-items-center rounded-full bg-background ring-1 ring-border">
              <span className="size-1.5 rounded-full bg-accent" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">{event.date}</span>
              <span className={cn("rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ring-1", kindTone[event.kind])}>
                {event.kind}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold">{event.label}</div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TrendOrigin({ analysis }: { analysis: TrendAnalysis }) {
  return (
    <section className="glass-panel animate-rise p-6" style={{ animationDelay: "120ms" }}>
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Possible origin</div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The earliest significant discussion identified in the analyzed results appears to come from:
      </p>
      <div className="mt-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
        <div className="text-sm font-semibold text-accent">{analysis.origin.source}</div>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{analysis.origin.date}</div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{analysis.origin.note}</p>
    </section>
  );
}

export function AmplificationChain({ analysis }: { analysis: TrendAnalysis }) {
  return (
    <section className="glass-panel animate-rise p-6" style={{ animationDelay: "200ms" }}>
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Who amplified it</div>
      <h2 className="mt-1 font-display text-xl font-bold tracking-tight">Propagation path</h2>
      <div className="mt-6 space-y-0">
        {analysis.amplification.map((step, i) => (
          <div key={i} className="animate-rise" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 backdrop-blur-xl">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[11px] text-muted-foreground ring-1 ring-border">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold">{step.label}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </div>
            {i < analysis.amplification.length - 1 && (
              <div className="py-1 text-center text-muted-foreground">↓</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground backdrop-blur-xl">
        <span className={cn("font-semibold", analysis.organic ? "text-support" : "text-contra")}>
          {analysis.organic ? "Mostly organic growth. " : "Event-driven growth. "}
        </span>
        {analysis.growthVerdict}
      </div>
    </section>
  );
}
