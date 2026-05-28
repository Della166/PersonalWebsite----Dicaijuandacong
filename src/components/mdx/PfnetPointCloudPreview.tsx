'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Boxes, LoaderCircle, Play, Scissors, Sparkles, Layers, Wand2 } from 'lucide-react';

type StageKey = 'idle' | 'full' | 'crop' | 'pyramid' | 'coarse' | 'mid' | 'fine' | 'complete';

const ORDER: StageKey[] = ['idle', 'full', 'crop', 'pyramid', 'coarse', 'mid', 'fine', 'complete'];

interface P2 {
  x: number;
  y: number;
}

// Deterministic PRNG (mulberry32) so the point cloud is stable across renders.
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A toy "airplane-like" silhouette in a unit square [0,1]^2, normalized like the
// course's unit-sphere normalization (centroid-centered). 2D projection stands in
// for the 3-D ShapeNet-Part shape the real code renders.
function buildShape(n: number): P2[] {
  const rng = makeRng(20260528);
  const pts: P2[] = [];
  const push = (cx: number, cy: number, sx: number, sy: number, k: number) => {
    for (let i = 0; i < k; i += 1) {
      // box-muller-ish via two uniforms, clamped to keep things on-screen
      const u = rng();
      const v = rng();
      const r = Math.sqrt(-2 * Math.log(u + 1e-6));
      const a = 2 * Math.PI * v;
      pts.push({
        x: Math.min(0.97, Math.max(0.03, cx + r * Math.cos(a) * sx)),
        y: Math.min(0.97, Math.max(0.03, cy + r * Math.sin(a) * sy)),
      });
    }
  };
  // fuselage (long axis), two wings, tail — reads as a recognizable object
  push(0.5, 0.5, 0.28, 0.045, Math.round(n * 0.34));
  push(0.46, 0.34, 0.16, 0.05, Math.round(n * 0.22)); // upper wing
  push(0.46, 0.66, 0.16, 0.05, Math.round(n * 0.22)); // lower wing
  push(0.2, 0.5, 0.05, 0.09, Math.round(n * 0.12)); // tail
  push(0.78, 0.5, 0.05, 0.035, n - pts.length); // nose
  return pts;
}

const NPOINTS = 768; // illustrative subset of the real npoints=2048
const CROP_NUM = 0.32; // ~ crop_point_num=512 / 2048 of the cloud's nearest region

function dist2(a: P2, b: P2) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

// Farthest-point sampling (the real point_scales pyramid uses FPS).
function fps(pts: P2[], k: number): P2[] {
  if (k >= pts.length) return pts.slice();
  const picked: number[] = [0];
  const minD = pts.map((p) => dist2(p, pts[0]));
  for (let i = 1; i < k; i += 1) {
    let best = 0;
    let bestD = -1;
    for (let j = 0; j < pts.length; j += 1) {
      if (minD[j] > bestD) {
        bestD = minD[j];
        best = j;
      }
    }
    picked.push(best);
    for (let j = 0; j < pts.length; j += 1) {
      const d = dist2(pts[j], pts[best]);
      if (d < minD[j]) minD[j] = d;
    }
  }
  return picked.map((idx) => pts[idx]);
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function PfnetPointCloudPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [adv, setAdv] = useState(true);

  const reached = (t: StageKey) => ORDER.indexOf(stage) >= ORDER.indexOf(t);

  // Build the cloud + crop region once (deterministic).
  const { kept, cropped, center, fine512, c1, c2 } = useMemo(() => {
    const fullPts = buildShape(NPOINTS);
    // pick one of 5 fixed viewpoints (matches the 5-direction crop in Train_PFNet)
    const view: P2 = { x: 0.78, y: 0.5 }; // "nose" viewpoint
    const idx = fullPts.map((p, i) => ({ i, d: dist2(p, view) })).sort((a, b) => a.d - b.d);
    const cropCount = Math.round(NPOINTS * CROP_NUM);
    const cropIdx = new Set(idx.slice(0, cropCount).map((o) => o.i));
    const keptPts = fullPts.filter((_, i) => !cropIdx.has(i)); // partial input
    const croppedPts = fullPts.filter((_, i) => cropIdx.has(i)); // real_center GT
    // fine target = the full cropped region; c1/c2 are FPS-downsampled coarse levels
    return {
      kept: keptPts,
      cropped: croppedPts,
      center: view,
      fine512: croppedPts,
      c1: fps(croppedPts, 64),
      c2: fps(croppedPts, 128),
    };
  }, []);

  // 3-scale FPS pyramid of the partial input → point_scales_list [2048,1024,512]
  const pyr2048 = kept;
  const pyr512 = useMemo(() => fps(kept, Math.round(kept.length * 0.25)), [kept]);

  // Chamfer Distance (illustrative ×100) shrinks as coarse→fine fills the hole.
  const cdByStage: Record<StageKey, number> = {
    idle: NaN,
    full: NaN,
    crop: NaN,
    pyramid: NaN,
    coarse: 7.4,
    mid: 3.1,
    fine: 1.18,
    complete: 1.18,
  };

  const reset = () => {
    setStage('idle');
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      const steps: StageKey[] = ['full', 'crop', 'pyramid', 'coarse', 'mid', 'fine', 'complete'];
      for (const s of steps) {
        await wait(s === 'full' ? 200 : 720);
        if (cancelled) return;
        setStage(s);
      }
      setRunning(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [running]);

  // SVG geometry: map unit-square coords to a 320×320 viewport.
  const S = 320;
  const px = (p: P2) => (p.x * S).toFixed(1);
  const py = (p: P2) => (p.y * S).toFixed(1);

  // Which generated set to draw filling the hole, by stage.
  const generated =
    stage === 'coarse' ? c1 : stage === 'mid' ? c2 : reached('fine') ? fine512 : [];

  const cd = cdByStage[stage];

  const stageLabel = (() => {
    if (zh) {
      switch (stage) {
        case 'idle':
          return '待运行';
        case 'full':
          return '完整点云 2048';
        case 'crop':
          return 'FPS 裁掉 512 点（real_center GT）';
        case 'pyramid':
          return '多尺度 FPS 金字塔 [2048,1024,512]';
        case 'coarse':
          return '粗粒度 center1 (64 点)';
        case 'mid':
          return 'center2 (128 点，残差细化)';
        case 'fine':
        case 'complete':
          return 'fine (512 点，补全缺失区域)';
      }
    }
    switch (stage) {
      case 'idle':
        return 'idle';
      case 'full':
        return 'full cloud 2048';
      case 'crop':
        return 'FPS-crop 512 pts (real_center GT)';
      case 'pyramid':
        return 'multi-scale FPS pyramid [2048,1024,512]';
      case 'coarse':
        return 'coarse center1 (64 pts)';
      case 'mid':
        return 'center2 (128 pts, residual)';
      case 'fine':
      case 'complete':
        return 'fine (512 pts, fills the hole)';
    }
  })();

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
              {zh ? 'PF-Net 点云补全：裁掉一块再生成回来' : 'PF-Net point-cloud completion: crop a region, regenerate it'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '完整点云 → FPS 裁掉 512 点留下空洞 → 多尺度 FPS 编码 → 分层金字塔解码器 coarse(64)→center2(128)→fine(512) 逐级把缺失区域填回来，最后给 Chamfer Distance 读数。'
                : 'Full cloud → FPS-crop 512 points to leave a hole → multi-scale FPS encoder → a fractal pyramid decoder fills the hole coarse(64) → center2(128) → fine(512), ending in a Chamfer Distance readout.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '运行中' : 'Running') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '裁剪并补全' : 'Crop & complete'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* SVG point-cloud viz */}
        <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '2D 投影点云' : '2D-projected point cloud'}</p>
            </div>
            <span className="font-mono text-[11px] text-[var(--color-green-300)]">{stageLabel}</span>
          </div>

          <svg viewBox={`0 0 ${S} ${S}`} className="mt-3 w-full" style={{ aspectRatio: '1 / 1' }}>
            <rect x="0" y="0" width={S} height={S} rx="14" fill="rgba(0,0,0,0.18)" />

            {/* crop viewpoint ring (one of the 5 fixed directions) */}
            {reached('crop') && !reached('fine') && (
              <circle cx={px(center)} cy={py(center)} r="46" fill="none" stroke="var(--color-amber-300)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.55" />
            )}

            {/* partial input (kept points) — always visible from 'full' onward */}
            {reached('full') &&
              pyr2048.map((p, i) => (
                <circle key={`k${i}`} cx={px(p)} cy={py(p)} r="1.15" fill="var(--color-text-secondary)" opacity={reached('crop') ? 0.85 : 0.55} />
              ))}

            {/* cropped GT points shown faintly only during the 'full' frame, then removed (the hole) */}
            {stage === 'full' &&
              cropped.map((p, i) => (
                <circle key={`c${i}`} cx={px(p)} cy={py(p)} r="1.15" fill="var(--color-text-muted)" opacity="0.35" />
              ))}

            {/* multi-scale FPS pyramid overlay: highlight the FPS-512 subset */}
            {stage === 'pyramid' &&
              pyr512.map((p, i) => (
                <circle key={`p${i}`} cx={px(p)} cy={py(p)} r="2.1" fill="none" stroke="var(--color-green-500)" strokeWidth="0.9" opacity="0.8" />
              ))}

            {/* generated points filling the hole, coarse → fine */}
            {generated.map((p, i) => (
              <circle
                key={`g${i}`}
                cx={px(p)}
                cy={py(p)}
                r={stage === 'coarse' ? 2.4 : stage === 'mid' ? 1.8 : 1.3}
                fill="var(--color-green-300)"
                opacity={reached('fine') ? 0.95 : 0.9}
              />
            ))}
          </svg>

          <p className="mt-2 font-mono text-[10px] leading-4 text-[var(--color-text-muted)]">
            {zh
              ? '* 灰点=部分输入；绿点=解码器生成；琥珀虚环=裁剪视角。形状与坐标为示意，权重未随站点发布。'
              : '* Grey = partial input; green = decoder output; amber ring = crop viewpoint. Shape + coords are illustrative; weights not shipped.'}
          </p>
        </div>

        {/* Right column: pipeline + CD + adversarial toggle */}
        <div className="space-y-4">
          {/* pyramid stages */}
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '分层金字塔解码器' : 'fractal pyramid decoder'}</p>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { key: 'coarse' as StageKey, zh: 'center1 · 64 点 · FC head', en: 'center1 · 64 pts · FC head' },
                { key: 'mid' as StageKey, zh: 'center2 · 128 点 · 残差', en: 'center2 · 128 pts · residual' },
                { key: 'fine' as StageKey, zh: 'fine · 512 点 · 残差（补全）', en: 'fine · 512 pts · residual (filled)' },
              ].map((row) => {
                const on = reached(row.key);
                return (
                  <div
                    key={row.key}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 transition-colors ${
                      on ? 'border-[var(--color-green-300)]/40 bg-[var(--color-green-300)]/10' : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40 opacity-50'
                    }`}
                  >
                    <span className="font-mono text-[11px] text-[var(--color-text-primary)]">{zh ? row.zh : row.en}</span>
                    {on && <span className="h-2 w-2 rounded-full bg-[var(--color-green-300)]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chamfer Distance readout */}
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? 'Chamfer Distance ×100 (fine ↔ GT)' : 'Chamfer Distance ×100 (fine ↔ GT)'}</p>
              <span className="font-mono text-lg text-[var(--color-green-300)]">{Number.isNaN(cd) ? '—' : cd.toFixed(2)}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-primary)]/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-green-500)] to-[var(--color-green-300)] transition-all duration-500"
                style={{ width: Number.isNaN(cd) ? '4%' : `${Math.max(6, 100 - cd * 11)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
              {zh
                ? 'errG_l2 = CD(fine,gt) + α₁·CD(center1,key1) + α₂·CD(center2,key2)。CD 越小越好，coarse→fine 逐级下降。'
                : 'errG_l2 = CD(fine,gt) + α₁·CD(center1,key1) + α₂·CD(center2,key2). Lower CD is better; it drops coarse→fine.'}
            </p>
          </div>

          {/* Adversarial toggle */}
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '对抗损失 (D_choose)' : 'adversarial loss (D_choose)'}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdv((v) => !v)}
                className={`relative h-6 w-11 rounded-full border transition-colors ${
                  adv ? 'border-[var(--color-green-300)]/55 bg-[var(--color-green-300)]/25' : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/60'
                }`}
                aria-pressed={adv}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-[var(--color-green-300)] transition-all ${adv ? 'left-6' : 'left-0.5 opacity-50'}`} />
              </button>
            </div>
            <p className="mt-2 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
              {adv
                ? 'errG = (1−wtl2)·BCE_adv + wtl2·errG_l2 · wtl2=0.95'
                : zh
                  ? 'errG = errG_l2（关掉判别器，纯 Chamfer 重建）'
                  : 'errG = errG_l2 (discriminator off, pure Chamfer reconstruction)'}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">
              {zh
                ? adv
                  ? '判别器 _netlocalD 让 fine 区域更像真实表面，惩罚过于平滑的解。'
                  : '只靠 Chamfer 时，补出的区域更平滑、细节更弱。'
                : adv
                  ? 'The _netlocalD discriminator pushes the filled region toward a realistic surface, penalizing over-smooth solutions.'
                  : 'With Chamfer only, the filled region is smoother with weaker detail.'}
            </p>
          </div>

          {stage === 'complete' && (
            <p className="rounded-[18px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 px-4 py-3 flex items-start gap-2 text-[11px] leading-5 text-[var(--color-text-secondary)]">
              <Scissors className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-green-300)]" />
              {zh
                ? '点云、坐标、CD 数值均为示意；裁剪策略（5 视角 + 距离排序裁 512）、多尺度 FPS 编码、分层残差解码器、对抗+Chamfer 复合损失都是 PF-Net 真实结构，来自咕泡 DL 系统班 3D 点云源码。'
                : 'Cloud, coords, and CD values are illustrative; the crop strategy (5 viewpoints + distance-sort crop 512), multi-scale FPS encoder, residual pyramid decoder, and adversarial + Chamfer loss are PF-Net\'s real structure, from the course\'s 3D point-cloud source.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
