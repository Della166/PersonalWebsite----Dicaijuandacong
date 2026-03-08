import { getContentByCategory, getReadingTime } from '@/lib/mdx';
import { getTranslations } from 'next-intl/server';
import BlogPreview from '@/components/sections/BlogPreview';

export default async function BlogPage() {
  const t = await getTranslations('blog');
  const posts = getContentByCategory('blog');

  const blogPosts = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    title_en: post.frontmatter.title_en,
    excerpt: post.frontmatter.excerpt,
    excerpt_en: post.frontmatter.excerpt_en,
    date: post.frontmatter.date,
    tags: post.frontmatter.tags ?? [],
    readingTime: Math.ceil(getReadingTime(post.content).minutes),
  }));

  return (
    <div className="min-h-screen pt-20">
      <div className="section-container">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">{t('title')}</h1>
        <p className="text-lg text-[var(--color-text-muted)] mb-12">{t('subtitle')}</p>
        <BlogPreview posts={blogPosts} />
      </div>
    </div>
  );
}
