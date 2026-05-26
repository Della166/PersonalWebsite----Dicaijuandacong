'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Image as ImageIcon,
  LoaderCircle,
  Play,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

type StageKey = 'idle' | 'rollout' | 'reward' | 'advantage' | 'update' | 'complete';

interface Candidate {
  text: string;
  // two real reward components from the notebook
  format: number; // formatting_reward_func, weight 0.3 → {0, 0.3, 0.6} minus penalty
  correct: number; // correctness_reward_func, weight 1.0 → {0, 1.5, 2.0}
}

interface MathSample {
  key: string;
  label: string;
  icon: typeof BarChart3;
  imageDescription: string;
  question: string;
  gold: string;
  candidates: Candidate[];
  baseAnswer: string;
  tunedAnswer: string;
  note: string;
}

// Real samples taken from the project's held-out eval records (baseline/after_records.json).
const samples: MathSample[] = [
  {
    key: 'navy-bar',
    label: 'idx 59 · bar chart',
    icon: BarChart3,
    imageDescription: 'A grouped bar chart of crime incidents; navy bars = "Acquaintance".',
    question: 'What is the highest value of navy blue bar?',
    gold: '991',
    candidates: [
      { text: '<REASONING> Compare the navy bars and read the tallest label… </REASONING><SOLUTION>991</SOLUTION>', format: 0.6, correct: 2.0 },
      { text: '<REASONING> The highest navy bar is labelled 991. </REASONING><SOLUTION>991.0</SOLUTION>', format: 0.6, correct: 1.5 },
      { text: '<REASONING> Looks like the tallest dark bar is around 980. </REASONING><SOLUTION>980</SOLUTION>', format: 0.6, correct: 0.0 },
      { text: 'The highest navy bar is 991 (no solution tags emitted).', format: 0.3, correct: 0.0 },
    ],
    baseAnswer: 'pred = 991.0 → format ok, but strict match fails (991.0 ≠ 991), so the eval marks it incorrect.',
    tunedAnswer: 'pred = 991 → exact match. This is one of the real "wrong → correct" cases in the records.',
    note: 'Real improved case: baseline emitted "991.0" (numerically right, strict-match wrong); after RL it emits "991".',
  },
  {
    key: 'age-gap',
    label: 'idx 27 · photo',
    icon: ImageIcon,
    imageDescription: 'A photo of two historical figures; question asks their age gap.',
    question: 'What is the age gap between these two people in image?',
    gold: '6',
    candidates: [
      { text: '<REASONING> Estimate both birth years, subtract… </REASONING><SOLUTION>11</SOLUTION>', format: 0.6, correct: 0.0 },
      { text: '<REASONING> Hard to tell exact ages from the photo. </REASONING><SOLUTION>6</SOLUTION>', format: 0.6, correct: 2.0 },
      { text: 'addCriterion addCriterion addCriterion addCriterion …', format: -0.6, correct: 0.0 },
      { text: '<REASONING> The gap looks small, maybe a few years. </REASONING> (missing SOLUTION)', format: 0.3, correct: 0.0 },
    ],
    baseAnswer: 'pred = null → no parsable <SOLUTION>, format_ok = false. The baseline failed the format gate entirely.',
    tunedAnswer: 'pred = 11 → still wrong, but format_ok = true. RL fixed the structure first; accuracy is the harder battle.',
    note: 'Real format-recovery case: baseline produced no valid <SOLUTION> tag at all; after RL the output is well-formed.',
  },
  {
    key: 'total-bars',
    label: 'idx 0 · bar chart',
    icon: BarChart3,
    imageDescription: 'A bar chart of ocean plastic mass by region (trillions).',
    question: "What's the total add up value of largest and smallest bar?",
    gold: '252.65',
    candidates: [
      { text: '<REASONING> Largest = 5.25, smallest = 0.25 → 5.50… </REASONING><SOLUTION>5.4974</SOLUTION>', format: 0.6, correct: 0.0 },
      { text: '<REASONING> Add the top and bottom bar values. </REASONING><SOLUTION>252.65</SOLUTION>', format: 0.6, correct: 2.0 },
      { text: '<REASONING> Misreads the axis units. </REASONING><SOLUTION>5.5</SOLUTION>', format: 0.6, correct: 0.0 },
      { text: '<REASONING> Unsure which bars to use. </REASONING><SOLUTION>250</SOLUTION>', format: 0.6, correct: 0.0 },
    ],
    baseAnswer: 'pred = 5.4974 → format ok but wrong (misread units). This sample stays wrong after the short run.',
    tunedAnswer: 'pred = 5.4974 → unchanged. An honest reminder: a short demo run does not fix hard perception errors.',
    note: 'Real unchanged case: kept as-is to show RL is not magic — perception/unit errors survive a short run.',
  },
];

const stageOrder: StageKey[] = ['idle', 'rollout', 'reward', 'advantage', 'update', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  { key: 'rollout', label: 'Rollout', description: 'Sample num_generations=4 completions with model.generate (fast_inference=False).' },
  { key: 'reward', label: 'Reward', description: 'Score each with formatting_reward_func (λ=0.3) + correctness_reward_func (λ=1.0).' },
  { key: 'advantage', label: 'Group advantage', description: 'Center rewards within the group of 4 to remove prompt-level scale.' },
  { key: 'update', label: 'GSPO update', description: 'Sequence-level importance ratio (importance_sampling_level="sequence"), dr_grpo loss.' },
];

function total(c: Candidate): number {
  return c.format + c.correct;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function QwenVlGspoPreview() {
  const [activeKey, setActiveKey] = useState<string>(samples[0].key);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleCandidateCount, setVisibleCandidateCount] = useState(0);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showTuned, setShowTuned] = useState(false);
  const [timeline, setTimeline] = useState<string[]>([]);

  const sample = samples.find((item) => item.key === activeKey) ?? samples[0];
  const groupMean = sample.candidates.reduce((sum, c) => sum + total(c), 0) / sample.candidates.length;

  const handleSelect = (key: string) => {
    setActiveKey(key);
    setStage('idle');
    setVisibleCandidateCount(0);
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
      setStage('rollout');
      setVisibleCandidateCount(0);
      setShowAdvantage(false);
      setShowUpdate(false);
      setShowTuned(false);
      setTimeline([
        `Loaded MathVista sample (${sample.imageDescription})`,
        'Sampling K=4 candidate completions from Qwen3-VL 8B (4-bit).',
      ]);

      for (let index = 0; index < sample.candidates.length; index += 1) {
        await wait(360);
        if (cancelled) return;
        setVisibleCandidateCount(index + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('reward');
      setTimeline((prev) => [...prev, 'Scored each candidate: format (λ=0.3) + correctness (λ=1.0).']);

      await wait(420);
      if (cancelled) return;
      setStage('advantage');
      setShowAdvantage(true);
      setTimeline((prev) => [...prev, `Centered rewards within the group (mean ${groupMean.toFixed(2)}).`]);

      await wait(460);
      if (cancelled) return;
      setStage('update');
      setShowUpdate(true);
      setTimeline((prev) => [...prev, 'Applied sequence-level GSPO update (dr_grpo loss).']);

      await wait(520);
      if (cancelled) return;
      setShowTuned(true);
      setTimeline((prev) => [...prev, 'Replayed the same prompt against the post-RL policy.']);

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
              Walk through one GSPO group step
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Pick a real MathVista sample, sample K=4 candidate completions, watch the two reward functions score
              them, and compare the base Qwen3-VL output against the policy after a sequence-level GSPO update.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Running GSPO step' : 'Run GSPO step'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              MathVista sample
            </p>
            <div className="grid gap-3">
              {samples.map((item) => {
                const Icon = item.icon;
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
                      <Icon className="mt-0.5 h-5 w-5 text-[var(--color-amber-300)]" />
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</h4>
                        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                          {item.imageDescription}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Prompt
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{sample.question}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
              … answer between &lt;REASONING&gt;…&lt;/REASONING&gt; and &lt;SOLUTION&gt;a single float&lt;/SOLUTION&gt;
            </p>

            <div className="mt-4 rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Gold answer</p>
              <p className="mt-1.5 text-sm font-semibold text-[var(--color-green-300)]">{sample.gold}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Reward functions
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">format · λ=0.3</p>
                <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">
                  +1 for one &lt;REASONING&gt; block, +1 for one &lt;SOLUTION&gt; block; −2 for addCriterion spam.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">correct · λ=1.0</p>
                <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">
                  2.0 for exact string match, 1.5 for numeric match (3 vs 3.0), else 0.
                </p>
              </div>
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
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">K=4 candidates</h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleCandidateCount}/{sample.candidates.length}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {sample.candidates.slice(0, visibleCandidateCount).map((candidate, index) => {
                const score = total(candidate);
                const advantage = score - groupMean;
                const positive = advantage >= 0;
                return (
                  <div
                    key={`${candidate.text}-${index}`}
                    className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                          candidate {index + 1}
                        </p>
                        <p className="mt-1.5 font-mono text-xs leading-5 text-[var(--color-text-secondary)]">
                          {candidate.text}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">reward</p>
                        <p className="mt-1.5 text-sm font-semibold text-[var(--color-green-300)]">
                          {score.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">
                        format: {candidate.format.toFixed(2)}
                      </span>
                      <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">
                        correct: {candidate.correct.toFixed(2)}
                      </span>
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

              {visibleCandidateCount === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-6 text-sm leading-6 text-[var(--color-text-muted)]">
                  Run the step to sample K=4 candidate completions from Qwen3-VL.
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
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">μ across the K=4 sampled sequences.</p>
            </div>
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Importance level
              </p>
              <p className="mt-2.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                {showUpdate ? 'sequence' : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">GSPO = sequence-level ratio, not per-token.</p>
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
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">base Qwen3-VL</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{sample.baseAnswer}</p>
              </div>
              <div
                className={`rounded-[22px] border p-4 transition-colors ${
                  showTuned
                    ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                    : 'border-dashed border-[var(--color-border-default)] bg-black/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    after GSPO
                  </p>
                  <Users className="h-3.5 w-3.5 text-[var(--color-green-300)]" />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
                  {showTuned ? sample.tunedAnswer : 'Awaiting the policy update step.'}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">{sample.note}</p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Held-out eval (100 samples · from the project records)
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Accuracy</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">5.0% → 6.0%</p>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Format compliance</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-green-300)]">77.0% → 84.0%</p>
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
                  The log narrates rollout, reward, advantage, and the GSPO update as the step runs.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
