'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  FileText,
  GitBranch,
  LoaderCircle,
  Network,
  Play,
  Quote,
  Search,
  Sparkles,
} from 'lucide-react';

type QuestionKey = 'rl-objectives' | 'rag-vlm' | 'agent-evals';
type StageKey = 'idle' | 'decompose' | 'retrieve' | 'extract' | 'crossref' | 'synthesize' | 'complete';

interface RetrievedSource {
  id: string;
  kind: 'arxiv' | 'semantic-scholar' | 'web';
  title: string;
  authors: string;
  year: number;
  venue: string;
}

interface StructuredNote {
  id: string;
  sourceId: string;
  claim: string;
  evidence: string;
  confidence: number;
}

interface CrossRefEdge {
  from: string;
  to: string;
  relation: 'supports' | 'contradicts' | 'extends';
  detail: string;
}

interface SynthesisSegment {
  text: string;
  citations: string[];
}

interface SampleQuestion {
  key: QuestionKey;
  question: string;
  summary: string;
  subQuestions: string[];
  sources: RetrievedSource[];
  notes: StructuredNote[];
  crossRefs: CrossRefEdge[];
  synthesis: SynthesisSegment[];
}

const sampleQuestions: SampleQuestion[] = [
  {
    key: 'rl-objectives',
    question: 'How do GRPO, GSPO, and DPO compare for long-sequence reasoning tasks?',
    summary: 'Comparative analysis of three preference optimization objectives on multi-step reasoning workloads.',
    subQuestions: [
      'What objective does each method optimize and how is the reward signal constructed?',
      'How do the methods scale with sequence length and group size?',
      'What benchmark evidence exists for long-form reasoning specifically?',
    ],
    sources: [
      {
        id: 's1',
        kind: 'arxiv',
        title: 'DPO: Your Language Model Is Secretly a Reward Model',
        authors: 'Rafailov et al.',
        year: 2023,
        venue: 'NeurIPS',
      },
      {
        id: 's2',
        kind: 'arxiv',
        title: 'GRPO: Group Relative Policy Optimization for Mathematical Reasoning',
        authors: 'Shao et al.',
        year: 2024,
        venue: 'arXiv:2402.03300',
      },
      {
        id: 's3',
        kind: 'arxiv',
        title: 'GSPO: Group Sequence Policy Optimization',
        authors: 'Yang et al.',
        year: 2025,
        venue: 'arXiv:2502.18789',
      },
      {
        id: 's4',
        kind: 'semantic-scholar',
        title: 'On the Token-Level Variance of Group Relative Estimators',
        authors: 'Liu and Chen',
        year: 2025,
        venue: 'TMLR',
      },
      {
        id: 's5',
        kind: 'semantic-scholar',
        title: 'Length Bias in Preference Optimization Revisited',
        authors: 'Park et al.',
        year: 2024,
        venue: 'ICLR',
      },
      {
        id: 's6',
        kind: 'web',
        title: 'Why GSPO Stabilizes Long-Form RL Training',
        authors: 'Qwen Team',
        year: 2025,
        venue: 'Qwen Engineering Blog',
      },
    ],
    notes: [
      {
        id: 'n1',
        sourceId: 's1',
        claim: 'DPO replaces the explicit reward model with a closed-form preference loss derived from a Bradley-Terry assumption.',
        evidence: 'The paper shows the DPO loss can be derived directly from pairwise preferences without training a separate reward model.',
        confidence: 0.92,
      },
      {
        id: 'n2',
        sourceId: 's2',
        claim: 'GRPO estimates advantages from group-relative rewards and removes the value network entirely.',
        evidence: 'Advantages are computed by subtracting the mean reward of K sampled completions per prompt, then normalized by group standard deviation.',
        confidence: 0.9,
      },
      {
        id: 'n3',
        sourceId: 's3',
        claim: 'GSPO replaces the token-level importance ratio with a sequence-level ratio to reduce variance on long generations.',
        evidence: 'The sequence-level ratio collapses per-token noise into one term per trajectory, which the authors connect to lower gradient variance.',
        confidence: 0.88,
      },
      {
        id: 'n4',
        sourceId: 's4',
        claim: 'Token-level GRPO advantages exhibit variance that grows roughly linearly with sequence length on long-form math tasks.',
        evidence: 'Empirical curves in Section 4 show variance growth matching the predicted O(T) bound under their group-relative estimator.',
        confidence: 0.81,
      },
    ],
    crossRefs: [
      {
        from: 'n3',
        to: 'n4',
        relation: 'supports',
        detail: 'GSPO motivation matches the variance growth GRPO exhibits in Liu and Chen.',
      },
      {
        from: 'n2',
        to: 'n3',
        relation: 'extends',
        detail: 'GSPO keeps the group-relative advantage idea from GRPO but replaces the ratio granularity.',
      },
      {
        from: 'n1',
        to: 'n2',
        relation: 'contradicts',
        detail: 'DPO sidesteps the rollout and reward structure that GRPO depends on, so they are not drop-in replacements.',
      },
    ],
    synthesis: [
      {
        text: 'On long-sequence reasoning workloads the three objectives sit on a spectrum defined by how much rollout structure they retain.',
        citations: ['n1', 'n2'],
      },
      {
        text: 'DPO collapses preferences into a closed-form loss with no rollout, GRPO keeps the rollout but replaces the value network with a group-relative baseline, and GSPO inherits the GRPO group structure while moving the importance ratio to the sequence level.',
        citations: ['n1', 'n2', 'n3'],
      },
      {
        text: 'Independent analysis confirms that the token-level ratio used by GRPO accumulates variance with sequence length, which is the specific failure mode GSPO is designed to address.',
        citations: ['n3', 'n4'],
      },
    ],
  },
  {
    key: 'rag-vlm',
    question: 'What are the current best practices for retrieval-augmented vision-language models?',
    summary: 'Survey of multimodal RAG techniques across encoders, indexes, and grounding strategies.',
    subQuestions: [
      'Which encoders are commonly used for image-text joint retrieval at scale?',
      'How are retrieval results fused into the VLM context window?',
      'What evaluation suites measure grounding faithfulness specifically for VLM RAG?',
    ],
    sources: [
      {
        id: 's1',
        kind: 'arxiv',
        title: 'Re-Imagen: Retrieval-Augmented Text-to-Image Generation',
        authors: 'Chen et al.',
        year: 2023,
        venue: 'ICLR',
      },
      {
        id: 's2',
        kind: 'arxiv',
        title: 'MuRAG: Multimodal Retrieval-Augmented Generation',
        authors: 'Chen et al.',
        year: 2022,
        venue: 'EMNLP',
      },
      {
        id: 's3',
        kind: 'arxiv',
        title: 'ColPali: Efficient Document Retrieval with Vision Language Models',
        authors: 'Faysse et al.',
        year: 2024,
        venue: 'arXiv:2407.01449',
      },
      {
        id: 's4',
        kind: 'semantic-scholar',
        title: 'Visual Grounding Faithfulness in Multimodal RAG',
        authors: 'Ramos and Singh',
        year: 2025,
        venue: 'CVPR',
      },
      {
        id: 's5',
        kind: 'semantic-scholar',
        title: 'Late Interaction Beats Single-Vector Retrieval for Document VQA',
        authors: 'Khattab et al.',
        year: 2024,
        venue: 'SIGIR',
      },
      {
        id: 's6',
        kind: 'web',
        title: 'Production Patterns for Multimodal RAG',
        authors: 'Vespa Engineering',
        year: 2025,
        venue: 'Vespa Blog',
      },
    ],
    notes: [
      {
        id: 'n1',
        sourceId: 's3',
        claim: 'ColPali demonstrates that patch-level VLM embeddings outperform OCR-then-text pipelines on visually rich documents.',
        evidence: 'On the ViDoRe benchmark, ColPali surpasses strong text-only baselines while removing the OCR preprocessing step.',
        confidence: 0.89,
      },
      {
        id: 'n2',
        sourceId: 's5',
        claim: 'Late interaction retrievers preserve token-level matches that single-vector encoders compress away.',
        evidence: 'The MaxSim operator over patch and token vectors recovers fine-grained matches on document VQA queries.',
        confidence: 0.87,
      },
      {
        id: 'n3',
        sourceId: 's2',
        claim: 'Fusing retrieved images directly into the VLM input outperforms text-only captions of those images.',
        evidence: 'MuRAG shows consistent gains when raw image tokens are appended instead of text summaries.',
        confidence: 0.84,
      },
      {
        id: 'n4',
        sourceId: 's4',
        claim: 'Grounding faithfulness for multimodal RAG requires evaluation suites that test image-grounded and text-grounded claims separately.',
        evidence: 'The proposed benchmark isolates failures where the generator cites the right image but the wrong caption, which prior suites collapsed.',
        confidence: 0.82,
      },
    ],
    crossRefs: [
      {
        from: 'n1',
        to: 'n2',
        relation: 'supports',
        detail: 'ColPali patch-level retrieval is a concrete instance of the late interaction pattern advocated in Khattab et al.',
      },
      {
        from: 'n3',
        to: 'n1',
        relation: 'extends',
        detail: 'MuRAG-style raw-image fusion complements ColPali-style retrieval at the index layer.',
      },
      {
        from: 'n4',
        to: 'n3',
        relation: 'contradicts',
        detail: 'Image fusion gains can hide grounding failures unless the evaluation suite measures them directly.',
      },
    ],
    synthesis: [
      {
        text: 'Current best practice for multimodal RAG converges on patch-level vision-language retrieval as the index layer.',
        citations: ['n1', 'n2'],
      },
      {
        text: 'Late interaction with MaxSim recovers the token-level matches that single-vector retrievers lose, and ColPali is the canonical instantiation on document VQA workloads.',
        citations: ['n1', 'n2'],
      },
      {
        text: 'At fusion time, appending raw image tokens consistently beats text summaries, but recent faithfulness benchmarks show that this fusion strategy can mask grounding errors unless evaluations test image and text claims separately.',
        citations: ['n3', 'n4'],
      },
    ],
  },
  {
    key: 'agent-evals',
    question: 'Which open-source LLM evaluation frameworks scale to multi-turn agent tasks?',
    summary: 'Comparison of evaluation harnesses that handle tool use, long horizons, and stateful environments.',
    subQuestions: [
      'Which frameworks natively support multi-turn tool-using agents?',
      'How do they handle stateful environments and reproducibility?',
      'What reporting granularity is available for step-level versus task-level success?',
    ],
    sources: [
      {
        id: 's1',
        kind: 'arxiv',
        title: 'AgentBench: Evaluating LLMs as Agents',
        authors: 'Liu et al.',
        year: 2023,
        venue: 'ICLR',
      },
      {
        id: 's2',
        kind: 'arxiv',
        title: 'tau-bench: Benchmarking Tool-Use Agents in Realistic Domains',
        authors: 'Yao et al.',
        year: 2024,
        venue: 'arXiv:2406.12045',
      },
      {
        id: 's3',
        kind: 'semantic-scholar',
        title: 'Inspect AI: A Framework for LLM Evaluation',
        authors: 'UK AISI',
        year: 2024,
        venue: 'Technical Report',
      },
      {
        id: 's4',
        kind: 'web',
        title: 'OpenAI Evals: Multi-Step Templates and Solvers',
        authors: 'OpenAI',
        year: 2024,
        venue: 'GitHub Documentation',
      },
      {
        id: 's5',
        kind: 'semantic-scholar',
        title: 'SWE-bench Verified: Reliable Software Engineering Evaluation',
        authors: 'Jimenez et al.',
        year: 2024,
        venue: 'arXiv:2310.06770',
      },
      {
        id: 's6',
        kind: 'web',
        title: 'Why Step-Level Metrics Matter for Agent Evals',
        authors: 'LangChain Engineering',
        year: 2025,
        venue: 'LangChain Blog',
      },
    ],
    notes: [
      {
        id: 'n1',
        sourceId: 's3',
        claim: 'Inspect AI provides first-class solver abstractions for multi-turn tool-using agents and ships sandboxed environments.',
        evidence: 'The framework defines Solver as a composable unit that wraps tool calls and state, with Docker-based sandboxes as the default execution layer.',
        confidence: 0.9,
      },
      {
        id: 'n2',
        sourceId: 's2',
        claim: 'tau-bench measures agent behavior against stateful business workflows with a user simulator instead of fixed transcripts.',
        evidence: 'Each task runs against a stateful database and a scripted user, so the agent must navigate dialogue and tool calls together.',
        confidence: 0.88,
      },
      {
        id: 'n3',
        sourceId: 's5',
        claim: 'SWE-bench Verified establishes reproducibility by gating evaluation on container-pinned test harnesses per task.',
        evidence: 'Each task ships with a Docker image and a fixed test suite, eliminating environment drift across runs.',
        confidence: 0.87,
      },
      {
        id: 'n4',
        sourceId: 's6',
        claim: 'Task-level success rates hide most agent failure modes that step-level traces would surface.',
        evidence: 'The post shows two agents with identical task-level scores diverging on retry counts, tool error rates, and intermediate state checks.',
        confidence: 0.78,
      },
    ],
    crossRefs: [
      {
        from: 'n1',
        to: 'n3',
        relation: 'supports',
        detail: 'Both frameworks treat container sandboxes as the route to reproducible multi-turn evaluation.',
      },
      {
        from: 'n2',
        to: 'n4',
        relation: 'extends',
        detail: 'tau-bench stateful user simulator is exactly the setting where step-level metrics become necessary.',
      },
      {
        from: 'n4',
        to: 'n2',
        relation: 'supports',
        detail: 'Step-level reporting is precisely what tau-bench-style benchmarks need to be diagnostic rather than scoreboard-only.',
      },
    ],
    synthesis: [
      {
        text: 'Among open-source evaluation harnesses, Inspect AI and tau-bench are the two that have made multi-turn agent evaluation a first-class concern rather than an afterthought.',
        citations: ['n1', 'n2'],
      },
      {
        text: 'Inspect AI contributes the solver abstraction and a sandboxed execution model, while tau-bench contributes stateful environments with simulated users that exercise dialogue and tools together.',
        citations: ['n1', 'n2'],
      },
      {
        text: 'Reproducibility in this regime is bought with container-pinned harnesses, as SWE-bench Verified demonstrates, and the most useful reporting granularity is step-level, since task-level success can conceal large differences in retries, tool errors, and intermediate state.',
        citations: ['n3', 'n4'],
      },
    ],
  },
];

const stageDefinitions: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string; icon: typeof Search }[] = [
  {
    key: 'decompose',
    label: 'Decompose',
    description: 'Split the research question into individually answerable sub-questions.',
    icon: GitBranch,
  },
  {
    key: 'retrieve',
    label: 'Retrieve',
    description: 'Query arXiv, Semantic Scholar, and Tavily in parallel and de-duplicate.',
    icon: Search,
  },
  {
    key: 'extract',
    label: 'Extract',
    description: 'Rewrite every source into a structured note with claim, evidence, and confidence.',
    icon: FileText,
  },
  {
    key: 'crossref',
    label: 'Cross-reference',
    description: 'Detect support and contradiction relationships between notes.',
    icon: Network,
  },
  {
    key: 'synthesize',
    label: 'Synthesize',
    description: 'Generate cited prose anchored to the note graph.',
    icon: Quote,
  },
];

const stageOrder: StageKey[] = ['idle', 'decompose', 'retrieve', 'extract', 'crossref', 'synthesize', 'complete'];

const sourceKindLabel: Record<RetrievedSource['kind'], string> = {
  arxiv: 'arXiv',
  'semantic-scholar': 'Semantic Scholar',
  web: 'Web',
};

const relationStyle: Record<CrossRefEdge['relation'], string> = {
  supports: 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/12 text-[var(--color-green-300)]',
  contradicts: 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12 text-[var(--color-amber-300)]',
  extends: 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40 text-[var(--color-text-secondary)]',
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function DeepResearchPreview() {
  const [activeKey, setActiveKey] = useState<QuestionKey>('rl-objectives');
  const [question, setQuestion] = useState(sampleQuestions[0].question);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleSubQuestionCount, setVisibleSubQuestionCount] = useState(0);
  const [visibleSourceCount, setVisibleSourceCount] = useState(0);
  const [visibleNoteCount, setVisibleNoteCount] = useState(0);
  const [visibleCrossRefCount, setVisibleCrossRefCount] = useState(0);
  const [visibleSynthesisCount, setVisibleSynthesisCount] = useState(0);
  const [hoveredCitation, setHoveredCitation] = useState<string | null>(null);

  const currentQuestion =
    sampleQuestions.find((item) => item.key === activeKey) ?? sampleQuestions[0];

  const handleQuestionSelect = (key: QuestionKey) => {
    const next = sampleQuestions.find((item) => item.key === key) ?? sampleQuestions[0];
    setActiveKey(key);
    setQuestion(next.question);
    setRunning(false);
    setStage('idle');
    setVisibleSubQuestionCount(0);
    setVisibleSourceCount(0);
    setVisibleNoteCount(0);
    setVisibleCrossRefCount(0);
    setVisibleSynthesisCount(0);
    setHoveredCitation(null);
  };

  useEffect(() => {
    if (!running) return;

    let cancelled = false;

    const run = async () => {
      setStage('decompose');
      setVisibleSubQuestionCount(0);
      setVisibleSourceCount(0);
      setVisibleNoteCount(0);
      setVisibleCrossRefCount(0);
      setVisibleSynthesisCount(0);

      for (let i = 0; i < currentQuestion.subQuestions.length; i += 1) {
        await wait(340);
        if (cancelled) return;
        setVisibleSubQuestionCount(i + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('retrieve');

      for (let i = 0; i < currentQuestion.sources.length; i += 1) {
        await wait(220);
        if (cancelled) return;
        setVisibleSourceCount(i + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('extract');

      for (let i = 0; i < currentQuestion.notes.length; i += 1) {
        await wait(360);
        if (cancelled) return;
        setVisibleNoteCount(i + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('crossref');

      for (let i = 0; i < currentQuestion.crossRefs.length; i += 1) {
        await wait(340);
        if (cancelled) return;
        setVisibleCrossRefCount(i + 1);
      }

      await wait(280);
      if (cancelled) return;
      setStage('synthesize');

      for (let i = 0; i < currentQuestion.synthesis.length; i += 1) {
        await wait(420);
        if (cancelled) return;
        setVisibleSynthesisCount(i + 1);
      }

      if (cancelled) return;
      setStage('complete');
      setRunning(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [currentQuestion, running]);

  const stageIndex = stageOrder.indexOf(stage);

  const notesById = new Map(currentQuestion.notes.map((note) => [note.id, note]));
  const sourcesById = new Map(currentQuestion.sources.map((source) => [source.id, source]));

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Preview
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              Run the research agent on a sample question
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Pick a research question, then watch the agent walk through decomposition, parallel
              retrieval, structured note extraction, cross-reference detection, and cited synthesis
              on a deterministic mock dataset.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Running research agent' : 'Run research agent'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Sample research questions
            </p>
            <div className="grid gap-3">
              {sampleQuestions.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleQuestionSelect(item.key)}
                  className={`rounded-[24px] border p-4 text-left transition-colors ${
                    activeKey === item.key
                      ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {item.question}
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                    {item.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Research question
              </p>
              <span className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                editable
              </span>
            </div>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="min-h-[88px] w-full resize-none rounded-2xl border border-[var(--color-border-default)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)] outline-none transition-colors focus:border-[var(--color-green-300)]/35"
            />
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Pipeline timeline
            </p>
            <div className="mt-4 space-y-3">
              {stageDefinitions.map((item, index) => {
                const Icon = item.icon;
                const itemIndex = stageOrder.indexOf(item.key);
                const isActive = stage === item.key;
                const isComplete = stageIndex > itemIndex;

                return (
                  <div
                    key={item.key}
                    className={`flex items-start gap-3 rounded-[22px] border p-3 transition-colors ${
                      isActive
                        ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                        : isComplete
                          ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10'
                          : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                    }`}
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-black/15 text-xs text-[var(--color-text-muted)]">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[var(--color-green-300)]" />
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {item.label}
                        </p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Sub-questions
              </p>
              <span className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleSubQuestionCount}/{currentQuestion.subQuestions.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {currentQuestion.subQuestions.slice(0, visibleSubQuestionCount).map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--color-border-default)] bg-black/10 px-3 py-2 text-sm leading-6 text-[var(--color-text-secondary)]"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10 text-xs text-[var(--color-amber-300)]">
                    Q{index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
              {visibleSubQuestionCount === 0 && (
                <p className="rounded-2xl border border-dashed border-[var(--color-border-default)] px-3 py-4 text-sm leading-6 text-[var(--color-text-muted)]">
                  Run the agent to watch the question split into searchable sub-questions.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Retrieved sources
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  arXiv, Semantic Scholar, web
                </h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleSourceCount}/{currentQuestion.sources.length}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {currentQuestion.sources.slice(0, visibleSourceCount).map((source) => (
                <div
                  key={source.id}
                  className="rounded-[20px] border border-[var(--color-border-default)] bg-black/10 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[var(--color-green-300)]" />
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {source.title}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--color-border-default)] px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                      {sourceKindLabel[source.kind]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {source.authors} · {source.year} · {source.venue}
                  </p>
                </div>
              ))}
              {visibleSourceCount === 0 && (
                <p className="rounded-2xl border border-dashed border-[var(--color-border-default)] px-3 py-4 text-sm leading-6 text-[var(--color-text-muted)]">
                  Parallel retrieval results will appear here once the agent fans out.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Structured notes
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Claim, evidence, confidence
                </h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleNoteCount}/{currentQuestion.notes.length}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {currentQuestion.notes.slice(0, visibleNoteCount).map((note) => {
                const source = sourcesById.get(note.sourceId);
                const isHovered = hoveredCitation === note.id;
                return (
                  <div
                    key={note.id}
                    className={`rounded-[22px] border p-4 transition-colors ${
                      isHovered
                        ? 'border-[var(--color-amber-300)]/45 bg-[var(--color-amber-300)]/12'
                        : 'border-[var(--color-border-default)] bg-black/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/8 px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-[var(--color-amber-300)]">
                        Note {note.id}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        confidence {note.confidence.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-text-primary)]">
                      {note.claim}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                      Evidence: {note.evidence}
                    </p>
                    {source && (
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                        Source: {source.authors}, {source.year}
                      </p>
                    )}
                  </div>
                );
              })}
              {visibleNoteCount === 0 && (
                <p className="rounded-2xl border border-dashed border-[var(--color-border-default)] px-3 py-4 text-sm leading-6 text-[var(--color-text-muted)]">
                  Each retrieved source will be rewritten into a structured note.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Cross-reference graph
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Support and contradiction edges
                </h4>
              </div>
              <Network className="h-4 w-4 text-[var(--color-green-300)]" />
            </div>
            <div className="mt-4 space-y-2">
              {currentQuestion.crossRefs.slice(0, visibleCrossRefCount).map((edge) => (
                <div
                  key={`${edge.from}-${edge.to}-${edge.relation}`}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 px-3 py-3"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-[var(--color-border-default)] bg-black/20 px-2 py-0.5 text-[var(--color-text-secondary)]">
                      {edge.from}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] ${relationStyle[edge.relation]}`}>
                      {edge.relation}
                    </span>
                    <span className="rounded-full border border-[var(--color-border-default)] bg-black/20 px-2 py-0.5 text-[var(--color-text-secondary)]">
                      {edge.to}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                    {edge.detail}
                  </p>
                </div>
              ))}
              {visibleCrossRefCount === 0 && (
                <p className="rounded-2xl border border-dashed border-[var(--color-border-default)] px-3 py-4 text-sm leading-6 text-[var(--color-text-muted)]">
                  Edges between notes will be inferred after extraction finishes.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Cited synthesis draft
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Hover a citation to inspect its note
                </h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {stage === 'complete' ? 'Ready' : stage === 'idle' ? 'Waiting' : 'Running'}
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              {visibleSynthesisCount === 0 ? (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  The final paragraph will appear here, anchored to specific notes by footnote-style citations.
                </p>
              ) : (
                <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {currentQuestion.synthesis.slice(0, visibleSynthesisCount).map((segment, index) => (
                    <p key={index}>
                      {segment.text}{' '}
                      {segment.citations.map((noteId, citationIndex) => {
                        const note = notesById.get(noteId);
                        const source = note ? sourcesById.get(note.sourceId) : undefined;
                        const tooltip = note && source
                          ? `${note.claim} — ${source.authors}, ${source.year}`
                          : noteId;
                        return (
                          <sup
                            key={`${index}-${noteId}-${citationIndex}`}
                            onMouseEnter={() => setHoveredCitation(noteId)}
                            onMouseLeave={() => setHoveredCitation(null)}
                            title={tooltip}
                            className={`mx-0.5 cursor-help rounded-md px-1 text-[11px] font-semibold transition-colors ${
                              hoveredCitation === noteId
                                ? 'bg-[var(--color-amber-300)]/25 text-[var(--color-amber-300)]'
                                : 'bg-[var(--color-green-300)]/15 text-[var(--color-green-300)] hover:bg-[var(--color-green-300)]/25'
                            }`}
                          >
                            [^{noteId}]
                          </sup>
                        );
                      })}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
