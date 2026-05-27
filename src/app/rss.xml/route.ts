import { getContentByCategory } from '@/lib/mdx';

const SITE = 'https://fulingchen.me';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const projects = getContentByCategory('projects');
  const blog = getContentByCategory('blog');

  type FeedItem = {
    title: string;
    description: string;
    url: string;
    date: string;
    category: string;
  };

  const items: FeedItem[] = [
    ...projects.map((p) => ({
      title: (p.frontmatter.title as string) || p.slug,
      description: (p.frontmatter.excerpt as string) || (p.frontmatter.excerpt_en as string) || '',
      url: `${SITE}/zh/projects/${p.slug}`,
      date: (p.frontmatter.date as string) || new Date().toISOString(),
      category: 'project',
    })),
    ...blog.map((b) => ({
      title: (b.frontmatter.title as string) || b.slug,
      description: (b.frontmatter.excerpt as string) || (b.frontmatter.excerpt_en as string) || '',
      url: `${SITE}/zh/blog/${b.slug}`,
      date: (b.frontmatter.date as string) || new Date().toISOString(),
      category: 'blog',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>fulingchen — AI Engineer &amp; Creator</title>
    <link>${SITE}</link>
    <description>AI 工程师 / 全栈开发 / 内容创作者作品集</description>
    <language>zh-CN</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <category>${item.category}</category>
      <guid isPermaLink="true">${item.url}</guid>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
