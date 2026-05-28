'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Boxes, Calculator, LoaderCircle, Play, Sparkles, Target } from 'lucide-react';

type StageKey = 'idle' | 'rollout' | 'reward' | 'critic' | 'advantage' | 'actor' | 'criticupd' | 'complete';

const stageOrder: StageKey[] = ['idle', 'rollout', 'reward', 'critic', 'advantage', 'actor', 'criticupd', 'complete'];

const roles = ['Actor', 'Reference', 'Reward', 'Critic'];
// which roles are lit at each stage
const roleActiveByStage: Record<StageKey, string[]> = {
  idle: [],
  rollout: ['Actor', 'Reference'],
  reward: ['Reward'],
  critic: ['Critic'],
  advantage: [],
  actor: ['Actor'],
  criticupd: ['Critic'],
  complete: [],
};

const stages: { key: Exclude<StageKey, 'idle' | 'complete'>; label: { en: string; zh: string } }[] = [
  { key: 'rollout', label: { zh: '1. Rollout：Actor 生成 CoT 答案', en: '1. Rollout: Actor generates a CoT answer' } },
  { key: 'reward', label: { zh: '2. Reward：规则函数打分(正则匹配 ####)', en: '2. Reward: rule function scores (regex on ####)' } },
  { key: 'critic', label: { zh: '3. Critic：估计 value', en: '3. Critic: estimates value' } },
  { key: 'advantage', label: { zh: '4. Advantage：A = reward − value (GAE)', en: '4. Advantage: A = reward − value (GAE)' } },
  { key: 'actor', label: { zh: '5. Actor 更新（Clipped Objective）', en: '5. Actor update (Clipped Objective)' } },
  { key: 'criticupd', label: { zh: '6. Critic 更新（(value−reward)²）', en: '6. Critic update ((value−reward)²)' } },
];

const problem = {
  zh: 'Natalia 4 月卖了 48 个发夹，5 月卖了一半。两个月共卖多少？',
  en: 'Natalia sold 48 clips in April, half as many in May. Total over both months?',
};
const answer = 'April 48, May 48/2=24, total 48+24=72.\n#### 72';

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function VeRLPpoPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');

  const reached = (t: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(t);
  const lit = roleActiveByStage[stage];

  const reset = () => {
    setStage('idle');
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      const seq: StageKey[] = ['rollout', 'reward', 'critic', 'advantage', 'actor', 'criticupd'];
      for (const s of seq) {
        setStage(s);
        await wait(620);
        if (cancelled) return;
      }
      setStage('complete');
      setRunning(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {zh ? '交互预览' : 'Interactive Preview'}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              {zh ? '一次 PPO 迭代（veRL · GSM8K）' : 'One PPO iteration (veRL · GSM8K)'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '复演 veRL 在 Qwen2.5-0.5B 上跑 GSM8K 的 PPO 闭环：四个模型角色(Actor/Reference/Reward/Critic)依次点亮，规则奖励按 #### 答案给 0/1。'
                : 'Replays the veRL PPO loop on Qwen2.5-0.5B over GSM8K: four model roles (Actor/Reference/Reward/Critic) light up in turn, with a rule reward scoring 0/1 on the #### answer.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '训练中' : 'Training') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '跑一步 PPO' : 'Run one PPO step'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          {/* Four model roles */}
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '四个模型角色（Ray 编排）' : 'Four model roles (Ray)'}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {roles.map((r) => {
                const on = lit.includes(r);
                return (
                  <div
                    key={r}
                    className={`rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${
                      on ? 'border-[var(--color-green-300)]/50 bg-[var(--color-green-300)]/15 text-[var(--color-green-300)]' : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {r}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">FSDP + vLLM · HybridFlow · single H800</p>
          </div>

          {/* GSM8K problem */}
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? 'GSM8K 题目' : 'GSM8K problem'}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? problem.zh : problem.en}</p>
            {reached('rollout') && (
              <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border-default)] bg-black/25 p-3 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">{answer}</pre>
            )}
          </div>

          {/* metrics footer */}
          {stage === 'complete' && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{zh ? 'step:42 实测指标' : 'step:42 measured metrics'}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] text-[var(--color-text-secondary)]">
                <span>entropy 0.475</span>
                <span>score/mean 0.296</span>
                <span>1702 tok/s</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          {stages.map((s) => {
            const active = stage === s.key;
            const done = reached(s.key) && !active;
            return (
              <div
                key={s.key}
                className={`flex items-center justify-between gap-2 rounded-[18px] border px-3.5 py-3 transition-colors ${
                  active ? 'border-[var(--color-green-300)]/50 bg-[var(--color-green-300)]/12' : done ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8' : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                }`}
              >
                <p className="text-sm text-[var(--color-text-primary)]">{zh ? s.label.zh : s.label.en}</p>
                {s.key === 'reward' && reached('reward') && (
                  <span className="shrink-0 rounded-full border border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/15 px-2 py-0.5 font-mono text-[10px] text-[var(--color-green-300)]">
                    #### 72 ✓ → 1.0
                  </span>
                )}
              </div>
            );
          })}

          <div className="rounded-[18px] border border-[var(--color-border-default)] bg-black/10 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
                reward: extract last 300 chars → /#### (\-?[0-9\.\,]+)/ → 1.0 correct / 0.0 wrong
              </p>
            </div>
          </div>

          {stage === 'complete' && (
            <p className="rounded-[18px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-3.5 py-3 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? '闭环回到下一步。这正是 InstructGPT 的 RLHF 第三阶段（SFT → 奖励模型 → PPO，带逐 token KL 惩罚防奖励作弊）。'
                : 'The loop returns to the next step. This is exactly stage three of InstructGPT\'s RLHF (SFT → reward model → PPO, with a per-token KL penalty to prevent reward hacking).'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
