'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Clapperboard,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  PenLine,
  Play,
  Shuffle,
  Sparkles,
} from 'lucide-react';

type StageKey = 'idle' | 'produce' | 'copywriting' | 'image' | 'video' | 'merge' | 'complete';

interface Shot {
  scene: { en: string; zh: string };
  narration: { en: string; zh: string };
}

const brief = {
  zh: '关于「深圳早高峰地铁」的 60 秒短视频',
  en: 'A 60-second short video about "Shenzhen rush-hour metro"',
};

const title = {
  zh: '8 点的深圳地铁，是什么样子？',
  en: 'What does the Shenzhen metro look like at 8 a.m.?',
};

const shots: Shot[] = [
  { scene: { zh: '清晨的地铁站入口', en: 'Metro entrance at dawn' }, narration: { zh: '天刚亮，城市还没醒，地铁口已经亮起。', en: 'Barely dawn — the city sleeps, but the station is awake.' } },
  { scene: { zh: '闸机前的长队', en: 'Queues at the gates' }, narration: { zh: '闸机前排起长队，每个人都赶着同一班车。', en: 'Long lines at the gates, everyone chasing the same train.' } },
  { scene: { zh: '拥挤的车厢', en: 'A packed carriage' }, narration: { zh: '车厢里挤满了人，脸几乎贴着车门。', en: 'The carriage is packed, faces pressed to the doors.' } },
  { scene: { zh: '紧握扶手的手', en: 'Hands gripping the rail' }, narration: { zh: '一只手紧紧抓着扶手，吊环随车摇晃。', en: 'A hand grips the rail; the straps sway with the train.' } },
  { scene: { zh: '站台上的奔跑', en: 'A sprint on the platform' }, narration: { zh: '门要关了，有人在站台上奔跑。', en: 'The doors are closing — someone sprints down the platform.' } },
  { scene: { zh: '涌出地铁的人潮', en: 'The crowd pours out' }, narration: { zh: '到站，人潮涌出，奔向写字楼的剪影。', en: 'Arrival — the crowd pours out toward the office towers.' } },
];

const workflows: { id: string; key: Exclude<StageKey, 'idle' | 'complete'>; icon: typeof PenLine; label: string; role: string }[] = [
  { id: 'Workflow-produce-draft-1308', key: 'produce', icon: Shuffle, label: 'produce', role: 'Master: reads the brief, routes to sub-workflows' },
  { id: 'Workflow-get_produce-draft-1319', key: 'copywriting', icon: PenLine, label: 'get_produce', role: 'Copywriting: title / storyboard shots / narration' },
  { id: 'Workflow-create_image-draft-1329', key: 'image', icon: ImageIcon, label: 'create_image', role: 'Image gen: one image per shot' },
  { id: 'Workflow-create_video-draft-1324', key: 'video', icon: Film, label: 'create_video', role: 'Video gen: image + narration → clip' },
  { id: 'Workflow-get_video-draft-1314', key: 'merge', icon: Clapperboard, label: 'get_video', role: 'Merge: clips + BGM + subtitles → final video' },
];

const stageOrder: StageKey[] = ['idle', 'produce', 'copywriting', 'image', 'video', 'merge', 'complete'];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function CozeVideoPipelinePreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleShots, setVisibleShots] = useState(0);
  const [timeline, setTimeline] = useState<string[]>([]);

  const reached = (target: StageKey) => stageOrder.indexOf(stage) >= stageOrder.indexOf(target);

  const reset = () => {
    setStage('idle');
    setVisibleShots(0);
    setTimeline([]);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setVisibleShots(0);
      setStage('produce');
      setTimeline([zh ? 'produce：主控读入 brief，决定走完整「文案→图→视频」链。' : 'produce: master reads the brief, routes the full text→image→video chain.']);

      await wait(560);
      if (cancelled) return;
      setStage('copywriting');
      setTimeline((prev) => [...prev, zh ? 'get_produce：生成标题 + 6 个分镜 + 每镜旁白。' : 'get_produce: generates the title + 6 storyboard shots + per-shot narration.']);
      for (let i = 0; i < shots.length; i += 1) {
        await wait(280);
        if (cancelled) return;
        setVisibleShots(i + 1);
      }

      await wait(420);
      if (cancelled) return;
      setStage('image');
      setTimeline((prev) => [...prev, zh ? 'create_image：对每个分镜调图生模型（即梦 / 文心一格），返回 6 张图。' : 'create_image: calls an image model (Jimeng / ERNIE) per shot → 6 images.']);

      await wait(720);
      if (cancelled) return;
      setStage('video');
      setTimeline((prev) => [...prev, zh ? 'create_video：每张图 + 旁白调视频模型（即梦 / 可灵），返回 6 个 ~10s 片段。' : 'create_video: each image + narration → a video model (Jimeng / Kling) → 6 ~10s clips.']);

      await wait(720);
      if (cancelled) return;
      setStage('merge');
      setTimeline((prev) => [...prev, zh ? 'get_video：ffmpeg 合并 6 段 + 背景音乐 + 字幕 → 成片。' : 'get_video: ffmpeg merges 6 clips + BGM + subtitles → final video.']);

      await wait(640);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [running, zh]);

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
              {zh ? '运行 5 工作流短视频流水线' : 'Run the 5-workflow short-video pipeline'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '在一个样例选题上复演 Coze 工作流链：produce → get_produce → create_image → create_video → get_video，从 brief 一路到成片。'
                : 'Replays the Coze workflow chain on a sample brief: produce → get_produce → create_image → create_video → get_video, from brief to finished cut.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '生成中' : 'Generating') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行流水线' : 'Run pipeline'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '选题 brief' : 'Brief'}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">{zh ? brief.zh : brief.en}</p>
            {reached('copywriting') && (
              <div className="mt-3 border-t border-[var(--color-border-default)] pt-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{zh ? '生成标题' : 'generated title'}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-green-300)]">{zh ? title.zh : title.en}</p>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            {workflows.map((wf) => {
              const isActive = stage === wf.key;
              const isComplete = reached(wf.key) && !isActive;
              return (
                <div
                  key={wf.id}
                  className={`rounded-[22px] border p-3 transition-colors ${
                    isActive
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                      : isComplete
                        ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <wf.icon className="h-4 w-4 text-[var(--color-amber-300)]" />
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{wf.label}</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{wf.role}</p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]/70">{wf.id}.zip</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {zh ? '执行日志' : 'Activity log'}
            </p>
            <div className="mt-4 space-y-3">
              {timeline.length > 0 ? (
                timeline.map((item, index) => (
                  <p key={`${index}-${item.slice(0, 8)}`} className="text-[11px] leading-5 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  {zh ? '运行流水线，看 5 个 workflow 依次接力。' : 'Run the pipeline to watch the 5 workflows hand off in sequence.'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? '分镜 → 图 → 视频片段' : 'Storyboard → image → clip'}
            </p>
            <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
              {visibleShots}/{shots.length}
            </div>
          </div>

          {visibleShots === 0 && (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-10 text-center text-sm leading-6 text-[var(--color-text-muted)]">
              {zh ? '分镜会随 get_produce 出现；图片和视频片段状态随后续 workflow 点亮。' : 'Shots appear as get_produce runs; image and clip badges light up as the later workflows run.'}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {shots.slice(0, visibleShots).map((shot, index) => (
              <div key={shot.scene.en} className="rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {zh ? `分镜 ${index + 1}` : `Shot ${index + 1}`} · {zh ? shot.scene.zh : shot.scene.en}
                  </p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-secondary)]">{zh ? shot.narration.zh : shot.narration.en}</p>
                <div className="mt-2.5 flex gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${reached('image') ? 'border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 text-[var(--color-green-300)]' : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}>
                    <ImageIcon className="h-3 w-3" /> {reached('image') ? (zh ? '图 ✓' : 'img ✓') : (zh ? '图' : 'img')}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${reached('video') ? 'border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/10 text-[var(--color-green-300)]' : 'border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}>
                    <Film className="h-3 w-3" /> {reached('video') ? (zh ? '片段 ✓ ~10s' : 'clip ✓ ~10s') : (zh ? '片段' : 'clip')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {reached('merge') && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8 p-4">
              <div className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-[var(--color-green-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? '成片（get_video 合并输出）' : 'Final video (get_video merge output)'}</p>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-black/20 p-3">
                <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-green-500)]/40 to-[var(--color-amber-300)]/30">
                  <Play className="h-5 w-5 text-[var(--color-text-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? title.zh : title.en}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{zh ? '6 片段 · ~60s · 含背景音乐 + 字幕' : '6 clips · ~60s · with BGM + subtitles'}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
                {zh ? '拆成 5 个 workflow 是为了独立失败 / 独立替换模型 / 独立 cache 与调试。' : 'Splitting into 5 workflows buys independent failure, model swap, caching, and debugging.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
