'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  FileText,
  LoaderCircle,
  Play,
  Shield,
  Sparkles,
} from 'lucide-react';

type DocKey = 'contract' | 'policy' | 'handbook';
type StageKey = 'idle' | 'parse' | 'overview' | 'clause' | 'risk' | 'report' | 'complete';
type Severity = 'high' | 'medium' | 'low';

interface Finding {
  severity: Severity;
  title: string;
  source: string;
  suggestion: string;
}

interface SampleDoc {
  key: DocKey;
  title: string;
  format: string;
  description: string;
  overview: string;
  findings: Finding[];
}

const docs: SampleDoc[] = [
  {
    key: 'contract',
    title: 'Vendor MSA v3',
    format: 'PDF · 46 pp · contract',
    description: 'Master services agreement between a SaaS vendor and a mid-market enterprise customer.',
    overview:
      'Standard MSA structure with services, payment, IP, confidentiality, and termination sections. Heavy customization in §4 (payment) and §11 (IP).',
    findings: [
      {
        severity: 'high',
        title: 'Payment terms inconsistent between cover page and §4.2',
        source: '§4.2, p. 7 ↔ cover, p. 1',
        suggestion: 'Align the 30-day net term on the cover with the 45-day term in §4.2 — the longer term is operationally enforced, so the cover should be updated.',
      },
      {
        severity: 'high',
        title: 'Missing SLA section despite repeated reference in §7.1',
        source: '§7.1, p. 12',
        suggestion: 'Insert the standard SLA schedule as Exhibit B with uptime, response, and credit terms aligned to enterprise tier.',
      },
      {
        severity: 'medium',
        title: 'IP attribution ambiguous on customer-provided data',
        source: '§11, p. 19',
        suggestion: 'Clarify that customer retains all rights in input data and the vendor receives a limited license to operate the service.',
      },
      {
        severity: 'low',
        title: 'Data protection clause references GDPR but not regional analogs',
        source: '§13.4, p. 23',
        suggestion: 'Expand to "GDPR, CCPA, and other applicable data-protection laws" for multi-jurisdiction coverage.',
      },
    ],
  },
  {
    key: 'policy',
    title: 'IT Security Policy v3.2',
    format: 'DOCX · 22 pp · policy',
    description: 'Internal security policy covering access control, password management, and incident response.',
    overview:
      'Policy covers most ISO 27001 themes but has gaps in incident response and MFA scoping.',
    findings: [
      {
        severity: 'high',
        title: 'Password rotation period conflicts with ISO 27001 guidance',
        source: '§3.2, p. 5',
        suggestion: 'Move from forced 30-day rotation to risk-based rotation with MFA enforcement, matching NIST 800-63B and ISO 27001 Annex A.9.',
      },
      {
        severity: 'high',
        title: 'No documented incident response procedure',
        source: 'missing — expected §8',
        suggestion: 'Add an incident response section covering detection, triage, escalation, communication, and post-mortem requirements.',
      },
      {
        severity: 'medium',
        title: 'MFA scope ambiguous for contractor accounts',
        source: '§5.1, p. 9',
        suggestion: 'State explicitly that MFA is required for all contractor accounts with access to production systems or customer data.',
      },
    ],
  },
  {
    key: 'handbook',
    title: 'Employee Handbook 2026',
    format: 'PDF · 78 pp · HR',
    description: 'Employee handbook covering remote work, leave, benefits, and grievance procedures.',
    overview:
      'Handbook structure is comprehensive but contains policy text that has not been updated for current local labor regulations.',
    findings: [
      {
        severity: 'high',
        title: 'Leave policy conflicts with local labor regulation on statutory minimum',
        source: '§6.3, p. 34',
        suggestion: 'Increase annual leave from 10 to 15 working days to match the statutory minimum in the applicable jurisdiction.',
      },
      {
        severity: 'medium',
        title: 'Remote work policy missing working-hours definition',
        source: '§4.1, p. 22',
        suggestion: 'Add explicit working-hours expectations (core hours, time-zone overlap, on-call expectations) to prevent disputes.',
      },
      {
        severity: 'low',
        title: 'Grievance procedure references an HR portal that has been deprecated',
        source: '§12.2, p. 67',
        suggestion: 'Update the grievance channel to the current HR portal URL and confirm escalation owners.',
      },
    ],
  },
];

const stageOrder: StageKey[] = ['idle', 'parse', 'overview', 'clause', 'risk', 'report', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  { key: 'parse', label: 'Parse', description: 'Extract and chunk the document by clause.' },
  { key: 'overview', label: 'Overview', description: 'Read the table of contents and form a structural understanding.' },
  { key: 'clause', label: 'Clause search', description: 'Locate every clause that matches the review checklist.' },
  { key: 'risk', label: 'Risk check', description: 'Apply policy / regulation / consistency rules to each clause.' },
  { key: 'report', label: 'Report', description: 'Emit findings with severity, source location, and suggested fix.' },
];

const severityStyles: Record<Severity, { dot: string; chip: string; label: string }> = {
  high: {
    dot: 'bg-[var(--color-amber-300)]',
    chip: 'bg-[var(--color-amber-300)]/14 text-[var(--color-amber-300)]',
    label: 'high',
  },
  medium: {
    dot: 'bg-[var(--color-green-300)]',
    chip: 'bg-[var(--color-green-300)]/14 text-[var(--color-green-300)]',
    label: 'medium',
  },
  low: {
    dot: 'bg-[var(--color-text-muted)]',
    chip: 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-secondary)]',
    label: 'low',
  },
};

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function DocReviewAgentPreview() {
  const [activeDoc, setActiveDoc] = useState<DocKey>('contract');
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [showOverview, setShowOverview] = useState(false);
  const [visibleFindings, setVisibleFindings] = useState(0);
  const [timeline, setTimeline] = useState<string[]>([]);

  const currentDoc = docs.find((doc) => doc.key === activeDoc) ?? docs[0];

  const handleDocSelect = (docKey: DocKey) => {
    setActiveDoc(docKey);
    setStage('idle');
    setShowOverview(false);
    setVisibleFindings(0);
    setTimeline([]);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setShowOverview(false);
      setVisibleFindings(0);
      setStage('parse');
      setTimeline([
        `Loaded ${currentDoc.title} (${currentDoc.format}).`,
        'Parsing and chunking the document by clause.',
      ]);

      await wait(420);
      if (cancelled) return;
      setStage('overview');
      setShowOverview(true);
      setTimeline((prev) => [...prev, 'Agent formed a structural overview of the document.']);

      await wait(420);
      if (cancelled) return;
      setStage('clause');
      setTimeline((prev) => [...prev, 'Locating clauses against the review checklist.']);

      await wait(420);
      if (cancelled) return;
      setStage('risk');
      setTimeline((prev) => [...prev, 'Running consistency, regulation, and completeness checks.']);

      await wait(360);
      if (cancelled) return;
      setStage('report');
      setTimeline((prev) => [...prev, 'Emitting structured findings with source citations.']);

      for (let index = 0; index < currentDoc.findings.length; index += 1) {
        await wait(360);
        if (cancelled) return;
        setVisibleFindings(index + 1);
      }

      await wait(240);
      if (cancelled) return;
      setStage('complete');
      setTimeline((prev) => [...prev, 'Review complete. Findings ready for human reviewer export.']);
      setRunning(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [currentDoc, running]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Preview
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              Run the document review agent
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Pick an enterprise document, watch the agent move through parse, overview, clause search, risk check,
              and report, and inspect the findings each tied back to a source location with a suggested fix.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Reviewing' : 'Run review agent'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Sample document
            </p>
            <div className="grid gap-3">
              {docs.map((doc) => {
                const isActive = activeDoc === doc.key;
                return (
                  <button
                    key={doc.key}
                    type="button"
                    onClick={() => handleDocSelect(doc.key)}
                    className={`rounded-[24px] border p-4 text-left transition-colors ${
                      isActive
                        ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 text-[var(--color-amber-300)]" />
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{doc.title}</h4>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                          {doc.format}
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{doc.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-[var(--color-green-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Agent overview note
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {showOverview
                ? currentDoc.overview
                : 'Run the agent to see how it summarizes the document structure before diving into clause review.'}
            </p>
          </div>

          <div className="grid gap-3">
            {stageLabels.map((item) => {
              const currentIndex = stageOrder.indexOf(stage);
              const itemIndex = stageOrder.indexOf(item.key);
              const isActive = stage === item.key;
              const isComplete = currentIndex > itemIndex;
              return (
                <div
                  key={item.key}
                  className={`rounded-[22px] border p-3 transition-colors ${
                    isActive
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                      : isComplete
                        ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isComplete ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--color-amber-300)]" />
                    ) : isActive ? (
                      <LoaderCircle className="mt-0.5 h-4 w-4 animate-spin text-[var(--color-green-300)]" />
                    ) : (
                      <Shield className="mt-0.5 h-4 w-4 text-[var(--color-text-muted)]" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                      <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Structured findings
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Cited, prioritized, fixable
                </h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleFindings}/{currentDoc.findings.length}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {currentDoc.findings.slice(0, visibleFindings).map((finding, index) => {
                const style = severityStyles[finding.severity];
                return (
                  <div
                    key={`${finding.title}-${index}`}
                    className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${style.dot}`} />
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{finding.title}</p>
                          <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                            source · {finding.source}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${style.chip}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{finding.suggestion}</p>
                  </div>
                );
              })}

              {visibleFindings === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-6 text-sm leading-6 text-[var(--color-text-muted)]">
                  Run the agent to surface findings with severity, source location, and suggested fixes.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Activity log
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {timeline.length > 0 ? (
                timeline.map((item, index) => (
                  <p key={`${item}-${index}`} className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  The agent will narrate parse, overview, clause search, risk check, and report as the review runs.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
