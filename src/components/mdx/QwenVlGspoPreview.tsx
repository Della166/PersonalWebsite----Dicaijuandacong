'use client';

import { useEffect, useState } from 'react';
import {
  Camera,
  Eye,
  LoaderCircle,
  Play,
  ScanText,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

type TaskKey = 'counting' | 'ocr' | 'grounding';
type StageKey = 'idle' | 'rollout' | 'reward' | 'advantage' | 'update' | 'complete';

interface Candidate {
  text: string;
  rewards: { name: string; value: number }[];
  total: number;
}

interface VisualTask {
  key: TaskKey;
  label: string;
  icon: typeof Camera;
  imageDescription: string;
  groundTruth: string;
  prompt: string;
  candidates: Candidate[];
  baseAnswer: string;
  tunedAnswer: string;
  rewardBreakdown: { name: string; description: string }[];
}

const tasks: VisualTask[] = [
  {
    key: 'counting',
    label: 'Object Counting',
    icon: Camera,
    imageDescription: 'A cluttered desk photo with stationery and small objects.',
    groundTruth: '7 pens',
    prompt: 'How many pens are visible in this image? Respond with a single integer.',
    candidates: [
      {
        text: '6 pens',
        rewards: [
          { name: 'EM', value: 0.0 },
          { name: 'soft', value: 0.6 },
        ],
        total: 0.3,
      },
      {
        text: '7 pens',
        rewards: [
          { name: 'EM', value: 1.0 },
          { name: 'soft', value: 1.0 },
        ],
        total: 1.0,
      },
      {
        text: 'around 8 or 9',
        rewards: [
          { name: 'EM', value: 0.0 },
          { name: 'soft', value: 0.2 },
        ],
        total: 0.1,
      },
      {
        text: '7',
        rewards: [
          { name: 'EM', value: 1.0 },
          { name: 'soft', value: 1.0 },
        ],
        total: 1.0,
      },
    ],
    baseAnswer: 'I can see roughly 8 or 9 pen-like objects on the desk.',
    tunedAnswer: '7',
    rewardBreakdown: [
      { name: 'Exact match', description: 'Integer matches ground truth.' },
      { name: 'Soft credit', description: 'Partial reward when |error| <= 1 keeps near-miss policy from collapsing.' },
    ],
  },
  {
    key: 'ocr',
    label: 'Screenshot OCR',
    icon: ScanText,
    imageDescription: 'A 1080p product dashboard screenshot with mixed fonts and a serial code.',
    groundTruth: 'SN-4421-AKQ-09',
    prompt: 'Transcribe the serial code visible in the lower-right corner of the dashboard.',
    candidates: [
      {
        text: 'SN-4421-AKQ-09',
        rewards: [
          { name: 'edit', value: 1.0 },
          { name: 'cap', value: 1.0 },
        ],
        total: 1.0,
      },
      {
        text: 'SN-4421-AKO-09',
        rewards: [
          { name: 'edit', value: 0.86 },
          { name: 'cap', value: 1.0 },
        ],
        total: 0.86,
      },
      {
        text: 'serial code S/N 4421 AKQ',
        rewards: [
          { name: 'edit', value: 0.18 },
          { name: 'cap', value: 0.5 },
        ],
        total: 0.18,
      },
      {
        text: 'SN-4421-AKQ-09',
        rewards: [
          { name: 'edit', value: 1.0 },
          { name: 'cap', value: 1.0 },
        ],
        total: 1.0,
      },
    ],
    baseAnswer: 'The serial code reads roughly "S/N 4421 AKQ" but the trailing digits are not clear.',
    tunedAnswer: 'SN-4421-AKQ-09',
    rewardBreakdown: [
      { name: 'Edit distance', description: 'Normalized character-level distance against the ground truth string.' },
      { name: 'Cap', description: 'Caps the penalty so a single short hallucination cannot dominate the group.' },
    ],
  },
  {
    key: 'grounding',
    label: 'Visual Grounding',
    icon: Target,
    imageDescription: 'A street photo with three pedestrians, two cars, and a stop sign.',
    groundTruth: 'stop sign at bbox [0.71, 0.34, 0.79, 0.46]',
    prompt: 'Return the bounding box for the stop sign in normalized [x1, y1, x2, y2] coordinates.',
    candidates: [
      {
        text: '[0.70, 0.34, 0.80, 0.47] (stop sign)',
        rewards: [
          { name: 'IoU', value: 0.91 },
          { name: 'label', value: 1.0 },
        ],
        total: 0.91,
      },
      {
        text: '[0.68, 0.30, 0.82, 0.50] (sign)',
        rewards: [
          { name: 'IoU', value: 0.72 },
          { name: 'label', value: 1.0 },
        ],
        total: 0.72,
      },
      {
        text: '[0.18, 0.55, 0.32, 0.78] (car)',
        rewards: [
          { name: 'IoU', value: 0.0 },
          { name: 'label', value: 0.0 },
        ],
        total: 0.0,
      },
      {
        text: '[0.71, 0.34, 0.79, 0.46] (stop sign)',
        rewards: [
          { name: 'IoU', value: 1.0 },
          { name: 'label', value: 1.0 },
        ],
        total: 1.0,
      },
    ],
    baseAnswer: 'The most salient object appears to be one of the parked cars on the left side of the frame.',
    tunedAnswer: '[0.71, 0.34, 0.79, 0.46] — stop sign',
    rewardBreakdown: [
      { name: 'IoU', description: 'Intersection-over-union against the ground-truth bounding box.' },
      { name: 'Label correctness', description: 'Binary check that the predicted object label matches the target.' },
    ],
  },
];

const stageOrder: StageKey[] = ['idle', 'rollout', 'reward', 'advantage', 'update', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  { key: 'rollout', label: 'Rollout', description: 'Sample K candidate completions with vLLM batched generation.' },
  { key: 'reward', label: 'Reward', description: 'Score each candidate with the task-specific reward function.' },
  { key: 'advantage', label: 'Group advantage', description: 'Center rewards inside the sampled group to remove scale noise.' },
  { key: 'update', label: 'Policy update', description: 'Sequence-level GSPO objective with KL regularization to the reference.' },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function QwenVlGspoPreview() {
  const [activeTask, setActiveTask] = useState<TaskKey>('counting');
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleCandidateCount, setVisibleCandidateCount] = useState(0);
  const [showAdvantage, setShowAdvantage] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showTuned, setShowTuned] = useState(false);
  const [timeline, setTimeline] = useState<string[]>([]);

  const currentTask = tasks.find((item) => item.key === activeTask) ?? tasks[0];
  const groupMean =
    currentTask.candidates.reduce((sum, c) => sum + c.total, 0) / currentTask.candidates.length;

  const handleTaskSelect = (taskKey: TaskKey) => {
    setActiveTask(taskKey);
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
        `Loaded ${currentTask.label} prompt against ${currentTask.imageDescription}`,
        'Driving Qwen3-VL 8B to sample K=4 candidate sequences with vLLM.',
      ]);

      for (let index = 0; index < currentTask.candidates.length; index += 1) {
        await wait(360);
        if (cancelled) return;
        setVisibleCandidateCount(index + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('reward');
      setTimeline((prev) => [
        ...prev,
        'Scored every candidate with the task-specific reward bank.',
      ]);

      await wait(420);
      if (cancelled) return;
      setStage('advantage');
      setShowAdvantage(true);
      setTimeline((prev) => [
        ...prev,
        `Centered rewards inside the group (mean ${groupMean.toFixed(2)}).`,
      ]);

      await wait(460);
      if (cancelled) return;
      setStage('update');
      setShowUpdate(true);
      setTimeline((prev) => [
        ...prev,
        'Applied sequence-level GSPO update with KL regularization to the reference policy.',
      ]);

      await wait(520);
      if (cancelled) return;
      setShowTuned(true);
      setTimeline((prev) => [
        ...prev,
        'Replayed the same visual prompt against the updated policy.',
      ]);

      await wait(260);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [currentTask, groupMean, running]);

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
              Walk through one GSPO training step
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Pick a multimodal task, sample a group of candidate completions, watch the reward bank score them,
              and compare the base Qwen3-VL output against the policy after a single GSPO update.
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
              Visual task
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
                        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                          {task.imageDescription}
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
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{currentTask.prompt}</p>

            <div className="mt-4 rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Ground truth</p>
              <p className="mt-1.5 text-sm font-semibold text-[var(--color-green-300)]">{currentTask.groundTruth}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Reward bank
            </p>
            <div className="mt-4 space-y-3">
              {currentTask.rewardBreakdown.map((item) => (
                <div key={item.name} className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</p>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{item.description}</p>
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
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">K=4 candidates</h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleCandidateCount}/{currentTask.candidates.length}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {currentTask.candidates.slice(0, visibleCandidateCount).map((candidate, index) => {
                const advantage = candidate.total - groupMean;
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
                        <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]">{candidate.text}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">reward</p>
                        <p className="mt-1.5 text-sm font-semibold text-[var(--color-green-300)]">
                          {candidate.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {candidate.rewards.map((reward) => (
                        <span
                          key={reward.name}
                          className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]"
                        >
                          {reward.name}: {reward.value.toFixed(2)}
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

              {visibleCandidateCount === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-6 text-sm leading-6 text-[var(--color-text-muted)]">
                  Run the step to sample K candidate completions from Qwen3-VL.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Group mean
              </p>
              <p className="mt-2.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                {showAdvantage ? groupMean.toFixed(3) : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">μ across the K sampled sequences.</p>
            </div>
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                KL to reference
              </p>
              <p className="mt-2.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                {showUpdate ? '0.038' : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Regularizer keeps the policy near pretrained behavior.</p>
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
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{currentTask.baseAnswer}</p>
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
                    after GSPO update
                  </p>
                  <Eye className="h-3.5 w-3.5 text-[var(--color-green-300)]" />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
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
                  <p
                    key={`${item}-${index}`}
                    className="text-sm leading-6 text-[var(--color-text-secondary)]"
                  >
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  The sandbox log will narrate rollout, reward, advantage, and policy update as the step runs.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
