import { getAllMdx, getMdxBySlug } from "./mdx";
import { fetchNotionPosts } from "./notion";
import type { ContentCategory } from "@/types/content";

export type ListEntry = {
  slug: string;
  title: string;
  titleEn?: string;
  date: string;
  excerpt?: string;
  excerptEn?: string;
  cover?: string;
  category: ContentCategory;
  readingTime?: number;
};

export async function loadBlogList(_locale: "zh" | "en"): Promise<ListEntry[]> {
  const mdxItems = getAllMdx("blog").filter((x) => x.frontmatter.published !== false);
  const fromMdx: ListEntry[] = mdxItems.map((x) => ({
    slug: x.slug,
    title: x.frontmatter.title,
    titleEn: x.frontmatter.title_en,
    date: x.frontmatter.date,
    excerpt: x.frontmatter.excerpt,
    excerptEn: x.frontmatter.excerpt_en,
    cover: x.frontmatter.cover,
    category: x.frontmatter.category,
    readingTime: x.readingTime,
  }));

  if (process.env.NOTION_API_KEY) {
    try {
      const notionItems = await fetchNotionPosts();
      const fromNotion: ListEntry[] = notionItems.map((x) => ({
        slug: `notion-${x.slug}`,
        title: x.frontmatter.title,
        date: x.frontmatter.date ?? "",
        category: "blog",
      }));
      fromMdx.push(...fromNotion);
    } catch { /* Notion unavailable */ }
  }

  return fromMdx.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function loadBlogPost(slug: string) {
  return getMdxBySlug("blog", slug);
}

export function loadCategoryList(category: ContentCategory): ListEntry[] {
  const items = getAllMdx(category).filter((x) => x.frontmatter.published !== false);
  return items.map((x) => ({
    slug: x.slug,
    title: x.frontmatter.title,
    titleEn: x.frontmatter.title_en,
    date: x.frontmatter.date,
    excerpt: x.frontmatter.excerpt,
    excerptEn: x.frontmatter.excerpt_en,
    cover: x.frontmatter.cover,
    category: x.frontmatter.category,
    readingTime: x.readingTime,
  }));
}
