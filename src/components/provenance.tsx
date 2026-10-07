import { useState } from "react";
import type { ProvenanceNode } from "@/lib/demo-analysis";
import { cn } from "@/lib/utils";

const kindTone: Record<ProvenanceNode["kind"], string> = {
  origin: "bg-accent/20 ring-accent/50 text-accent",
  news: "bg-support/15 ring-support/40 text-support",
  publication: "bg-secondary ring-border text-foreground",
  blog: "bg-secondary ring-border text-muted-foreground",
};

export function ProvenanceGraph({ nodes }: { nodes: ProvenanceNode[] }) {
  const [selected, setSelected] = useState<ProvenanceNode>(nodes[0]);

  return (
    <section className="glass-panel animate-rise p-6" style={{ animationDelay: "350ms" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Provenance lineage
          </div>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
            Where the information travels
          </h2>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">original → derived</span>
      </div>

      <div className="relative mt-8 grid grid-cols-2 items-start gap-6 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-[18px] hidden h-px bg-gradient-to-r from-accent/50 via-support/40 to-border md:block" />
        {nodes.map((node, i) => (
          <button
            key={node.id}
            onClick={() => setSelected(node)}
            className="group relative z-10 flex flex-col items-center gap-2 text-center"
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full ring-1 transition group-hover:scale-110",
                kindTone[node.kind],
                selected.id === node.id && "ring-2 ring-offset-2 ring-offset-background",
              )}
            >
              <span className="size-2 rounded-full bg-current" />
            </span>
            <span className="text-[11px] font-medium text-foreground">{node.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {node.count} {node.count === 1 ? "source" : "sources"} · {node.credibility.toFixed(2)}
            </span>
            {i < nodes.length - 1 && <span className="text-muted-foreground md:hidden">↓</span>}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{selected.label}</span>
          <span className="font-mono text-[11px] text-muted-foreground">
            credibility {selected.credibility.toFixed(2)}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{selected.detail}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          These {selected.count} {selected.count === 1 ? "source is" : "sources are"} not necessarily{" "}
          {selected.count} separate pieces of evidence — they may all trace back to the original report.
        </p>
      </div>
    </section>
  );
}
