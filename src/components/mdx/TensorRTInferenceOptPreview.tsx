'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Boxes, Cpu, Gauge, LoaderCircle, Play, Puzzle, Sparkles, Zap } from 'lucide-react';

type StageKey = 'idle' | 'parse' | 'fusion' | 'precision' | 'plugin' | 'latency' | 'complete';

const stageOrder: StageKey[] = ['idle', 'parse', 'fusion', 'precision', 'plugin', 'latency', 'complete'];

const stages: { key: Exclude<StageKey, 'idle' | 'complete'>; label: { en: string; zh: string } }[] = [
  { key: 'parse', label: { zh: '1. 解析 ONNX → TensorRT 计算图', en: '1. Parse ONNX → TensorRT graph' } },
  { key: 'fusion', label: { zh: '2. 层/张量融合：Conv+BN+ReLU → CBR', en: '2. Layer/tensor fusion: Conv+BN+ReLU → CBR' } },
  { key: 'precision', label: { zh: '3. INT8 PTQ 校准（FP32 → INT8）', en: '3. INT8 PTQ calibration (FP32 → INT8)' } },
  { key: 'plugin', label: { zh: '4. NMS 自定义 Plugin（IPluginV2DynamicExt）', en: '4. Custom NMS plugin (IPluginV2DynamicExt)' } },
  { key: 'latency', label: { zh: '5. 引擎构建完成 → 前后延迟对比', en: '5. Engine built → before/after latency' } },
];

// Raw ONNX graph: three Conv→BN→ReLU chains feeding into NMS, then SSD detect.
type Node = { id: string; label: string; group: number };
const rawNodes: Node[][] = [
  [
    { id: 'c0', label: 'Conv', group: 0 },
    { id: 'b0', label: 'BN', group: 0 },
    { id: 'r0', label: 'ReLU', group: 0 },
  ],
  [
    { id: 'c1', label: 'Conv', group: 1 },
    { id: 'b1', label: 'BN', group: 1 },
    { id: 'r1', label: 'ReLU', group: 1 },
  ],
  [
    { id: 'c2', label: 'Conv', group: 2 },
    { id: 'b2', label: 'BN', group: 2 },
    { id: 'r2', label: 'ReLU', group: 2 },
  ],
];

// After fusion: each chain collapses into a single CBR kernel.
const fusedNodes: Node[] = [
  { id: 'cbr0', label: 'CBR', group: 0 },
  { id: 'cbr1', label: 'CBR', group: 1 },
  { id: 'cbr2', label: 'CBR', group: 2 },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function TensorRTInferenceOptPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');

  const reached = (t: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(t);
  const fused = reached('fusion');
  const int8 = reached('precision');
  const hasPlugin = reached('plugin');

  const reset = () => {
    setStage('idle');
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      const seq: StageKey[] = ['parse', 'fusion', 'precision', 'plugin', 'latency'];
      for (const s of seq) {
        setStage(s);
        await wait(720);
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
              {zh ? 'TensorRT 引擎构建（ONNX → SSD 推理）' : 'TensorRT engine build (ONNX → SSD inference)'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '复演 Builder 把 ONNX 模型编译成推理引擎的过程：层/张量融合把 Conv+BN+ReLU 塌缩成单个 CBR kernel，INT8 PTQ 校准，再把自定义 NMS Plugin 插进图里。延迟数字为示意。'
                : 'Replays the Builder compiling an ONNX model into an inference engine: layer/tensor fusion collapses Conv+BN+ReLU into one CBR kernel, INT8 PTQ calibration runs, then a custom NMS plugin slots into the graph. Latency numbers are illustrative.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '构建中' : 'Building') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '构建引擎' : 'Build engine'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {/* Compute graph: raw chains collapse into CBR on fusion */}
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                {fused ? (zh ? '计算图（融合后）' : 'Compute graph (after fusion)') : zh ? '计算图（ONNX 原始）' : 'Compute graph (raw ONNX)'}
              </p>
            </div>

            <div className="mt-3 space-y-2.5">
              {fused
                ? fusedNodes.map((n) => (
                    <div key={n.id} className="flex items-center gap-2">
                      <div className="flex-1 rounded-xl border border-[var(--color-green-300)]/50 bg-[var(--color-green-300)]/15 px-3 py-2.5 text-center text-sm font-semibold text-[var(--color-green-300)] transition-colors">
                        {n.label}
                        {int8 && (
                          <span className="ml-2 rounded-full border border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/15 px-1.5 py-0.5 font-mono text-[9px] text-[var(--color-amber-300)]">
                            INT8
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                : rawNodes.map((chain) => (
                    <div key={chain[0].id} className="flex items-center gap-1.5">
                      {chain.map((n, i) => (
                        <div key={n.id} className="flex flex-1 items-center gap-1.5">
                          <div
                            className={`flex-1 rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors ${
                              reached('parse')
                                ? 'border-[var(--color-border-hover)] bg-[var(--color-bg-primary)]/45 text-[var(--color-text-secondary)]'
                                : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'
                            }`}
                          >
                            {n.label}
                          </div>
                          {i < chain.length - 1 && <span className="text-[var(--color-text-muted)]">→</span>}
                        </div>
                      ))}
                    </div>
                  ))}

              {/* NMS plugin node slots in */}
              <div
                className={`rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${
                  hasPlugin
                    ? 'border-[var(--color-amber-300)]/55 bg-[var(--color-amber-300)]/15 text-[var(--color-amber-300)]'
                    : 'border-dashed border-[var(--color-border-default)] text-[var(--color-text-muted)]'
                }`}
              >
                {hasPlugin ? (zh ? 'NMS Plugin（自定义 CUDA 算子）' : 'NMS Plugin (custom CUDA op)') : zh ? 'NMS（待插入）' : 'NMS (pending)'}
              </div>

              <div className="rounded-xl border border-[var(--color-border-default)] bg-black/15 px-3 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                {zh ? 'SSD 检测头' : 'SSD detection head'}
              </div>
            </div>

            <p className="mt-3 font-mono text-[10px] text-[var(--color-text-muted)]">
              {zh
                ? '融合让 kernel launch 数量从 9 降到 3 · auto-tuning 选最快 kernel'
                : 'fusion drops kernel launches 9 → 3 · auto-tuning picks the fastest kernel'}
            </p>
          </div>

          {/* Calibration / precision panel */}
          {int8 && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? 'PTQ 量化校准' : 'PTQ quantization calibration'}</p>
              </div>
              <p className="mt-2 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
                {zh
                  ? 'calibrator 跑校准集 → 收每层激活直方图 → 选 scale → FP32 weights → INT8'
                  : 'calibrator runs the calib set → per-layer activation histograms → pick scale → FP32 weights → INT8'}
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                {zh ? 'Winograd 整数算术卷积加速 · 精度损失需用校准集体检' : 'Winograd integer-arithmetic conv · accuracy loss audited on the calib set'}
              </p>
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
                  active
                    ? 'border-[var(--color-green-300)]/50 bg-[var(--color-green-300)]/12'
                    : done
                      ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                }`}
              >
                <p className="text-sm text-[var(--color-text-primary)]">{zh ? s.label.zh : s.label.en}</p>
                {s.key === 'fusion' && fused && (
                  <span className="shrink-0 rounded-full border border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/15 px-2 py-0.5 font-mono text-[10px] text-[var(--color-green-300)]">
                    9 → 3 kernels
                  </span>
                )}
                {s.key === 'plugin' && hasPlugin && (
                  <Puzzle className="h-3.5 w-3.5 shrink-0 text-[var(--color-amber-300)]" />
                )}
              </div>
            );
          })}

          <div className="rounded-[18px] border border-[var(--color-border-default)] bg-black/10 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
                builder.build_serialized_network(network, config) → engine.plan
              </p>
            </div>
          </div>

          {/* Before/after latency bars (illustrative) */}
          {stage === 'complete' && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  {zh ? '单图推理延迟（示意，非实测）' : 'per-image latency (illustrative, not measured)'}
                </p>
              </div>
              <div className="mt-3 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-[var(--color-text-secondary)]">
                    <span>FP32 baseline</span>
                    <span>~12.0 ms</span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-black/30">
                    <div className="h-full w-full rounded-full bg-[var(--color-text-muted)]/50" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-[var(--color-green-300)]">
                    <span>TRT INT8 + fusion + plugin</span>
                    <span>~3.0 ms</span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-black/30">
                    <div className="h-full w-1/4 rounded-full bg-[var(--color-green-300)]" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-4 text-[var(--color-text-muted)]">
                {zh
                  ? '数字为示意：课程只有视频、未给基准数据，真实加速取决于模型 / 显卡 / batch。'
                  : 'Numbers are illustrative: the (video-only) course shipped no benchmarks; real speedup depends on model / GPU / batch.'}
              </p>
            </div>
          )}

          {stage === 'complete' && (
            <p className="rounded-[18px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-3.5 py-3 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? '引擎序列化为 .plan，运行时 deserialize 加载即可推理。融合 + 量化是图编译器的活，NMS 当作不可分解算子写成 IPluginV2 自定义 op。'
                : 'The engine serializes to a .plan; the runtime deserializes it for inference. Fusion + quantization are graph-compiler work, while NMS — an op TensorRT cannot decompose — ships as an IPluginV2 custom op.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
