'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Database,
  GitPullRequestArrow,
  LoaderCircle,
  Play,
  Recycle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Pillar {
  icon: typeof Database;
  name: { en: string; zh: string };
  note: { en: string; zh: string };
}

const BASELINE = 52.8;
const FINAL = 66.5;
const MODEL_UPGRADE = 6.8; // pp gain from switching models, for contrast

const pillars: Pillar[] = [
  {
    icon: Database,
    name: { zh: '① 代码库即真相源', en: '① Codebase as source of truth' },
    note: { zh: 'CLAUDE.md / AGENTS.md ~100 行「行军指南」，声明式注入项目知识。', en: 'CLAUDE.md / AGENTS.md (~100 lines) — declarative project knowledge.' },
  },
  {
    icon: ShieldCheck,
    name: { zh: '② 机械化架构约束', en: '② Mechanized architectural constraints' },
    note: { zh: '「CLAUDE.md 是建议，Hooks 是法律」：PreToolUse / PostToolUse 强制拦截。', en: '"CLAUDE.md is advice, Hooks are law": PreToolUse / PostToolUse enforcement.' },
  },
  {
    icon: GitPullRequestArrow,
    name: { zh: '③ 反馈循环', en: '③ Feedback loops' },
    note: { zh: '四层反馈：即时(Hooks) → 构建(CI/CD) → 跨会话两层。', en: 'Four levels: instant (Hooks) → build (CI/CD) → two cross-session layers.' },
  },
  {
    icon: Recycle,
    name: { zh: '④ 熵管理', en: '④ Entropy management' },
    note: { zh: '对抗文档漂移 / 架构侵蚀 / 风格不一致 / 重复代码。', en: 'Fight doc drift / architecture erosion / style drift / duplication.' },
  },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function HarnessEngineeringPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [applied, setApplied] = useState(0); // number of pillars applied
  const [complete, setComplete] = useState(false);

  // score climbs with design level (illustrative); endpoints 52.8 / 66.5 are the real measured values.
  const score = complete ? FINAL : BASELINE + ((FINAL - BASELINE) * applied) / pillars.length;
  const scorePct = ((score - 40) / (75 - 40)) * 100; // map 40–75 range to bar width

  const reset = () => {
    setApplied(0);
    setComplete(false);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      setApplied(0);
      setComplete(false);
      for (let i = 0; i < pillars.length; i += 1) {
        await wait(680);
        if (cancelled) return;
        setApplied(i + 1);
      }
      await wait(420);
      if (cancelled) return;
      setComplete(true);
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
              {zh ? '同一个模型，靠 Harness 拉高 benchmark' : 'Same model — lift the benchmark with the Harness'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '产出质量 = 模型能力 × 设计水平。装上 Harness 四大支柱，模型不变（GPT-5.2-Codex），Terminal Bench 2.0 从 52.8% 提到 66.5%。'
                : 'Output quality = model capability × design level. Install the four Harness pillars — model unchanged (GPT-5.2-Codex) — and Terminal Bench 2.0 goes 52.8% → 66.5%.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (complete ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '装配中' : 'Installing') : complete ? (zh ? '重置' : 'Reset') : zh ? '装配 Harness' : 'Install the Harness'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-3">
          {pillars.map((p, i) => {
            const on = applied > i;
            return (
              <div
                key={p.name.en}
                className={`rounded-[22px] border p-3.5 transition-colors ${
                  on ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/10' : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <p.icon className={`h-4 w-4 ${on ? 'text-[var(--color-green-300)]' : 'text-[var(--color-text-muted)]'}`} />
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? p.name.zh : p.name.en}</p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{zh ? p.note.zh : p.note.en}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Terminal Bench 2.0</p>
              <p className="font-mono text-sm font-semibold text-[var(--color-green-300)]">{score.toFixed(1)}%</p>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-green-500)] to-[var(--color-green-300)] transition-all duration-700"
                style={{ width: `${Math.max(0, Math.min(100, scorePct))}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--color-text-muted)]">
              <span>{zh ? `裸模型 ${BASELINE}%` : `bare model ${BASELINE}%`}</span>
              <span>{zh ? `满 Harness ${FINAL}%` : `full Harness ${FINAL}%`}</span>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              {zh ? '中间过程为示意；52.8% / 66.5% 是课程引用的实测端点。' : 'The climb is illustrative; 52.8% / 66.5% are the real measured endpoints from the course.'}
            </p>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? 'Harness 完整度' : 'Harness completeness'}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-[var(--color-text-primary)]">{applied}/{pillars.length} {zh ? '支柱' : 'pillars'}</p>
          </div>

          {complete && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {zh ? `+${(FINAL - BASELINE).toFixed(1)}pp，全部来自 Harness` : `+${(FINAL - BASELINE).toFixed(1)}pp, all from the Harness`}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-secondary)]">
                {zh
                  ? `模型一行没改。对比：换更强的模型只 +${MODEL_UPGRADE}pp —— Harness 工程的收益是换模型的约 2 倍。`
                  : `Not one line of the model changed. For contrast, a model upgrade gives only +${MODEL_UPGRADE}pp — the Harness is ~2× the gain of swapping models.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
