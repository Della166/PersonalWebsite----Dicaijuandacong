export type ContentCategory = "blog" | "project" | "paper" | "creative" | "thought";

export type ContentLang = "zh" | "en" | "both";

export interface VideoEmbed {
  platform: "bilibili" | "youtube" | "direct";
  id: string;
  title?: string;
}

export interface ContentFrontmatter {
  title: string;
  title_en?: string;
  date: string;
  category: ContentCategory;
  tags: string[];
  lang: ContentLang;
  cover?: string;
  excerpt?: string;
  excerpt_en?: string;
  platforms?: string[];
  videos?: VideoEmbed[];
  github?: string;
  paper_url?: string;
  venue?: string;
  published?: boolean;
}

export interface ContentItem {
  slug: string;
  frontmatter: ContentFrontmatter;
  content: string;
  readingTime?: number;
}
