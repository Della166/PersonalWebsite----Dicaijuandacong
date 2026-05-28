'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Boxes,
  Cpu,
  Gauge,
  LoaderCircle,
  Play,
  ScanSearch,
  Sparkles,
  TableProperties,
} from 'lucide-react';

type StageKey = 'idle' | 'load' | 'infer' | 'boxes' | 'complete';

interface DefectBox {
  cls: string;
  conf: number;
  // percentages relative to the image placeholder
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SampleImage {
  id: string;
  label: { zh: string; en: string };
  tone: string; // base steel tone
  boxes: DefectBox[];
}

// Six NEU-DET defect classes, each with a stable accent color.
const classColor: Record<string, string> = {
  crazing: 'var(--color-amber-300)',
  inclusion: 'var(--color-green-300)',
  pitted_surface: '#e0b6ff',
  scratches: '#9bd0ff',
  patches: 'var(--color-green-500)',
  'rolled-in_scale': '#ffb59b',
};

// Illustrative samples (NOT measured): representative boxes + scores so the
// panel reads like a real YOLO inference overlay without shipping weights.
const samples: SampleImage[] = [
  {
    id: 'A',
    label: { zh: '样例 A · 划痕 + 夹杂', en: 'Sample A · scratches + inclusion' },
    tone: 'linear-gradient(115deg,#6b7079,#9aa1ab 45%,#7c828c)',
    boxes: [
      { cls: 'scratches', conf: 0.91, x: 14, y: 22, w: 58, h: 11 },
      { cls: 'inclusion', conf: 0.84, x: 63, y: 58, w: 19, h: 24 },
    ],
  },
  {
    id: 'B',
    label: { zh: '样例 B · 麻点 + 斑块', en: 'Sample B · pitted + patches' },
    tone: 'linear-gradient(140deg,#73797f,#a3a8af 50%,#82888f)',
    boxes: [
      { cls: 'pitted_surface', conf: 0.88, x: 30, y: 30, w: 26, h: 28 },
      { cls: 'patches', conf: 0.79, x: 60, y: 14, w: 30, h: 22 },
      { cls: 'patches', conf: 0.73, x: 12, y: 64, w: 22, h: 20 },
    ],
  },
  {
    id: 'C',
    label: { zh: '样例 C · 裂纹 + 氧化铁皮', en: 'Sample C · crazing + scale' },
    tone: 'linear-gradient(120deg,#6e747c,#9da6a6 48%,#787e87)',
    boxes: [
      { cls: 'crazing', conf: 0.86, x: 18, y: 18, w: 64, h: 16 },
      { cls: 'rolled-in_scale', conf: 0.81, x: 40, y: 55, w: 34, h: 30 },
    ],
  },
];

// Illustrative per-class mAP@0.5 from a typical NEU-DET YOLO run — labeled as
// representative, NOT a measured benchmark from shipped weights.
const perClass: { cls: string; ap: number }[] = [
  { cls: 'crazing', ap: 0.41 },
  { cls: 'inclusion', ap: 0.82 },
  { cls: 'pitted_surface', ap: 0.86 },
  { cls: 'scratches', ap: 0.95 },
  { cls: 'patches', ap: 0.91 },
  { cls: 'rolled-in_scale', ap: 0.69 },
];

const mapAll = perClass.reduce((s, c) => s + c.ap, 0) / perClass.length; // ~0.773

const stages: { icon: typeof ScanSearch; key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  {
    icon: Cpu,
    key: 'load',
    label: 'best.pt → YOLO("best.pt")',
    description: 'Ultralytics loads the YOLOv12 weights trained on NEU-DET (6 classes, imgsz 640).',
  },
  {
    icon: ScanSearch,
    key: 'infer',
    label: 'model.predict(img, conf=0.25)',
    description: 'A single forward pass over the held-out steel image returns boxes + class + confidence.',
  },
  {
    icon: Boxes,
    key: 'boxes',
    label: 'results[0].boxes → overlay',
    description: 'Detections are drawn over the surface, then summarized into a per-class mAP table.',
  },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function YoloSteelDefectPreview() {
  const zh = useLocale() === 'zh';
  const [selected, setSelected] = useState(0);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [timeline, setTimeline] = useState<string[]>([]);

  const sample = samples[selected];

  const stageReached = (target: StageKey) => {
    const order: StageKey[] = ['idle', 'load', 'infer', 'boxes', 'complete'];
    return order.indexOf(stage) >= order.indexOf(target);
  };

  const reset = () => {
    setStage('idle');
    setTimeline([]);
    setRunning(false);
  };

  const pick = (index: number) => {
    if (running) return;
    setSelected(index);
    reset();
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setTimeline([
        zh
          ? `predict.py：在 ${sample.label.zh} 上跑 YOLOv12 推理。`
          : `predict.py: running YOLOv12 inference on ${sample.label.en}.`,
      ]);
      setStage('load');
      await wait(560);
      if (cancelled) return;
      setTimeline((prev) => [
        ...prev,
        zh
          ? 'Ultralytics 加载 best.pt（NEU-DET 6 类，imgsz 640）。'
          : 'Ultralytics loads best.pt (NEU-DET 6 classes, imgsz 640).',
      ]);

      await wait(680);
      if (cancelled) return;
      setStage('infer');
      setTimeline((prev) => [
        ...prev,
        zh
          ? 'model.predict(conf=0.25)：单次前向，得到候选框 + 类别 + 置信度。'
          : 'model.predict(conf=0.25): one forward pass → candidate boxes + class + confidence.',
      ]);

      await wait(640);
      if (cancelled) return;
      setStage('boxes');
      setTimeline((prev) => [
        ...prev,
        zh
          ? `检出 ${sample.boxes.length} 处缺陷，叠回钢材表面 + 汇总 mAP 表。`
          : `${sample.boxes.length} defects detected, overlaid on the surface + mAP summary.`,
      ]);

      await wait(560);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [running, zh, sample]);

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
              {zh ? '运行 YOLOv12 钢材缺陷检测' : 'Run YOLOv12 steel-defect detection'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '挑一张钢材表面图，复演 best.pt 推理：缺陷框 + 每类置信度逐个出现，最后给一张 mAP / 每类 AP 表。'
                : 'Pick a steel-surface image and replay best.pt inference: defect boxes + per-class confidence appear, ending in an mAP / per-class AP table.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '推理中' : 'Detecting') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行推理' : 'Run inference'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <ScanSearch className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '输入图像' : 'Input image'}</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {samples.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pick(index)}
                  disabled={running}
                  className={`rounded-xl border px-2 py-2 text-left transition-colors disabled:cursor-not-allowed ${
                    selected === index
                      ? 'border-[var(--color-green-300)]/45 bg-[var(--color-green-300)]/10'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40 hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  <span className="font-mono text-[11px] text-[var(--color-text-primary)]">{item.id}</span>
                  <span className="mt-1 block text-[10px] leading-4 text-[var(--color-text-muted)]">{zh ? item.label.zh : item.label.en}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {stages.map((item) => {
              const isActive = stage === item.key;
              const isComplete = stageReached(item.key) && !isActive;
              return (
                <div
                  key={item.key}
                  className={`rounded-[22px] border p-3 transition-colors ${
                    isActive
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                      : isComplete
                        ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-[var(--color-amber-300)]" />
                    <p className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[var(--color-text-muted)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '训练配方' : 'Training recipe'}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
              {zh
                ? 'NEU-DET ~5000 张 → train / val / predict。~100 epochs，imgsz 640，mosaic + mixup + copy-paste 增强，AutoDL GPU 上训练。'
                : 'NEU-DET ~5000 imgs → train / val / predict. ~100 epochs, imgsz 640, mosaic + mixup + copy-paste augments, trained on an AutoDL GPU.'}
            </p>
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {zh ? '执行日志' : 'Activity log'}
            </p>
            <div className="mt-4 space-y-3">
              {timeline.length > 0 ? (
                timeline.map((item, index) => (
                  <p key={`${index}-${item.slice(0, 8)}`} className="font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  {zh ? '运行推理，看缺陷框如何叠到钢材表面上。' : 'Run inference to watch defect boxes land on the steel surface.'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Stage 1-2 — image + boxes overlay */}
          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ScanSearch className="h-4 w-4 text-[var(--color-amber-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '检测结果叠加' : 'Detection overlay'}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-green-300)]">
                <Gauge className="h-3 w-3" /> imgsz 640
              </span>
            </div>

            <div
              className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[var(--color-border-default)]"
              style={{ background: sample.tone }}
            >
              {/* stylized brushed-metal striations */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(115deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 6px)',
                }}
              />
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 30% 40%, rgba(0,0,0,0.35), transparent 45%), radial-gradient(circle at 75% 65%, rgba(0,0,0,0.30), transparent 40%)',
                }}
              />

              {stageReached('boxes') &&
                sample.boxes.map((box, index) => {
                  const color = classColor[box.cls] ?? 'var(--color-green-300)';
                  return (
                    <div
                      key={`${box.cls}-${index}`}
                      className="absolute rounded-[3px] transition-opacity duration-500"
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`,
                        border: `2px solid ${color}`,
                        boxShadow: `0 0 12px ${color}55`,
                      }}
                    >
                      <span
                        className="absolute -top-[18px] left-0 whitespace-nowrap rounded-[3px] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black"
                        style={{ background: color }}
                      >
                        {box.cls} {box.conf.toFixed(2)}
                      </span>
                    </div>
                  );
                })}

              {!stageReached('boxes') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full border border-[var(--color-border-default)] bg-black/30 px-3 py-1 text-[11px] text-[var(--color-text-muted)]">
                    {stage === 'idle'
                      ? zh
                        ? '钢材表面（点「运行推理」检测缺陷）'
                        : 'Steel surface (run inference to detect defects)'
                      : zh
                        ? '推理中…'
                        : 'Detecting…'}
                  </span>
                </div>
              )}
            </div>
            <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">
              {zh
                ? '* 框与置信度为示意，best.pt 权重未随站点发布，浏览器内不跑模型。'
                : '* Boxes + scores are illustrative; best.pt weights are not shipped and no model runs in the browser.'}
            </p>
          </div>

          {/* Stage 3 — per-class mAP table */}
          {stageReached('boxes') && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TableProperties className="h-4 w-4 text-[var(--color-green-300)]" />
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'val 评估（每类 AP@0.5）' : 'val metrics (per-class AP@0.5)'}</p>
                </div>
                <span className="font-mono text-[11px] text-[var(--color-green-300)]">mAP@0.5 ≈ {mapAll.toFixed(3)}</span>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border-default)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-bg-primary)]/55 text-[var(--color-text-muted)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">{zh ? '缺陷类别' : 'Defect class'}</th>
                      <th className="px-3 py-2 font-medium">AP@0.5</th>
                      <th className="px-3 py-2 font-medium">{zh ? '占比条' : 'Bar'}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-text-secondary)]">
                    {perClass.map((c) => (
                      <tr key={c.cls} className="border-t border-[var(--color-border-default)]">
                        <td className="px-3 py-1.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: classColor[c.cls] }} />
                            <span className="font-mono text-[11px]">{c.cls}</span>
                          </span>
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[var(--color-green-300)]">{c.ap.toFixed(2)}</td>
                        <td className="px-3 py-1.5">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-primary)]/60">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[var(--color-green-500)] to-[var(--color-green-300)]"
                              style={{ width: `${c.ap * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
                {zh
                  ? '* 数值为 NEU-DET 上典型 YOLO 量级的示意值（crazing 低召回是已知难点），非本站权重实测。'
                  : '* Numbers are representative of a typical NEU-DET YOLO run (crazing low recall is a known hard case), not measured from shipped weights.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
