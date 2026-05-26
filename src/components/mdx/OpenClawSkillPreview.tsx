'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileCode2,
  LoaderCircle,
  Package,
  Play,
  Sparkles,
  Terminal,
  XCircle,
} from 'lucide-react';

type SkillKey = 'email' | 'pr' | 'release';
type StageKey = 'idle' | 'scaffold' | 'preview' | 'validate' | 'complete';

interface SkillTemplate {
  key: SkillKey;
  name: string;
  description: string;
  triggers: string[];
  scaffoldLines: string[];
  skillMd: string;
  checks: { label: string; status: 'pass' | 'fail'; detail: string }[];
}

const templates: SkillTemplate[] = [
  {
    key: 'email',
    name: 'email-triage',
    description: 'Triage incoming email into priority queues with summary and suggested reply.',
    triggers: ['email', 'inbox', 'triage'],
    scaffoldLines: [
      '$ claw skill new email-triage',
      '⠋ scaffolding skill directory ...',
      '  ✓ skills/email-triage/SKILL.md',
      '  ✓ skills/email-triage/scripts/triage.ts',
      '  ✓ skills/email-triage/references/queue-rules.md',
      '  ✓ skills/email-triage/.editorconfig',
      '  ✓ skills/email-triage/tests/fixture.txt',
      '✔ scaffold complete (5 files, 0 warnings)',
      '',
      'next: claw skill test skills/email-triage',
    ],
    skillMd: `---
name: email-triage
description: Triage an inbox of emails into priority queues with a one-line summary and suggested reply per message.
triggers: [email, inbox, triage, "@triage"]
version: 0.1.0
---

# Email Triage

Reads a batch of emails, classifies each into one of four priority queues, and emits
a short summary plus a suggested reply draft. Refer to references/queue-rules.md for
the routing rules.`,
    checks: [
      { label: 'frontmatter schema', status: 'pass', detail: 'all required fields present.' },
      { label: 'description length', status: 'pass', detail: '94 chars (10..1024 ok).' },
      { label: 'trigger keywords', status: 'pass', detail: '4 triggers, no duplicates with other skills.' },
      { label: 'referenced files', status: 'pass', detail: 'references/queue-rules.md exists.' },
      { label: 'scripts executable', status: 'pass', detail: 'scripts/triage.ts compiles and exits cleanly on fixture.' },
      { label: 'changelog updated', status: 'fail', detail: 'version 0.1.0 declared but CHANGELOG.md not modified.' },
    ],
  },
  {
    key: 'pr',
    name: 'pr-reviewer',
    description: 'Review pull requests against repository style rules and surface inline-comment suggestions.',
    triggers: ['pr', 'diff', 'review', '@review'],
    scaffoldLines: [
      '$ claw skill new pr-reviewer',
      '⠋ scaffolding skill directory ...',
      '  ✓ skills/pr-reviewer/SKILL.md',
      '  ✓ skills/pr-reviewer/scripts/review.ts',
      '  ✓ skills/pr-reviewer/references/style-rules.md',
      '  ✓ skills/pr-reviewer/references/security-rules.md',
      '  ✓ skills/pr-reviewer/tests/fixture.diff',
      '✔ scaffold complete (5 files, 0 warnings)',
      '',
      'next: claw skill test skills/pr-reviewer',
    ],
    skillMd: `---
name: pr-reviewer
description: Review a pull-request diff against this repository's style and security rules, returning inline comments where appropriate.
triggers: [pr, diff, review, "@review"]
version: 0.2.1
---

# PR Reviewer

Reads a unified diff, applies the project's style rules (references/style-rules.md)
and security rules (references/security-rules.md), and emits inline-comment
suggestions plus a summary verdict.`,
    checks: [
      { label: 'frontmatter schema', status: 'pass', detail: 'all required fields present.' },
      { label: 'description length', status: 'pass', detail: '123 chars (10..1024 ok).' },
      { label: 'trigger keywords', status: 'pass', detail: '4 triggers, no duplicates with other skills.' },
      { label: 'referenced files', status: 'pass', detail: '2 references resolved.' },
      { label: 'scripts executable', status: 'pass', detail: 'scripts/review.ts compiles and exits cleanly on fixture.' },
      { label: 'changelog updated', status: 'pass', detail: 'CHANGELOG.md entry found for 0.2.1.' },
    ],
  },
  {
    key: 'release',
    name: 'release-notes',
    description: 'Draft release notes from a list of merged pull requests, grouped by feature, fix, and chore.',
    triggers: ['release', 'changelog', 'notes'],
    scaffoldLines: [
      '$ claw skill new release-notes',
      '⠋ scaffolding skill directory ...',
      '  ✓ skills/release-notes/SKILL.md',
      '  ✓ skills/release-notes/scripts/draft.ts',
      '  ✓ skills/release-notes/references/voice-guide.md',
      '  ✓ skills/release-notes/tests/fixture.json',
      '✔ scaffold complete (4 files, 0 warnings)',
      '',
      'next: claw skill test skills/release-notes',
    ],
    skillMd: `---
name: release-notes
description: Draft a release-notes document from a list of merged pull requests, grouped into feature, fix, and chore sections.
triggers: [release, changelog, notes]
version: 0.1.4
---

# Release Notes

Reads a list of merged pull requests, groups them by conventional-commit type,
and drafts release notes in the voice described in references/voice-guide.md.`,
    checks: [
      { label: 'frontmatter schema', status: 'pass', detail: 'all required fields present.' },
      { label: 'description length', status: 'pass', detail: '107 chars (10..1024 ok).' },
      { label: 'trigger keywords', status: 'pass', detail: '3 triggers, no duplicates.' },
      { label: 'referenced files', status: 'pass', detail: 'references/voice-guide.md exists.' },
      { label: 'scripts executable', status: 'fail', detail: 'scripts/draft.ts exits 1 on fixture.json — likely missing PR payload schema.' },
      { label: 'changelog updated', status: 'pass', detail: 'CHANGELOG.md entry found for 0.1.4.' },
    ],
  },
];

const stageOrder: StageKey[] = ['idle', 'scaffold', 'preview', 'validate', 'complete'];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function OpenClawSkillPreview() {
  const [activeSkill, setActiveSkill] = useState<SkillKey>('email');
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleLines, setVisibleLines] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [visibleChecks, setVisibleChecks] = useState(0);

  const current = templates.find((tpl) => tpl.key === activeSkill) ?? templates[0];

  const handleSkillSelect = (skillKey: SkillKey) => {
    setActiveSkill(skillKey);
    setStage('idle');
    setVisibleLines(0);
    setShowPreview(false);
    setVisibleChecks(0);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setVisibleLines(0);
      setShowPreview(false);
      setVisibleChecks(0);
      setStage('scaffold');

      for (let index = 0; index < current.scaffoldLines.length; index += 1) {
        await wait(180);
        if (cancelled) return;
        setVisibleLines(index + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('preview');
      setShowPreview(true);

      await wait(420);
      if (cancelled) return;
      setStage('validate');

      for (let index = 0; index < current.checks.length; index += 1) {
        await wait(280);
        if (cancelled) return;
        setVisibleChecks(index + 1);
      }

      await wait(200);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [current, running]);

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
              Scaffold and validate a Skill in one step
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Pick a Skill template, run the scaffolding CLI, preview the generated SKILL.md, and watch the local
              validator run the same checks the CI action will run on a pull request.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Running scaffold' : 'Run scaffold + validate'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Skill template
            </p>
            <div className="grid gap-3">
              {templates.map((template) => {
                const isActive = activeSkill === template.key;
                return (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => handleSkillSelect(template.key)}
                    className={`rounded-[24px] border p-4 text-left transition-colors ${
                      isActive
                        ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Package className="mt-0.5 h-5 w-5 text-[var(--color-amber-300)]" />
                      <div>
                        <h4 className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">
                          {template.name}
                        </h4>
                        <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">
                          {template.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {template.triggers.map((trigger) => (
                            <span
                              key={trigger}
                              className="rounded-full border border-[var(--color-border-default)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]"
                            >
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-black p-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[var(--color-green-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                CLI
              </p>
            </div>
            <div className="mt-3 min-h-[220px] font-mono text-[12px] leading-5 text-[var(--color-green-200)]">
              {current.scaffoldLines.slice(0, visibleLines).map((line, index) => (
                <div key={`${line}-${index}`}>{line || ' '}</div>
              ))}
              {visibleLines === 0 && (
                <p className="text-[var(--color-text-muted)]">Awaiting `claw skill new`...</p>
              )}
              {running && stage === 'scaffold' && (
                <span className="mt-1 inline-block h-3 w-1.5 animate-pulse bg-[var(--color-green-300)]/80 align-middle" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Generated SKILL.md
                </p>
              </div>
              <span className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {current.name}/SKILL.md
              </span>
            </div>

            <pre
              className={`mt-4 max-h-[260px] overflow-auto rounded-[20px] border border-[var(--color-border-default)] bg-black/30 p-4 font-mono text-[12px] leading-5 transition-opacity ${
                showPreview ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <code className="text-[var(--color-green-200)]">{current.skillMd}</code>
            </pre>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  CI validator
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Local + CI run the same checks
                </h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleChecks}/{current.checks.length}
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {current.checks.slice(0, visibleChecks).map((check, index) => (
                <div
                  key={`${check.label}-${index}`}
                  className={`flex items-start gap-3 rounded-[18px] border p-3 ${
                    check.status === 'pass'
                      ? 'border-[var(--color-border-default)] bg-[var(--color-green-300)]/6'
                      : 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8'
                  }`}
                >
                  {check.status === 'pass' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-green-300)]" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-amber-300)]" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{check.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{check.detail}</p>
                  </div>
                </div>
              ))}

              {visibleChecks === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-6 text-sm leading-6 text-[var(--color-text-muted)]">
                  Run scaffold + validate to see the CI checks stream in.
                </div>
              )}

              {stage === 'complete' && current.checks.some((c) => c.status === 'fail') && (
                <div className="flex items-start gap-3 rounded-[18px] border border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/10 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-amber-300)]" />
                  <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                    Validation completed with at least one failure. The CI action would block the PR until the
                    flagged item is resolved.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
