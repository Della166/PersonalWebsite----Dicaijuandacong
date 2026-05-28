'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Activity,
  Image as ImageIcon,
  LoaderCircle,
  Music,
  Play,
  Sparkles,
  Thermometer,
  Waves,
} from 'lucide-react';

type StageKey = 'idle' | 'encode' | 'project' | 'generate' | 'complete';

interface Modality {
  key: string;
  icon: typeof ImageIcon;
  label: { en: string; zh: string };
  trained: boolean; // PandaGPT only trained on image-text; others are emergent
}

const modalities: Modality[] = [
  { key: 'image', icon: ImageIcon, label: { zh: '图像', en: 'Image' }, trained: true },
  { key: 'text', icon: Sparkles, label: { zh: '文本', en: 'Text' }, trained: true },
  { key: 'audio', icon: Music, label: { zh: '音频', en: 'Audio' }, trained: false },
  { key: 'depth', icon: Waves, label: { zh: '深度', en: 'Depth' }, trained: false },
  { key: 'thermal', icon: Thermometer, label: { zh: '热成像', en: 'Thermal' }, trained: false },
  { key: 'imu', icon: Activity, label: { zh: 'IMU', en: 'IMU' }, trained: false },
];

const sampleInput = {
  zh: '🏖️ 海滩照片 + 🌊 海浪音频 + 问题：“画面里在发生什么？你听到了什么？”',
  en: '🏖️ beach photo + 🌊 wave audio + prompt: "What\'s happening and what do you hear?"',
};
const response = {
  zh: '这是一片海滩，有人在沙滩上散步；我“听到”规律的海浪拍岸声——尽管 PandaGPT 只在图文对上训练过，音频是涌现出来的。',
  en: 'A beach scene with people walking on the sand; I "hear" rhythmic waves crashing — even though PandaGPT was only trained on image-text pairs, audio works emergently.',
};

const stageOrder: StageKey[] = ['idle', 'encode', 'project', 'generate', 'complete'];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function MultimodalVisionLlmPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  // which modalities are part of this query (image + text always; audio on by default to show emergence)
  const [active, setActive] = useState<Record<string, boolean>>({ image: true, text: true, audio: true, depth: false, thermal: false, imu: false });

  const reached = (t: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(t);

  const reset = () => {
    setStage('idle');
    setRunning(false);
  };

  const toggle = (k: string) => {
    if (k === 'image' || k === 'text') return; // always on
    setActive((p) => ({ ...p, [k]: !p[k] }));
    reset();
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      for (const s of ['encode', 'project', 'generate'] as StageKey[]) {
        setStage(s);
        await wait(820);
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

  const usedEmergent = modalities.some((m) => active[m.key] && !m.trained);

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
              {zh ? '六种模态绑进一个 LLM（PandaGPT）' : 'Six modalities into one LLM (PandaGPT)'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? 'ImageBind 把 6 种模态对齐到同一向量空间，一个线性投影接到 Vicuna —— PandaGPT 只训练图文对，却能涌现地理解音频/深度等。'
                : 'ImageBind aligns 6 modalities into one embedding space; a linear projection feeds Vicuna — PandaGPT trains only on image-text yet emergently understands audio/depth/etc.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '推理中' : 'Inferring') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行推理' : 'Run inference'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? 'ImageBind · 6 模态（点击增减）' : 'ImageBind · 6 modalities (toggle)'}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {modalities.map((m) => {
                const on = active[m.key];
                const lit = on && reached('encode');
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggle(m.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition-colors ${
                      lit ? 'border-[var(--color-green-300)]/50 bg-[var(--color-green-300)]/12' : on ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/8' : 'border-[var(--color-border-default)] opacity-45'
                    } ${m.key === 'image' || m.key === 'text' ? 'cursor-default' : ''}`}
                  >
                    <m.icon className={`h-4 w-4 ${lit ? 'text-[var(--color-green-300)]' : on ? 'text-[var(--color-amber-300)]' : 'text-[var(--color-text-muted)]'}`} />
                    <span className="text-[11px] text-[var(--color-text-secondary)]">{zh ? m.label.zh : m.label.en}</span>
                    {!m.trained && on && <span className="text-[8px] text-[var(--color-text-muted)]">{zh ? '涌现' : 'emergent'}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{zh ? '多模态输入' : 'Multimodal input'}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? sampleInput.zh : sampleInput.en}</p>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '架构' : 'Architecture'}</p>
            <p className="mt-2 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
              modalities → ImageBind (frozen) → 1 linear projection → Vicuna (LLM) → text
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* pipeline stages */}
          <div className="grid gap-2">
            {[
              { key: 'encode', label: { zh: '1. ImageBind 编码 → 同一向量空间', en: '1. ImageBind encodes → one shared embedding space' } },
              { key: 'project', label: { zh: '2. 线性投影 → Vicuna 词嵌入空间', en: '2. linear projection → Vicuna embedding space' } },
              { key: 'generate', label: { zh: '3. Vicuna 生成多模态回答', en: '3. Vicuna generates a multimodal answer' } },
            ].map((s) => {
              const active2 = stage === s.key;
              const done = reached(s.key as StageKey) && !active2;
              return (
                <div key={s.key} className={`rounded-[16px] border px-3.5 py-2.5 text-sm transition-colors ${active2 ? 'border-[var(--color-green-300)]/50 bg-[var(--color-green-300)]/12 text-[var(--color-text-primary)]' : done ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8 text-[var(--color-text-secondary)]' : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}>
                  {zh ? s.label.zh : s.label.en}
                </div>
              );
            })}
          </div>

          {/* shared embedding viz */}
          {reached('encode') && (
            <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/15 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{zh ? '同一嵌入空间' : 'shared embedding space'}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {modalities.filter((m) => active[m.key]).map((m) => (
                  <span key={m.key} className="inline-flex items-center gap-1 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-2.5 py-1 text-[11px] text-[var(--color-green-300)]">
                    <m.icon className="h-3 w-3" /> {zh ? m.label.zh : m.label.en}
                  </span>
                ))}
                <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">→ 1 space</span>
              </div>
            </div>
          )}

          {/* response */}
          {reached('generate') && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'PandaGPT 回答' : 'PandaGPT answer'}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? response.zh : response.en}</p>
              {usedEmergent && (
                <p className="mt-2 rounded-lg border border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/8 px-2.5 py-1.5 text-[11px] leading-5 text-[var(--color-amber-300)]">
                  {zh ? '用到了非图文模态（音频/深度…）→ 这是 ImageBind 绑定 6 模态带来的涌现能力。' : 'Used a non-image-text modality (audio/depth…) → emergent from ImageBind binding all 6.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
