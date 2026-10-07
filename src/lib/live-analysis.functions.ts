import { createServerFn } from "@tanstack/react-start";
import type {
  ClaimAnalysis,
  EvidenceSource,
  ProvenanceNode,
  SourceType,
  Stance,
  TrendAnalysis,
  TrendEvent,
} from "./demo-analysis";

interface RawResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  date: string;
}

async function serp(params: Record<string, string>): Promise<{ results: RawResult[]; total: number }> {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) throw new Error("Search key is not configured");
  const url = new URL("https://serpapi.com/search.json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("api_key", key);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const json = (await res.json()) as Record<string, any>;
  if (json["error"]) throw new Error(String(json["error"]));
  const list: any[] = json["organic_results"] ?? json["news_results"] ?? [];
  const results: RawResult[] = list
    .map((r) => ({
      title: String(r.title ?? ""),
      link: String(r.link ?? ""),
      snippet: String(r.snippet ?? r.snippet_highlighted_words?.join(" ") ?? ""),
      source: String(r.source?.name ?? r.source ?? domainOf(String(r.link ?? ""))),
      date: String(r.date ?? r.iso_date ?? ""),
    }))
    .filter((r) => r.link);
  const total = Number(json["search_information"]?.["total_results"] ?? results.length) || results.length;
  return { results, total };
}

function domainOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function classify(domain: string): { type: SourceType; cred: number } {
  const d = domain.toLowerCase();
  if (/\.gov(\.|$)|\.mil$|who\.int|un\.org|europa\.eu|\.int$/.test(d)) return { type: "Official source", cred: 0.93 };
  if (/\.edu(\.|$)|\.ac\.|nature\.com|science\.org|nih\.gov|arxiv|springer|wiley|pubmed|sciencedirect|thelancet|nejm|jstor/.test(d))
    return { type: "Research / report", cred: 0.9 };
  if (/reuters|apnews|bbc|nytimes|washingtonpost|theguardian|ft\.com|wsj|bloomberg|economist|npr|cnn|aljazeera|thehindu|indianexpress|hindustantimes|timesofindia|ndtv|cnbc|forbes|axios/.test(d))
    return { type: "Major news organization", cred: 0.82 };
  if (/wikipedia|britannica/.test(d)) return { type: "Secondary publication", cred: 0.7 };
  if (/reddit|quora|twitter|x\.com|facebook|youtube|tiktok|instagram|linkedin/.test(d))
    return { type: "User-generated content", cred: 0.3 };
  if (/medium|substack|blogspot|wordpress|blog/.test(d)) return { type: "Blog", cred: 0.45 };
  return { type: "Secondary publication", cred: 0.6 };
}

const CONTRA = /\b(false|myth|debunk|not true|misleading|no evidence|fake|hoax|incorrect|wrong|denies|disputed|fact[- ]check|unproven|refute|contrary|doesn'?t|does not|isn'?t|is not)\b/i;
const SUPPORT = /\b(confirm|shows?|found|proves?|evidence|study|according|reports?|data|increase|rise|record|true|indeed|demonstrat)\w*/i;

function stanceOf(text: string, query: string): Stance {
  const t = text.toLowerCase();
  if (CONTRA.test(t)) return "contradicting";
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const overlap = words.filter((w) => t.includes(w)).length / Math.max(1, words.length);
  if (SUPPORT.test(t) && overlap >= 0.4) return "supporting";
  return "neutral";
}

function tokens(s: string): Set<string> {
  return new Set(s.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
}
function similarity(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / Math.max(1, Math.min(a.size, b.size));
}

function toSources(results: RawResult[], query: string): EvidenceSource[] {
  const base = results.map((r, i) => {
    const domain = domainOf(r.link);
    const { type, cred } = classify(domain);
    return { r, i, domain, type, cred, tok: tokens(`${r.title} ${r.snippet}`) };
  });
  const seenDomains = new Map<string, string>();
  return base.map((b) => {
    const id = `src-${b.i}`;
    let originId: string | undefined;
    // derived if same domain seen before, or highly similar to a more credible earlier source
    if (seenDomains.has(b.domain)) originId = seenDomains.get(b.domain);
    else {
      const parent = base.find((o) => o.i < b.i && o.cred >= b.cred && similarity(o.tok, b.tok) > 0.55);
      if (parent) originId = `src-${parent.i}`;
      seenDomains.set(b.domain, id);
    }
    const stance = stanceOf(`${b.r.title} ${b.r.snippet}`, query);
    const why =
      stance === "supporting"
        ? `${b.type} whose reporting aligns with the claim.`
        : stance === "contradicting"
          ? `${b.type} that disputes or qualifies the claim.`
          : `${b.type} providing related context without a clear position.`;
    return {
      id,
      name: b.r.source || b.domain,
      headline: b.r.title,
      excerpt: b.r.snippet || "No excerpt available.",
      why: originId ? `${why} Appears to echo an earlier source.` : why,
      type: b.type,
      credibility: b.cred,
      stance,
      independent: !originId,
      originId,
      url: b.r.link,
      date: b.r.date || "—",
    };
  });
}

function echoOf(sources: EvidenceSource[]) {
  const derived = sources.filter((s) => !s.independent).length;
  const ratio = derived / Math.max(1, sources.length);
  const echoLevel: "High" | "Moderate" | "Low" = ratio > 0.45 ? "High" : ratio > 0.2 ? "Moderate" : "Low";
  const echoSummary =
    echoLevel === "High"
      ? `${derived} of ${sources.length} sources appear to repeat earlier coverage — the topic looks bigger than its evidence base.`
      : echoLevel === "Moderate"
        ? `Some repetition: ${derived} sources echo earlier reporting, but several independent sources exist.`
        : `Most sources appear independent; little sign of an echo chamber.`;
  return { echoLevel, echoSummary, derived };
}

function provenanceOf(sources: EvidenceSource[]): ProvenanceNode[] {
  const groups: Record<ProvenanceNode["kind"], EvidenceSource[]> = { origin: [], news: [], publication: [], blog: [] };
  for (const s of sources) {
    if (s.type === "Official source" || s.type === "Research / report" || s.type === "Primary source") groups.origin.push(s);
    else if (s.type === "Major news organization") groups.news.push(s);
    else if (s.type === "Secondary publication") groups.publication.push(s);
    else groups.blog.push(s);
  }
  const labels: Record<ProvenanceNode["kind"], string> = {
    origin: "Primary & official",
    news: "Major news",
    publication: "Secondary publications",
    blog: "Blogs & social",
  };
  return (Object.keys(groups) as ProvenanceNode["kind"][])
    .filter((k) => groups[k].length)
    .map((k) => {
      const g = groups[k];
      return {
        id: `prov-${k}`,
        label: g[0]!.name,
        kind: k,
        detail: `${labels[k]}: ${g.map((s) => s.name).slice(0, 4).join(", ")}${g.length > 4 ? "…" : ""}`,
        count: g.length,
        credibility: g.reduce((a, s) => a + s.credibility, 0) / g.length,
      };
    });
}

export const analyzeClaim = createServerFn({ method: "POST" })
  .inputValidator((d: { q: string }) => ({ q: String(d.q).slice(0, 300) }))
  .handler(async ({ data }): Promise<ClaimAnalysis> => {
    const { results, total } = await serp({ engine: "google", q: data.q, num: "20" });
    const sources = toSources(results, data.q);
    const sup = sources.filter((s) => s.stance === "supporting");
    const con = sources.filter((s) => s.stance === "contradicting");
    const weight = (arr: EvidenceSource[]) => arr.reduce((a, s) => a + s.credibility * (s.independent ? 1 : 0.4), 0);
    const ws = weight(sup);
    const wc = weight(con);
    const strength = Math.round((ws / Math.max(0.01, ws + wc + 0.5)) * 100);
    const verdict: ClaimAnalysis["verdict"] =
      sources.length < 3 || ws + wc < 1
        ? "Insufficient Evidence"
        : wc > ws * 1.2
          ? "Contradicted"
          : ws > wc * 2.5
            ? "Mostly Supported"
            : "Partially Supported";
    const { echoLevel, echoSummary, derived } = echoOf(sources);
    const indep = sources.length - derived;
    return {
      mode: "claim",
      query: data.q,
      verdict,
      evidenceStrength: strength,
      verdictReason: `${sup.length} supporting and ${con.length} contradicting sources found across ${sources.length} results, weighted by credibility and independence.`,
      sources,
      totalResults: sources.length,
      independentCount: indep,
      derivedCount: derived,
      echoLevel,
      echoSummary,
      provenance: provenanceOf(sources),
      synthesis: `Across ${sources.length} live web results (of roughly ${total.toLocaleString()} indexed), ${indep} appear independent. ${
        sup.length ? `Supporting evidence comes mainly from ${[...new Set(sup.map((s) => s.type))].slice(0, 2).join(" and ").toLowerCase()}.` : "Little direct support was found."
      } ${con.length ? `${con.length} source(s) dispute or qualify the claim — review them before drawing conclusions.` : "No notable contradicting sources surfaced."}`,
    };
  });

function parseDate(s: string): number {
  const t = Date.parse(s.replace(/,\s*\+\d{4}\s*UTC/, ""));
  return Number.isNaN(t) ? NaN : t;
}

export const analyzeTrend = createServerFn({ method: "POST" })
  .inputValidator((d: { q: string }) => ({ q: String(d.q).slice(0, 300) }))
  .handler(async ({ data }): Promise<TrendAnalysis> => {
    const [news, web] = await Promise.all([
      serp({ engine: "google_news", q: data.q }).catch(() => ({ results: [], total: 0 })),
      serp({ engine: "google", q: data.q, num: "10" }),
    ]);
    const all = [...news.results.slice(0, 20), ...web.results];
    const sources = toSources(all, data.q);
    const dated = sources
      .map((s) => ({ s, t: parseDate(s.date) }))
      .filter((x) => !Number.isNaN(x.t))
      .sort((a, b) => a.t - b.t);
    const first = dated[0];
    const timeline: TrendEvent[] = dated.slice(0, 8).map((x, i) => ({
      date: new Date(x.t).toISOString().slice(0, 10),
      label: x.s.headline.slice(0, 80),
      kind: i === 0 ? "mention" : x.s.type === "Major news organization" ? "amplification" : x.s.type === "Research / report" ? "publication" : "event",
      detail: `${x.s.name} — ${x.s.type}`,
    }));
    const { echoLevel, echoSummary, derived } = echoOf(sources);
    const byType = (t: SourceType) => sources.filter((s) => s.type === t).length;
    const amplification = (
      [
        ["Primary & official", byType("Official source") + byType("Research / report")],
        ["Major news", byType("Major news organization")],
        ["Secondary publications", byType("Secondary publication")],
        ["Blogs & social", byType("Blog") + byType("User-generated content")],
      ] as const
    )
      .filter(([, n]) => n > 0)
      .map(([label, n]) => ({ label, detail: `${n} source${n > 1 ? "s" : ""} in this stage` }));
    const organic = echoLevel !== "High";
    return {
      mode: "trend",
      query: data.q,
      summary: `${sources.length} live sources found${dated.length ? `, spanning ${timeline[0]?.date} to ${timeline[timeline.length - 1]?.date}` : ""}.`,
      timeline,
      origin: first
        ? { source: first.s.name, date: new Date(first.t).toISOString().slice(0, 10), note: first.s.headline }
        : { source: sources[0]?.name ?? "Unknown", date: "—", note: "No dated coverage found to pinpoint an origin." },
      amplification,
      growthVerdict: organic
        ? "Coverage appears largely organic, with multiple independent sources."
        : "Growth looks amplified — many sources repeat the same earlier reporting.",
      organic,
      echoLevel,
      echoSummary,
      sources,
      totalResults: sources.length,
      independentCount: sources.length - derived,
      derivedCount: derived,
    };
  });
