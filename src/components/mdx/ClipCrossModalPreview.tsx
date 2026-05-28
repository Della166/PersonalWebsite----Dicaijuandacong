'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Image as ImageIcon, LoaderCircle, Play, Search, Sparkles, Type } from 'lucide-react';

type Mode = 'text2img' | 'img2img' | 'hybrid';
type StageKey = 'idle' | 'embed' | 'retrieve' | 'complete';

interface ImgPoint {
  id: string;
  label: { en: string; zh: string };
  x: number; // 0..100 in plot space
  y: number;
}

const images: ImgPoint[] = [
  { id: 'arch', label: { zh: '架构图', en: 'architecture' }, x: 26, y: 30 },
  { id: 'flow', label: { zh: '流程图', en: 'flowchart' }, x: 40, y: 22 },
  { id: 'diagram', label: { zh: '示意图', en: 'diagram' }, x: 33, y: 44 },
  { id: 'chart', label: { zh: '柱状图', en: 'bar chart' }, x: 70, y: 35 },
  { id: 'ui', label: { zh: 'UI 截图', en: 'UI screenshot' }, x: 64, y: 70 },
  { id: 'photo', label: { zh: '风景照', en: 'landscape photo' }, x: 82, y: 78 },
];

interface ModeDef {
  query: { en: string; zh: string };
  queryKind: 'text' | 'image';
  qx: number;
  qy: number;
  results: { id: string; score: number; self?: boolean }[];
}

const modeDefs: Record<Mode, ModeDef> = {
  text2img: {
    query: { zh: '文本：「系统架构图」', en: 'text: "system architecture diagram"' },
    queryKind: 'text',
    qx: 30,
    qy: 33,
    results: [
      { id: 'arch', score: 0.28 },
      { id: 'diagram', score: 0.21 },
      { id: 'flow', score: 0.19 },
    ],
  },
  img2img: {
    query: { zh: '图片：一张架构图', en: 'image: an architecture diagram' },
    queryKind: 'image',
    qx: 26,
    qy: 30,
    results: [
      { id: 'arch', score: 1.0, self: true },
      { id: 'diagram', score: 0.31 },
      { id: 'flow', score: 0.27 },
    ],
  },
  hybrid: {
    query: { zh: '文本：「架构图」+ BM25 关键词', en: 'text: "architecture" + BM25 keyword' },
    queryKind: 'text',
    qx: 31,
    qy: 35,
    results: [
      { id: 'arch', score: 0.28 },
      { id: 'flow', score: 0.22 },
      { id: 'diagram', score: 0.2 },
    ],
  },
};

const imgName = (id: string, zh: boolean) => {
  const m = images.find((i) => i.id === id);
  return m ? (zh ? m.label.zh : m.label.en) : id;
};

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function ClipCrossModalPreview() {
  const zh = useLocale() === 'zh';
  const [mode, setMode] = useState<Mode>('text2img');
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');

  const def = modeDefs[mode];
  const reached = (t: StageKey) => ['idle', 'embed', 'retrieve', 'complete'].indexOf(stage) >= ['idle', 'embed', 'retrieve', 'complete'].indexOf(t);
  const shownResults = useMemo(() => (reached('retrieve') ? def.results.filter((r) => !r.self) : []), [stage, mode]);

  const reset = () => {
    setStage('idle');
    setRunning(false);
  };

  const selectMode = (m: Mode) => {
    setMode(m);
    reset();
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      setStage('embed');
      await wait(620);
      if (cancelled) return;
      setStage('retrieve');
      await wait(640);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [running, mode]);

  const modeTabs: { key: Mode; label: { en: string; zh: string } }[] = [
    { key: 'text2img', label: { zh: '文搜图', en: 'text→image' } },
    { key: 'img2img', label: { zh: '图搜图', en: 'image→image' } },
    { key: 'hybrid', label: { zh: '混合检索', en: 'hybrid' } },
  ];

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
              {zh ? '文字和图片落进同一个向量空间' : 'Text and images in one vector space'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? 'CLIP 把文本和图片都编码成 512 维同一空间，所以可以「文搜图 / 图搜图」。混合检索再叠加 BM25 + RRF 融合。'
                : 'CLIP encodes text and images into the same 512-dim space, so you can do text→image / image→image. Hybrid adds BM25 + RRF fusion.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '检索中' : 'Retrieving') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行检索' : 'Run retrieval'}
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {modeTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => selectMode(t.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                mode === t.key
                  ? 'border-[var(--color-green-300)]/45 bg-[var(--color-green-300)]/12 text-[var(--color-green-300)]'
                  : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              {zh ? t.label.zh : t.label.en}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* 2D shared embedding space */}
        <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '共享 512 维空间（投影到 2D）' : 'Shared 512-dim space (2D projection)'}</p>
          <svg viewBox="0 0 100 90" className="mt-3 w-full" style={{ aspectRatio: '100/90' }}>
            {/* grid */}
            <rect x="0" y="0" width="100" height="90" fill="none" />
            {[20, 40, 60, 80].map((g) => (
              <line key={`v${g}`} x1={g} y1="0" x2={g} y2="90" stroke="var(--color-border-default)" strokeWidth="0.2" />
            ))}
            {[20, 40, 60].map((g) => (
              <line key={`h${g}`} x1="0" y1={g} x2="100" y2={g} stroke="var(--color-border-default)" strokeWidth="0.2" />
            ))}
            {/* retrieval lines */}
            {reached('retrieve') &&
              shownResults.map((r) => {
                const img = images.find((i) => i.id === r.id)!;
                return (
                  <line
                    key={`l-${r.id}`}
                    x1={def.qx}
                    y1={def.qy}
                    x2={img.x}
                    y2={img.y}
                    stroke="var(--color-green-300)"
                    strokeWidth="0.4"
                    strokeDasharray="1.5 1"
                    opacity="0.7"
                  />
                );
              })}
            {/* image points */}
            {images.map((img) => {
              const hit = reached('retrieve') && def.results.some((r) => r.id === img.id && !r.self);
              return (
                <g key={img.id}>
                  <circle cx={img.x} cy={img.y} r={hit ? 2.4 : 1.8} fill={hit ? 'var(--color-green-300)' : 'var(--color-amber-300)'} opacity={hit ? 1 : 0.55} />
                  <text x={img.x + 3} y={img.y + 1} fontSize="3" fill="var(--color-text-secondary)">{zh ? img.label.zh : img.label.en}</text>
                </g>
              );
            })}
            {/* query point */}
            {reached('embed') && (
              <g>
                <circle cx={def.qx} cy={def.qy} r="2.6" fill="none" stroke="var(--color-green-300)" strokeWidth="0.6" />
                <circle cx={def.qx} cy={def.qy} r="1.3" fill="var(--color-green-300)" />
                <text x={def.qx + 3} y={def.qy - 2} fontSize="3" fill="var(--color-green-300)" fontWeight="600">query</text>
              </g>
            )}
          </svg>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
            {def.queryKind === 'text' ? <Type className="h-3.5 w-3.5 text-[var(--color-green-300)]" /> : <ImageIcon className="h-3.5 w-3.5 text-[var(--color-green-300)]" />}
            {zh ? def.query.zh : def.query.en}
            {reached('embed') && <span className="font-mono text-[10px] text-[var(--color-text-muted)]">→ 512d</span>}
          </div>
        </div>

        {/* Results + notes */}
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '检索结果（cosine）' : 'Retrieval results (cosine)'}</p>
            </div>
            {reached('retrieve') ? (
              <div className="mt-3 space-y-2">
                {mode === 'img2img' && (
                  <p className="rounded-lg border border-[var(--color-border-default)] bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                    {zh ? '自身命中 1.00 → 用 Path.resolve() 过滤' : 'self-hit 1.00 → filtered via Path.resolve()'}
                  </p>
                )}
                {shownResults.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="w-4 text-[11px] text-[var(--color-text-muted)]">{i + 1}</span>
                    <span className="flex-1 text-sm text-[var(--color-text-primary)]">{imgName(r.id, zh)}</span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/30">
                      <div className="h-full rounded-full bg-[var(--color-green-300)]" style={{ width: `${Math.min(100, r.score * 100 * 2.5)}%` }} />
                    </div>
                    <span className="w-10 text-right font-mono text-[11px] text-[var(--color-green-300)]">{r.score.toFixed(2)}</span>
                  </div>
                ))}
                <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">
                  {zh ? '跨模态分数绝对值偏低很正常，看排序；精度靠 Reranker。' : 'Low absolute cross-modal scores are normal — ranking matters; precision needs a reranker.'}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">{zh ? '运行检索，看 query 在共享空间里拉出最近的图。' : 'Run retrieval to pull the nearest images in the shared space.'}</p>
            )}
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '进阶：VLM 描述 + 混合' : 'Beyond: VLM caption + hybrid'}</p>
            <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? 'CLIP 读不了图内文字、中文弱 → 用 VLM(GPT-4o / Qwen-VL-Max) 给图生描述，再用 text-embedding-3-small(1536d) 入库；检索时 BM25 + 向量经 QueryFusionRetriever 用 RRF(k=60) 融合。'
                : 'CLIP can\'t read in-image text and is weak in Chinese → caption images with a VLM (GPT-4o / Qwen-VL-Max), re-embed with text-embedding-3-small (1536d); at query time, BM25 + vector are fused by QueryFusionRetriever via RRF (k=60).'}
            </p>
            {mode === 'hybrid' && reached('retrieve') && (
              <p className="mt-2 font-mono text-[10px] text-[var(--color-green-300)]">vector ‖ BM25 → RRF score = Σ 1/(60 + rank)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
