export type ProjectCategory = 'agent' | 'webapp' | 'miniapp' | 'other';

export interface Project {
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  category: ProjectCategory;
  tags: string[];
  github?: string;
  demo?: string;
  cover?: string;
}

export const projects: Project[] = [
  {
    title: 'AI 视频生成 Agent',
    title_en: 'AI Video Generation Agent',
    description: '基于多模态大模型的自动化视频生成 Agent，支持从文本到视频的端到端生成。',
    description_en: 'An automated video generation agent powered by multimodal LLMs, supporting end-to-end text-to-video generation.',
    category: 'agent',
    tags: ['Python', 'LLM', 'Video Generation', 'Agent'],
    github: 'https://github.com',
  },
  {
    title: '智能写作助手',
    title_en: 'Smart Writing Assistant',
    description: '基于 LLM 的智能写作助手，支持多种写作风格和自动排版。',
    description_en: 'An LLM-powered writing assistant with multiple writing styles and auto-formatting.',
    category: 'agent',
    tags: ['TypeScript', 'LLM', 'Next.js'],
    github: 'https://github.com',
    demo: 'https://demo.com',
  },
  {
    title: '个人作品集网站',
    title_en: 'Personal Portfolio',
    description: '科技感暖绿色主题的个人网站，内置内容管道和全平台发布系统。',
    description_en: 'A tech-inspired warm green portfolio with built-in content pipeline and cross-platform publishing.',
    category: 'webapp',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    github: 'https://github.com',
    demo: 'https://yoursite.com',
  },
  {
    title: 'AI 绘画小程序',
    title_en: 'AI Art Mini Program',
    description: '微信小程序，集成 Stable Diffusion 实现 AI 绘画功能。',
    description_en: 'A WeChat mini program integrating Stable Diffusion for AI art generation.',
    category: 'miniapp',
    tags: ['微信小程序', 'Python', 'Stable Diffusion'],
  },
  {
    title: '论文阅读助手',
    title_en: 'Paper Reading Assistant',
    description: '自动解析 arXiv 论文，生成结构化笔记和中文摘要。',
    description_en: 'Auto-parses arXiv papers to generate structured notes and summaries.',
    category: 'other',
    tags: ['Python', 'NLP', 'LLM'],
    github: 'https://github.com',
  },
];
