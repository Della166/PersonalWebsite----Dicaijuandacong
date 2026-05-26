import type { ComponentType } from 'react';
import MultiModelStudioPreview from '@/components/mdx/MultiModelStudioPreview';
import MultimodalDocumentRagPreview from '@/components/mdx/MultimodalDocumentRagPreview';
import QwenVlGspoPreview from '@/components/mdx/QwenVlGspoPreview';
import GrpoReasoningPreview from '@/components/mdx/GrpoReasoningPreview';
import DocReviewAgentPreview from '@/components/mdx/DocReviewAgentPreview';
import OpenClawSkillPreview from '@/components/mdx/OpenClawSkillPreview';
import DeepResearchPreview from '@/components/mdx/DeepResearchPreview';

interface LocalizedText {
  en: string;
  zh: string;
}

interface LocalizedList {
  en: string[];
  zh: string[];
}

interface DemoHighlight {
  label: LocalizedText;
  value: LocalizedText;
}

export interface ProjectDemoDefinition {
  component: ComponentType;
  eyebrow: LocalizedText;
  summary: LocalizedText;
  localNote: LocalizedText;
  whatToTry: LocalizedList;
  whatItProves: LocalizedList;
  highlights: DemoHighlight[];
}

export const projectDemos = {
  'multi-model-ai-studio': {
    component: MultiModelStudioPreview,
    eyebrow: {
      en: 'Local preview mode',
      zh: '本地试玩模式',
    },
    summary: {
      en: 'A portfolio-safe sandbox that simulates provider switching, multimodal prompts, and streaming responses inside the site.',
      zh: '一个嵌在作品集站点里的安全试玩沙盒，用来模拟模型切换、多模态输入和流式响应体验。',
    },
    localNote: {
      en: 'This local version is intentionally capped: no private API keys, no live spend, and a stable scripted flow that lets recruiters feel the product shape immediately.',
      zh: '这个本地版本刻意做了边界控制：不暴露私有密钥、不产生真实调用成本，并用稳定脚本流程让招聘方快速感受到产品形态。',
    },
    whatToTry: {
      en: [
        'Switch between hosted and self-hosted providers without changing the operator surface.',
        'Open the vision preset to see how multimodal input fits the same workflow.',
        'Run the preview and watch the response stream in progressively.',
      ],
      zh: [
        '在不更换操作界面的前提下切换云端模型和本地模型。',
        '试试 vision 预设，看看多模态输入如何复用同一套产品流程。',
        '运行预览，观察回答如何以流式方式逐步返回。',
      ],
    },
    whatItProves: {
      en: [
        'You can package LLM capability into a full-stack product instead of a notebook demo.',
        'You understand adapter design, session state, and streaming UX at the application layer.',
        'You can present AI infrastructure decisions in a recruiter-friendly way.',
      ],
      zh: [
        '你能把 LLM 能力做成全栈产品，而不只是 Notebook 演示。',
        '你理解适配器抽象、会话状态和流式交互这些应用层设计。',
        '你能把 AI 基础设施选择转化成招聘方看得懂的产品表达。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'Unified workspace for hosted and local models', zh: '统一承载云端与本地模型的工作台' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Provider switching plus streaming output', zh: '模型切换与流式输出并存' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Applied AI product thinking with full-stack execution', zh: '全栈落地能力加 AI 产品思维' },
      },
    ],
  },
  'multimodal-document-rag-platform': {
    component: MultimodalDocumentRagPreview,
    eyebrow: {
      en: 'Grounded retrieval sandbox',
      zh: '检索问答试玩沙盒',
    },
    summary: {
      en: 'A guided preview that walks visitors through document selection, retrieval inspection, and grounded answering for multimodal RAG workflows.',
      zh: '一个带引导的试玩页，让访问者亲自体验文档选择、检索片段查看和有依据问答这条多模态 RAG 流程。',
    },
    localNote: {
      en: 'This local sandbox focuses on the strongest product signal: visible retrieval evidence. It is a better portfolio demo than exposing an unrestricted upload endpoint.',
      zh: '这个本地沙盒重点展示最能打动招聘方的信号：检索证据可见化。相比直接开放无限制上传接口，它更适合作品集演示。',
    },
    whatToTry: {
      en: [
        'Pick a sample document with a different structure and switch the question prompt.',
        'Run the preview and inspect which chunks the system retrieves first.',
        'Compare the retrieved evidence with the final cited answer.',
      ],
      zh: [
        '切换不同结构的样例文档，并更换问题提示词。',
        '运行预览，观察系统先检索到了哪些片段。',
        '对照检索证据和最终带引用的回答是否一致。',
      ],
    },
    whatItProves: {
      en: [
        'You understand document pipelines beyond simple chat over text embeddings.',
        'You can expose retrieval quality in a user-facing interface instead of hiding it.',
        'You know how to present multimodal RAG as a product workflow, not just a backend stack.',
      ],
      zh: [
        '你理解的不只是“向量聊天”，而是更完整的文档智能流程。',
        '你能把检索质量以用户可见的方式展现出来，而不是藏在后端里。',
        '你会把多模态 RAG 讲成产品工作流，而不只是后端技术栈。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'Document upload, retrieval inspector, grounded QA', zh: '文档进入、检索查看和有依据问答' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Chunk visibility before final answer', zh: '先看检索片段，再看最终回答' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Document AI product design with deployable architecture', zh: '文档智能产品设计和可部署架构意识' },
      },
    ],
  },
  'qwen-vl-gspo-visual-rl': {
    component: QwenVlGspoPreview,
    eyebrow: {
      en: 'GSPO training step replay',
      zh: 'GSPO 训练步骤复演',
    },
    summary: {
      en: 'A guided preview that walks through one GSPO group step on a real MathVista sample: rollout K=4 completions, score them with the format + correctness rewards, group-relative advantage, and the sequence-level update.',
      zh: '一个引导式预览，用真实 MathVista 样本走一次 GSPO 训练步：采样 K=4 个回答、用 format + correctness 两个奖励打分、组内 advantage、再做序列级更新。',
    },
    localNote: {
      en: 'The preview uses real samples from the project\'s held-out eval records (baseline/after_records.json) and the actual two-reward scoring. No live GPU inference on the portfolio host — the model is Qwen3-VL 8B in 4-bit, which belongs on a GPU, not a web server.',
      zh: '预览用的是项目真实的留出评估记录（baseline/after_records.json）里的样本，以及真实的双奖励打分。作品集服务器上不跑 GPU 推理——模型是 4bit 的 Qwen3-VL 8B，该放 GPU 上而不是 web 服务器。',
    },
    whatToTry: {
      en: [
        'Switch between three real MathVista samples: a wrong→correct case, a format-recovery case, and a stayed-wrong case.',
        'Run the step and inspect each of the K=4 candidates with its format (λ=0.3) and correctness (λ=1.0) reward.',
        'Watch the group-relative advantage, then see the before/after answer and the real 100-sample eval metrics.',
      ],
      zh: [
        '在三个真实 MathVista 样本间切换：前错后对、格式修复、以及训练后仍错的样本。',
        '运行训练步，查看 K=4 个候选各自的 format（λ=0.3）和 correctness（λ=1.0）奖励。',
        '观察组内 advantage，再看前后答案对照和真实的 100 样本评估指标。',
      ],
    },
    whatItProves: {
      en: [
        'You can run the modern LLM-RL stack (TRL GRPO/GSPO), not textbook PPO.',
        'You know how GSPO differs from GRPO — sequence-level importance sampling, one config flag.',
        'You report honest before/after metrics (acc 5%→6%, format 77%→84%) from auditable records, not a single hero number.',
      ],
      zh: [
        '你能跑通现代 LLM-RL 技术栈（TRL 的 GRPO/GSPO），不是教科书 PPO。',
        '你清楚 GSPO 和 GRPO 的区别——序列级重要性采样，一个配置开关。',
        '你给的是可审计记录里的真实前后指标（准确率 5%→6%、格式 77%→84%），不是单一漂亮数字。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'Unsloth 4-bit + LoRA · TRL GRPOTrainer · Qwen3-VL 8B', zh: 'Unsloth 4bit + LoRA · TRL GRPOTrainer · Qwen3-VL 8B' },
      },
      {
        label: { en: 'Rewards', zh: '奖励设计' },
        value: { en: 'format (λ=0.3, addCriterion penalty) + correctness (λ=1.0)', zh: 'format（λ=0.3，含 addCriterion 惩罚）+ correctness（λ=1.0）' },
      },
      {
        label: { en: 'Real result', zh: '真实结果' },
        value: { en: 'Format compliance 77% → 84% on held-out eval', zh: '留出评估格式合规率 77% → 84%' },
      },
    ],
  },
  'grpo-reasoning-trainer': {
    component: GrpoReasoningPreview,
    eyebrow: {
      en: 'GRPO training step replay',
      zh: 'GRPO 训练步骤复演',
    },
    summary: {
      en: 'A guided preview of one GRPO group step on a GSM8K problem: sample K completions from Qwen2.5-0.5B, score with the five reward functions, compute the group-relative advantage (no critic), update the policy.',
      zh: '一个引导式预览，用一道 GSM8K 题走一次 GRPO 组步：从 Qwen2.5-0.5B 采样 K 条、用 5 个奖励函数打分、算组内 advantage（无 critic）、更新 policy。',
    },
    localNote: {
      en: 'The preview uses GSM8K-style problems and the notebook\'s actual five reward functions. Real GRPO needs a GPU and the 0.5B base model (~17GB, hours on a 3090) — the replay shows the same mechanism without the cost.',
      zh: '预览用 GSM8K 风格题目和 notebook 里真实的 5 个奖励函数。真实 GRPO 需要 GPU + 0.5B 基座（约 17GB，3090 上数小时），复演保留同样机制但无运行成本。',
    },
    whatToTry: {
      en: [
        'Switch between the GSM8K problems and watch how the five reward functions score each completion.',
        'Note correctness (+2.0) dominates while the four format rewards shape the <reasoning>/<answer> structure.',
        'See the group mean act as the implicit baseline, then the before/after: bare answer → structured reasoning.',
      ],
      zh: [
        '切换 GSM8K 题目，看 5 个奖励函数怎么给每条候选打分。',
        '注意 correctness（+2.0）主导，4 个格式奖励负责塑形 <reasoning>/<answer> 结构。',
        '看组内均值充当隐式 baseline，再看前后对比：从直接给答案 → 结构化推理。',
      ],
    },
    whatItProves: {
      en: [
        'You can run the GRPO recipe behind DeepSeek-R1 end to end, on a model small enough to actually inspect.',
        'You can design a stack of verifiable reward functions and explain how each shapes behavior.',
        'You tell an honest story — demonstrating a mechanism on a 0.5B model, clear about what is and isn\'t claimed.',
      ],
      zh: [
        '你能把 DeepSeek-R1 的 GRPO 配方端到端跑通，而且选了个小到能真正看清楚的模型。',
        '你能设计一组可验证的奖励函数，并讲清每个怎么塑形行为。',
        '你讲的是诚实的故事——在 0.5B 上演示机制，明确说清楚claim 了什么、没claim 什么。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'TRL GRPOTrainer · Qwen2.5-0.5B · GSM8K · single GPU', zh: 'TRL GRPOTrainer · Qwen2.5-0.5B · GSM8K · 单卡' },
      },
      {
        label: { en: 'Rewards', zh: '奖励设计' },
        value: { en: '5 funcs: correctness + int + strict/soft format + xmlcount', zh: '5 个：correctness + int + strict/soft format + xmlcount' },
      },
      {
        label: { en: 'Real result', zh: '真实结果' },
        value: { en: 'Reward alone induces reasoning chains on a 0.5B model', zh: '仅靠奖励就让 0.5B 模型学会输出推理链' },
      },
    ],
  },
  'ai-document-review-agent': {
    component: DocReviewAgentPreview,
    eyebrow: {
      en: 'Document review sandbox',
      zh: '文档审核试玩沙盒',
    },
    summary: {
      en: 'A replay of a real review run on the bundled labor-contract sample: MinerU parses the PDF, then issues stream in over SSE — each tagged Grammar & Spelling or Definitive Language with risk, fix, and bounding box — and you accept or dismiss each through the HITL gate.',
      zh: '复演一次真实审核：MinerU 解析样本劳动合同，问题通过 SSE 流式出现——每条标注「语法拼写」或「绝对化表述」，带风险、修正建议、bbox——你再经 HITL 门 accept/dismiss。',
    },
    localNote: {
      en: 'The preview replays issues modeled on the real pipeline output; no live MinerU/DeepSeek calls and no private documents leave the sandbox. The running system needs a MinerU API key + a DeepSeek API key.',
      zh: '预览复演的是基于真实流水线输出建模的问题；不调真实 MinerU/DeepSeek，私有文档不外泄。真实系统运行需要 MinerU API key + DeepSeek API key。',
    },
    whatToTry: {
      en: [
        'Run the review and watch issues stream in over SSE as each chunk is processed.',
        'Note the two issue types — Grammar & Spelling (低) and Definitive Language (高) — and each issue\'s bounding box.',
        'Accept or dismiss each issue: the mutation goes through a LangChain human-in-the-loop gate and persists.',
      ],
      zh: [
        '运行审核，看问题随每个 chunk 处理通过 SSE 流式出现。',
        '注意两类问题——语法拼写（低）和绝对化表述（高）——以及每条的 bounding box。',
        'accept/dismiss 每条问题：变更经 LangChain 人工在环门确认并持久化。',
      ],
    },
    whatItProves: {
      en: [
        'You use LangChain v1.1 correctly — provider-based model init, PydanticOutputParser, framework-level HITL.',
        'You can ship full-stack: FastAPI + React/FluentUI + SQLite + SSE, front to back.',
        'You ground every issue to a real PDF location with a robust 3-level bounding-box fallback.',
      ],
      zh: [
        '你正确使用 LangChain v1.1——provider 初始化、PydanticOutputParser、框架级 HITL。',
        '你能交付全栈：FastAPI + React/FluentUI + SQLite + SSE，前后端打通。',
        '你把每条问题都定位到真实 PDF 位置，带 3 级 bounding-box 回退。',
      ],
    },
    highlights: [
      {
        label: { en: 'Stack', zh: '技术栈' },
        value: { en: 'FastAPI + React/FluentUI · LangChain v1.1 + DeepSeek · MinerU · SQLite', zh: 'FastAPI + React/FluentUI · LangChain v1.1 + DeepSeek · MinerU · SQLite' },
      },
      {
        label: { en: 'Issue types', zh: '问题类型' },
        value: { en: 'Grammar & Spelling (低) + Definitive Language (高) + custom rules', zh: '语法拼写（低）+ 绝对化表述（高）+ 自定义规则' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Real full-stack LangChain v1.1 system with HITL + bbox grounding', zh: '真·全栈 LangChain v1.1 系统，带 HITL 和 bbox 定位' },
      },
    ],
  },
  'openclaw-skill-framework': {
    component: OpenClawSkillPreview,
    eyebrow: {
      en: 'Author & run a Skill',
      zh: '编写并运行 Skill',
    },
    summary: {
      en: 'A walkthrough of authoring an OpenClaw Skill: the Daily Briefing SKILL.md from frontmatter to hot-load to routing to running, then the Lobster news-briefing pipeline pausing at its human-approval gate.',
      zh: '走一遍 OpenClaw Skill 的编写：Daily Briefing 的 SKILL.md 从 frontmatter → 热加载 → 路由 → 运行，再看 Lobster news-briefing 管线停在人工审批门。',
    },
    localNote: {
      en: 'The preview replays the SKILL.md authoring/loading model and a worked Daily Briefing example, plus an interactive Lobster approval gate. Source is course material on the OpenClaw Skill system, not a shipped runtime.',
      zh: '预览复演 SKILL.md 的编写/加载模型和一个完整的 Daily Briefing 实例，外加可交互的 Lobster 审批门。素材来自 OpenClaw Skill 系统的课件，非线上运行时。',
    },
    whatToTry: {
      en: [
        'Run the skill and follow SKILL.md from author → hot-load (~250ms) → route on "日报" → run.',
        'Read the real SKILL.md: the description is the routing signal; metadata.requires declares deps.',
        'Try the Lobster approval gate — approve or reject, and watch the conditional push step run or skip.',
      ],
      zh: [
        '运行 skill，跟着 SKILL.md 走：编写 → 热加载（~250ms）→ 命中「日报」路由 → 运行。',
        '读真实 SKILL.md：description 是路由信号，metadata.requires 声明依赖。',
        '试 Lobster 审批门——approve/reject，看条件 push 步骤运行还是跳过。',
      ],
    },
    whatItProves: {
      en: [
        'You understand the OpenClaw / Agent-Skills model: SKILL.md vs plugin vs channel, frontmatter routing, layered loading, token budget.',
        'You can author a real skill end to end: tight triggers + a supporting Bash script + references.',
        'You reach for structured orchestration (Lobster) with approval gates when free-form steps aren\'t reliable.',
      ],
      zh: [
        '你懂 OpenClaw / Agent-Skills 模型：SKILL.md vs plugin vs channel、frontmatter 路由、分层加载、token 预算。',
        '你能端到端写一个真 skill：精准触发 + 配套 Bash 脚本 + references。',
        '你在自由步骤不够可靠时，会用结构化编排（Lobster）+ 审批门。',
      ],
    },
    highlights: [
      {
        label: { en: 'Model', zh: '机制' },
        value: { en: 'SKILL.md (Markdown) teaches the agent — vs code plugins', zh: 'SKILL.md（Markdown）教 Agent——区别于代码插件' },
      },
      {
        label: { en: 'Worked example', zh: '完整实例' },
        value: { en: 'Daily Briefing skill: SKILL.md + collect-git-activity.sh', zh: 'Daily Briefing skill：SKILL.md + collect-git-activity.sh' },
      },
      {
        label: { en: 'Orchestration', zh: '编排' },
        value: { en: 'Lobster pipeline with a human-approval gate', zh: '带人工审批门的 Lobster 管线' },
      },
    ],
  },
  'deep-research-agent': {
    component: DeepResearchPreview,
    eyebrow: {
      en: 'Research pipeline replay',
      zh: '研究 pipeline 复演',
    },
    summary: {
      en: 'A replay of the Dify Deep Research workflow on a sample topic: the three-way intent gate, decomposition into subtopics, a ReAct agent that searches and extracts evidence per subtopic, source dedup with stable IDs, and a footnote-cited Markdown report.',
      zh: '复演 Dify Deep Research workflow：三路意图门、拆成子问题、ReAct Agent 逐子问题搜索抽取证据、稳定 sid 去重，最后输出带脚注引用的 Markdown 报告。',
    },
    localNote: {
      en: 'The preview replays the real graph\'s behavior; no live Dify/Tavily/LLM calls. The running workflow lives on the Dify platform and needs DeepSeek, Tongyi/Qwen, and Tavily API keys.',
      zh: '预览复演真实 graph 的行为；不调真实 Dify/Tavily/LLM。真实 workflow 跑在 Dify 平台上，需要 DeepSeek、通义/Qwen、Tavily 的 API key。',
    },
    whatToTry: {
      en: [
        'Run the workflow and follow the Dify graph: intent gate → decompose → research → accumulate → report.',
        'Watch the ReAct agent extract {claim, quote, confidence} per subtopic via Tavily search + extract.',
        'See URL→sid dedup (one source reused across subtopics) and the footnote-cited report.',
      ],
      zh: [
        '运行 workflow，跟着 Dify graph 走：意图门 → 拆解 → 检索 → 累计 → 报告。',
        '看 ReAct agent 用 Tavily 搜索+抽取，给每个子问题产出 {claim, quote, confidence}。',
        '观察 URL→sid 去重（一个来源跨子问题复用）和带脚注引用的报告。',
      ],
    },
    whatItProves: {
      en: [
        'You can design a non-trivial Dify workflow: branching intent control, iteration, code nodes, multi-model routing.',
        'You take evidence discipline seriously: claim+quote+confidence, stable source IDs, footnote citations.',
        'You know when low-code is the right tool — and can be honest that the value is the orchestration.',
      ],
      zh: [
        '你能设计复杂 Dify workflow：分支意图控制、迭代、代码节点、多模型路由。',
        '你重视证据纪律：claim+quote+confidence、稳定 sid、脚注引用。',
        '你知道何时低代码是对的工具，也能诚实说明价值在编排而非代码。',
      ],
    },
    highlights: [
      {
        label: { en: 'Platform', zh: '平台' },
        value: { en: 'Dify advanced-chat workflow · DeepSeek + Qwen3-max · Tavily', zh: 'Dify advanced-chat workflow · DeepSeek + Qwen3-max · Tavily' },
      },
      {
        label: { en: 'Graph', zh: '工作流' },
        value: { en: 'Intent gate → decompose → ReAct research → dedup → cited report', zh: '意图门 → 拆解 → ReAct 检索 → 去重 → 带引用报告' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Evidence-first agent workflow design in low-code', zh: '低代码里的证据优先 agent 工作流设计' },
      },
    ],
  },
} satisfies Record<string, ProjectDemoDefinition>;

export type ProjectDemoSlug = keyof typeof projectDemos;

export const projectDemoSlugs = Object.keys(projectDemos) as ProjectDemoSlug[];

export function isProjectDemoSlug(slug: string): slug is ProjectDemoSlug {
  return slug in projectDemos;
}
