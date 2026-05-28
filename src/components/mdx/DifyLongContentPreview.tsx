'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  CheckCircle2,
  Code2,
  GitBranch,
  LoaderCircle,
  Play,
  Repeat,
  ScrollText,
  Sparkles,
} from 'lucide-react';

type StageKey = 'idle' | 'start' | 'loop' | 'stylecheck' | 'complete';

interface Segment {
  beat: { en: string; zh: string };
  text: { en: string; zh: string };
  chars: number;
}

const budget = 1200; // conversation_variable `zishu` — the 字数预算

const topic = {
  zh: '一篇关于「深夜便利店」的短篇小说',
  en: 'A short story about a late-night convenience store',
};
const background = {
  zh: '基调温暖治愈，第三人称叙述，结尾留白',
  en: 'Warm, healing tone; third-person narration; open ending',
};

// Each segment = one pass through the loop body (文章扩充节点 → 节点统计 → 条件分支).
const segments: Segment[] = [
  {
    beat: { en: 'Opening', zh: '开场' },
    text: {
      zh: '凌晨一点，便利店的灯还亮着。店员阿 May 擦着柜台，门口的风铃轻轻响了一下。',
      en: 'One a.m., the store lights still on. May wipes the counter; the door chime rings softly.',
    },
    chars: 230,
  },
  {
    beat: { en: 'Character enters', zh: '人物登场' },
    text: {
      zh: '进来的是个穿校服的男孩，攥着皱巴巴的五块钱，在关东煮前站了很久。',
      en: 'A boy in a school uniform comes in, clutching a crumpled five-yuan note, hesitating by the oden.',
    },
    chars: 250,
  },
  {
    beat: { en: 'Turn', zh: '转折' },
    text: {
      zh: '阿 May 没说话，多盛了一颗蛋，把找零悄悄推回他手心。',
      en: 'May says nothing, ladles in an extra egg, and quietly slides the change back into his palm.',
    },
    chars: 240,
  },
  {
    beat: { en: 'Deepen', zh: '递进' },
    text: {
      zh: '男孩愣住，眼眶有点红。他说妈妈今晚加班，这是他第一次自己买晚饭。',
      en: 'The boy freezes, eyes reddening. His mom works late tonight — his first time buying dinner alone.',
    },
    chars: 260,
  },
  {
    beat: { en: 'Open ending', zh: '留白收束' },
    text: {
      zh: '门铃再响时，男孩已经走了。柜台上多了一张便利贴：谢谢阿姨。窗外，天快亮了。',
      en: 'When the chime rings again the boy is gone. A sticky note sits on the counter: thank you. Outside, dawn is near.',
    },
    chars: 250,
  },
];

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function cumulativeAt(index: number) {
  return segments.slice(0, index + 1).reduce((sum, s) => sum + s.chars, 0);
}

export default function DifyLongContentPreview() {
  const zh = useLocale() === 'zh';
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleSegments, setVisibleSegments] = useState(0);
  const [showStyleCheck, setShowStyleCheck] = useState(false);
  const [timeline, setTimeline] = useState<string[]>([]);

  const written = visibleSegments > 0 ? cumulativeAt(visibleSegments - 1) : 0;
  const budgetMet = written >= budget;
  const progress = Math.min(100, Math.round((written / budget) * 100));

  const reset = () => {
    setStage('idle');
    setVisibleSegments(0);
    setShowStyleCheck(false);
    setTimeline([]);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const run = async () => {
      setStage('start');
      setVisibleSegments(0);
      setShowStyleCheck(false);
      setTimeline([
        zh
          ? `开始节点：读入 主题 / 背景 / 字数预算（zishu = ${budget}）。`
          : `Start node: read 主题 / 背景 / word budget (zishu = ${budget}).`,
      ]);

      await wait(560);
      if (cancelled) return;
      setStage('loop');
      setTimeline((prev) => [
        ...prev,
        zh
          ? '进入「循环扩充内容」节点（Dify loop，最多 8 轮）。'
          : 'Entering the 循环扩充内容 loop node (Dify loop, max 8 iterations).',
      ]);

      for (let i = 0; i < segments.length; i += 1) {
        await wait(680);
        if (cancelled) return;
        setVisibleSegments(i + 1);
        const total = cumulativeAt(i);
        const done = total >= budget;
        setTimeline((prev) => [
          ...prev,
          zh
            ? `第 ${i + 1} 轮 · 文章扩充节点(deepseek-chat) → 节点统计 len(history)=${total} → 条件分支 ${total}≥${budget} ? ${done ? '是 → 退出循环' : '否 → 继续'}`
            : `Iter ${i + 1} · 文章扩充节点(deepseek-chat) → 节点统计 len(history)=${total} → if-else ${total}≥${budget} ? ${done ? 'yes → loop-end' : 'no → continue'}`,
        ]);
        if (done) break;
      }

      await wait(420);
      if (cancelled) return;
      setStage('stylecheck');
      setShowStyleCheck(true);
      setTimeline((prev) => [
        ...prev,
        zh
          ? 'Tool-StyleChecker：对成稿做风格 / 语气 / 自然度审查，输出 JSON 结论。'
          : 'Tool-StyleChecker: reviews the draft for style / tone / naturalness, returns a JSON verdict.',
      ]);

      await wait(520);
      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [running, zh]);

  const nodes: { icon: typeof Code2; label: string; description: string }[] = [
    {
      icon: ScrollText,
      label: zh ? '文章扩充节点 (LLM · deepseek-chat)' : '文章扩充节点 (LLM · deepseek-chat)',
      description: zh
        ? '按 主题 + 背景 + conversation.history 扩写下一段，要求「故事递进性」。'
        : 'Expands the next beat from 主题 + 背景 + conversation.history, told to keep narrative momentum.',
    },
    {
      icon: Code2,
      label: zh ? '节点统计 (code · python3)' : '节点统计 (code · python3)',
      description: 'def main(arg1): return {"result": len(arg1)} — counts len(history).',
    },
    {
      icon: GitBranch,
      label: zh ? '条件分支 (if-else)' : '条件分支 (if-else)',
      description: zh
        ? 'len(history) ≥ zishu ? 达标 → 退出循环；否则回到扩充节点。'
        : 'len(history) ≥ zishu ? met → loop-end; otherwise back to the expand node.',
    },
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
              {zh ? '运行长文迭代工作流' : 'Run the long-form iteration workflow'}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {zh
                ? '在示例主题上复演 Dify advanced-chat graph：开始节点读入预算 → 循环里「扩写 → 数字数 → 判断达标」反复迭代 → 退出后跑风格校验工具。'
                : 'Replays the Dify advanced-chat graph on a sample topic: a start node reads the budget → the loop runs "expand → count chars → check budget" repeatedly → after exit it runs a style-checker tool.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => (stage === 'complete' ? reset() : setRunning(true))}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? (zh ? '生成中' : 'Writing') : stage === 'complete' ? (zh ? '重置' : 'Reset') : zh ? '运行工作流' : 'Run workflow'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{zh ? '开始节点输入' : 'Start-node inputs'}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
              <span className="text-[var(--color-text-muted)]">zhuti·</span> {zh ? topic.zh : topic.en}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
              <span className="text-[var(--color-text-muted)]">beijing·</span> {zh ? background.zh : background.en}
            </p>
            <p className="mt-1 font-mono text-[11px] text-[var(--color-text-muted)]">zishu (budget) = {budget}</p>
          </div>

          <div className="grid gap-3">
            {nodes.map((item) => {
              const isActive = stage === 'loop';
              return (
                <div
                  key={item.label}
                  className={`rounded-[22px] border p-3 transition-colors ${
                    isActive
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                      : stage === 'stylecheck' || stage === 'complete'
                        ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-[var(--color-amber-300)]" />
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-muted)]">{item.description}</p>
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
                  <p key={`${index}-${item.slice(0, 8)}`} className="font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  {zh ? '运行工作流，看迭代循环逐轮扩写并判断字数。' : 'Run the workflow to watch the loop expand and check the word budget each pass.'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {zh ? '逐段成稿 & conversation.history' : 'Draft by beat & conversation.history'}
            </p>
            <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 font-mono text-xs text-[var(--color-text-muted)]">
              {written}/{budget}
            </div>
          </div>

          <div className="rounded-[18px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{zh ? '字数预算进度' : 'word-budget progress'}</p>
              <p className={`font-mono text-[11px] ${budgetMet ? 'text-[var(--color-green-300)]' : 'text-[var(--color-text-muted)]'}`}>
                {budgetMet ? (zh ? '达标 · 退出循环' : 'met · loop-end') : `${progress}%`}
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/25">
              <div
                className={`h-full rounded-full transition-all duration-500 ${budgetMet ? 'bg-[var(--color-green-300)]' : 'bg-[var(--color-amber-300)]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {visibleSegments === 0 && (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-10 text-center text-sm leading-6 text-[var(--color-text-muted)]">
              {zh ? '每轮迭代扩写的段落会按顺序出现在这里，并累加进 conversation.history。' : 'Each loop iteration appends a beat here and into conversation.history.'}
            </div>
          )}

          {segments.slice(0, visibleSegments).map((seg, index) => {
            const total = cumulativeAt(index);
            const done = total >= budget;
            return (
              <div key={seg.beat.en} className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-[var(--color-amber-300)]" />
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {zh ? `第 ${index + 1} 轮 · ${seg.beat.zh}` : `Iteration ${index + 1} · ${seg.beat.en}`}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--color-text-muted)]">+{seg.chars} → {total}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{zh ? seg.text.zh : seg.text.en}</p>
                <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">
                  if-else: {total} ≥ {budget} ? {done ? (zh ? '是 → loop-end' : 'yes → loop-end') : (zh ? '否 → 继续扩写' : 'no → continue')}
                </p>
              </div>
            );
          })}

          {showStyleCheck && (
            <div className="rounded-[22px] border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/8 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-green-300)]" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zh ? 'Tool-StyleChecker 输出' : 'Tool-StyleChecker output'}</p>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border-default)] bg-black/25 p-3 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
{`{
  "style_match": true,
  "target_style": "${zh ? '温暖治愈 / 第三人称' : 'warm-healing / third-person'}",
  "issues": [
    "${zh ? '第 2 段「站了很久」与第 4 段措辞略重复，可换词' : 'slight wording echo between beats 2 and 4'}"
  ]
}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
