'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Calculator, RotateCcw, Sparkles } from 'lucide-react';

// Phase-2 innovation: the project's FIVE real reward functions, ported
// faithfully from the notebook to run live in the browser. Edit the completion
// and the gold answer; every reward recomputes instantly. Pure string logic,
// no API, no GPU — the exact scoring GRPOTrainer would apply.

function countOccurrences(text: string, sub: string): number {
  if (!sub) return 0;
  let count = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(sub, from);
    if (idx === -1) break;
    count += 1;
    from = idx + sub.length;
  }
  return count;
}

function extractXmlAnswer(text: string): string {
  const afterOpen = text.split('<answer>').pop() ?? '';
  return afterOpen.split('</answer>')[0].trim();
}

// correctness_reward_func: +2.0 if extracted answer == gold else 0
function correctnessReward(text: string, gold: string): number {
  return extractXmlAnswer(text) === gold.trim() ? 2.0 : 0.0;
}

// int_reward_func: +0.5 if extracted answer is all digits (Python str.isdigit)
function intReward(text: string): number {
  const a = extractXmlAnswer(text);
  return a.length > 0 && /^\d+$/.test(a) ? 0.5 : 0.0;
}

// strict_format: re.match(r"^<reasoning>\n.*?\n</reasoning>\n<answer>\n.*?\n</answer>\n$") — no DOTALL
function strictFormatReward(text: string): number {
  const re = /^<reasoning>\n.*?\n<\/reasoning>\n<answer>\n.*?\n<\/answer>\n$/;
  return re.test(text) ? 0.5 : 0.0;
}

// soft_format: re.match(r"<reasoning>.*?</reasoning>\s*<answer>.*?</answer>") — start-anchored, no DOTALL
function softFormatReward(text: string): number {
  const re = /^<reasoning>.*?<\/reasoning>\s*<answer>.*?<\/answer>/;
  return re.test(text) ? 0.5 : 0.0;
}

// xmlcount_reward_func / count_xml: 0.125 per well-formed tag, minus trailing-text penalty
function xmlCountReward(text: string): number {
  let count = 0;
  if (countOccurrences(text, '<reasoning>\n') === 1) count += 0.125;
  if (countOccurrences(text, '\n</reasoning>\n') === 1) count += 0.125;
  if (countOccurrences(text, '\n<answer>\n') === 1) {
    count += 0.125;
    const tail = text.split('\n</answer>\n').pop() ?? '';
    count -= tail.length * 0.001;
  }
  if (countOccurrences(text, '\n</answer>') === 1) {
    count += 0.125;
    const tail = text.split('\n</answer>').pop() ?? '';
    count -= (tail.length - 1) * 0.001;
  }
  return count;
}

interface Preset {
  label: string;
  gold: string;
  completion: string;
}

const presets: Preset[] = [
  {
    label: 'Clean (correct + well-formed)',
    gold: '5',
    completion: '<reasoning>\n120 / 8 = 15 chunks; 15 × 20 = 300 minutes = 5 hours.\n</reasoning>\n<answer>\n5\n</answer>\n',
  },
  {
    label: 'Formatted but wrong',
    gold: '5',
    completion: '<reasoning>\nI think it is about four hours.\n</reasoning>\n<answer>\n4\n</answer>\n',
  },
  {
    label: 'Right answer, no tags',
    gold: '5',
    completion: '120 / 8 = 15, times 20 = 300 minutes, so 5 hours.',
  },
  {
    label: 'Non-integer answer',
    gold: '2.5',
    completion: '<reasoning>\nrelative speed 140, 350/140 = 2.5\n</reasoning>\n<answer>\n2.5 hours\n</answer>\n',
  },
];

interface RewardRow {
  name: string;
  value: number;
  note: string;
}

export default function GrpoReasoningPreview() {
  const zh = useLocale() === 'zh';
  const [gold, setGold] = useState(presets[0].gold);
  const [completion, setCompletion] = useState(presets[0].completion);

  const rows: RewardRow[] = useMemo(() => {
    const extracted = extractXmlAnswer(completion);
    return [
      { name: 'correctness', value: correctnessReward(completion, gold), note: `extracted "${extracted || '∅'}" vs gold "${gold.trim()}"` },
      { name: 'int', value: intReward(completion), note: 'answer is a pure integer' },
      { name: 'strict_format', value: strictFormatReward(completion), note: 'exact <reasoning>\\n…\\n</reasoning>\\n<answer>…' },
      { name: 'soft_format', value: softFormatReward(completion), note: 'loosely contains both blocks' },
      { name: 'xmlcount', value: xmlCountReward(completion), note: '0.125 per tag − trailing-text penalty' },
    ];
  }, [completion, gold]);

  const totalReward = rows.reduce((s, r) => s + r.value, 0);

  const loadPreset = (p: Preset) => {
    setGold(p.gold);
    setCompletion(p.completion);
  };

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {zh ? '实时 · 在你浏览器里运行' : 'Live · runs in your browser'}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              {zh ? 'GRPO 奖励计算器 — 真实的 5 个函数' : 'GRPO reward calculator — the real five functions'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh ? (
                <>
                  编辑模型 completion 和 gold 答案。5 个奖励函数（从 notebook 逐字移植）实时重算。这正是{' '}
                  <code>GRPOTrainer</code> 在计算组内相对 advantage 前给每条采样 completion 打的分。
                </>
              ) : (
                <>
                  Edit a model completion and the gold answer. All five reward functions — ported verbatim from the
                  notebook — recompute live. This is the exact scoring <code>GRPOTrainer</code> applies to each sampled
                  completion before computing the group-relative advantage.
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadPreset(presets[0])}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18"
          >
            <RotateCcw className="h-4 w-4" /> {zh ? '重置' : 'Reset'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? '预设示例' : 'Presets'}
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => loadPreset(p)}
                  className="rounded-full border border-[var(--color-border-default)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-amber-300)]/40 hover:text-[var(--color-amber-300)]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? 'Gold 答案' : 'Gold answer'}
            </p>
            <input
              value={gold}
              onChange={(e) => setGold(e.target.value)}
              className="w-full rounded-[16px] border border-[var(--color-border-default)] bg-black/20 px-4 py-2.5 font-mono text-sm text-[var(--color-green-300)] outline-none focus:border-[var(--color-green-300)]/40"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? '模型 completion（可编辑）' : 'Model completion (editable)'}
            </p>
            <textarea
              value={completion}
              onChange={(e) => setCompletion(e.target.value)}
              rows={10}
              spellCheck={false}
              className="w-full resize-y rounded-[20px] border border-[var(--color-border-default)] bg-black/20 p-4 font-mono text-xs leading-6 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-green-300)]/40"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {zh ? '总奖励' : 'Total reward'}
              </p>
              <Calculator className="h-4 w-4 text-[var(--color-amber-300)]" />
            </div>
            <p className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)]">{totalReward.toFixed(3)}</p>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{zh ? '5 个奖励函数之和' : 'sum of the five reward functions'}</p>
          </div>

          <div className="space-y-2.5">
            {rows.map((r) => {
              const positive = r.value > 0;
              return (
                <div
                  key={r.name}
                  className={`rounded-[18px] border p-3.5 transition-colors ${
                    positive
                      ? 'border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8'
                      : 'border-[var(--color-border-default)] bg-black/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">{r.name}</span>
                    <span
                      className={`font-mono text-sm font-semibold ${
                        positive ? 'text-[var(--color-green-300)]' : 'text-[var(--color-text-muted)]'
                      }`}
                    >
                      {r.value >= 0 ? '+' : ''}
                      {r.value.toFixed(3)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">{r.note}</p>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] leading-5 text-[var(--color-text-muted)]">
            {zh ? (
              <>
                训练时 GRPOTrainer 就这样给每条采样 completion 打分，再在 <code>num_generations=16</code> 的组内归一化得到每条的
                advantage。试试预设：干净的答案约 3.6 分；答对但没标签的会丢掉所有格式奖励。
              </>
            ) : (
              <>
                In training, GRPOTrainer scores every sampled completion this way, then normalizes the totals within the
                group of <code>num_generations=16</code> to get each completion&apos;s advantage. Try the presets: a clean
                answer scores ~3.6; correct-but-untagged loses every format reward.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
