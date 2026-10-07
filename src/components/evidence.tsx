import type { EvidenceSource, Stance } from "@/lib/demo-analysis";
import { cn } from "@/lib/utils";

const stanceStyles: Record<Stance, { label: string; hint: string; text: string; chip: string }> = {
  supporting: {
    label: "Supporting",
    hint: "Sources that say the claim is true",
    text: "text-support",
    chip: "bg-support/15 text-support ring-support/30",
  },
  contradicting: {
    label: "Contradicting",
    hint: "Sources that say the claim is wrong or false — 0 means no source disagreed",
    text: "text-contra",
    chip: "bg-contra/15 text-contra ring-contra/30",
  },
  neutral: {
    label: "Neutral / Context",
    hint: "Related sources with no clear position",
    text: "text-neut",
    chip: "bg-secondary text-muted-foreground ring-border",
  },
};

export function CredibilityDot({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone = value >= 0.75 ? "text-support" : value >= 0.5 ? "text-accent" : "text-contra";
  return (
    <span className={cn("font-mono text-[11px]", tone)} title={`Credibility ${pct}%`}>
      cred {value.toFixed(2)}
    </span>
  );
}

export function EvidenceCard({ source, delay = 0 }: { source: EvidenceSource; delay?: number }) {
  const s = stanceStyles[source.stance];
  return (
    <article
      className="animate-rise rounded-2xl border border-border bg-card p-4 backdrop-blur-xl"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("rounded px-2 py-0.5 font-mono text-[11px] font-semibold ring-1", s.chip)}>
          {source.independent ? "Independent" : "Derived"} · {source.type}
        </span>
        <CredibilityDot value={source.credibility} />
      </div>
      <h4 className="mt-3 text-sm font-semibold leading-snug text-foreground">{source.headline}</h4>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{source.excerpt}</p>
      <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Why it matters: </span>
        {source.why}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{source.name}</span>
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-accent transition hover:brightness-125"
        >
          Open source →
        </a>
      </div>
    </article>
  );
}

export function EvidenceColumn({ stance, sources }: { stance: Stance; sources: EvidenceSource[] }) {
  const s = stanceStyles[stance];
  return (
    <section className="glass-panel animate-rise p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className={cn("text-sm font-semibold", s.text)}>{s.label}</h3>
        <span className="font-mono text-[11px] text-muted-foreground">{sources.length} sources</span>
      </div>
      <p className="-mt-2 mb-3 text-[11px] leading-snug text-muted-foreground">{s.hint}</p>
      <div className="space-y-3">
        {sources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-5 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {stance === "supporting" && "No sources clearly support this claim yet."}
              {stance === "contradicting" &&
                "No source disagreed with this claim — nothing found that says it is wrong."}
              {stance === "neutral" && "No neutral or background sources found."}
            </p>
          </div>
        ) : (
          sources.slice(0, 3).map((src, i) => <EvidenceCard key={src.id} source={src} delay={i * 120} />)
        )}
      </div>
    </section>
  );
}

export function Meter({ value, tone = "accent" }: { value: number; tone?: "accent" | "support" | "contra" }) {
  const bar =
    tone === "support"
      ? "bg-support"
      : tone === "contra"
        ? "bg-contra"
        : "bg-gradient-to-r from-accent to-indigo-300";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div className={cn("animate-meter h-full rounded-full", bar)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  delay?: number;
}) {
  return (
    <div className="glass-panel animate-rise p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-3 font-display text-4xl font-bold tracking-tight">{value}</div>
      {sub && <p className="mt-2 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
