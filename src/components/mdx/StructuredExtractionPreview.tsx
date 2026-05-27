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

// Faithful to the actual source code in LangExtractApp.zip:
//   backend/app/scenarios/{radiology,medication,news,finance,medical,customer_service,sales}.py
//
// Each scenario is a BaseScenario subclass with: name, description, extract_classes,
// get_prompt(), get_examples() (real lx.data.ExampleData with attributes), get_samples().
//
// The 3 scenarios below — radiology, medication, news — are lifted verbatim from
// backend/app/scenarios/{radiology,medication,news}.py.  The sample texts are exactly
// what the project ships as rad_sample_2 / med_sample_2 / news_sample_1.

interface Extraction {
  cls: string;
  text: string;
  start: number;
  end: number;
  attributes?: Record<string, string>;
}

interface ScenarioCase {
  key: 'radiology' | 'medication' | 'news';
  scenarioName: string;
  description: string;
  extractClasses: string[];
  // sample id from get_samples() in the source
  sampleId: string;
  sampleTitle: string;
  text: string;
  rawExtractions: Array<Omit<Extraction, 'start' | 'end'> & { needle: string }>;
  // From config.py: long-doc preset
  config: { extraction_passes: number; max_workers: number; max_char_buffer: number };
}

const RAD_TEXT =
  '胸部X线检查报告\n\n' +
  '临床指征: 咳嗽1周，发热\n' +
  '检查技术: 胸部正侧位片\n\n' +
  '影像所见:\n' +
  '两肺纹理清晰，右下肺野见斑片状模糊影，边界不清。\n' +
  '两肺门影不大，纵隔居中，心影大小形态正常。\n' +
  '两膈面光滑，肋膈角锐利。\n' +
  '胸廓对称，骨质未见明显异常。\n\n' +
  '印象:\n' +
  '右下肺感染性病变可能，建议结合临床及实验室检查，必要时CT进一步检查';

const MED_TEXT =
  '处方\n\n' +
  '诊断: 社区获得性肺炎\n\n' +
  '1. 头孢曲松钠 2g 静脉滴注 每日1次 连续使用5-7天\n' +
  '2. 阿奇霉素片 500mg 口服 每日1次 连续使用3天\n' +
  '3. 氨溴索口服液 30mg 口服 每日3次 餐后服用\n' +
  '4. 布洛芬缓释胶囊 300mg 口服 发热时服用 每日不超过3次\n\n' +
  '备注: 如体温持续不退或症状加重，请及时复诊';

const NEWS_TEXT =
  '北京时间2024年12月20日，中国科学院在北京举行新闻发布会，宣布中国自主研发的量子计算机"九章三号"取得重大突破。\n\n' +
  '中科院院长侯建国在发布会上介绍，"九章三号"在特定任务上的计算速度达到了传统超级计算机的百万倍。这一成果由中国科学技术大学潘建伟团队历时五年研发完成。\n\n' +
  '清华大学物理系教授王向斌表示，这标志着中国在量子计算领域已处于世界领先地位。该成果已在《自然》杂志上发表。\n\n' +
  '据悉，下一步研究团队将继续优化系统性能，并探索量子计算在密码学、药物研发等领域的应用。';

const SCENARIOS: ScenarioCase[] = [
  {
    key: 'radiology',
    scenarioName: '放射学报告',
    description: '从医学影像报告中提取结构化信息，包括检查类型、临床指征、发现、印象等',
    extractClasses: ['检查类型', '临床指征', '检查技术', '发现', '印象', '建议'],
    sampleId: 'rad_sample_2',
    sampleTitle: '胸部X光报告',
    text: RAD_TEXT,
    rawExtractions: [
      { cls: '检查类型', text: '胸部X线检查报告', needle: '胸部X线检查报告', attributes: { 类型: 'X线' } },
      { cls: '临床指征', text: '咳嗽1周，发热', needle: '咳嗽1周，发热', attributes: { 类型: '主诉' } },
      { cls: '检查技术', text: '胸部正侧位片', needle: '胸部正侧位片', attributes: { 方法: '正侧位片' } },
      { cls: '发现', text: '两肺纹理清晰', needle: '两肺纹理清晰', attributes: { 部位: '两肺', significance: 'normal' } },
      { cls: '发现', text: '右下肺野见斑片状模糊影，边界不清', needle: '右下肺野见斑片状模糊影，边界不清', attributes: { 部位: '右下肺', significance: 'significant' } },
      { cls: '发现', text: '心影大小形态正常', needle: '心影大小形态正常', attributes: { 部位: '心脏', significance: 'normal' } },
      { cls: '印象', text: '右下肺感染性病变可能', needle: '右下肺感染性病变可能', attributes: { 序号: '1' } },
      { cls: '建议', text: '建议结合临床及实验室检查，必要时CT进一步检查', needle: '建议结合临床及实验室检查，必要时CT进一步检查', attributes: { 类型: '后续检查' } },
    ],
    config: { extraction_passes: 1, max_workers: 1, max_char_buffer: 1500 },
  },
  {
    key: 'medication',
    scenarioName: '药物信息',
    description: '从病历或处方中提取药物相关信息，包括药物名称、剂量、用法、频率、适应症等',
    extractClasses: ['药物', '剂量', '用法', '频率', '疗程', '适应症'],
    sampleId: 'med_sample_2',
    sampleTitle: '感染科处方',
    text: MED_TEXT,
    rawExtractions: [
      // The project's trick: use medication_group attribute to link "药物 ↔ 剂量 ↔ 频率 ↔ 用法 ↔ 疗程" for the same drug.
      { cls: '药物', text: '头孢曲松钠', needle: '头孢曲松钠', attributes: { medication_group: '头孢曲松钠' } },
      { cls: '剂量', text: '2g', needle: '2g', attributes: { medication_group: '头孢曲松钠' } },
      { cls: '用法', text: '静脉滴注', needle: '静脉滴注', attributes: { medication_group: '头孢曲松钠' } },
      { cls: '频率', text: '每日1次', needle: '每日1次', attributes: { medication_group: '头孢曲松钠' } },
      { cls: '疗程', text: '连续使用5-7天', needle: '连续使用5-7天', attributes: { medication_group: '头孢曲松钠' } },
      { cls: '药物', text: '阿奇霉素片', needle: '阿奇霉素片', attributes: { medication_group: '阿奇霉素片' } },
      { cls: '剂量', text: '500mg', needle: '500mg', attributes: { medication_group: '阿奇霉素片' } },
      { cls: '药物', text: '氨溴索口服液', needle: '氨溴索口服液', attributes: { medication_group: '氨溴索口服液' } },
      { cls: '药物', text: '布洛芬缓释胶囊', needle: '布洛芬缓释胶囊', attributes: { medication_group: '布洛芬缓释胶囊' } },
      { cls: '适应症', text: '社区获得性肺炎', needle: '社区获得性肺炎' },
    ],
    config: { extraction_passes: 1, max_workers: 1, max_char_buffer: 1500 },
  },
  {
    key: 'news',
    scenarioName: '新闻信息',
    description: '从新闻报道中提取结构化信息，包括人物、地点、机构、时间、事件等',
    extractClasses: ['人物', '地点', '机构', '时间', '事件'],
    sampleId: 'news_sample_1',
    sampleTitle: '科技新闻',
    text: NEWS_TEXT,
    rawExtractions: [
      { cls: '时间', text: '2024年12月20日', needle: '2024年12月20日', attributes: { 类型: '具体日期' } },
      { cls: '机构', text: '中国科学院', needle: '中国科学院', attributes: { 类型: '科研机构' } },
      { cls: '地点', text: '北京', needle: '在北京', attributes: { 类型: '城市' } },
      { cls: '事件', text: '量子计算机"九章三号"取得重大突破', needle: '量子计算机"九章三号"取得重大突破', attributes: { 类型: '科研突破' } },
      { cls: '人物', text: '侯建国', needle: '侯建国', attributes: { 职位: '中科院院长' } },
      { cls: '机构', text: '中国科学技术大学', needle: '中国科学技术大学', attributes: { 类型: '高校' } },
      { cls: '人物', text: '潘建伟', needle: '潘建伟', attributes: { 职位: '团队负责人', 所属机构: '中国科学技术大学' } },
      { cls: '机构', text: '清华大学物理系', needle: '清华大学物理系', attributes: { 类型: '高校院系' } },
      { cls: '人物', text: '王向斌', needle: '王向斌', attributes: { 职位: '教授', 所属机构: '清华大学物理系' } },
    ],
    config: { extraction_passes: 2, max_workers: 4, max_char_buffer: 2000 },
  },
];

function resolve(scenarios: ScenarioCase[]) {
  return scenarios.map((s) => ({
    ...s,
    extractions: s.rawExtractions
      .map(({ needle, ...rest }) => {
        const start = s.text.indexOf(needle);
        if (start === -1) return null;
        // For news "北京" we used needle "在北京" to disambiguate — trim back to extraction text length.
        return { ...rest, start: s.text.indexOf(rest.text, start), end: s.text.indexOf(rest.text, start) + rest.text.length };
      })
      .filter((x): x is Extraction => x !== null && x.start >= 0)
      .sort((a, b) => a.start - b.start),
  }));
}

const RESOLVED = resolve(SCENARIOS);

const ALL_SCENARIOS_IN_REPO = [
  { name: '放射学报告', file: 'scenarios/radiology.py' },
  { name: '药物信息', file: 'scenarios/medication.py' },
  { name: '新闻信息', file: 'scenarios/news.py' },
  { name: '金融分析', file: 'scenarios/finance.py' },
  { name: '中医药机制研究', file: 'scenarios/medical.py' },
  { name: '客服工单', file: 'scenarios/customer_service.py' },
  { name: '销售商机', file: 'scenarios/sales.py' },
] as const;

const CLASS_COLOR: Record<string, string> = {
  时间: 'border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/14 text-[var(--color-amber-300)]',
  地点: 'border-[#7fbc8c]/40 bg-[#7fbc8c]/14 text-[#7fbc8c]',
  机构: 'border-[#d4a574]/40 bg-[#d4a574]/14 text-[#d4a574]',
  人物: 'border-[#a78bfa]/40 bg-[#a78bfa]/14 text-[#a78bfa]',
  事件: 'border-[#60a5fa]/40 bg-[#60a5fa]/14 text-[#60a5fa]',
  指标: 'border-[#f472b6]/40 bg-[#f472b6]/14 text-[#f472b6]',
  检查类型: 'border-[#7fbc8c]/40 bg-[#7fbc8c]/14 text-[#7fbc8c]',
  临床指征: 'border-[#a78bfa]/40 bg-[#a78bfa]/14 text-[#a78bfa]',
  检查技术: 'border-[#60a5fa]/40 bg-[#60a5fa]/14 text-[#60a5fa]',
  发现: 'border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/14 text-[var(--color-amber-300)]',
  印象: 'border-[#f472b6]/40 bg-[#f472b6]/14 text-[#f472b6]',
  建议: 'border-[#d4a574]/40 bg-[#d4a574]/14 text-[#d4a574]',
  药物: 'border-[#a78bfa]/40 bg-[#a78bfa]/14 text-[#a78bfa]',
  剂量: 'border-[var(--color-amber-300)]/40 bg-[var(--color-amber-300)]/14 text-[var(--color-amber-300)]',
  用法: 'border-[#60a5fa]/40 bg-[#60a5fa]/14 text-[#60a5fa]',
  频率: 'border-[#7fbc8c]/40 bg-[#7fbc8c]/14 text-[#7fbc8c]',
  疗程: 'border-[#d4a574]/40 bg-[#d4a574]/14 text-[#d4a574]',
  适应症: 'border-[#f472b6]/40 bg-[#f472b6]/14 text-[#f472b6]',
};

function colorFor(cls: string) {
  return (
    CLASS_COLOR[cls] ??
    'border-[var(--color-border-default)] bg-black/20 text-[var(--color-text-secondary)]'
  );
}

function renderHighlighted(text: string, extractions: Extraction[]) {
  const pieces: Array<{ kind: 'text' | 'hit'; content: string; ext?: Extraction }> = [];
  let cursor = 0;
  // Filter overlapping (longer earlier wins).
  const kept: Extraction[] = [];
  let lastEnd = -1;
  for (const e of extractions) {
    if (e.start >= lastEnd) {
      kept.push(e);
      lastEnd = e.end;
    }
  }
  for (const e of kept) {
    if (e.start > cursor) pieces.push({ kind: 'text', content: text.slice(cursor, e.start) });
    pieces.push({ kind: 'hit', content: text.slice(e.start, e.end), ext: e });
    cursor = e.end;
  }
  if (cursor < text.length) pieces.push({ kind: 'text', content: text.slice(cursor) });
  return pieces;
}

export default function StructuredExtractionPreview() {
  const [key, setKey] = useState<'radiology' | 'medication' | 'news'>('radiology');
  const scenario = useMemo(
    () => RESOLVED.find((s) => s.key === key) ?? RESOLVED[0],
    [key],
  );
  const pieces = useMemo(
    () => renderHighlighted(scenario.text, scenario.extractions),
    [scenario],
  );

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(127,188,140,0.10),rgba(212,165,116,0.10))] px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-300)]">
          <Sparkles className="h-3.5 w-3.5" />
          LangExtractApp · 3 of 7 production scenarios
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Real scenarios shipped in <code className="rounded bg-black/30 px-1 text-2xl">backend/app/scenarios/</code>
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          The project actually ships <strong>7 BaseScenario subclasses</strong> — each defining{' '}
          <code className="rounded bg-black/30 px-1">extract_classes</code>,{' '}
          <code className="rounded bg-black/30 px-1">get_prompt()</code>,{' '}
          <code className="rounded bg-black/30 px-1">get_examples()</code>, and{' '}
          <code className="rounded bg-black/30 px-1">get_samples()</code>. The three highlighted
          below (radiology / medication / news) are lifted verbatim from the project&apos;s source;
          extraction positions are computed against the actual string so the highlights are real
          char offsets, not styling.
        </p>
      </div>

      <div className="px-6 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Production scenarios (toggle to switch)
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {RESOLVED.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setKey(s.key)}
              className={`rounded-[24px] border p-4 text-left transition-colors ${
                key === s.key
                  ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--color-amber-300)]" />
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {s.scenarioName}
                </h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{s.description}</p>
              <p className="mt-2 font-mono text-[10px] text-[var(--color-text-muted)]">
                extract_classes = [{s.extractClasses.map((c) => `"${c}"`).join(', ')}]
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
                Source · <code className="rounded bg-black/30 px-1">{scenario.sampleId}</code> · {scenario.sampleTitle}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                <Target className="h-3.5 w-3.5" />
                {scenario.extractions.length} extractions · source-grounded
              </span>
            </div>
            <div className="mt-4 max-h-96 overflow-auto rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-4 text-sm leading-7 text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {pieces.map((p, i) =>
                p.kind === 'text' ? (
                  <span key={i}>{p.content}</span>
                ) : (
                  <span
                    key={i}
                    title={`${p.ext!.cls} · char_interval [${p.ext!.start}-${p.ext!.end}]${p.ext!.attributes ? ' · ' + JSON.stringify(p.ext!.attributes) : ''}`}
                    className={`rounded border px-1 py-0.5 ${colorFor(p.ext!.cls)}`}
                  >
                    {p.content}
                    <sup className="ml-0.5 font-mono text-[9px] opacity-70">{p.ext!.cls}</sup>
                  </span>
                ),
              )}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              Hover any highlighted span: tooltip shows{' '}
              <code className="rounded bg-black/30 px-1">char_interval [start-end]</code> plus the
              real attributes returned by{' '}
              <code className="rounded bg-black/30 px-1">lx.data.Extraction(extraction_class, extraction_text, attributes)</code>.
              For the 药物信息 scenario notice the{' '}
              <code className="rounded bg-black/30 px-1">medication_group</code> attribute — it&apos;s the project&apos;s
              trick to link 药物 ↔ 剂量 ↔ 频率 ↔ 用法 ↔ 疗程 for the same drug.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-[var(--color-amber-300)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                lx.extract config (per scenario)
              </p>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  extraction_passes
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--color-green-300)]">
                  {scenario.config.extraction_passes}
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">multi-pass recall</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  max_workers
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--color-green-300)]">
                  {scenario.config.max_workers}
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">parallel chunks</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-default)] bg-black/15 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  max_char_buffer
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--color-green-300)]">
                  {scenario.config.max_char_buffer}
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">chunk size</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              All 7 scenarios shipped in repo
            </p>
            <div className="mt-3 grid gap-2">
              {ALL_SCENARIOS_IN_REPO.map((s) => (
                <div
                  key={s.file}
                  className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-sm ${
                    ['放射学报告', '药物信息', '新闻信息'].includes(s.name)
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10 text-[var(--color-green-300)]'
                      : 'border-[var(--color-border-default)] bg-black/10 text-[var(--color-text-secondary)]'
                  }`}
                >
                  <span>{s.name}</span>
                  <code className="font-mono text-[10px] text-[var(--color-text-muted)]">{s.file}</code>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
              Three (highlighted) are wired into this preview. Adding a new scenario means
              subclassing <code className="rounded bg-black/30 px-1">BaseScenario</code> — the
              base class lives at <code className="rounded bg-black/30 px-1">app/scenarios/base.py</code>.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Extractions on this excerpt
            </p>
            <div className="mt-3 max-h-72 space-y-2 overflow-auto">
              {scenario.extractions.map((e) => (
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
                  {e.attributes && Object.keys(e.attributes).length > 0 && (
                    <p className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">
                      attributes = {JSON.stringify(e.attributes)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/35 px-6 py-5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--color-green-300)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Real backend layout · LangExtractApp/backend/app/
          </p>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {[
            { path: 'main.py', note: 'FastAPI entry · uvicorn app.main:app --reload --port 8000' },
            { path: 'config.py', note: 'Settings: deepseek_api_key · vector_store_backend (chroma/qdrant) · dashscope_api_key (embeddings) · mineru_api_key (PDF OCR)' },
            { path: 'api/routes.py', note: '8 endpoints: /health · /scenarios{,_id,/samples} · /extract · /cache/{stats,delete}' },
            { path: 'api/rag_routes.py', note: '12 endpoints under /rag: pdf/{parse,upload,task/:id} · search · qa · qa/stream · chat · documents · extractions · stats · init' },
            { path: 'core/extractor.py', note: 'Extractor.extract(text, scenario_id, use_cache) · wraps lx.extract(fence_output=True, use_schema_constraints=False) · builds segments grouped by class with intervals[]' },
            { path: 'services/{vector_store,vector_store_chroma}.py', note: 'Real Qdrant ↔ Chroma switch · controlled by VECTOR_STORE_BACKEND env · same DocumentChunk schema' },
            { path: 'services/pdf_parser.py', note: 'MinerU API client · /rag/pdf/upload supports 200MB / 600 pages · markdown chunked by paragraph then indexed' },
            { path: 'services/qa_agent.py', note: 'LangChain Agent over the vector store · uses DeepSeek-chat · sources returned per answer span' },
            { path: 'scenarios/base.py', note: 'BaseScenario abstract class + ScenarioRegistry · the 7 subclasses register at import time' },
          ].map((f) => (
            <div
              key={f.path}
              className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-3"
            >
              <p className="font-mono text-[12px] text-[var(--color-amber-300)]">{f.path}</p>
              <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">{f.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            POST /rag/pdf/upload — production flow seen in rag_routes.py:197-319
          </p>
          <ol className="mt-3 space-y-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            <li>1. validate .pdf + size ≤ 200MB</li>
            <li>2. PDFParser.parse_uploaded_file(content, filename, model_version=&quot;vlm&quot;|&quot;pipeline&quot;, timeout=600) → MinerU returns markdown</li>
            <li>3. markdown.split(&quot;\n\n&quot;) → DocumentChunk[paragraph_index, source=&quot;pdf_upload&quot;]</li>
            <li>4. vector_store.add_chunks(chunks) → routed to Chroma (chroma_db/) or Qdrant by VECTOR_STORE_BACKEND</li>
            <li>5. optional: if extract_after_parse + scenario → run Extractor over the markdown → return extractions[] with char_interval</li>
            <li>6. response: PDFParseResponse(success, task_id, markdown, source, parse_time, extractions[])</li>
          </ol>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {[
            { name: 'MinerU (PDF→Markdown)', note: 'POST /rag/pdf/upload · 200MB/600p · vlm or pipeline mode' },
            { name: 'LangExtract', note: '7 scenarios · source grounding · cache.py de-dupe' },
            { name: 'Vector store (Qdrant or Chroma)', note: 'real env-switch: VECTOR_STORE_BACKEND=chroma|qdrant' },
            { name: 'DashScope embeddings', note: 'Tongyi/通义 embedding API for chunk vectors' },
            { name: 'QAAgent (LangChain)', note: '/rag/qa + /rag/qa/stream + /rag/chat (multi-turn)' },
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

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              ScenarioRegistry · how the 7 scenarios self-register
            </p>
            <pre className="mt-3 overflow-x-auto rounded-2xl border border-[var(--color-border-default)] bg-black/40 p-3 font-mono text-[11px] leading-5 text-[var(--color-text-secondary)]">
{`class BaseScenario(ABC):
    name: str = "基础场景"
    description: str = "场景描述"
    extract_classes: List[str] = []

    @abstractmethod
    def get_prompt(self) -> str: ...
    @abstractmethod
    def get_examples(self) -> List[lx.data.ExampleData]: ...
    def get_samples(self) -> List[Dict[str, str]]: return []

class ScenarioRegistry:
    _scenarios: Dict[str, Type[BaseScenario]] = {}

    @classmethod
    def register(cls, scenario_id, scenario_class): ...
    @classmethod
    def get(cls, scenario_id) -> BaseScenario: ...   # 抛 ValueError 未注册
    @classmethod
    def list_all(cls) -> Dict[str, Dict[str, Any]]:  # 给 /scenarios 端点用
        ...`}
            </pre>
            <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
              新场景 = 写 1 个 BaseScenario 子类 + 在模块顶层调一次{' '}
              <code className="rounded bg-black/30 px-1">ScenarioRegistry.register("scenario_id", MyScenario)</code> 即可。
              <code className="rounded bg-black/30 px-1">/scenarios</code> 端点直接返回 list_all() 结果。
            </p>
          </div>

          <div className="rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Qdrant vs Chroma · same interface, 2 deploy modes
            </p>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--color-border-default)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-black/15 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-3 py-2 font-semibold">aspect</th>
                    <th className="px-3 py-2 font-semibold">VectorStore (Qdrant)</th>
                    <th className="px-3 py-2 font-semibold">ChromaVectorStore</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {[
                    ['deploy mode', 'remote / :memory: fallback', 'local persistent only (chroma_db/)'],
                    ['env var', 'QDRANT_URL + QDRANT_API_KEY', 'CHROMA_PERSIST_DIR'],
                    ['client', 'qdrant_client.QdrantClient', 'chromadb.PersistentClient'],
                    ['distance', 'models.Distance.COSINE', 'hnsw:space=cosine (metadata)'],
                    ['recreate logic', 'init_collection(recreate=True) 删 + 重建', '删 collection + _init_collection()'],
                    ['embeddings', 'DashScope text-embedding-v4 · chunk_size=10', '同上 · 同一 OpenAIEmbeddings 实例'],
                    ['filter API', 'models.Filter / FieldCondition', 'where={"doc_id": {"$eq": ...}}'],
                  ].map((row, i) => (
                    <tr key={row[0]} className={`${i % 2 === 0 ? 'bg-transparent' : 'bg-black/5'} border-t border-[var(--color-border-default)]/60`}>
                      <td className="px-3 py-2 text-[var(--color-text-muted)]">{row[0]}</td>
                      <td className="px-3 py-2 font-mono text-[var(--color-text-secondary)]">{row[1]}</td>
                      <td className="px-3 py-2 font-mono text-[var(--color-text-secondary)]">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
              <code className="rounded bg-black/30 px-1">DocumentChunk</code> dataclass &amp;{' '}
              <code className="rounded bg-black/30 px-1">add_chunks() / search() / delete_by_doc_id()</code>{' '}
              的方法签名两边完全一致 — rag_routes.py 才能在
              <code className="rounded bg-black/30 px-1">backend.lower() == "chroma"</code> 处分支无缝切换。
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-[var(--color-border-default)] bg-black/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            QAAgent · services/qa_agent.py · 4 entry methods
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {[
              { name: 'search_context(query, top_k=5)', note: 'vector_store.search → List[{doc_id, doc_title, content, score, ...}]' },
              { name: 'format_context(results)', note: '拼成 "[来源 N] ..." 多段文本喂给 prompt' },
              { name: 'build_prompt(question, context, structured=True)', note: 'system: 「不要在回答中提及来源/文档/参考字眼，直接陈述」 + structured: 「总结一句 → • 分点带【关键词】 → 简短结论」' },
              { name: 'answer / answer_stream / chat', note: 'answer 一次性 LLM invoke；answer_stream 用 llm.stream 流式 yield；chat 多轮对话注入历史 messages' },
            ].map((m) => (
              <div key={m.name} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/40 p-3">
                <code className="font-mono text-[11px] text-[var(--color-amber-300)]">{m.name}</code>
                <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">{m.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-muted)]">
            response 包 <code className="rounded bg-black/30 px-1">{`{success, question, answer, sources[{doc_id, doc_title, content_preview, score}], context_count}`}</code>{' '}
            — sources 总是带回，前端可独立渲染「来源溯源」面板（即使 system prompt 让模型自己不要主动提及）。
          </p>
        </div>
      </div>
    </div>
  );
}
