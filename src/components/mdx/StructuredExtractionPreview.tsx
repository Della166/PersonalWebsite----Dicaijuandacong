'use client';

import { useMemo, useState } from 'react';
import {
  Database,
  FileText,
  MessageSquare,
  Quote,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';

// A multi-vertical preview: pick a preloaded document, see both the extracted
// structured fields (LangExtract layer) and a grounded QA answer with citations
// (LangChain + DeepSeek + Qdrant/Chroma layer). The "vector backend" indicator
// flips because the project is designed to be pluggable between the two.

type DocKey = 'radiology' | 'finance' | 'news';
type Backend = 'qdrant' | 'chroma';

interface Field {
  label: string;
  value: string;
  source: string;
}

interface QaTurn {
  question: string;
  answer: string;
  sources: string[];
}

interface DocCase {
  key: DocKey;
  title: string;
  vertical: string;
  excerpt: string;
  fields: Field[];
  qa: QaTurn[];
}

const DOCS: DocCase[] = [
  {
    key: 'radiology',
    title: 'Chest CT Report · pt-184',
    vertical: 'Radiology · clinical narrative + measurements',
    excerpt:
      'Indication: follow-up of right upper lobe nodule. Findings: 1.8 cm spiculated nodule in the right upper lobe, stable since the prior scan dated 2025-11-14, with mild interval increase in surrounding ground-glass opacity. No new pulmonary nodules identified. Mediastinal lymph nodes are within normal size. Impression: stable dominant nodule; recommend low-dose chest CT in 3 months for surveillance.',
    fields: [
      { label: 'Patient ID', value: 'pt-184', source: 'header' },
      { label: 'Modality', value: 'CT chest, low dose', source: 'header' },
      { label: 'Primary finding', value: '1.8 cm spiculated nodule, right upper lobe', source: 'findings §1' },
      { label: 'Stability', value: 'stable vs prior 2025-11-14', source: 'findings §1' },
      { label: 'Secondary finding', value: 'mild interval increase in adjacent GGO', source: 'findings §1' },
      { label: 'Follow-up recommendation', value: 'low-dose chest CT in 3 months', source: 'impression' },
    ],
    qa: [
      {
        question: 'What does the report recommend as next step, and on what timeline?',
        answer:
          'Repeat low-dose chest CT in 3 months for surveillance. The recommendation is given in the Impression section, motivated by the stable dominant nodule plus the mild interval increase in surrounding ground-glass opacity flagged in the findings.',
        sources: ['impression', 'findings §1'],
      },
    ],
  },
  {
    key: 'finance',
    title: 'Q3 Earnings Release · ACME Co.',
    vertical: 'Finance · structured KPIs + guidance language',
    excerpt:
      'ACME Co. (NASDAQ: ACME) reported Q3 2025 revenue of $412.6M, up 18% YoY, with non-GAAP operating margin of 22.4%. Net income on a GAAP basis was $61.2M, or $0.47 per diluted share. The company is raising full-year revenue guidance to a range of $1.64B–$1.66B (prior: $1.59B–$1.62B). The board also authorized an additional $500M share-repurchase program.',
    fields: [
      { label: 'Reporting period', value: 'Q3 2025', source: 'lede' },
      { label: 'Revenue', value: '$412.6M (+18% YoY)', source: 'lede' },
      { label: 'Non-GAAP operating margin', value: '22.4%', source: 'lede' },
      { label: 'Net income (GAAP)', value: '$61.2M', source: 'lede' },
      { label: 'Diluted EPS', value: '$0.47', source: 'lede' },
      { label: 'FY revenue guidance', value: '$1.64B–$1.66B (raised)', source: 'guidance' },
      { label: 'Buyback authorized', value: '$500M (additional)', source: 'capital return' },
    ],
    qa: [
      {
        question: 'Did the company raise or lower full-year revenue guidance, and by how much?',
        answer:
          'Raised. The new range is $1.64B–$1.66B versus a prior range of $1.59B–$1.62B, i.e. roughly +$40–50M at both ends.',
        sources: ['guidance'],
      },
    ],
  },
  {
    key: 'news',
    title: 'News brief · regulator approves merger',
    vertical: 'News · entity-rich narrative',
    excerpt:
      'The European Commission today approved the proposed acquisition of NorthWind Logistics by Vector Freight Group, conditional on the divestment of NorthWind\'s German rail-freight subsidiary, RheinRail GmbH. Commissioner Margrethe Vestager called the remedy "sufficient to address competition concerns in the Rhine corridor." The transaction is expected to close in Q1 2026 pending regulatory clearance in the UK.',
    fields: [
      { label: 'Action', value: 'Conditional approval of merger', source: 'lede' },
      { label: 'Acquirer', value: 'Vector Freight Group', source: 'lede' },
      { label: 'Target', value: 'NorthWind Logistics', source: 'lede' },
      { label: 'Authority', value: 'European Commission', source: 'lede' },
      { label: 'Condition / remedy', value: 'Divestment of RheinRail GmbH (NorthWind DE subsidiary)', source: 'remedy clause' },
      { label: 'Expected close', value: 'Q1 2026 (pending UK clearance)', source: 'closing paragraph' },
      { label: 'Quoted', value: 'Margrethe Vestager (Commissioner)', source: 'quote' },
    ],
    qa: [
      {
        question: 'What is the regulatory condition attached to the approval?',
        answer:
          'The European Commission required Vector Freight Group to divest NorthWind\'s German rail-freight subsidiary, RheinRail GmbH, as a remedy targeting the Rhine corridor.',
        sources: ['remedy clause', 'quote'],
      },
    ],
  },
];

export default function StructuredExtractionPreview() {
  const [activeDoc, setActiveDoc] = useState<DocKey>('radiology');
  const [backend, setBackend] = useState<Backend>('qdrant');

  const doc = useMemo(() => DOCS.find((d) => d.key === activeDoc) ?? DOCS[0], [activeDoc]);
  const turn = doc.qa[0];

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(127,188,140,0.10),rgba(212,165,116,0.10))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              Vertical sandbox · extract + QA
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              Structured fields and grounded QA, same workflow
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Pick a vertical, read the source excerpt, and compare what LangExtract pulled out as
              structured fields with how the LangChain + DeepSeek QA layer answers a grounded
              question over the same document.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-1">
            <div className="flex items-center gap-1 text-xs">
              {(['qdrant', 'chroma'] as Backend[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBackend(b)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-colors ${
                    backend === b
                      ? 'bg-[var(--color-green-300)]/14 text-[var(--color-green-300)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  <Database className="h-3.5 w-3.5" />
                  {b}
                </button>
              ))}
            </div>
            <p className="mt-1 px-3 pb-2 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Vector backend
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Vertical document library
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {DOCS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setActiveDoc(d.key)}
              className={`rounded-[24px] border p-4 text-left transition-colors ${
                activeDoc === d.key
                  ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--color-amber-300)]" />
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{d.title}</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{d.vertical}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Source excerpt
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                <TerminalSquare className="h-3.5 w-3.5" />
                normalized to Markdown
              </span>
            </div>
            <p className="mt-4 rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {doc.excerpt}
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Pipeline checkpoints
            </p>
            <div className="mt-3 grid gap-2 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--color-amber-300)]" />
                  Parse → Markdown
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">ok</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Quote className="h-4 w-4 text-[var(--color-green-300)]" />
                  LangExtract → structured fields
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{doc.fields.length} fields</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <Database className="h-4 w-4 text-[var(--color-green-300)]" />
                  Index in {backend}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">live backend toggle</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-3 py-2">
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[var(--color-green-300)]" />
                  Grounded QA
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">sourced answer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Extracted structured fields
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                LangExtract
              </span>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border-default)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-black/15 text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Field</th>
                    <th className="px-3 py-2 font-semibold">Value</th>
                    <th className="px-3 py-2 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.fields.map((f, i) => (
                    <tr
                      key={f.label}
                      className={`${
                        i % 2 === 0 ? 'bg-transparent' : 'bg-black/5'
                      } border-t border-[var(--color-border-default)]/60`}
                    >
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{f.label}</td>
                      <td className="px-3 py-2 text-[var(--color-text-primary)]">{f.value}</td>
                      <td className="px-3 py-2 text-xs text-[var(--color-text-muted)]">{f.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Grounded QA · same document
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {backend} · DeepSeek
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Question
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-primary)]">{turn.question}</p>
            </div>
            <div className="mt-3 rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Answer
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{turn.answer}</p>
              <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
                Cited sources: {turn.sources.join(' · ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
