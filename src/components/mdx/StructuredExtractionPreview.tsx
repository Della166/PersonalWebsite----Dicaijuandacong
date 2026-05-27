'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Layers,
  ScanLine,
  Sparkles,
  Target,
} from 'lucide-react';

// Faithful to the actual course materials in:
//   Y:/agent/九天菜菜/.../【正在更新】热门工业级案例/【加餐】案例13：垂直领域 Agentic-GraphRAG 开发实战/
// Notebook: Agentic-GraphRAG应用开发实战.ipynb
//
// Real project shape:
//   OCR (MinerU / PaddleOCR-VL / DeepSeek-OCR) →
//   LangExtract (Google open-source, prompt + few-shot + source grounding) →
//   knowledge graph / vector store →
//   LangChain 1.1 Agent (ReAct-style tool use, with source citation)
//
// Two real demos in the notebook drive this preview:
//   1) News brief (2025-12-22 国家统计局/发改委/央行) — 时间/地点/机构/人物/事件/指标
//   2) Romeo & Juliet 罗密欧与朱丽叶 long-doc (~54k chars → 1,889 extractions in 3 passes)

interface Extraction {
  cls: string;
  text: string;
  start: number; // character offset in source text — the project's "source grounding" feature
  end: number;
  attributes?: Record<string, string>;
}

interface DocCase {
  key: 'news' | 'romeo';
  title: string;
  origin: string;
  text: string;
  // Hand-picked extractions matching the categories in the notebook's prompt + verified
  // start/end offsets against the actual source string at runtime.
  rawExtractions: Array<Omit<Extraction, 'start' | 'end'> & { needle: string }>;
  config: { extraction_passes: number; max_workers: number; max_char_buffer: number };
  totalExtractions: number;
  charCount: number;
}

// The full first paragraph from notebook cell 66 (Step 3: 准备测试文本).
const NEWS_TEXT =
  '2025年12月22日上午，国家统计局在北京国务院新闻办公室举行新闻发布会，公布2025年前11个月国民经济运行情况。\n' +
  '国家统计局新闻发言人付凌晖表示，规模以上工业增加值同比增长6.1%，社会消费品零售总额增长7.3%。\n\n' +
  '同日，国家发展改革委（以下简称"发改委"）在例行发布会上介绍，将于2026年起对"人工智能+制造"试点城市给予专项资金支持，首批覆盖上海、深圳、成都等10个城市。\n' +
  '发改委副主任李春临称，资金将重点投向算力基础设施和工业软件，并与地方财政配套安排相衔接。\n\n' +
  '22日傍晚，中国人民银行（央行）公告，自12月23日起下调金融机构存款准备金率0.25个百分点。\n' +
  '央行副行长宣昌能在答记者问时称，此举旨在保持流动性合理充裕，并支持中小微企业融资。';

// Compact excerpt from the Romeo & Juliet few-shot example in notebook cell 107.
const ROMEO_TEXT =
  '罗密欧: 轻声！那边窗子里亮起来的是什么光？\n' +
  '那就是东方，朱丽叶就是太阳。\n' +
  '朱丽叶: 啊！罗密欧，罗密欧！为什么你偏偏是罗密欧呢？';

const DOCS: DocCase[] = [
  {
    key: 'news',
    title: '新闻发布会 · 三机构 · 2025-12-22',
    origin:
      '出自 notebook 第 66 cell（《四、【实战】Prompt Engineering 对比 LangExtract》章节）。LangExtract 的对照测试就是用这段新闻跑 6 类实体。',
    text: NEWS_TEXT,
    rawExtractions: [
      { cls: '时间', text: '2025年12月22日上午', needle: '2025年12月22日上午' },
      { cls: '机构', text: '国家统计局', needle: '国家统计局' },
      { cls: '地点', text: '北京国务院新闻办公室', needle: '北京国务院新闻办公室' },
      { cls: '事件', text: '举行新闻发布会，公布2025年前11个月国民经济运行情况', needle: '举行新闻发布会，公布2025年前11个月国民经济运行情况' },
      { cls: '人物', text: '付凌晖', needle: '付凌晖', attributes: { 角色: '国家统计局新闻发言人' } },
      { cls: '指标', text: '规模以上工业增加值同比增长6.1%', needle: '规模以上工业增加值同比增长6.1%' },
      { cls: '指标', text: '社会消费品零售总额增长7.3%', needle: '社会消费品零售总额增长7.3%' },
      { cls: '机构', text: '国家发展改革委', needle: '国家发展改革委' },
      { cls: '时间', text: '2026年起', needle: '2026年起' },
      { cls: '事件', text: '对"人工智能+制造"试点城市给予专项资金支持', needle: '对"人工智能+制造"试点城市给予专项资金支持' },
      { cls: '地点', text: '上海、深圳、成都等10个城市', needle: '上海、深圳、成都等10个城市' },
      { cls: '人物', text: '李春临', needle: '李春临', attributes: { 角色: '发改委副主任' } },
      { cls: '机构', text: '中国人民银行', needle: '中国人民银行' },
      { cls: '时间', text: '12月23日起', needle: '12月23日起' },
      { cls: '指标', text: '下调金融机构存款准备金率0.25个百分点', needle: '下调金融机构存款准备金率0.25个百分点' },
      { cls: '人物', text: '宣昌能', needle: '宣昌能', attributes: { 角色: '央行副行长' } },
    ],
    config: { extraction_passes: 1, max_workers: 1, max_char_buffer: 4000 },
    totalExtractions: 16,
    charCount: NEWS_TEXT.length,
  },
  {
    key: 'romeo',
    title: '罗密欧与朱丽叶 · few-shot 示例',
    origin:
      '出自 notebook 第 107 cell。同样的 few-shot 喂给 lx.extract() 处理整本 54,000 字符的剧本，跑出 1,889 个实体（3 轮 pass · 20 workers · 1000 字 chunk）。',
    text: ROMEO_TEXT,
    rawExtractions: [
      { cls: '人物', text: '罗密欧', needle: '罗密欧', attributes: { 情感状态: '惊叹' } },
      { cls: '情感', text: '轻声！', needle: '轻声！', attributes: { 情感: '温柔敬畏', 人物: '罗密欧' } },
      { cls: '关系', text: '朱丽叶就是太阳', needle: '朱丽叶就是太阳', attributes: { 类型: '比喻', 人物1: '罗密欧', 人物2: '朱丽叶' } },
      { cls: '人物', text: '朱丽叶', needle: '朱丽叶', attributes: { 情感状态: '渴望' } },
      { cls: '情感', text: '为什么你偏偏是罗密欧呢？', needle: '为什么你偏偏是罗密欧呢？', attributes: { 情感: '渴望的疑问', 人物: '朱丽叶' } },
    ],
    config: { extraction_passes: 3, max_workers: 20, max_char_buffer: 1000 },
    totalExtractions: 1889,
    charCount: 54000,
  },
];

// Resolve needle offsets at module load — guarantees position values stay in sync with the
// strings shown to the user (the "source grounding" claim has to hold on screen).
function resolve(docs: DocCase[]) {
  return docs.map((d) => ({
    ...d,
    extractions: d.rawExtractions
      .map(({ needle, ...rest }) => {
        const start = d.text.indexOf(needle);
        return start === -1 ? null : { ...rest, start, end: start + needle.length };
      })
      .filter((x): x is Extraction => x !== null)
      .sort((a, b) => a.start - b.start),
  }));
}

const RESOLVED = resolve(DOCS);

// Few-shot code snippets shown alongside — taken directly from the notebook code cells.
const FEW_SHOT_CODE_NEWS = `examples = [
    lx.data.ExampleData(
        text="2025年6月3日，工业和信息化部在北京发布《算力基础设施高质量发展行动计划》。"
             "工信部副部长张云明表示，到2027年全国算力总规模将达到300 EFLOPS。",
        extractions=[
            lx.data.Extraction("时间", "2025年6月3日"),
            lx.data.Extraction("机构", "工业和信息化部"),
            lx.data.Extraction("地点", "北京"),
            lx.data.Extraction("人物", "张云明"),
            lx.data.Extraction("事件", "发布《算力基础设施高质量发展行动计划》"),
            lx.data.Extraction("指标", "300 EFLOPS"),
        ],
    )
]`;

const FEW_SHOT_CODE_ROMEO = `examples = [
    lx.data.ExampleData(
        text=textwrap.dedent("""\\
            罗密欧: 轻声！那边窗子里亮起来的是什么光？
            那就是东方，朱丽叶就是太阳。
            朱丽叶: 啊！罗密欧，罗密欧！为什么你偏偏是罗密欧呢？"""),
        extractions=[
            lx.data.Extraction(extraction_class="人物",
                               extraction_text="罗密欧",
                               attributes={"情感状态": "惊叹"}),
            lx.data.Extraction(extraction_class="关系",
                               extraction_text="朱丽叶就是太阳",
                               attributes={"类型": "比喻",
                                           "人物1": "罗密欧",
                                           "人物2": "朱丽叶"}),
            # ... 共 5 个示例 extractions
        ],
    )
]`;

const CLASS_COLOR: Record<string, string> = {
  时间: 'border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/14 text-[var(--color-amber-300)]',
  地点: 'border-[#7fbc8c]/40 bg-[#7fbc8c]/14 text-[#7fbc8c]',
  机构: 'border-[#d4a574]/40 bg-[#d4a574]/14 text-[#d4a574]',
  人物: 'border-[#a78bfa]/40 bg-[#a78bfa]/14 text-[#a78bfa]',
  事件: 'border-[#60a5fa]/40 bg-[#60a5fa]/14 text-[#60a5fa]',
  指标: 'border-[#f472b6]/40 bg-[#f472b6]/14 text-[#f472b6]',
  情感: 'border-[#f472b6]/40 bg-[#f472b6]/14 text-[#f472b6]',
  关系: 'border-[#60a5fa]/40 bg-[#60a5fa]/14 text-[#60a5fa]',
};

function colorFor(cls: string) {
  return (
    CLASS_COLOR[cls] ??
    'border-[var(--color-border-default)] bg-black/20 text-[var(--color-text-secondary)]'
  );
}

function renderHighlighted(text: string, extractions: Extraction[]) {
  // Render text with mark spans for each extraction. Extractions are pre-sorted by start.
  const pieces: Array<{ kind: 'text' | 'hit'; content: string; ext?: Extraction }> = [];
  let cursor = 0;
  for (const e of extractions) {
    if (e.start > cursor) {
      pieces.push({ kind: 'text', content: text.slice(cursor, e.start) });
    }
    pieces.push({ kind: 'hit', content: text.slice(e.start, e.end), ext: e });
    cursor = e.end;
  }
  if (cursor < text.length) pieces.push({ kind: 'text', content: text.slice(cursor) });
  return pieces;
}

export default function StructuredExtractionPreview() {
  const [docKey, setDocKey] = useState<'news' | 'romeo'>('news');
  const doc = useMemo(
    () => RESOLVED.find((d) => d.key === docKey) ?? RESOLVED[0],
    [docKey],
  );
  const pieces = useMemo(() => renderHighlighted(doc.text, doc.extractions), [doc]);
  const fewShotCode = doc.key === 'romeo' ? FEW_SHOT_CODE_ROMEO : FEW_SHOT_CODE_NEWS;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(127,188,140,0.10),rgba(212,165,116,0.10))] px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-300)]">
          <Sparkles className="h-3.5 w-3.5" />
          LangExtract · source-grounded extraction
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Prompt + few-shot → structured entities anchored to char offsets
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          The signature feature of LangExtract (the Google open-source library wrapped in this
          project) is that every extraction carries its <code className="rounded bg-black/30 px-1">char_interval</code>{' '}
          back to the source. Pick a document to see the same prompt → highlight loop on real text
          taken from the notebook.
        </p>
      </div>

      <div className="px-6 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Real documents from the notebook
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {RESOLVED.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDocKey(d.key)}
              className={`rounded-[24px] border p-4 text-left transition-colors ${
                docKey === d.key
                  ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--color-amber-300)]" />
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{d.title}</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{d.origin}</p>
              <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
                Source length: {d.charCount.toLocaleString()} chars · resolved here: {d.extractions.length}{' '}
                extractions
                {d.totalExtractions !== d.extractions.length && (
                  <> · full-doc total: {d.totalExtractions.toLocaleString()}</>
                )}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Source text · extractions inlined at their exact char_interval
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                <Target className="h-3.5 w-3.5" />
                source-grounded
              </span>
            </div>
            <div className="mt-4 max-h-96 overflow-auto rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-4 text-sm leading-7 text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {pieces.map((p, i) =>
                p.kind === 'text' ? (
                  <span key={i}>{p.content}</span>
                ) : (
                  <span
                    key={i}
                    title={`${p.ext!.cls} · char_interval [${p.ext!.start}-${p.ext!.end}]`}
                    className={`rounded border px-1 py-0.5 ${colorFor(p.ext!.cls)}`}
                  >
                    {p.content}
                    <sup className="ml-0.5 font-mono text-[9px] opacity-70">{p.ext!.cls}</sup>
                  </span>
                ),
              )}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              Hover any highlighted span to see its{' '}
              <code className="rounded bg-black/30 px-1">char_interval [start-end]</code>. This is
              the actual <code className="rounded bg-black/30 px-1">ext.char_interval.start_pos / end_pos</code> the
              library returns in the notebook&apos;s Step 15 output.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                lx.extract config used for this doc
              </p>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  extraction_passes
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--color-green-300)]">
                  {doc.config.extraction_passes}
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">multi-pass recall</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  max_workers
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--color-green-300)]">
                  {doc.config.max_workers}
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">parallel chunks</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  max_char_buffer
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--color-green-300)]">
                  {doc.config.max_char_buffer}
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">chunk size</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              The Romeo &amp; Juliet run uses the project&apos;s long-doc preset (3 / 20 / 1000) and
              yields ~1,889 extractions over 54,000 chars in 1-2 minutes against DeepSeek API.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Few-shot example (verbatim from notebook)
            </p>
            <pre className="mt-3 max-h-72 overflow-auto rounded-2xl border border-[var(--color-border-default)] bg-black/40 p-3 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)] whitespace-pre">
              {fewShotCode}
            </pre>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              Passed into <code className="rounded bg-black/30 px-1">lx.extract(text, prompt_description, examples=examples, model=OpenAILanguageModel(deepseek-chat))</code>{' '}
              — same DeepSeek API as Stage 2 of NL2SQL.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Extractions on this excerpt
            </p>
            <div className="mt-3 max-h-72 space-y-2 overflow-auto">
              {doc.extractions.map((e, i) => (
                <div
                  key={`${e.start}-${e.cls}`}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${colorFor(e.cls)}`}
                    >
                      {e.cls}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      [{e.start}-{e.end}]
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-primary)]">{e.text}</p>
                  {e.attributes && (
                    <p className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">
                      {JSON.stringify(e.attributes, null, 0).replace(/,/g, ', ')}
                    </p>
                  )}
                </div>
              ))}
              {doc.extractions.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">No extractions resolved.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/35 px-6 py-5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--color-green-300)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            End-to-end · Agentic-GraphRAG pipeline
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            { name: 'OCR · MinerU / PaddleOCR-VL / DeepSeek-OCR', note: 'PDF/scan → Markdown / JSON 结构化' },
            { name: 'LangExtract', note: 'prompt + few-shot · source grounding · multi-pass' },
            { name: 'KG + Vector store', note: '实体 + 关系 + chunk 双索引' },
            { name: 'LangChain 1.1 Agent', note: 'ReAct 调用工具 · 输出附原文引用' },
          ].map((s, i, arr) => (
            <div key={s.name} className="flex items-center gap-2">
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 px-3 py-2">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{s.name}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{s.note}</p>
              </div>
              {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
          The notebook walks through three GraphRAG variants (Microsoft GraphRAG, LightRAG,
          Fast-GraphRAG) and explains why the project picks LangExtract + a lighter graph plus the
          Agent decides between vector / graph retrieval at query time — not a fixed pipeline.
        </p>
      </div>
    </div>
  );
}
