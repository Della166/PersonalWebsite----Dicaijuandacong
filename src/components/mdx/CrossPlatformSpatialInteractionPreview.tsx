'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Hand, LoaderCircle, Layers, Play, Sparkles } from 'lucide-react';

type StageKey = 'idle' | 'joints' | 'pinch' | 'ray' | 'grab' | 'poke' | 'complete';
type Platform = 'quest' | 'visionpro';

const stageOrder: StageKey[] = ['idle', 'joints', 'pinch', 'ray', 'grab', 'poke', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: { en: string; zh: string } }[] = [
  { key: 'joints', label: { zh: '1. 手骨架追踪：26 个关节点驱动虚拟手', en: '1. Hand-skeleton tracking: 26 joints drive the virtual hand' } },
  { key: 'pinch', label: { zh: '2. 手势识别：拇指 + 食指捏合 → 视为 button', en: '2. Gesture recognition: thumb + index pinch → treated as a button' } },
  { key: 'ray', label: { zh: '3. 射线命中：interactor 选中远处的 XRGrabInteractable', en: '3. Ray hit: the interactor selects a distant XRGrabInteractable' } },
  { key: 'grab', label: { zh: '4. 抓取：Kinematic 稳跟手 vs Velocity-Tracking 可投掷', en: '4. Grab: Kinematic follows the hand vs Velocity-Tracking lets you throw' } },
  { key: 'poke', label: { zh: '5. World-Space UI：XR Poke Interactor 戳按钮', en: '5. World-Space UI: an XR Poke Interactor pokes the button' } },
];

// The platform-divergent device layer vs the constant XRI layer.
const layers: {
  id: string;
  role: { en: string; zh: string };
  quest: { en: string; zh: string };
  visionpro: { en: string; zh: string };
  constant?: boolean;
}[] = [
  {
    id: 'base',
    role: { zh: '基座标准', en: 'Base standard' },
    quest: { en: 'OpenXR', zh: 'OpenXR' },
    visionpro: { en: 'OpenXR', zh: 'OpenXR' },
    constant: true,
  },
  {
    id: 'device',
    role: { zh: '设备/渲染层（分叉点）', en: 'Device / render layer (the fork)' },
    quest: { en: 'Meta XR SDK (v72→v76+)', zh: 'Meta XR SDK（v72→v76+）' },
    visionpro: { en: 'PolySpatial (RealityKit) · or Metal', zh: 'PolySpatial（RealityKit）· 或 Metal' },
  },
  {
    id: 'xri',
    role: { zh: '交互层（保持一致）', en: 'Interaction layer (stays constant)' },
    quest: { en: 'XR Interaction Toolkit (XRI)', zh: 'XR Interaction Toolkit（XRI）' },
    visionpro: { en: 'XR Interaction Toolkit (XRI)', zh: 'XR Interaction Toolkit（XRI）' },
    constant: true,
  },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function CrossPlatformSpatialInteractionPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [platform, setPlatform] = useState<Platform>('quest');

  const reached = (t: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(t);

  const reset = () => {
    setStage('idle');
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      const seq: StageKey[] = ['joints', 'pinch', 'ray', 'grab', 'poke'];
      for (const s of seq) {
        setStage(s);
        await wait(s === 'grab' ? 950 : 750);
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

  const isQuest = platform === 'quest';

  // hand joints (a tiny abstract skeleton on the left of the SVG)
  const wrist = { x: 16, y: 70 };
  const fingertips = [
    { x: 26, y: 28 }, // index
    { x: 33, y: 24 }, // middle
    { x: 40, y: 27 }, // ring
    { x: 46, y: 33 }, // pinky
  ];
  const thumb = { x: 12, y: 46 };
  const targetObj = { x: 78, y: 38 };
  const uiPanel = { x: 74, y: 74 };

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {zh ? '交互流程复演' : 'Interaction-flow replay'}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              {zh ? '跨平台空间交互：手 → 捏合 → 射线 → 抓取 → 戳 UI' : 'Cross-platform spatial interaction: hand → pinch → ray → grab → poke UI'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '复演课程文档里的 XRI 交互链。切换 Quest ⟷ Vision Pro：设备/渲染层分叉（Meta XR SDK vs PolySpatial/Metal），但上面的 XR Interaction Toolkit 交互层保持不变——这就是跨平台可移植性的来源。'
                : 'Replays the documented XRI interaction chain. Toggle Quest ⟷ Vision Pro: the device/render layer forks (Meta XR SDK vs PolySpatial/Metal), but the XR Interaction Toolkit layer on top stays constant — that is where cross-platform portability comes from.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '运行中' : 'Running') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行交互链' : 'Run interaction chain'}
          </button>
        </div>

        {/* platform toggle */}
        <div className="mt-4 inline-flex rounded-full border border-[var(--color-border-default)] bg-black/15 p-1">
          {(['quest', 'visionpro'] as Platform[]).map((p) => {
            const active = platform === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[var(--color-green-300)]/20 text-[var(--color-green-300)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {p === 'quest' ? (zh ? 'Meta Quest' : 'Meta Quest') : (zh ? 'Apple Vision Pro' : 'Apple Vision Pro')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* interaction flow diagram */}
        <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/15 p-4">
          <div className="flex items-center gap-2">
            <Hand className="h-4 w-4 text-[var(--color-amber-300)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {zh ? '交互流程（手骨架 → 抓取 → 戳 UI）' : 'Interaction flow (hand-skeleton → grab → poke UI)'}
            </p>
          </div>
          <svg viewBox="0 0 100 100" className="mt-3 w-full" style={{ aspectRatio: '1.15' }}>
            {/* hand skeleton */}
            <g opacity={reached('joints') ? 1 : 0.3}>
              {fingertips.map((f, i) => (
                <line key={`b-${i}`} x1={wrist.x} y1={wrist.y} x2={f.x} y2={f.y} stroke="var(--color-green-300)" strokeWidth="0.5" opacity="0.6" />
              ))}
              <line x1={wrist.x} y1={wrist.y} x2={thumb.x} y2={thumb.y} stroke="var(--color-green-300)" strokeWidth="0.5" opacity="0.6" />
              {[...fingertips, thumb].map((j, i) => (
                <circle key={`j-${i}`} cx={j.x} cy={j.y} r="1.4" fill="var(--color-green-300)" />
              ))}
              <circle cx={wrist.x} cy={wrist.y} r="2" fill="var(--color-green-500)" />
            </g>

            {/* pinch indicator (index + thumb close) */}
            {reached('pinch') && (
              <g>
                <circle cx={(fingertips[0].x + thumb.x) / 2} cy={(fingertips[0].y + thumb.y) / 2} r="3.4" fill="none" stroke="var(--color-amber-300)" strokeWidth="0.7" />
                <text x={(fingertips[0].x + thumb.x) / 2} y={(fingertips[0].y + thumb.y) / 2 - 5} fontSize="3.2" fill="var(--color-amber-300)" textAnchor="middle" fontWeight="700">pinch</text>
              </g>
            )}

            {/* ray from index fingertip to target */}
            {reached('ray') && (
              <line
                x1={fingertips[0].x}
                y1={fingertips[0].y}
                x2={targetObj.x}
                y2={targetObj.y}
                stroke="var(--color-amber-300)"
                strokeWidth="0.7"
                strokeDasharray="2 1.2"
                opacity="0.85"
              />
            )}

            {/* grabbed object */}
            <g opacity={reached('ray') ? 1 : 0.25}>
              <rect
                x={targetObj.x - 6}
                y={targetObj.y - 6}
                width="12"
                height="12"
                rx="2"
                fill={reached('grab') ? 'var(--color-green-300)' : 'var(--color-bg-card)'}
                stroke="var(--color-green-300)"
                strokeWidth="0.6"
              />
              {stage === 'grab' && (
                <text x={targetObj.x} y={targetObj.y + 0.8} fontSize="2.6" fill="#0e1a14" textAnchor="middle" fontWeight="700">
                  {isQuest ? 'kinematic' : 'velocity'}
                </text>
              )}
            </g>
            {/* throw arc hint at grab (Velocity-Tracking) */}
            {stage === 'grab' && (
              <path
                d={`M ${targetObj.x} ${targetObj.y - 8} Q ${targetObj.x + 10} ${targetObj.y - 18} ${targetObj.x + 16} ${targetObj.y - 6}`}
                fill="none"
                stroke="var(--color-amber-300)"
                strokeWidth="0.5"
                strokeDasharray="1.5 1"
                opacity="0.7"
              />
            )}

            {/* world-space UI panel + poke */}
            <g opacity={reached('poke') ? 1 : 0.25}>
              <rect x={uiPanel.x - 10} y={uiPanel.y - 7} width="20" height="14" rx="1.5" fill="var(--color-bg-card)" stroke="var(--color-border-hover)" strokeWidth="0.5" />
              <rect
                x={uiPanel.x - 6}
                y={uiPanel.y - 2}
                width="12"
                height="4.5"
                rx="1"
                fill={stage === 'poke' || stage === 'complete' ? 'var(--color-green-300)' : 'var(--color-border-default)'}
              />
              {reached('poke') && (
                <circle cx={uiPanel.x - 11} cy={uiPanel.y} r="1.4" fill="var(--color-amber-300)" />
              )}
            </g>
          </svg>
          <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">
            {zh
              ? `当前平台 ${isQuest ? 'Quest' : 'Vision Pro'}：抓取 Movement Type 演示为 ${isQuest ? 'Kinematic（稳跟手）' : 'Velocity-Tracking（Throw On Detach 可投掷）'}；World-Space UI 经 Tracked Device Graphic Raycaster + InputSystemUIInputModule。`
              : `Platform ${isQuest ? 'Quest' : 'Vision Pro'}: grab Movement Type shown as ${isQuest ? 'Kinematic (follows the hand)' : 'Velocity-Tracking (Throw On Detach)'}; World-Space UI via Tracked Device Graphic Raycaster + InputSystemUIInputModule.`}
          </p>
        </div>

        {/* stages + layer stack */}
        <div className="space-y-2.5">
          {stageLabels.map((s) => {
            const active = stage === s.key;
            const done = reached(s.key) && !active;
            return (
              <div
                key={s.key}
                className={`flex items-start gap-2 rounded-[18px] border px-3.5 py-2.5 transition-colors ${
                  active
                    ? 'border-[var(--color-green-300)]/50 bg-[var(--color-green-300)]/12'
                    : done
                      ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/8'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                }`}
              >
                <p className="text-sm leading-5 text-[var(--color-text-primary)]">{zh ? s.label.zh : s.label.en}</p>
              </div>
            );
          })}

          <div className="rounded-[18px] border border-[var(--color-border-default)] bg-black/10 p-3">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[var(--color-amber-300)]" />
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                {zh ? '分层架构（绿色 = 跨平台一致）' : 'Layered architecture (green = cross-platform constant)'}
              </p>
            </div>
            <div className="mt-2 space-y-1.5">
              {layers.map((l) => (
                <div
                  key={l.id}
                  className={`rounded-[12px] border px-2.5 py-1.5 ${
                    l.constant
                      ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/8'
                      : 'border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/8'
                  }`}
                >
                  <div className="text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">{zh ? l.role.zh : l.role.en}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-[var(--color-text-secondary)]">
                    {l.constant ? (zh ? l.quest.zh : l.quest.en) : isQuest ? (zh ? l.quest.zh : l.quest.en) : zh ? l.visionpro.zh : l.visionpro.en}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {stage === 'complete' && (
            <p className="rounded-[18px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-3.5 py-3 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? '同一条 XRI 交互链在 Quest 和 Vision Pro 上跑通——只有设备/渲染层换了 SDK（Meta XR SDK vs PolySpatial/Metal）。这是从视频课程整理的研究复演，不是已上线的 Unity 应用。'
                : 'The same XRI interaction chain runs on both Quest and Vision Pro — only the device/render layer swaps SDKs (Meta XR SDK vs PolySpatial/Metal). This is a study-derived replay from a video-only course, not a shipped Unity app.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
