export type ProjectCategory = 'platform' | 'document' | 'agent' | 'ml' | 'rl' | 'devtools';

export interface Project {
  slug?: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  category: ProjectCategory;
  tags: string[];
  github?: string;
  demo?: string;
  cover?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: 'multi-model-ai-studio',
    title: '多模型 AI Studio',
    title_en: 'Multi-Model AI Studio',
    description: '统一接入云端与本地大模型的全栈 AI 平台，支持会话、流式响应、多模态输入与批量推理。',
    description_en: 'A full-stack AI workspace that unifies hosted and self-hosted LLMs with chat, streaming responses, multimodal input, and batch inference.',
    category: 'platform',
    tags: ['React', 'TypeScript', 'FastAPI', 'SSE', 'LLM Platform'],
    github: 'https://github.com/fufankeji/FuFan-LLM-PlayGround',
    demo: '/demo/multi-model-ai-studio',
    cover: '/projects/multi-model-ai-studio/cover.svg',
    featured: true,
  },
  {
    slug: 'multimodal-document-rag-platform',
    title: '多模态文档 RAG 平台',
    title_en: 'Multimodal Document RAG Platform',
    description: '围绕 PDF 解析、向量检索和文档问答构建的多模态 RAG 系统，强调上传、检索和对话的一体化体验。',
    description_en: 'A multimodal RAG system for PDF parsing, vector retrieval, and document-grounded chat, built as one integrated upload-to-answer experience.',
    category: 'document',
    tags: ['React', 'FastAPI', 'LangChain', 'Milvus', 'RAG'],
    demo: '/demo/multimodal-document-rag-platform',
    cover: '/projects/multimodal-document-rag-platform/cover.svg',
    featured: true,
  },
  {
    slug: 'structured-extraction-retrieval-qa-platform',
    title: '结构化抽取与问答平台',
    title_en: 'Structured Extraction and Retrieval QA Platform',
    description: '把结构化信息抽取、向量检索与有依据问答整合在一起，适用于放射报告、药物信息、金融与新闻等文档场景。',
    description_en: 'A document intelligence platform that combines structured extraction, vector search, and grounded QA across radiology, medication, finance, and news workflows.',
    category: 'document',
    tags: ['FastAPI', 'Qdrant', 'Chroma', 'LangChain', 'DeepSeek'],
    cover: '/projects/structured-extraction-retrieval-qa-platform/cover.svg',
  },
  {
    slug: 'enterprise-nl2sql-fine-tuning-system',
    title: '企业私有化 NL2SQL 微调系统',
    title_en: 'Enterprise NL2SQL Fine-Tuning System',
    description: '从数据库元数据出发生成训练样本，配套数据构造、训练、校验与评估流程，用于企业私有化 SQL 问答能力建设。',
    description_en: 'An enterprise NL2SQL pipeline that generates schema-aware training data, then supports tuning, validation, and evaluation for natural-language SQL workflows.',
    category: 'ml',
    tags: ['LoRA', 'QLoRA', 'FastAPI', 'WebSocket', 'SQL'],
    cover: '/projects/enterprise-nl2sql-fine-tuning-system/cover.svg',
    featured: true,
  },
  {
    slug: 'rl-tuned-function-calling-agent-pipeline',
    title: '函数调用 Agent 偏好优化流水线',
    title_en: 'RL-Tuned Function-Calling Agent Pipeline',
    description: '围绕 function calling 代理构建数据生成、偏好对构造和评估流程，用于提升工具选择与参数调用质量。',
    description_en: 'A function-calling agent pipeline for preference data generation and evaluation, designed to improve tool selection and argument quality.',
    category: 'agent',
    tags: ['DPO', 'Function Calling', 'Evaluation', 'FastAPI', 'Agents'],
    cover: '/projects/rl-tuned-function-calling-agent-pipeline/cover.svg',
  },
  {
    title: 'OCR 驱动的 AI 数据分析系统',
    title_en: 'OCR-Powered AI Data Analysis System',
    description: '把 OCR 服务、结构化抽取与可视化分析衔接起来，让图像和 PDF 数据可以直接进入分析链路。',
    description_en: 'An OCR-driven analysis workflow that turns PDF and image content into structured extraction and visualization-ready data.',
    category: 'document',
    tags: ['DeepSeek-OCR', 'Async Batching', 'FastAPI', 'Analytics'],
  },
  {
    slug: 'qwen-vl-gspo-visual-rl',
    title: 'Qwen3-VL 视觉强化学习训练系统',
    title_en: 'Qwen3-VL Visual Reinforcement Learning System',
    description: '围绕 Qwen3-VL 8B 多模态模型构建的视觉强化学习训练管线，使用 GSPO 算法在视觉计数、OCR 和指代任务上做偏好优化。',
    description_en: 'An end-to-end visual reinforcement learning pipeline built around Qwen3-VL 8B, using GSPO to align the vision-language model on counting, OCR, and grounding tasks.',
    category: 'rl',
    tags: ['Qwen3-VL', 'GSPO', 'Reinforcement Learning', 'vLLM', 'PyTorch'],
    demo: '/demo/qwen-vl-gspo-visual-rl',
    cover: '/projects/qwen-vl-gspo-visual-rl/cover.svg',
    featured: true,
  },
  {
    slug: 'grpo-reasoning-trainer',
    title: 'GRPO 推理强化训练器',
    title_en: 'GRPO Reasoning Trainer',
    description: '复刻 DeepSeek-R1 论文里 GRPO 算法的训练管线，在数学推理、代码生成和思维链任务上做无 critic 的强化训练。',
    description_en: 'An implementation of the GRPO algorithm from DeepSeek-R1, used to RL-tune open-source LLMs on math, code, and chain-of-thought tasks without a separate critic.',
    category: 'rl',
    tags: ['PyTorch', 'GRPO', 'DeepSeek-R1', 'TRL', 'Reasoning'],
    demo: '/demo/grpo-reasoning-trainer',
    cover: '/projects/grpo-reasoning-trainer/cover.svg',
    featured: true,
  },
  {
    slug: 'ai-document-review-agent',
    title: 'AI 文档审核 Agent',
    title_en: 'AI Document Review Agent',
    description: '面向企业文档审核场景的 Agent 系统：上传合同、政策、技术规范，自动给出条款一致性、风险点和修改建议，所有结论都引用原文位置。',
    description_en: 'An enterprise document review agent: upload a contract, policy, or spec and receive structured findings on clause consistency, risk, and edit suggestions, each tied to a source location.',
    category: 'agent',
    tags: ['LangChain', 'FastAPI', 'React', 'PostgreSQL', 'Celery', 'Agent'],
    demo: '/demo/ai-document-review-agent',
    cover: '/projects/ai-document-review-agent/cover.svg',
    featured: true,
  },
  {
    slug: 'openclaw-skill-framework',
    title: 'OpenClaw Skill 开发框架',
    title_en: 'OpenClaw Skill Builder',
    description: '一套围绕 OpenClaw Skill 系统的工程化开发框架：scaffolding CLI、本地测试 harness、版本管理和 CI 校验。',
    description_en: 'An engineering toolkit for OpenClaw Skills: scaffolding CLI, local test harness, version management, and CI validation.',
    category: 'devtools',
    tags: ['OpenClaw', 'TypeScript', 'Bun', 'CLI', 'GitHub Actions'],
    demo: '/demo/openclaw-skill-framework',
    cover: '/projects/openclaw-skill-framework/cover.svg',
  },
  {
    slug: 'deep-research-agent',
    title: 'Deep Research Agent',
    title_en: 'Deep Research Agent',
    description: '面向研究者的自动调研 agent：拆解研究问题，并行检索 arXiv / Semantic Scholar / 网页，结构化笔记 + 交叉引用，产出带引用的综述初稿。',
    description_en: 'A research-survey agent: decompose a question, retrieve from arXiv / Semantic Scholar / web in parallel, build structured notes with cross-references, and emit a cited draft.',
    category: 'agent',
    tags: ['LangGraph', 'Tavily', 'arXiv', 'FastAPI', 'Pydantic', 'Agent'],
    demo: '/demo/deep-research-agent',
    cover: '/projects/deep-research-agent/cover.svg',
    featured: true,
  },
];
