'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { LoaderCircle, Layers, Play, Sparkles } from 'lucide-react';

interface Strategy {
  key: string;
  name: { en: string; zh: string };
  detail: { en: string; zh: string };
  windowTokens: number; // effective window after this step (K)
  cost: number; // relative cost index after this step
}

const BASE_TOKENS = 180; // K
const modules: { name: { en: string; zh: string }; tokens: number }[] = [
  { name: { zh: '系统提示层', en: 'System prompt' }, tokens: 8 },
  { name: { zh: '对话历史层', en: 'Conversation history' }, tokens: 60 },
  { name: { zh: '记忆注入层', en: 'Memory injection' }, tokens: 12 },
  { name: { zh: '工具上下文层', en: 'Tool context' }, tokens: 70 },
  { name: { zh: '任务状态层', en: 'Task state' }, tokens: 6 },
  { name: { zh: '外部知识层', en: 'External knowledge' }, tokens: 24 },
];

// Applied in the course's decision priority: Cache → Compress → Isolate → Write/Select.
const strategies: Strategy[] = [
  { key: 'cache', name: { zh: '① Cache 提示缓存', en: '① Cache' }, detail: { zh: '静态前缀缓存命中，cache-read 仅 10%（省 90% 成本），首日就能上', en: 'Static prefix cache hit, cache-read at 10% (90% cost off), day one' }, windowTokens: 180, cost: 55 },
  { key: 'clear', name: { zh: '② Compress 工具结果清除', en: '② Compress · tool-result clearing' }, detail: { zh: '清掉冗长的原始工具输出，只留「决策 + 为什么」，零成本', en: 'Drop verbose raw tool output, keep "decision + why" — zero cost' }, windowTokens: 135, cost: 42 },
  { key: 'mask', name: { zh: '③ Compress 观察遮蔽 + trim', en: '③ Compress · observation masking + trim' }, detail: { zh: '遮蔽旧观察 + trim_messages 硬截断对话历史', en: 'Mask old observations + trim_messages hard-truncate history' }, windowTokens: 105, cost: 32 },
  { key: 'isolate', name: { zh: '④ Isolate 子 Agent 隔离', en: '④ Isolate · sub-agent' }, detail: { zh: 'SubAgentMiddleware 把外部知识检索丢进独立上下文', en: 'SubAgentMiddleware moves external-knowledge work into its own context' }, windowTokens: 81, cost: 26 },
  { key: 'writeselect', name: { zh: '⑤ Write + Select', en: '⑤ Write + Select' }, detail: { zh: '任务状态 offload 到 scratchpad，记忆 JIT 检索', en: 'Offload task state to a scratchpad, JIT-retrieve memory' }, windowTokens: 70, cost: 22 },
];

// which modules are "reduced" once a given strategy index is reached
const moduleReducedAt: Record<number, number> = { 3: 1, 1: 2, 5: 3, 4: 4 }; // moduleIdx -> strategy step

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function ContextEngineeringPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0); // 0 = baseline, 1..5 strategies applied
  const complete = step >= strategies.length;

  const windowTokens = step === 0 ? BASE_TOKENS : strategies[step - 1].windowTokens;
  const cost = step === 0 ? 100 : strategies[step - 1].cost;

  const reset = () => {
    setStep(0);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      setStep(0);
      for (let i = 1; i <= strategies.length; i += 1) {
        await wait(720);
        if (cancelled) return;
        setStep(i);
      }
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
              {zh ? '五大策略给上下文窗口瘦身' : 'Five strategies trimming the context window'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '六大模块占满窗口，按「先 Cache 后 Isolate」的决策优先级叠加五大策略——窗口和成本一起降。'
                : 'Six modules fill the window; stack the five strategies in the "Cache-first, Isolate-later" priority order — window and cost both drop.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (complete ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '优化中' : 'Optimizing') : complete ? (zh ? '重置' : 'Reset') : zh ? '叠加策略' : 'Stack strategies'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '六大上下文模块' : 'Six context modules'}</p>
            </div>
            <div className="mt-3 space-y-2">
              {modules.map((m, mi) => {
                const reduceStep = moduleReducedAt[mi];
                const reduced = reduceStep !== undefined && step >= reduceStep;
                const cached = mi === 0 && step >= 1; // system prompt prefix cached
                const widthPct = (m.tokens / 70) * 100;
                return (
                  <div key={m.name.en} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 text-[11px] text-[var(--color-text-secondary)]">{zh ? m.name.zh : m.name.en}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/30">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          cached ? 'bg-[var(--color-green-300)]' : reduced ? 'bg-[var(--color-amber-300)]/40' : 'bg-[var(--color-amber-300)]'
                        }`}
                        style={{ width: `${reduced ? widthPct * 0.4 : widthPct}%` }}
                      />
                    </div>
                    {cached && <span className="text-[9px] text-[var(--color-green-300)]">cached</span>}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">{zh ? '对话历史 + 工具上下文 合计 >50% 窗口（最大的两个「水龙头」）。' : 'Conversation history + tool context together are >50% of the window (the two biggest taps).'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{zh ? '有效窗口' : 'Window'}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-text-primary)]">{windowTokens}K</p>
            </div>
            <div className="rounded-[20px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{zh ? '相对成本' : 'Relative cost'}</p>
              <p className={`mt-1 font-mono text-2xl font-bold ${cost < 60 ? 'text-[var(--color-green-300)]' : 'text-[var(--color-amber-300)]'}`}>{cost}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {strategies.map((s, si) => {
            const applied = step > si;
            const active = step === si + 1;
            return (
              <div
                key={s.key}
                className={`rounded-[20px] border p-3 transition-colors ${
                  active ? 'border-[var(--color-green-300)]/45 bg-[var(--color-green-300)]/12' : applied ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8' : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? s.name.zh : s.name.en}</p>
                  {applied && <span className="font-mono text-[10px] text-[var(--color-green-300)]">→ {s.cost}%</span>}
                </div>
                <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">{zh ? s.detail.zh : s.detail.en}</p>
              </div>
            );
          })}
          {complete && (
            <p className="rounded-[18px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-3 py-2.5 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {zh ? '零成本策略（Cache / 工具结果清除）先上，复杂的（Isolate / Write）按需叠加。数值为示意，优先级与机制来自 Part 9 课件。' : 'Zero-cost strategies (Cache / tool-result clearing) first; complex ones (Isolate / Write) stacked on demand. Numbers are illustrative; the priority and mechanisms come from the Part 9 courseware.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
