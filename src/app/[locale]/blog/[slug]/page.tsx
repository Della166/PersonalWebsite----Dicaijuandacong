import { notFound } from 'next/navigation';
import { getContentBySlug, getContentByCategory } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import readingTime from 'reading-time';
import { getTranslations } from 'next-intl/server';

export async function generateStaticParams() {
  const posts = getContentByCategory('blog');
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('blog');
  const post = getContentBySlug('blog', slug);

  if (!post) notFound();

  const { frontmatter, content } = post;
  const stats = readingTime(content);
  const title = locale === 'zh' ? frontmatter.title : (frontmatter.title_en || frontmatter.title);

  return (
    <div className="min-h-screen pt-20">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <a
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green-300)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_blog')}
        </a>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(frontmatter.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {Math.ceil(stats.minutes)} {t('min_read')}
            </span>
          </div>
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {frontmatter.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 text-xs rounded-full bg-[var(--color-green-300)]/10 text-[var(--color-green-300)] border border-[var(--color-green-300)]/20">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-invert prose-green max-w-none
                        prose-headings:text-[var(--color-text-primary)]
                        prose-p:text-[var(--color-text-secondary)]
                        prose-a:text-[var(--color-green-300)] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[var(--color-text-primary)]
                        prose-code:text-[var(--color-green-200)] prose-code:bg-[var(--color-bg-card)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-[var(--color-bg-card)] prose-pre:border prose-pre:border-[var(--color-border-default)]
                        prose-blockquote:border-[var(--color-green-300)]
                        prose-img:rounded-xl">
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, rehypeHighlight],
              },
            }}
          />
        </div>
      </article>
    </div>
  );
}
