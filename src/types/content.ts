/** Content category used in frontmatter (singular form) */
export type ContentCategory = 'blog' | 'project' | 'paper' | 'creative' | 'thought';

/** MDX content directory names (matches src/content/ subdirs) */
export type ContentDir = 'blog' | 'projects' | 'papers' | 'creative' | 'thoughts';

/** Maps ContentCategory to ContentDir for path resolution */
export const CATEGORY_TO_DIR: Record<ContentCategory, ContentDir> = {
  blog: 'blog',
  project: 'projects',
  paper: 'papers',
  creative: 'creative',
  thought: 'thoughts',
};

export type Platform = 'website' | 'wechat' | 'xiaohongshu' | 'douyin';

export type VideoPlatform = 'bilibili' | 'youtube' | 'direct';

export interface VideoEmbed {
  platform: VideoPlatform;
  id: string;
  title?: string;
}

/** Base frontmatter shared by all content types */
export interface ContentFrontmatter {
  title: string;
  title_en?: string;
  date: string;
  category: ContentCategory;
  tags: string[];
  /** zh | en | both - both means show in both language locales */
  lang: 'zh' | 'en' | 'both';
  cover?: string;
  excerpt?: string;
  excerpt_en?: string;
  platforms?: Platform[];
  videos?: VideoEmbed[];
  github?: string;
  demo?: string;
  paper_url?: string;
  venue?: string;
  published: boolean;
  slug?: string;
}

/** Frontmatter for blog posts */
export interface BlogFrontmatter extends ContentFrontmatter {
  category: 'blog';
}

/** Frontmatter for projects (with github link) */
export interface ProjectFrontmatter extends ContentFrontmatter {
  category: 'project';
  github?: string;
  demo?: string;
}

/** Frontmatter for papers (with paper_url, venue) */
export interface PaperFrontmatter extends ContentFrontmatter {
  category: 'paper';
  paper_url?: string;
  venue?: string;
}

/** Frontmatter for creative works (with videos) */
export interface CreativeFrontmatter extends ContentFrontmatter {
  category: 'creative';
  videos?: VideoEmbed[];
}

/** Frontmatter for thoughts/short notes */
export interface ThoughtFrontmatter extends ContentFrontmatter {
  category: 'thought';
}

export interface ContentItem {
  frontmatter: ContentFrontmatter;
  content: string;
  slug: string;
  source: 'mdx' | 'notion';
}
