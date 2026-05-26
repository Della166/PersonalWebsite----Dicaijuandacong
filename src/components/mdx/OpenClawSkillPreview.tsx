'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  FileCode2,
  LoaderCircle,
  Play,
  Sparkles,
  Terminal,
  Workflow,
  X,
} from 'lucide-react';

type StageKey = 'idle' | 'author' | 'load' | 'route' | 'run' | 'complete';
type Approval = 'pending' | 'approved' | 'rejected';

const skillMd = `---
name: daily-briefing
description: "Generate a structured daily work briefing from
  Git activity and manual input. Use when (1) user says
  'daily briefing'; (2) summarize today's work; (3) user
  shares work items for formatting."
metadata: { "openclaw": { "emoji": "📋",
  "requires": { "bins": ["git"] } } }
---

## Trigger
- user says "日报" / "daily briefing"

## Process
1. run scripts/collect-git-activity.sh
2. classify ✅ done / ⚠️ blocked / 📅 tomorrow
3. format with the template

## Rules
- exact template, no extra sections
- do NOT add commentary at the end`;

const stageOrder: StageKey[] = ['idle', 'author', 'load', 'route', 'run', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  { key: 'author', label: 'Author SKILL.md', description: 'YAML frontmatter (name, description, metadata.requires) + Markdown body.' },
  { key: 'load', label: 'Hot-load', description: 'Drop into skills/ — the harness watcher registers it in ~250ms, no restart.' },
  { key: 'route', label: 'Route', description: 'User says "日报" → description matches → agent invokes daily-briefing.' },
  { key: 'run', label: 'Run', description: 'collect-git-activity.sh gathers today\'s commits → formatted briefing.' },
];

const briefingOutput = `📋 Daily Briefing 2026-05-26
- ✅ faithfully replicated 5 portfolio projects from course materials
- ✅ deployed fulingchen.me via Vercel
- ⚠️ GitHub Pages config was a stale dead-end (now removed)
- 📅 phase 2: innovate on top of the faithful replicas`;

const lobsterSteps = [
  { id: 'search', cmd: "bash scripts/tavily-search.sh 'AI Agent 2026'", gated: false },
  { id: 'summarize', cmd: 'bash scripts/deepseek-summarize.sh', gated: false },
  { id: 'preview', cmd: 'bash scripts/format-preview.sh', gated: true },
  { id: 'push', cmd: 'bash scripts/feishu-push.sh', gated: false },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function OpenClawSkillPreview() {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [timeline, setTimeline] = useState<string[]>([]);
  const [approval, setApproval] = useState<Approval>('pending');

  const reset = () => {
    setStage('idle');
    setTimeline([]);
    setApproval('pending');
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setStage('author');
      setApproval('pending');
      setTimeline(['Wrote SKILL.md: frontmatter + Trigger/Process/Rules body.']);

      await wait(560);
      if (cancelled) return;
      setStage('load');
      setTimeline((prev) => [...prev, 'Dropped into skills/daily-briefing/ → watcher registered it (~250ms).']);

      await wait(520);
      if (cancelled) return;
      setStage('route');
      setTimeline((prev) => [...prev, 'User: "帮我生成今天的日报" → description matched → invoking daily-briefing.']);

      await wait(560);
      if (cancelled) return;
      setStage('run');
      setTimeline((prev) => [...prev, 'Ran collect-git-activity.sh → classified commits → formatted briefing.']);

      await wait(560);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  const stageReached = (k: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(k);

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
              Author &amp; run an OpenClaw Skill
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Walk a SKILL.md from authoring to hot-load to routing to running — the Daily Briefing example — then
              see the Lobster news-briefing pipeline pause at its human-approval gate.
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Running' : stage === 'complete' ? 'Reset' : 'Run skill'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">skills/daily-briefing/SKILL.md</p>
            </div>
            <pre className="mt-3 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-2xl border border-[var(--color-border-default)] bg-black/25 p-3 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {skillMd}
            </pre>
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
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[var(--color-green-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">briefing output</p>
            </div>
            {stageReached('run') ? (
              <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/8 p-3 font-mono text-[11px] leading-5 text-[var(--color-text-primary)]">
                {briefingOutput}
              </pre>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-[var(--color-border-default)] px-3 py-6 text-sm leading-6 text-[var(--color-text-muted)]">
                Run the skill to produce the formatted briefing.
              </p>
            )}
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Lobster: news-briefing pipeline
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {lobsterSteps.map((s, i) => {
                const blockedByApproval = s.id === 'push' && approval !== 'approved';
                return (
                  <div
                    key={s.id}
                    className={`rounded-2xl border p-2.5 ${
                      s.gated
                        ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8'
                        : blockedByApproval
                          ? 'border-[var(--color-border-default)] bg-black/20 opacity-60'
                          : 'border-[var(--color-border-default)] bg-black/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">{i + 1}.</span>
                      <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">{s.id}</span>
                      {s.gated && (
                        <span className="ml-auto rounded-full border border-[var(--color-amber-300)]/30 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-amber-300)]">
                          approval: required
                        </span>
                      )}
                      {s.id === 'push' && (
                        <span className="ml-auto text-[10px] text-[var(--color-text-muted)]">
                          condition: $preview.approved
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-[10px] leading-4 text-[var(--color-text-muted)]">{s.cmd}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
              {approval === 'pending' ? (
                <>
                  <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
                    Pipeline paused at <span className="font-mono">preview</span> — needs human approval before push.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setApproval('approved')}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/12 px-3 py-1.5 text-xs font-medium text-[var(--color-green-300)] transition-colors hover:bg-[var(--color-green-300)]/18"
                    >
                      <Check className="h-3.5 w-3.5" /> approve yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setApproval('rejected')}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-hover)]"
                    >
                      <X className="h-3.5 w-3.5" /> approve no
                    </button>
                  </div>
                </>
              ) : approval === 'approved' ? (
                <p className="text-xs font-semibold text-[var(--color-green-300)]">
                  ✓ approved → push step ran → briefing sent to Feishu.
                </p>
              ) : (
                <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                  ✕ rejected → push skipped (condition $preview.approved is false).
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Activity log
            </p>
            <div className="mt-4 space-y-3">
              {timeline.length > 0 ? (
                timeline.map((item, index) => (
                  <p key={`${item}-${index}`} className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  Run the skill to walk author → load → route → run, then try the Lobster approval gate.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
