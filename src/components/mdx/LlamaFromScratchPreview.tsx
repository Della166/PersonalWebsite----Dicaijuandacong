'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Blocks, LineChart, LoaderCircle, Play, Sparkles } from 'lucide-react';

type StageKey = 'idle' | 'assemble' | 'train' | 'complete';

interface Layer {
  name: { en: string; zh: string };
  note: { en: string; zh: string };
}

// One LLaMA decoder block + wrappers — the real component stack the course's LLaMA series teaches.
const layers: Layer[] = [
  { name: { zh: 'Token Embedding', en: 'Token Embedding' }, note: { zh: 'vocab 32000 → dim 512（与 LM Head 权重共享）', en: 'vocab 32000 → dim 512 (tied with LM Head)' } },
  { name: { zh: 'RMSNorm', en: 'RMSNorm' }, note: { zh: '只按均方根缩放，省掉均值中心化', en: 'RMS-only scaling, no mean centering' } },
  { name: { zh: 'RoPE Self-Attention (GQA)', en: 'RoPE Self-Attention (GQA)' }, note: { zh: '旋转位置编码 + 分组查询注意力（8 头 / 4 KV 头）+ KV 缓存', en: 'rotary pos-enc + grouped-query attn (8 heads / 4 KV) + KV cache' } },
  { name: { zh: 'RMSNorm', en: 'RMSNorm' }, note: { zh: '残差前再归一化（Pre-Norm）', en: 'pre-norm before the residual' } },
  { name: { zh: 'SwiGLU FFN', en: 'SwiGLU FFN' }, note: { zh: '门控激活前馈，替代 ReLU-MLP', en: 'gated-activation FFN, replaces ReLU-MLP' } },
];

const N_BLOCKS = 8;
const lossCurve = [8.2, 6.1, 4.9, 4.1, 3.6, 3.25, 3.05, 2.92];
const samples = [
  { zh: 'the the the 的 的 ，，，', en: 'the the the , , ,' },
  { zh: '从前 有 一只 猫 ， 它 它 在 在', en: 'once a a cat , it it in in' },
  { zh: '从前有一只猫，它住在便利店门口的纸箱里。', en: 'Once there was a cat that lived in a box by the store.' },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function LlamaFromScratchPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [builtLayers, setBuiltLayers] = useState(0);
  const [step, setStep] = useState(0); // training step index into lossCurve

  const reached = (t: StageKey) => ['idle', 'assemble', 'train', 'complete'].indexOf(stage) >= ['idle', 'assemble', 'train', 'complete'].indexOf(t);

  const reset = () => {
    setStage('idle');
    setBuiltLayers(0);
    setStep(0);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      setStage('assemble');
      setBuiltLayers(0);
      setStep(0);
      for (let i = 0; i < layers.length; i += 1) {
        await wait(420);
        if (cancelled) return;
        setBuiltLayers(i + 1);
      }
      await wait(450);
      if (cancelled) return;
      setStage('train');
      for (let i = 0; i < lossCurve.length; i += 1) {
        await wait(360);
        if (cancelled) return;
        setStep(i + 1);
      }
      await wait(300);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  const sampleIdx = step === 0 ? 0 : step < 4 ? 1 : 2;
  const curLoss = step === 0 ? lossCurve[0] : lossCurve[Math.min(step - 1, lossCurve.length - 1)];

  // sparkline points
  const w = 100;
  const h = 40;
  const maxL = lossCurve[0];
  const minL = lossCurve[lossCurve.length - 1];
  const pts = lossCurve.slice(0, Math.max(1, step)).map((l, i) => {
    const x = (i / (lossCurve.length - 1)) * w;
    const y = h - ((l - minL) / (maxL - minL)) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

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
              {zh ? '从零搭 LLaMA 架构并训练' : 'Build LLaMA from scratch, then train'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '先逐层拼出 LLaMA 的 decoder block（RMSNorm + RoPE + GQA + SwiGLU + KV 缓存），再跑训练——看 loss 下降、生成逐渐通顺。'
                : 'Assemble a LLaMA decoder block layer by layer (RMSNorm + RoPE + GQA + SwiGLU + KV cache), then train — watch the loss fall and generations get coherent.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '运行中' : 'Running') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '搭建并训练' : 'Build & train'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
        {/* Architecture stack */}
        <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
          <div className="flex items-center gap-2">
            <Blocks className="h-4 w-4 text-[var(--color-amber-300)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? `Decoder Block × ${N_BLOCKS}` : `Decoder Block × ${N_BLOCKS}`}</p>
          </div>
          <div className="mt-3 space-y-1.5">
            {layers.map((l, i) => {
              const on = builtLayers > i;
              return (
                <div
                  key={`${l.name.en}-${i}`}
                  className={`rounded-xl border px-3 py-2 transition-colors ${
                    on ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/10' : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40 opacity-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? l.name.zh : l.name.en}</p>
                  {on && <p className="mt-0.5 text-[11px] leading-4 text-[var(--color-text-muted)]">{zh ? l.note.zh : l.note.en}</p>}
                </div>
              );
            })}
            <div className={`rounded-xl border px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition-colors ${reached('train') ? 'border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/10' : 'border-[var(--color-border-default)] opacity-50'}`}>
              {zh ? '最终 RMSNorm → LM Head (tied)' : 'final RMSNorm → LM Head (tied)'}
            </div>
          </div>
          <p className="mt-3 font-mono text-[10px] text-[var(--color-text-muted)]">dim 512 · 8 layers · 8 heads / 4 KV (GQA) · vocab 32000 · 示意配置</p>
        </div>

        {/* Training */}
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '训练 loss' : 'training loss'}</p>
              </div>
              <span className="font-mono text-sm text-[var(--color-green-300)]">{reached('train') ? curLoss.toFixed(2) : '—'}</span>
            </div>
            <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full" style={{ aspectRatio: `${w}/${h}` }} preserveAspectRatio="none">
              {pts.length > 1 && (
                <polyline points={pts.join(' ')} fill="none" stroke="var(--color-green-300)" strokeWidth="1.2" />
              )}
              {pts.length > 0 && reached('train') && (() => {
                const [lx, ly] = pts[pts.length - 1].split(',');
                return <circle cx={lx} cy={ly} r="1.6" fill="var(--color-green-300)" />;
              })()}
            </svg>
            <div className="flex justify-between font-mono text-[10px] text-[var(--color-text-muted)]">
              <span>step 0</span>
              <span>{reached('train') ? `step ${step * 200}` : ''}</span>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '采样生成（同一 prompt）' : 'sample generation (same prompt)'}</p>
            {reached('train') ? (
              <p className="mt-2 font-mono text-sm leading-6 text-[var(--color-text-primary)]">{zh ? samples[sampleIdx].zh : samples[sampleIdx].en}</p>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{zh ? '训练开始后，生成会从乱码逐步变通顺。' : 'Once training starts, generations move from gibberish to coherent.'}</p>
            )}
          </div>

          {stage === 'complete' && (
            <p className="rounded-[18px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-4 py-3 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? 'loss / step / 生成均为示意；架构组件（RMSNorm·RoPE·GQA·SwiGLU·KV缓存）是真实 LLaMA 结构，来自大模型原理正课 LLaMA 系列。'
                : 'Loss / step / generations are illustrative; the components (RMSNorm·RoPE·GQA·SwiGLU·KV-cache) are the real LLaMA architecture from the course\'s LLaMA series.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
