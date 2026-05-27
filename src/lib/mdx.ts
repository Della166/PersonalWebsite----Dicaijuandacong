import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { ContentFrontmatter, ContentItem } from '@/types/content';

const contentDir = path.join(process.cwd(), 'src/content');

// Treat `<slug>.<locale>.mdx` (e.g. foo.zh.mdx) as a locale variant of `<slug>.mdx`,
// not as a separate piece of content. Without this filter, generateStaticParams +
// sitemap end up emitting bogus routes like /projects/deep-research-agent.zh.
const LOCALE_SUFFIX = /\.(zh|en)\.mdx?$/i;

export function getContentByCategory(category: string): ContentItem[] {
  const dir = path.join(contentDir, category);

  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => (f.endsWith('.mdx') || f.endsWith('.md')) && !LOCALE_SUFFIX.test(f));

  return files
    .map((filename) => {
      const filePath = path.join(dir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      const slug = filename.replace(/\.mdx?$/, '');

      return {
        frontmatter: { ...data, slug } as ContentFrontmatter,
        content,
        slug,
        source: 'mdx' as const,
      };
    })
    .filter((item) => item.frontmatter.published !== false)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

export function getAllContent(): ContentItem[] {
  const categories = ['blog', 'projects', 'papers', 'creative', 'thoughts'];
  return categories.flatMap((cat) => getContentByCategory(cat));
}

export function getContentBySlug(
  category: string,
  slug: string,
  locale?: string,
): ContentItem | null {
  const dir = path.join(contentDir, category);
  const extensions = ['.mdx', '.md'];

  // Try locale-suffixed file first (e.g. <slug>.zh.mdx / <slug>.en.mdx),
  // then fall back to plain <slug>.mdx / <slug>.md.
  const candidates: string[] = [];
  if (locale) {
    for (const ext of extensions) candidates.push(`${slug}.${locale}${ext}`);
  }
  for (const ext of extensions) candidates.push(`${slug}${ext}`);

  for (const candidate of candidates) {
    const filePath = path.join(dir, candidate);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      return {
        frontmatter: { ...data, slug } as ContentFrontmatter,
        content,
        slug,
        source: 'mdx',
      };
    }
  }

  return null;
}

export function getReadingTime(content: string) {
  return readingTime(content);
}
