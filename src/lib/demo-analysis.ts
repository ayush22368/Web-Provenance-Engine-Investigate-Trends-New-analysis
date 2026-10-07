// Demo analysis engine for Web Provenance Engine.
// Deterministically generates a realistic evidence analysis from a query.
// Swap `generateAnalysis` / `generateTrend` with calls to your search API later —
// the UI only depends on the types below.

export type Stance = "supporting" | "contradicting" | "neutral";
export type SourceType =
  | "Primary source"
  | "Official source"
  | "Research / report"
  | "Major news organization"
  | "Secondary publication"
  | "Blog"
  | "User-generated content";

export interface EvidenceSource {
  id: string;
  name: string;
  headline: string;
  excerpt: string;
  why: string;
  type: SourceType;
  credibility: number; // 0..1
  stance: Stance;
  independent: boolean;
  originId?: string; // id of the source it derives from
  url: string;
  date: string;
}

export interface ProvenanceNode {
  id: string;
  label: string;
  kind: "origin" | "news" | "publication" | "blog";
  detail: string;
  count: number;
  credibility: number;
}

export interface ClaimAnalysis {
  mode: "claim";
  query: string;
  verdict: "Mostly Supported" | "Partially Supported" | "Insufficient Evidence" | "Contradicted";
  evidenceStrength: number; // 0..100
  verdictReason: string;
  sources: EvidenceSource[];
  totalResults: number;
  independentCount: number;
  derivedCount: number;
  echoLevel: "High" | "Moderate" | "Low";
  echoSummary: string;
  provenance: ProvenanceNode[];
  synthesis: string;
}

export interface TrendEvent {
  date: string;
  label: string;
  kind: "mention" | "event" | "spike" | "publication" | "amplification";
  detail: string;
}

export interface TrendAnalysis {
  mode: "trend";
  query: string;
  summary: string;
  timeline: TrendEvent[];
  origin: { source: string; date: string; note: string };
  amplification: { label: string; detail: string }[];
  growthVerdict: string;
  organic: boolean;
  echoLevel: "High" | "Moderate" | "Low";
  echoSummary: string;
  sources: EvidenceSource[];
  totalResults: number;
  independentCount: number;
  derivedCount: number;
}

// --- deterministic pseudo-random from string ---
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function pick<T>(arr: T[], seed: number, i: number): T {
  return arr[(seed + i * 7919) % arr.length];
}

const SOURCE_POOL: { name: string; type: SourceType; cred: number }[] = [
  { name: "Journal of Applied Research", type: "Research / report", cred: 0.91 },
  { name: "National Statistics Bureau", type: "Official source", cred: 0.94 },
  { name: "The Daily Ledger", type: "Major news organization", cred: 0.82 },
  { name: "Global Wire News", type: "Major news organization", cred: 0.8 },
  { name: "Policy Institute Report", type: "Research / report", cred: 0.88 },
  { name: "Transit Quarterly", type: "Secondary publication", cred: 0.66 },
  { name: "Market Wire Daily", type: "Secondary publication", cred: 0.55 },
  { name: "The Insight Review", type: "Secondary publication", cred: 0.62 },
  { name: "DataPoints Blog", type: "Blog", cred: 0.44 },
  { name: "TrendWatch Online", type: "Blog", cred: 0.4 },
  { name: "Forum thread (r/technology)", type: "User-generated content", cred: 0.28 },
  { name: "Primary dataset release", type: "Primary source", cred: 0.95 },
];

const SUPPORT_WHY = [
  "Primary data that directly measures the claim, not a re-report.",
  "Independent methodology; reaches the same conclusion from separate data.",
  "Official figures confirm the core numbers behind the claim.",
  "Peer-reviewed analysis with transparent sourcing.",
];
const CONTRA_WHY = [
  "Points to a narrow but real caveat the claim glosses over.",
  "Uses a different measurement that weakens the headline conclusion.",
  "Opinion piece — asserts disagreement without independent data.",
  "Repeats an older critique that predates the latest evidence.",
];
const NEUTRAL_WHY = [
  "Provides useful background without taking a position.",
  "Reframes the question rather than answering it.",
  "Covers adjacent context that shapes how the claim should be read.",
];

function makeSources(seed: number, query: string): EvidenceSource[] {
  const stances: Stance[] = ["supporting", "contradicting", "neutral"];
  const sources: EvidenceSource[] = SOURCE_POOL.map((s, i) => {
    const stance = stances[(seed + i) % 3 === 0 ? 0 : (seed + i) % 3 === 1 ? 2 : (i % 4 === 3 ? 1 : 0)];
    const independent = i < 5 || (seed + i) % 5 === 0;
    const why =
      stance === "supporting"
        ? pick(SUPPORT_WHY, seed, i)
        : stance === "contradicting"
          ? pick(CONTRA_WHY, seed, i)
          : pick(NEUTRAL_WHY, seed, i);
    return {
      id: `src-${i}`,
      name: s.name,
      headline:
        stance === "supporting"
          ? `New analysis affirms: ${query}`
          : stance === "contradicting"
            ? `The case against: ${query}`
            : `Context and background on: ${query}`,
      excerpt:
        stance === "supporting"
          ? "Across the datasets reviewed, the evidence consistently points in the direction of the claim, with effect sizes holding under multiple methodologies."
          : stance === "contradicting"
            ? "Under certain conditions the effect narrows considerably, and the strongest version of the claim does not survive closer inspection."
            : "The topic is more nuanced than the headline suggests; several underlying factors determine how the claim should be interpreted.",
      why,
      type: s.type,
      credibility: s.cred,
      stance,
      independent,
      originId: independent ? undefined : "src-11",
      url: `https://example.com/${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      date: `202${3 + ((seed + i) % 3)}-${String(1 + ((seed + i * 3) % 12)).padStart(2, "0")}-${String(1 + ((seed + i * 7) % 28)).padStart(2, "0")}`,
    };
  });
  return sources;
}

export function generateAnalysis(query: string): ClaimAnalysis {
  const seed = hash(query.toLowerCase().trim());
  const sources = makeSources(seed, query);
  const totalResults = 24 + (seed % 12);
  const derivedCount = sources.filter((s) => !s.independent).length + (seed % 8);
  const independentCount = totalResults - derivedCount;
  const echoRatio = derivedCount / totalResults;
  const echoLevel = echoRatio > 0.55 ? "High" : echoRatio > 0.35 ? "Moderate" : "Low";
  const strength = 55 + (seed % 35);
  const verdict =
    strength >= 78 ? "Mostly Supported" : strength >= 62 ? "Partially Supported" : strength >= 45 ? "Insufficient Evidence" : "Contradicted";

  return {
    mode: "claim",
    query,
    verdict,
    evidenceStrength: strength,
    verdictReason:
      verdict === "Mostly Supported"
        ? "Independent, high-credibility sources converge on the claim, and contradicting evidence is narrow in scope."
        : verdict === "Partially Supported"
          ? "The core of the claim holds, but important caveats and measurement disputes remain unresolved."
          : verdict === "Insufficient Evidence"
            ? "Few independent primary sources address the claim directly; most coverage recycles the same material."
            : "The strongest independent evidence points against the claim as stated.",
    sources,
    totalResults,
    independentCount,
    derivedCount,
    echoLevel,
    echoSummary:
      echoLevel === "High"
        ? `${derivedCount} of ${totalResults} results appear to repeat or derive from the same underlying information.`
        : echoLevel === "Moderate"
          ? "A meaningful share of results trace back to a small set of original reports."
          : "Most results appear to provide independently sourced evidence.",
    provenance: [
      { id: "p0", label: "Original Report", kind: "origin", detail: "Primary dataset release — the earliest source everything else cites.", count: 1, credibility: 0.95 },
      { id: "p1", label: "News Organizations", kind: "news", detail: "Major outlets covering the original report within days.", count: 4, credibility: 0.82 },
      { id: "p2", label: "Other Publications", kind: "publication", detail: "Secondary outlets re-reporting the news coverage.", count: 7, credibility: 0.6 },
      { id: "p3", label: "Blogs / Social Posts", kind: "blog", detail: "Commentary and discussion derived from the publications.", count: derivedCount, credibility: 0.38 },
    ],
    synthesis: `Most reliable sources support the claim, but a large share of the coverage appears to derive from the same original report. ${independentCount} of ${totalResults} results look genuinely independent, and two independent sources disagree on the underlying measurement. The strongest evidence supports the claim — but the apparent consensus is broader than the independent evidence actually is.`,
  };
}

export function generateTrend(query: string): TrendAnalysis {
  const seed = hash(query.toLowerCase().trim());
  const sources = makeSources(seed, query);
  const totalResults = 20 + (seed % 14);
  const derivedCount = sources.filter((s) => !s.independent).length + (seed % 6);
  const independentCount = totalResults - derivedCount;
  const organic = seed % 3 !== 0;
  const echoLevel = derivedCount / totalResults > 0.5 ? "High" : derivedCount / totalResults > 0.3 ? "Moderate" : "Low";

  return {
    mode: "trend",
    query,
    summary: `Discussion around “${query}” shows a clear acceleration pattern: a quiet early phase, a catalyzing event, then rapid amplification across publications and social platforms.`,
    timeline: [
      { date: "Early 2024", label: "First niche mentions", kind: "mention", detail: "Scattered discussion in specialist communities and forums." },
      { date: "Mid 2024", label: "First substantive coverage", kind: "publication", detail: "A research report and one major outlet publish the first serious treatments." },
      { date: "Late 2024", label: "Catalyzing event", kind: "event", detail: "A high-profile announcement triggers a sharp spike in coverage." },
      { date: "Early 2025", label: "Major amplification", kind: "amplification", detail: "Social platforms and newsletters multiply the story; derivative articles surge." },
      { date: "Mid 2025", label: "Mainstream attention", kind: "spike", detail: "Coverage peaks across major news organizations; search interest hits its high." },
    ],
    origin: {
      source: "Specialist community discussion, later cited by the first research report",
      date: "Early 2024",
      note: "The earliest discoverable source is not necessarily the absolute origin — it is the earliest significant discussion identified in the analyzed results.",
    },
    amplification: [
      { label: "Original Event", detail: "The initial report and community discussion that started the thread." },
      { label: "Early Discussion", detail: "Blogs and forums pick it up within weeks." },
      { label: "Major Publication", detail: "A flagship outlet legitimizes the topic for a broad audience." },
      { label: "Social Media Discussion", detail: "Viral threads drive the largest single spike." },
      { label: "Multiple News Articles", detail: "Dozens of derivative articles, many repeating the same reporting." },
      { label: "Wider Public Attention", detail: "The topic enters general discourse." },
    ],
    growthVerdict: organic
      ? "Growth appears mostly organic — multiple independent communities arrived at the topic before mainstream coverage."
      : "Growth appears heavily driven by one major event; most later coverage traces back to it.",
    organic,
    echoLevel,
    echoSummary:
      echoLevel === "High"
        ? "Many websites are repeating the same story rather than adding new reporting."
        : "A healthy share of sources add original reporting or analysis.",
    sources,
    totalResults,
    independentCount,
    derivedCount,
  };
}
