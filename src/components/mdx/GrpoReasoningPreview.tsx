'use client';

import { useEffect, useState } from 'react';
import {
  Calculator,
  LoaderCircle,
  Play,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

type StageKey = 'idle' | 'sample' | 'score' | 'advantage' | 'update' | 'complete';

// The five real reward functions from the notebook.
interface Completion {
  text: string;
  correctness: number; // +2.0 exact match
  int: number; // +0.5 if answer is a pure integer
  strict: number; // +0.5 strict format regex
  soft: number; // +0.5 loose format
  xml: number; // up to +0.5 graded tag count
}

interface Gsm8kSample {
  key: string;
  label: string;
  prompt: string;
  gold: string;
  completions: Completion[];
  baseAnswer: string;
  tunedAnswer: string;
}

function total(c: Completion): number {
  return c.correctness + c.int + c.strict + c.soft + c.xml;
}

// Real GSM8K-style problems (the notebook's running example is the "Joy reads pages" one).
const samples: Gsm8kSample[] = [
  {
    key: 'joy-pages',
    label: 'GSM8K · reading rate',
    prompt: 'Joy can read 8 pages of a book in 20 minutes. How many hours will it take her to read 120 pages?',
    gold: '5',
    completions: [
      {
        text: '<reasoning>\n120 / 8 = 15 chunks; 15 × 20 = 300 min = 5 hours.\n</reasoning>\n<answer>\n5\n</answer>\n',
        correctness: 2.0, int: 0.5, strict: 0.5, soft: 0.5, xml: 0.5,
      },
      {
        text: '<reasoning>\n8 pages / 20 min → 120 pages take 300 minutes = 5 hours.\n</reasoning>\n<answer>\n5 hours\n</answer>\n',
        correctness: 0.0, int: 0.0, strict: 0.5, soft: 0.5, xml: 0.5,
      },
      {
        text: '120 / 8 = 15, times 20 = 300 minutes, so 5 hours.',
        correctness: 0.0, int: 0.0, strict: 0.0, soft: 0.0, xml: 0.0,
      },
      {
        text: '<reasoning>\nRoughly 4 hours I think.\n</reasoning>\n<answer>\n4\n</answer>\n',
        correctness: 0.0, int: 0.5, strict: 0.5, soft: 0.5, xml: 0.5,
      },
    ],
    baseAnswer: 'Base 0.5B: "About 4 hours." — no reasoning, often no <answer> tags. Just blurts a number.',
    tunedAnswer: 'After GRPO: emits a <reasoning> block (120/8=15, ×20=300min=5h) then <answer>5</answer>. Shows its work.',
  },
  {
    key: 'eggs',
    label: 'GSM8K · arithmetic',
    prompt: 'A robe takes 2 bolts of blue fiber and half that much white fiber. How many bolts in total?',
    gold: '3',
    completions: [
      {
        text: '<reasoning>\nBlue = 2, white = 2/2 = 1, total = 3.\n</reasoning>\n<answer>\n3\n</answer>\n',
        correctness: 2.0, int: 0.5, strict: 0.5, soft: 0.5, xml: 0.5,
      },
      {
        text: '<reasoning>\nhalf of 2 is 1, so 2 + 1\n</reasoning>\n<answer>\n3\n</answer>\n',
        correctness: 2.0, int: 0.5, strict: 0.5, soft: 0.5, xml: 0.5,
      },
      {
        text: '<reasoning>\n2 + 2 = 4 bolts.\n</reasoning>\n<answer>\n4\n</answer>\n',
        correctness: 0.0, int: 0.5, strict: 0.5, soft: 0.5, xml: 0.5,
      },
      {
        text: 'The total is 3 bolts.',
        correctness: 0.0, int: 0.0, strict: 0.0, soft: 0.0, xml: 0.0,
      },
    ],
    baseAnswer: 'Base 0.5B: "4 bolts." — adds instead of halving, no structure.',
    tunedAnswer: 'After GRPO: <reasoning> blue=2, white=1, total=3 </reasoning><answer>3</answer>.',
  },
];

const rewardDefs: { key: keyof Omit<Completion, 'text'>; label: string; desc: string }[] = [
  { key: 'correctness', label: 'correctness', desc: 'extracted <answer> exactly equals GSM8K gold → +2.0' },
  { key: 'int', label: 'int', desc: 'answer is a pure integer → +0.5' },
  { key: 'strict', label: 'strict_format', desc: 'exact <reasoning>…</reasoning><answer>… regex → +0.5' },
  { key: 'soft', label: 'soft_format', desc: 'loosely contains both blocks → +0.5' },
  { key: 'xml', label: 'xmlcount', desc: '0.125 per well-formed tag, minus trailing-text penalty' },
];

const stageOrder: StageKey[] = ['idle', 'sample', 'score', 'advantage', 'update', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  { key: 'sample', label: 'Sample', description: 'Sample num_generations=16 completions (showing 4) from Qwen2.5-0.5B.' },
  { key: 'score', label: 'Score', description: 'Score each with the five reward functions; correctness dominates.' },
  { key: 'advantage', label: 'Group advantage', description: 'Center rewards within the group — the implicit baseline, no critic.' },
  { key: 'update', label: 'Policy update', description: 'One GRPO step (KL-regularized) pushes up above-mean completions.' },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function GrpoReasoningPreview() {
  const [activeKey, setActiveKey] = useState<string>(samples[0].key);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleCount, setVisibleCount] = useState(0);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showTuned, setShowTuned] = useState(false);
  const [timeline, setTimeline] = useState<string[]>([]);

  const sample = samples.find((s) => s.key === activeKey) ?? samples[0];
  const groupMean = sample.completions.reduce((sum, c) => sum + total(c), 0) / sample.completions.length;

  const handleSelect = (key: string) => {
    setActiveKey(key);
    setStage('idle');
    setVisibleCount(0);
    setShowAdvantage(false);
    setShowUpdate(false);
    setShowTuned(false);
    setTimeline([]);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setStage('sample');
      setVisibleCount(0);
      setShowAdvantage(false);
      setShowUpdate(false);
      setShowTuned(false);
      setTimeline([
        'Loaded GSM8K prompt; gold answer hidden from the model.',
        'Sampling completions from Qwen2.5-0.5B (num_generations=16, showing 4).',
      ]);

      for (let i = 0; i < sample.completions.length; i += 1) {
        await wait(360);
        if (cancelled) return;
        setVisibleCount(i + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('score');
      setTimeline((prev) => [...prev, 'Scored each completion with the 5 reward functions.']);

      await wait(420);
      if (cancelled) return;
      setStage('advantage');
      setShowAdvantage(true);
      setTimeline((prev) => [...prev, `Group mean reward = ${groupMean.toFixed(2)} (implicit baseline, no critic).`]);

      await wait(460);
      if (cancelled) return;
      setStage('update');
      setShowUpdate(true);
      setTimeline((prev) => [...prev, 'GRPO step: push completions with A>0 up, A<0 down, KL-regularized.']);

      await wait(520);
      if (cancelled) return;
      setShowTuned(true);
      setTimeline((prev) => [...prev, 'Compared base vs post-GRPO behavior on the same prompt.']);

      await wait(260);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [sample, groupMean, running]);

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
              Walk through one GRPO group step
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Pick a GSM8K problem, sample K completions from Qwen2.5-0.5B, watch the five reward functions score
              them, and compare the base output against the policy after one group-relative update.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Running GRPO step' : 'Run GRPO step'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              GSM8K problem
            </p>
            <div className="grid gap-3">
              {samples.map((item) => {
                const isActive = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelect(item.key)}
                    className={`rounded-[24px] border p-4 text-left transition-colors ${
                      isActive
                        ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Calculator className="mt-0.5 h-5 w-5 text-[var(--color-amber-300)]" />
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</h4>
                        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{item.prompt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Gold answer
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-green-300)]">{sample.gold}</p>
            <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
              System prompt asks for &lt;reasoning&gt;…&lt;/reasoning&gt;&lt;answer&gt;…&lt;/answer&gt;.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Five reward functions
            </p>
            <div className="mt-4 space-y-2.5">
              {rewardDefs.map((r) => (
                <div key={r.key} className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
                  <p className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">{r.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
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
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Sampled group
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">K candidates</h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleCount}/{sample.completions.length}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {sample.completions.slice(0, visibleCount).map((c, index) => {
                const score = total(c);
                const advantage = score - groupMean;
                const positive = advantage >= 0;
                return (
                  <div
                    key={`${c.text}-${index}`}
                    className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                          completion {index + 1}
                        </p>
                        <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
                          {c.text}
                        </pre>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">reward</p>
                        <p className="mt-1.5 text-sm font-semibold text-[var(--color-green-300)]">{score.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {rewardDefs.map((r) => (
                        <span
                          key={r.key}
                          className="rounded-full border border-[var(--color-border-default)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]"
                        >
                          {r.label}: {c[r.key].toFixed(2)}
                        </span>
                      ))}
                      {showAdvantage && (
                        <span
                          className={`ml-auto rounded-full px-3 py-1 text-[11px] font-semibold ${
                            positive
                              ? 'bg-[var(--color-green-300)]/15 text-[var(--color-green-300)]'
                              : 'bg-[var(--color-amber-300)]/15 text-[var(--color-amber-300)]'
                          }`}
                        >
                          A = {positive ? '+' : ''}
                          {advantage.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {visibleCount === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-6 text-sm leading-6 text-[var(--color-text-muted)]">
                  Run the step to sample completions from Qwen2.5-0.5B.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Group mean reward
              </p>
              <p className="mt-2.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                {showAdvantage ? groupMean.toFixed(2) : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Implicit baseline — replaces PPO&apos;s critic.</p>
            </div>
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                num_generations
              </p>
              <p className="mt-2.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                {showUpdate ? '16' : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Completions sampled per prompt (config).</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Same prompt, two policies
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">Before vs after</h4>
              </div>
              <TrendingUp className="h-4 w-4 text-[var(--color-amber-300)]" />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">base 0.5B</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{sample.baseAnswer}</p>
              </div>
              <div
                className={`rounded-[22px] border p-4 transition-colors ${
                  showTuned
                    ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                    : 'border-dashed border-[var(--color-border-default)] bg-black/10'
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">after GRPO</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
                  {showTuned ? sample.tunedAnswer : 'Awaiting the policy update step.'}
                </p>
              </div>
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
                  The log narrates sample, score, advantage, and the GRPO update as the step runs.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
