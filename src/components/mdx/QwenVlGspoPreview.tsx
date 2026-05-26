'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Calculator, RotateCcw, Sparkles } from 'lucide-react';

// Phase-2 innovation: the project's TWO real reward functions for the Qwen3-VL
// GSPO run, ported faithfully from the notebook to run live in the browser.
// formatting_reward_func (λ=0.3, with the addCriterion penalty) + correctness_reward_func (λ=1.0).

const FORMAT_WEIGHT = 0.3;
const CORRECT_WEIGHT = 1.0;

function findAll(text: string, re: RegExp): string[] {
  return [...text.matchAll(re)].map((m) => m[1]);
}

// formatting_reward_func
function formattingReward(completion: string): { value: number; reasoningOk: boolean; solutionOk: boolean; penalized: boolean } {
  let score = 0;
  const reasoning = findAll(completion, /<REASONING>([\s\S]*?)<\/REASONING>/g);
  const solution = findAll(completion, /<SOLUTION>([\s\S]*?)<\/SOLUTION>/g);
  const reasoningOk = reasoning.length === 1;
  const solutionOk = solution.length === 1;
  if (reasoningOk) score += 1.0;
  if (solutionOk) score += 1.0;

  // addCriterion spam penalty
  let penalized = false;
  if (completion.length !== 0) {
    const removal = completion.split('addCriterion').join('').split('\n').join('');
    if ((completion.length - removal.length) / completion.length >= 0.5) {
      score -= 2.0;
      penalized = true;
    }
  }
  return { value: FORMAT_WEIGHT * score, reasoningOk, solutionOk, penalized };
}

function extractSolution(completion: string): string | null {
  const matches = findAll(completion, /<SOLUTION>([\s\S]*?)<\/SOLUTION>/g);
  if (matches.length !== 1) return null;
  return matches[0].replace(/\n/g, '').trim();
}

function toNumber(x: string): number | null {
  const n = Number(x.trim());
  return Number.isFinite(n) ? n : null;
}

// correctness_reward_func
function correctnessReward(completion: string, gold: string): { value: number; basis: string } {
  const pred = extractSolution(completion);
  if (pred === null) return { value: 0, basis: 'no single <SOLUTION> block → 0' };
  const goldText = gold.trim();
  if (pred === goldText) return { value: CORRECT_WEIGHT * 2.0, basis: `exact string match "${pred}" → 2.0` };
  const pn = toNumber(pred);
  const gn = toNumber(goldText);
  if (pn !== null && gn !== null && Math.abs(pn - gn) < 1e-8) {
    return { value: CORRECT_WEIGHT * 1.5, basis: `numeric match (${pred} ≈ ${goldText}) → 1.5` };
  }
  return { value: 0, basis: `"${pred}" ≠ "${goldText}" → 0` };
}

interface Preset {
  label: string;
  gold: string;
  completion: string;
}

const presets: Preset[] = [
  {
    label: 'Clean + correct',
    gold: '991',
    completion: '<REASONING>The tallest navy bar is labelled 991.</REASONING><SOLUTION>991</SOLUTION>',
  },
  {
    label: 'Numeric match (991 vs 991.0)',
    gold: '991',
    completion: '<REASONING>Reading the value off the bar.</REASONING><SOLUTION>991.0</SOLUTION>',
  },
  {
    label: 'Format ok, wrong answer',
    gold: '991',
    completion: '<REASONING>Looks around 980 to me.</REASONING><SOLUTION>980</SOLUTION>',
  },
  {
    label: 'addCriterion spam',
    gold: '6',
    completion: 'addCriterion addCriterion addCriterion addCriterion addCriterion addCriterion',
  },
];

export default function QwenVlGspoPreview() {
  const zh = useLocale() === 'zh';
  const [gold, setGold] = useState(presets[0].gold);
  const [completion, setCompletion] = useState(presets[0].completion);

  const fmt = useMemo(() => formattingReward(completion), [completion]);
  const correct = useMemo(() => correctnessReward(completion, gold), [completion, gold]);
  const total = fmt.value + correct.value;

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
              {zh ? 'GSPO 奖励计算器 — 真实的 2 个函数' : 'GSPO reward calculator — the real two functions'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '编辑 VLM completion 和 gold 答案。格式奖励（λ=0.3，含真实 addCriterion 惩罚）和正确性奖励（λ=1.0，精确 2.0 / 数值 1.5 / 否则 0）——从 notebook 逐字移植——实时重算。这正是每条采样 completion 在 GSPO 更新前得到的奖励。'
                : 'Edit a VLM completion and the gold answer. The formatting reward (λ=0.3, with the real addCriterion penalty) and correctness reward (λ=1.0, exact 2.0 / numeric 1.5 / else 0) — ported verbatim from the notebook — recompute live. This is the exact reward each sampled completion gets before the GSPO update.'}
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
              {zh ? 'VLM completion（可编辑）' : 'VLM completion (editable)'}
            </p>
            <textarea
              value={completion}
              onChange={(e) => setCompletion(e.target.value)}
              rows={8}
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
            <p className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)]">{total.toFixed(2)}</p>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">0.3 · format + 1.0 · correctness</p>
          </div>

          <div
            className={`rounded-[18px] border p-4 ${
              fmt.value > 0
                ? 'border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8'
                : 'border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/8'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">formatting · λ=0.3</span>
              <span className="font-mono text-sm font-semibold text-[var(--color-green-300)]">{fmt.value.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${fmt.reasoningOk ? 'border-[var(--color-green-300)]/30 text-[var(--color-green-300)]' : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}>
                one &lt;REASONING&gt; {fmt.reasoningOk ? '+1' : '0'}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${fmt.solutionOk ? 'border-[var(--color-green-300)]/30 text-[var(--color-green-300)]' : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}>
                one &lt;SOLUTION&gt; {fmt.solutionOk ? '+1' : '0'}
              </span>
              {fmt.penalized && (
                <span className="rounded-full border border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/12 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-amber-300)]">
                  addCriterion −2
                </span>
              )}
            </div>
          </div>

          <div
            className={`rounded-[18px] border p-4 ${
              correct.value > 0
                ? 'border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8'
                : 'border-[var(--color-border-default)] bg-black/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">correctness · λ=1.0</span>
              <span
                className={`font-mono text-sm font-semibold ${
                  correct.value > 0 ? 'text-[var(--color-green-300)]' : 'text-[var(--color-text-muted)]'
                }`}
              >
                {correct.value.toFixed(2)}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-[var(--color-text-muted)]">{correct.basis}</p>
          </div>

          <p className="text-[11px] leading-5 text-[var(--color-text-muted)]">
            {zh ? (
              <>
                注意奖励和评估指标的差异：records 把 <code>991.0</code> 判为<em>错误</em>（严格字符串匹配），但这里它拿 1.5（数值匹配）。
                正是这个细节，让格式合规提升（77%→84%）比原始准确率提升更干净。
              </>
            ) : (
              <>
                Note the gap between this reward and the eval metric: the records mark <code>991.0</code> as
                <em> incorrect</em> (strict string match), yet here it earns 1.5 (numeric match). That nuance is why the
                format-compliance gain (77%→84%) is cleaner than the raw accuracy gain.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
