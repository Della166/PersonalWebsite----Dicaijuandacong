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
      en: 'A guided preview that walks through one GSPO training step on Qwen3-VL: rollout, reward, group-relative advantage, and policy update.',
      zh: '一个引导式预览，把一次 GSPO 训练步骤拆给你看：rollout、reward、group-relative advantage、policy update。',
    },
    localNote: {
      en: 'This local preview replays captured rollouts on three preset tasks. Running real GPU inference on a portfolio host would be unreliable and would not be more informative than the captured replay.',
      zh: '这个本地预览复演的是预先采集好的 rollout 数据，覆盖三个预设任务。直接在作品集服务器上跑 GPU 推理既不稳又不会比复演更有说服力。',
    },
    whatToTry: {
      en: [
        'Switch between the counting, OCR, and grounding tasks to see how reward shaping differs.',
        'Run the step and inspect each of the K candidate completions and its reward breakdown.',
        'Watch the group-relative advantage compute and shift the answer after the policy update.',
      ],
      zh: [
        '在 counting / OCR / grounding 三个任务之间切换，观察奖励函数差异。',
        '运行训练步，查看 K 个候选回答和各自的奖励分解。',
        '看 group-relative advantage 怎么计算，policy update 后回答如何改变。',
      ],
    },
    whatItProves: {
      en: [
        'You can build modern LLM RL infrastructure beyond textbook PPO.',
        'You know how to design interpretable reward functions for distinct visual tasks.',
        'You think about RL training observability, not just final accuracy.',
      ],
      zh: [
        '你能搭建超越教科书 PPO 的现代 LLM RL 训练基础设施。',
        '你能为不同视觉任务设计可解释的奖励函数。',
        '你关心 RL 训练过程的可观测性，不只是最终准确率。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'Sampled group, reward bank, advantage, policy update', zh: '采样组、奖励组件、advantage、policy update' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Per-task reward shaping visible in front of the user', zh: '不同任务的 reward shaping 直接可见' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'End-to-end multimodal RL system thinking', zh: '完整的多模态 RL 系统思维' },
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
      en: 'A guided preview of one GRPO training step on a base LLM: sample K, score correctness / format / length, compute group-relative advantage, update the policy.',
      zh: '一个引导式预览，演示一次 GRPO 训练步骤：采样 K 条、用 correctness / format / length 打分、计算 group-relative advantage、更新 policy。',
    },
    localNote: {
      en: 'This preview replays captured completions on three preset prompts. Real GRPO requires a GPU and a base model — the captured replay shows the same mechanism without the cost.',
      zh: '这个预览复演的是预采集的候选回答，覆盖三个预设 prompt。真实 GRPO 需要 GPU + base 模型，复演保留了同样的机制但没有运行成本。',
    },
    whatToTry: {
      en: [
        'Switch between math, code, and chain-of-thought tasks to see different reward profiles.',
        'Run the step and inspect each candidate completion and its reward components.',
        'See group mean, std, and KL change as the policy updates against the reference.',
      ],
      zh: [
        '切换 math / code / CoT 三类任务，观察不同的奖励画像。',
        '运行训练步，查看每个候选和它的奖励组件。',
        '观察 policy 相对 reference 更新时 group mean、std、KL 的变化。',
      ],
    },
    whatItProves: {
      en: [
        'You understand the algorithm that powered DeepSeek-R1 well enough to reimplement it.',
        'You separate reward signals so they remain debuggable instead of collapsing into a single number.',
        'You can talk about RL training internals without hand-waving.',
      ],
      zh: [
        '你能把 DeepSeek-R1 背后的算法拆到能自己复现的程度。',
        '你能把奖励信号拆开，让训练过程可调试，而不是一个黑盒数字。',
        '你能不靠搪塞地讲清楚 RL 训练内部机制。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'K candidates, reward components, group advantage, KL trajectory', zh: 'K 个候选、奖励组件、group advantage、KL 轨迹' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Before / after policy answers on the same prompt', zh: '同一 prompt 在更新前后的输出对比' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Frontier reasoning-model RL implemented from first principles', zh: '从第一性原理实现前沿推理模型 RL' },
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
      en: 'A guided preview of the document review agent: pick a contract, policy, or handbook and watch the agent move from parse to overview to clause search to risk check to structured findings.',
      zh: '一个引导式文档审核 agent 预览：选合同 / 安全策略 / 员工手册，看 agent 走 parse → overview → clause search → risk check → structured findings 全流程。',
    },
    localNote: {
      en: 'This preview uses three preset documents with mock findings, so no private contracts ever leave the sandbox and the agent loop is deterministic to inspect.',
      zh: '这个预览用了三个预设文档和模拟 findings，私有合同不会离开沙盒，agent loop 也是确定性的，便于检查。',
    },
    whatToTry: {
      en: [
        'Pick a document type with a distinct review checklist (contract vs policy vs handbook).',
        'Run the agent and follow each stage in the activity log.',
        'Inspect the structured findings: severity, source location, and suggested fix.',
      ],
      zh: [
        '选择不同审核清单的文档类型（合同 / 安全策略 / 员工手册）。',
        '运行 agent，跟着 activity log 看每一步。',
        '查看结构化 findings：severity、来源位置、建议修改。',
      ],
    },
    whatItProves: {
      en: [
        'You can design an agent loop with clearly separated reasoning stages instead of a single mega-prompt.',
        'You treat evidence discipline (source citation per finding) as a product requirement, not an afterthought.',
        'You understand the production concerns around agent systems: async work, token budgets, fallbacks.',
      ],
      zh: [
        '你能把 agent loop 设计成多个清晰分离的推理阶段，而不是一个超大 prompt。',
        '你把证据纪律（每条 finding 都带来源引用）当成产品需求，而不是事后补丁。',
        '你理解 agent 系统的生产问题：异步任务、token 预算、降级策略。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'Document intake, 5-stage agent loop, structured findings', zh: '文档进入、5 阶段 agent loop、结构化 findings' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Every finding pinned to a source location', zh: '每条 finding 都对应到具体来源位置' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Production-shaped agent system with evidence discipline', zh: '带证据纪律的生产级 agent 系统' },
      },
    ],
  },
  'openclaw-skill-framework': {
    component: OpenClawSkillPreview,
    eyebrow: {
      en: 'Skill scaffold + validate',
      zh: 'Skill 脚手架 + 校验',
    },
    summary: {
      en: 'A guided preview of the OpenClaw Skill toolkit: pick a Skill template, run the scaffolding CLI, preview the generated SKILL.md, and see the local + CI validator produce its report.',
      zh: '一个 OpenClaw Skill 工具链的引导预览：选 Skill 模板、跑 scaffolding CLI、预览生成的 SKILL.md，再看本地 + CI 校验器输出报告。',
    },
    localNote: {
      en: 'This preview scripts a CLI session and a validator run on three sample skill templates. Running real OpenClaw inside the browser would not be more informative — the value here is the developer workflow shape, not the runtime.',
      zh: '这个预览模拟了 CLI 会话和三个示例 skill 模板的校验。直接在浏览器里跑 OpenClaw 没必要——价值在开发者工作流的形态，不在运行时本身。',
    },
    whatToTry: {
      en: [
        'Pick a Skill template (email triage, PR reviewer, release notes) with different trigger sets.',
        'Run the scaffold and watch the file tree stream into the terminal.',
        'Inspect the generated SKILL.md and the CI validator checks side by side.',
      ],
      zh: [
        '选择不同触发集的 Skill 模板（email triage / PR reviewer / release notes）。',
        '运行 scaffold，看文件树流式输出到终端。',
        '同时检查生成的 SKILL.md 和 CI 校验器的结果。',
      ],
    },
    whatItProves: {
      en: [
        'You think about agent ecosystems at the tooling layer, not just at the prompt layer.',
        'You design CLIs with predictable verbs, opinionated defaults, and useful error messages.',
        'You enforce quality through CI rather than relying on reviewer memory.',
      ],
      zh: [
        '你从工具链层面思考 agent 生态，而不只是 prompt 层。',
        '你的 CLI 设计有可预期的动词、合理的默认和有用的错误信息。',
        '你用 CI 来保证质量，而不是依赖 reviewer 记忆。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'CLI session, generated SKILL.md, CI validator report', zh: 'CLI 会话、生成的 SKILL.md、CI 校验器报告' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Same checks visible locally and in CI', zh: '本地和 CI 跑相同的检查' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Developer-experience design for AI agent platforms', zh: '面向 AI agent 平台的 DevEx 设计' },
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
      en: 'A guided preview of the Deep Research Agent: pick a research question, watch it decompose into sub-questions, retrieve sources in parallel, extract structured notes, cross-reference them, and emit a cited draft.',
      zh: 'Deep Research Agent 的引导预览：选研究问题，看 agent 拆解子问题、并行检索、抽取结构化笔记、交叉引用，最后给出带引用的初稿。',
    },
    localNote: {
      en: 'This preview replays a deterministic pipeline run on three sample research questions. The sources, notes, and synthesis are precomputed so the pipeline shape is easy to inspect without live API calls.',
      zh: '这个预览用了确定性的 pipeline 复演，覆盖三个示例研究问题。来源、笔记、综述都是预计算的，便于在不调真实 API 的前提下观察 pipeline 形态。',
    },
    whatToTry: {
      en: [
        'Pick a research question with a different shape (algorithm comparison, best practices, evaluation).',
        'Watch the parallel retrieval counts across arXiv, Semantic Scholar, and the open web.',
        'Inspect the cross-reference graph between structured notes and the cited draft that comes out of it.',
      ],
      zh: [
        '挑一个形态不同的研究问题（算法对比 / 最佳实践 / 评估）。',
        '观察 arXiv、Semantic Scholar、开放网三路并行检索的数量。',
        '查看结构化笔记之间的交叉引用图，以及由它生成的带引用初稿。',
      ],
    },
    whatItProves: {
      en: [
        'You can design multi-stage agent pipelines where each stage has a typed contract with the next.',
        'You force the agent to produce structured intermediate state so the final output stays auditable.',
        'You think about retrieval beyond a single API call: de-duplication, source preference, parallel sources.',
      ],
      zh: [
        '你能设计多阶段 agent pipeline，每一阶段对下一阶段都有类型化的契约。',
        '你强制 agent 产出结构化中间状态，让最终输出可审计。',
        '你对检索的思考超出单次 API 调用：去重、来源偏好、并行多源。',
      ],
    },
    highlights: [
      {
        label: { en: 'Surface', zh: '展示重点' },
        value: { en: 'Question decomposition, multi-source retrieval, cross-referenced synthesis', zh: '问题拆解、多源检索、交叉引用综述' },
      },
      {
        label: { en: 'Interaction', zh: '交互亮点' },
        value: { en: 'Every paragraph cited back to a note, every note cited back to a source', zh: '每段都引用回笔记，每条笔记都引用回来源' },
      },
      {
        label: { en: 'Best signal', zh: '最强信号' },
        value: { en: 'Production-shaped research agent with auditable contracts', zh: '带可审计契约的生产级研究 agent' },
      },
    ],
  },
} satisfies Record<string, ProjectDemoDefinition>;

export type ProjectDemoSlug = keyof typeof projectDemos;

export const projectDemoSlugs = Object.keys(projectDemos) as ProjectDemoSlug[];

export function isProjectDemoSlug(slug: string): slug is ProjectDemoSlug {
  return slug in projectDemos;
}
