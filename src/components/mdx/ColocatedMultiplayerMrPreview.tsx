'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { LoaderCircle, Network, Play, ScanLine, Sparkles } from 'lucide-react';

type StageKey = 'idle' | 'local' | 'scan' | 'align' | 'network' | 'sync' | 'complete';

const stageOrder: StageKey[] = ['idle', 'local', 'scan', 'align', 'network', 'sync', 'complete'];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: { en: string; zh: string } }[] = [
  { key: 'local', label: { zh: '1. 两台头显各自的本地坐标系（origin 不重合）', en: '1. Two headsets, two independent local coordinate frames (origins differ)' } },
  { key: 'scan', label: { zh: '2. 空间锚扫描：各自识别环境特征并放置 spatial anchors', en: '2. Spatial-anchor scan: each headset recognizes the room and places anchors' } },
  { key: 'align', label: { zh: '3. 空间对齐：两个本地系收敛到同一个共享 origin', en: '3. Spatial alignment: both local frames converge to ONE shared origin' } },
  { key: 'network', label: { zh: '4. 组网：进入同一联机房间，走公网中继', en: '4. Networked room: both join one session over a public-internet relay' } },
  { key: 'sync', label: { zh: '5. 状态同步：玩家 avatar + 共享被抓物体跨端位置一致', en: '5. State sync: player avatars + a shared grabbed object stay consistent across clients' } },
];

const pipeline: { id: string; label: { en: string; zh: string } }[] = [
  { id: 'anchor', label: { zh: '空间锚', en: 'spatial anchors' } },
  { id: 'align', label: { zh: '空间对齐', en: 'spatial alignment' } },
  { id: 'room', label: { zh: '联机房间', en: 'networked room' } },
  { id: 'state', label: { zh: '状态同步', en: 'state sync' } },
  { id: 'relay', label: { zh: '公网中继', en: 'public-net relay' } },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function ColocatedMultiplayerMrPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');

  const reached = (t: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(t);

  const reset = () => {
    setStage('idle');
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      const seq: StageKey[] = ['local', 'scan', 'align', 'network', 'sync'];
      for (const s of seq) {
        setStage(s);
        await wait(s === 'align' ? 1000 : 800);
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

  const aligned = reached('align');

  // Headset A's local frame is fixed near top-left. Headset B starts offset/rotated,
  // and on `align` it snaps onto A's frame (one shared origin).
  const sharedOrigin = { x: 50, y: 52 };
  // Headset B pre-alignment frame origin (offset + skew) vs post-alignment (== shared)
  const bOriginPre = { x: 68, y: 32 };
  const bOrigin = aligned ? sharedOrigin : bOriginPre;

  // Avatars (drawn in WORLD space once aligned; before alignment B's avatar sits in its own frame)
  const avatarA = { x: 38, y: 44 };
  const avatarBWorld = { x: 62, y: 60 };
  const avatarBPre = { x: 80, y: 40 };
  const avatarB = aligned ? avatarBWorld : avatarBPre;

  // Shared grabbed object
  const sharedObj = { x: 50, y: 30 };
  const sharedObjPreB = { x: 84, y: 22 };

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {zh ? '共址联机流程复演' : 'Colocation-flow replay'}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              {zh ? '大空间多人 MR：锚 → 对齐 → 共享 origin → 状态同步' : 'Large-space multiplayer MR: anchor → align → shared origin → state sync'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '俯视平面图复演课程文档里的共址（colocation）管线：两台头显起初各有本地坐标系，扫描空间锚后「对齐」一步把两个系吸附到同一个共享 origin，之后 avatar 和被抓物体跨端位置才一致。'
                : 'A top-down floorplan replays the documented colocation pipeline: two headsets start with independent local frames; after the spatial-anchor scan, the "align" step snaps both onto one shared origin, after which avatars and a grabbed object stay positionally consistent across clients.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '对齐中' : 'Aligning') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行共址流程' : 'Run colocation flow'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* top-down floorplan */}
        <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/15 p-4">
          <div className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-[var(--color-amber-300)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {zh ? '俯视平面图（两台头显共享一个 origin）' : 'Top-down floorplan (two headsets, one shared origin)'}
            </p>
          </div>
          <svg viewBox="0 0 100 80" className="mt-3 w-full" style={{ aspectRatio: '1.25' }}>
            {/* room bounds */}
            <rect x="6" y="6" width="88" height="68" rx="2" fill="none" stroke="var(--color-border-hover)" strokeWidth="0.6" strokeDasharray="2 1.5" />

            {/* Headset A local frame (fixed) */}
            <g>
              <line x1={sharedOrigin.x - 14} y1={sharedOrigin.y} x2={sharedOrigin.x + 14} y2={sharedOrigin.y} stroke="var(--color-green-300)" strokeWidth="0.4" opacity="0.5" />
              <line x1={sharedOrigin.x} y1={sharedOrigin.y - 12} x2={sharedOrigin.x} y2={sharedOrigin.y + 12} stroke="var(--color-green-300)" strokeWidth="0.4" opacity="0.5" />
            </g>

            {/* Headset B frame — snaps onto shared origin at `align` */}
            <g style={{ transition: 'opacity .4s' }}>
              <line
                x1={bOrigin.x - 14}
                y1={bOrigin.y}
                x2={bOrigin.x + 14}
                y2={bOrigin.y}
                stroke="var(--color-amber-300)"
                strokeWidth="0.4"
                opacity={aligned ? 0.45 : 0.7}
                style={{ transition: 'all .5s ease' }}
              />
              <line
                x1={bOrigin.x}
                y1={bOrigin.y - 12}
                x2={bOrigin.x}
                y2={bOrigin.y + 12}
                stroke="var(--color-amber-300)"
                strokeWidth="0.4"
                opacity={aligned ? 0.45 : 0.7}
                style={{ transition: 'all .5s ease' }}
              />
            </g>

            {/* shared origin marker */}
            <circle cx={sharedOrigin.x} cy={sharedOrigin.y} r={aligned ? 2.4 : 1.6} fill={aligned ? 'var(--color-green-300)' : 'var(--color-text-muted)'} style={{ transition: 'all .4s' }} />
            {aligned && <text x={sharedOrigin.x} y={sharedOrigin.y - 4} fontSize="2.8" fill="var(--color-green-300)" textAnchor="middle" fontWeight="700">shared origin</text>}

            {/* anchors appear at scan */}
            {reached('scan') && (
              <g fill="var(--color-amber-300)" opacity="0.8">
                <rect x="14" y="14" width="2.4" height="2.4" rx="0.4" />
                <rect x="82" y="16" width="2.4" height="2.4" rx="0.4" />
                <rect x="16" y="62" width="2.4" height="2.4" rx="0.4" />
                <rect x="80" y="60" width="2.4" height="2.4" rx="0.4" />
              </g>
            )}

            {/* shared grabbed object — once synced, both clients agree on its position */}
            {reached('network') && (
              <g style={{ transition: 'all .5s ease' }}>
                <rect
                  x={sharedObj.x - 3}
                  y={sharedObj.y - 3}
                  width="6"
                  height="6"
                  rx="1"
                  fill={reached('sync') ? 'var(--color-green-300)' : 'var(--color-bg-card)'}
                  stroke="var(--color-green-300)"
                  strokeWidth="0.5"
                />
                {/* ghost of B's pre-alignment view of the object — only before sync */}
                {!reached('sync') && (
                  <rect x={sharedObjPreB.x - 3} y={sharedObjPreB.y - 3} width="6" height="6" rx="1" fill="none" stroke="var(--color-amber-300)" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.6" />
                )}
              </g>
            )}

            {/* Avatar A (green) */}
            <g>
              <circle cx={avatarA.x} cy={avatarA.y} r="2.6" fill="var(--color-green-300)" />
              <text x={avatarA.x} y={avatarA.y + 1} fontSize="2.6" fill="#0e1a14" textAnchor="middle" fontWeight="700">A</text>
            </g>

            {/* Avatar B (amber) — snaps into world space at align */}
            <g style={{ transition: 'all .5s ease' }}>
              <circle cx={avatarB.x} cy={avatarB.y} r="2.6" fill="var(--color-amber-300)" style={{ transition: 'all .5s ease' }} />
              <text x={avatarB.x} y={avatarB.y + 1} fontSize="2.6" fill="#0e1a14" textAnchor="middle" fontWeight="700">B</text>
            </g>

            {/* sync links once networked */}
            {reached('sync') && (
              <>
                <line x1={avatarA.x} y1={avatarA.y} x2={sharedObj.x} y2={sharedObj.y} stroke="var(--color-green-300)" strokeWidth="0.4" strokeDasharray="1.5 1" opacity="0.6" />
                <line x1={avatarBWorld.x} y1={avatarBWorld.y} x2={sharedObj.x} y2={sharedObj.y} stroke="var(--color-amber-300)" strokeWidth="0.4" strokeDasharray="1.5 1" opacity="0.6" />
              </>
            )}
          </svg>
          <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">
            {aligned
              ? zh
                ? '对齐后两个本地系合一：A、B 的 avatar 和共享物体在同一坐标系里——这是共址 MR 最难的一步。'
                : 'After alignment the two local frames become one: A, B avatars and the shared object live in one coordinate system — the hardest step in colocated MR.'
              : zh
                ? '对齐前：B 在自己的本地系里，看到的物体位置和 A 不一致（虚线幽灵框）。'
                : 'Before alignment: B is in its own local frame and disagrees with A on the object position (dashed ghost box).'}
          </p>
        </div>

        {/* stages + pipeline */}
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
              <Network className="h-3.5 w-3.5 text-[var(--color-amber-300)]" />
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{zh ? '共址管线（Pico 大空间）' : 'Colocation pipeline (Pico large-space)'}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pipeline.map((p, i) => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <span className="rounded border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-green-300)]">
                    {zh ? p.label.zh : p.label.en}
                  </span>
                  {i < pipeline.length - 1 && <span className="text-[10px] text-[var(--color-text-muted)]">→</span>}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] leading-4 text-[var(--color-text-muted)]">
              {zh
                ? '联机用的 Netcode SDK 在可读材料里未点名（视频课程，未核实）。'
                : 'The networking Netcode SDK is not named in the readable materials (video-only course — unverified).'}
            </p>
          </div>

          {stage === 'complete' && (
            <p className="rounded-[18px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-3.5 py-3 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? '共享坐标系 + 状态同步是 XR 最难的问题之一。这是从视频课程整理的研究复演，不是已上线的 Unity 应用；联机 Netcode SDK 来自视频、未核实。'
                : 'Shared coordinate frames + state sync are among the hardest XR problems. This is a study-derived replay from a video-only course, not a shipped Unity app; the multiplayer Netcode SDK is unverified (video-only).'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
