import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getContentByCategory, getContentBySlug } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, ExternalLink, Github, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getProjectDemoHref, isInternalProjectDemo, isPreviewProjectDemo } from '@/lib/project-links';

export async function generateStaticParams() {
  const projects = getContentByCategory('projects');
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('projects');
  const project = getContentBySlug('projects', slug);

  if (!project) notFound();

  const { frontmatter, content } = project;
  const title = locale === 'zh' ? frontmatter.title : (frontmatter.title_en || frontmatter.title);
  const excerpt =
    locale === 'zh'
      ? (frontmatter.excerpt || frontmatter.excerpt_en)
      : (frontmatter.excerpt_en || frontmatter.excerpt);

  return (
    <div className="min-h-screen pt-20">
      <article className="max-w-5xl mx-auto px-4 py-12">
        <a
          href={`/${locale}#projects`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-green-300)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_projects')}
        </a>

        <header className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] items-start mb-12">
          <div className="relative overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
            {frontmatter.cover ? (
              <Image
                src={frontmatter.cover}
                alt={title}
                width={1600}
                height={900}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="aspect-[16/10] bg-gradient-to-br from-[var(--color-green-300)]/20 via-[var(--color-green-500)]/15 to-[var(--color-amber-300)]/15" />
            )}
          </div>

          <div className="glass-card p-6 md:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {t('case_study')}
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] leading-tight">
              {title}
            </h1>

            {excerpt && (
              <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                {excerpt}
              </p>
            )}

            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {frontmatter.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-[var(--color-green-300)]/10 text-[var(--color-green-300)] border border-[var(--color-green-300)]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {frontmatter.demo && isInternalProjectDemo(frontmatter.demo) && (
                <Link
                  href={getProjectDemoHref({ demo: frontmatter.demo, locale, slug })}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/12 px-4 py-2 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18"
                >
                  <ExternalLink className="w-4 h-4" />
                  {isPreviewProjectDemo(frontmatter.demo) ? t('try_preview') : t('view_demo')}
                </Link>
              )}

              {frontmatter.demo && !isInternalProjectDemo(frontmatter.demo) && (
                <a
                  href={frontmatter.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/12 px-4 py-2 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('view_demo')}
                </a>
              )}

              {frontmatter.github && (
                <a
                  href={frontmatter.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-green-300)]"
                >
                  <Github className="w-4 h-4" />
                  {t('view_github')}
                </a>
              )}
            </div>
          </div>
        </header>

        <div
          className="prose prose-invert prose-green max-w-none
                     prose-headings:text-[var(--color-text-primary)]
                     prose-headings:scroll-mt-24
                     prose-p:text-[var(--color-text-secondary)]
                     prose-li:text-[var(--color-text-secondary)]
                     prose-a:text-[var(--color-green-300)] prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-[var(--color-text-primary)]
                     prose-code:text-[var(--color-green-200)] prose-code:bg-[var(--color-bg-card)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                     prose-pre:bg-[var(--color-bg-card)] prose-pre:border prose-pre:border-[var(--color-border-default)]
                     prose-blockquote:border-[var(--color-green-300)]
                     prose-img:rounded-2xl"
        >
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
