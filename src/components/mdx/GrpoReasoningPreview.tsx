'use client';

import { useEffect, useState } from 'react';
import {
  Brain,
  Calculator,
  Code,
  GitBranch,
  LoaderCircle,
  Play,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

type TaskKey = 'math' | 'code' | 'cot';
type StageKey = 'idle' | 'sample' | 'score' | 'advantage' | 'update' | 'complete';

interface Completion {
  text: string;
  correctness: number;
  format: number;
  length: number;
  total: number;
}

interface ReasoningTask {
  key: TaskKey;
  label: string;
  icon: typeof Brain;
  prompt: string;
  groundTruth: string;
  completions: Completion[];
  baseAnswer: string;
  tunedAnswer: string;
}

const tasks: ReasoningTask[] = [
  {
    key: 'math',
    label: 'Math Reasoning',
    icon: Calculator,
    prompt: 'A train leaves A at 60 km/h, another leaves B at 80 km/h heading toward each other. AB = 350 km. When do they meet?',
    groundTruth: '2.5 hours',
    completions: [
      {
        text: '<think>relative speed 60+80=140, time=350/140=2.5</think><answer>2.5 hours</answer>',
        correctness: 1.0,
        format: 1.0,
        length: 0.0,
        total: 1.18,
      },
      {
        text: 'time = 350 / (60+80) = 2.5 hours',
        correctness: 1.0,
        format: 0.2,
        length: 0.0,
        total: 1.04,
      },
      {
        text: '<think>let me think... 60*t + 80*t = 350, so t=3</think><answer>3 hours</answer>',
        correctness: 0.0,
        format: 1.0,
        length: 0.0,
        total: 0.20,
      },
      {
        text: 'About 3 hours, depending on how we count stops and other factors that may affect the journey time over varying terrain conditions.',
        correctness: 0.0,
        format: 0.0,
        length: -0.3,
        total: -0.30,
      },
    ],
    baseAnswer: 'Approximately 3 hours, give or take, depending on track conditions and other factors.',
    tunedAnswer: '<think>relative speed 60+80=140, time=350/140=2.5</think><answer>2.5 hours</answer>',
  },
  {
    key: 'code',
    label: 'Code Generation',
    icon: Code,
    prompt: 'Write a Python function `is_palindrome(s)` that returns True if `s` reads the same forwards and backwards, ignoring case and non-alphanumeric characters.',
    groundTruth: 'unit tests pass',
    completions: [
      {
        text: '<think>strip non-alnum, lowercase, compare with reverse</think><answer>```python\ndef is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n```</answer>',
        correctness: 1.0,
        format: 1.0,
        length: 0.0,
        total: 1.18,
      },
      {
        text: '```python\ndef is_palindrome(s):\n    s = s.lower()\n    return s == s[::-1]\n```',
        correctness: 0.4,
        format: 0.2,
        length: 0.0,
        total: 0.44,
      },
      {
        text: '<answer>```python\ndef is_palindrome(s: str) -> bool:\n    f = [c.lower() for c in s if c.isalnum()]\n    return f == f[::-1]\n```</answer>',
        correctness: 1.0,
        format: 0.6,
        length: 0.0,
        total: 1.12,
      },
      {
        text: 'Here is a function that should work for most cases, though edge handling around Unicode normalization is left as an exercise to the reader and may require further refinement...',
        correctness: 0.0,
        format: 0.0,
        length: -0.4,
        total: -0.40,
      },
    ],
    baseAnswer: 'def is_palindrome(s): return s == s[::-1]   # forgets case + non-alnum stripping',
    tunedAnswer: '<think>strip non-alnum, lowercase, compare with reverse</think><answer>```python\ndef is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n```</answer>',
  },
  {
    key: 'cot',
    label: 'Chain-of-Thought',
    icon: Brain,
    prompt: 'A farmer has 17 sheep. All but 9 die. How many sheep are left?',
    groundTruth: '9',
    completions: [
      {
        text: '<think>"all but 9 die" means 9 are left alive</think><answer>9</answer>',
        correctness: 1.0,
        format: 1.0,
        length: 0.0,
        total: 1.18,
      },
      {
        text: '<think>17-9=8</think><answer>8</answer>',
        correctness: 0.0,
        format: 1.0,
        length: 0.0,
        total: 0.20,
      },
      {
        text: '9 sheep are left.',
        correctness: 1.0,
        format: 0.0,
        length: 0.0,
        total: 1.00,
      },
      {
        text: '<think>17 minus the ones that died... wait, "all but 9" is a tricky phrasing. Let me reread. All except 9 die, so 9 survive. But also let me double check by considering the alternative reading where the number that died is 9.</think><answer>9</answer>',
        correctness: 1.0,
        format: 1.0,
        length: -0.2,
        total: 0.98,
      },
    ],
    baseAnswer: '<think>17-9=8</think><answer>8 sheep are left.</answer>',
    tunedAnswer: '<think>"all but 9 die" means 9 are left alive</think><answer>9</answer>',
  },
];

const stageOrder: StageKey[] = ['idle', 'sample', 'score', 'advantage', 'update', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  { key: 'sample', label: 'Sample K', description: 'vLLM-backed batched generation of K candidate completions.' },
  { key: 'score', label: 'Reward bank', description: 'Score correctness, format, and length on every candidate.' },
  { key: 'advantage', label: 'Group advantage', description: 'A_i = (r_i − μ) / σ across the sampled group.' },
  { key: 'update', label: 'Policy update', description: 'GRPO loss with KL regularization to the reference policy.' },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function GrpoReasoningPreview() {
  const [activeTask, setActiveTask] = useState<TaskKey>('math');
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleCount, setVisibleCount] = useState(0);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showTuned, setShowTuned] = useState(false);
  const [timeline, setTimeline] = useState<string[]>([]);

  const currentTask = tasks.find((task) => task.key === activeTask) ?? tasks[0];
  const groupMean =
    currentTask.completions.reduce((sum, c) => sum + c.total, 0) / currentTask.completions.length;
  const groupStd = Math.sqrt(
    currentTask.completions.reduce((sum, c) => sum + (c.total - groupMean) ** 2, 0) /
      currentTask.completions.length,
  );

  const handleTaskSelect = (taskKey: TaskKey) => {
    setActiveTask(taskKey);
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
        `Selected ${currentTask.label} prompt.`,
        'Sampling K=4 candidate completions from the policy with vLLM.',
      ]);

      for (let index = 0; index < currentTask.completions.length; index += 1) {
        await wait(340);
        if (cancelled) return;
        setVisibleCount(index + 1);
      }

      await wait(260);
      if (cancelled) return;
      setStage('score');
      setTimeline((prev) => [...prev, 'Scored each candidate on correctness, format, and length.']);

      await wait(420);
      if (cancelled) return;
      setStage('advantage');
      setShowAdvantage(true);
      setTimeline((prev) => [
        ...prev,
        `Computed group-relative advantages (μ=${groupMean.toFixed(2)}, σ=${groupStd.toFixed(2)}).`,
      ]);

      await wait(460);
      if (cancelled) return;
      setStage('update');
      setShowUpdate(true);
      setTimeline((prev) => [
        ...prev,
        'Applied GRPO policy update with KL regularization to the frozen reference.',
      ]);

      await wait(500);
      if (cancelled) return;
      setShowTuned(true);
      setTimeline((prev) => [...prev, 'Replayed the same prompt through the updated policy.']);

      await wait(220);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [currentTask, groupMean, groupStd, running]);

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
              Walk through one GRPO training step
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Pick a reasoning task, watch the trainer sample K=4 completions, score each one on correctness, format, and length,
              and turn the group-relative advantage into a measurable shift in the model's answer.
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
              Reasoning task
            </p>
            <div className="grid gap-3">
              {tasks.map((task) => {
                const Icon = task.icon;
                const isActive = activeTask === task.key;
                return (
                  <button
                    key={task.key}
                    type="button"
                    onClick={() => handleTaskSelect(task.key)}
                    className={`rounded-[24px] border p-4 text-left transition-colors ${
                      isActive
                        ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 text-[var(--color-amber-300)]" />
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{task.label}</h4>
                        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{task.prompt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Ground truth</p>
            <p className="mt-3 text-sm font-semibold text-[var(--color-green-300)]">{currentTask.groundTruth}</p>
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
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">K=4 completions</h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleCount}/{currentTask.completions.length}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {currentTask.completions.slice(0, visibleCount).map((completion, index) => {
                const advantage = (completion.total - groupMean) / (groupStd || 1);
                const positive = advantage >= 0;
                return (
                  <div
                    key={`${completion.text.slice(0, 20)}-${index}`}
                    className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                          completion {index + 1}
                        </p>
                        <p className="mt-1.5 break-words font-mono text-xs leading-5 text-[var(--color-text-secondary)]">
                          {completion.text}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">reward</p>
                        <p className="mt-1.5 text-sm font-semibold text-[var(--color-green-300)]">
                          {completion.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">
                        correct: {completion.correctness.toFixed(2)}
                      </span>
                      <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">
                        format: {completion.format.toFixed(2)}
                      </span>
                      <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">
                        length: {completion.length.toFixed(2)}
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

              {visibleCount === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-6 text-sm leading-6 text-[var(--color-text-muted)]">
                  Run the step to sample K candidate completions from the policy.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">μ</p>
              <p className="mt-2.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                {showAdvantage ? groupMean.toFixed(2) : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">group mean</p>
            </div>
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">σ</p>
              <p className="mt-2.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                {showAdvantage ? groupStd.toFixed(2) : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">group std</p>
            </div>
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">KL</p>
              <p className="mt-2.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                {showUpdate ? '0.042' : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">to reference</p>
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
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">base policy</p>
                <p className="mt-2 break-words font-mono text-xs leading-6 text-[var(--color-text-secondary)]">
                  {currentTask.baseAnswer}
                </p>
              </div>
              <div
                className={`rounded-[22px] border p-4 transition-colors ${
                  showTuned
                    ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                    : 'border-dashed border-[var(--color-border-default)] bg-black/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">after GRPO update</p>
                  <GitBranch className="h-3.5 w-3.5 text-[var(--color-green-300)]" />
                </div>
                <p className="mt-2 break-words font-mono text-xs leading-6 text-[var(--color-text-primary)]">
                  {showTuned ? currentTask.tunedAnswer : 'Awaiting the policy update step.'}
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
                  The sandbox log will narrate sample, score, advantage, and policy update as the step runs.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
