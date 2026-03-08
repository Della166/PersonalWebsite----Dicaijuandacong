import { getContentByCategory, getAllContent, getContentBySlug } from './mdx';
import { ContentItem } from '@/types/content';

export async function loadContent(category?: string): Promise<ContentItem[]> {
  const mdxContent = category ? getContentByCategory(category) : getAllContent();

  // Notion content will be added here when configured
  // const notionContent = await loadFromNotion(category);
  // return [...mdxContent, ...notionContent].sort(...)

  return mdxContent.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export async function loadContentBySlug(
  category: string,
  slug: string
): Promise<ContentItem | null> {
  const mdxContent = getContentBySlug(category, slug);
  if (mdxContent) return mdxContent;

  // Fallback to Notion when configured
  // return await loadFromNotion(category, slug);

  return null;
}

export function filterByPlatform(items: ContentItem[], platform: string): ContentItem[] {
  return items.filter((item) => item.frontmatter.platforms?.includes(platform as any));
}

export function filterByTag(items: ContentItem[], tag: string): ContentItem[] {
  return items.filter((item) => item.frontmatter.tags?.includes(tag));
}

export function filterByLang(items: ContentItem[], lang: string): ContentItem[] {
  return items.filter(
    (item) => item.frontmatter.lang === lang || item.frontmatter.lang === 'both'
  );
}
