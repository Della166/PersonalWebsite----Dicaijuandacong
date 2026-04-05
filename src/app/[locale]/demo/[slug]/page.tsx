import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, Github, Sparkles } from 'lucide-react';
import { projects } from '@/data/projects';
import { projectDemos, projectDemoSlugs } from '@/data/project-demos';

function pickLocalizedText<T extends { en: string; zh: string }>(value: T, locale: string) {
  return locale === 'zh' ? value.zh : value.en;
}

function pickLocalizedList<T extends { en: string[]; zh: string[] }>(value: T, locale: string) {
  return locale === 'zh' ? value.zh : value.en;
}

export function generateStaticParams() {
  return projectDemoSlugs.map((slug) => ({ slug }));
}

export default async function ProjectDemoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  const demo = projectDemos[slug];

  if (!project || !demo) notFound();

  const title = locale === 'zh' ? project.title : project.title_en;
  const description = locale === 'zh' ? project.description : project.description_en;
  const backLabel = locale === 'zh' ? '返回案例页' : 'Back to case study';
  const caseStudyLabel = locale === 'zh' ? '案例拆解' : 'Case Study';
  const sourceLabel = locale === 'zh' ? '源码' : 'Source Code';
  const whatToTryLabel = locale === 'zh' ? '建议体验' : 'What to try';
  const whatItProvesLabel = locale === 'zh' ? '这个试玩能说明什么' : 'What this demo proves';
  const localNoteLabel = locale === 'zh' ? '本地版本说明' : 'Why this local version exists';
  const DemoComponent = demo.component;

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link
          href={`/${locale}/projects/${slug}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-green-300)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <header className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
          <div className="glass-card p-6 md:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/25 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-green-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {pickLocalizedText(demo.eyebrow, locale)}
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight text-[var(--color-text-primary)] md:text-4xl">
              {title}
            </h1>

            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              {description}
            </p>

            <p className="mt-4 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {pickLocalizedText(demo.summary, locale)}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--color-green-300)]/20 bg-[var(--color-green-300)]/10 px-3 py-1 text-xs text-[var(--color-green-300)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/projects/${slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/12 px-4 py-2 text-sm font-medium text-[var(--color-amber-300)] transition-colors hover:border-[var(--color-amber-300)]/55 hover:bg-[var(--color-amber-300)]/18"
              >
                <FileText className="h-4 w-4" />
                {caseStudyLabel}
              </Link>

              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-green-300)]"
                >
                  <Github className="h-4 w-4" />
                  {sourceLabel}
                </a>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
            {project.cover ? (
              <Image
                src={project.cover}
                alt={title}
                width={1600}
                height={1000}
                className="h-auto w-full object-cover"
              />
            ) : (
              <div className="aspect-[16/10] bg-gradient-to-br from-[var(--color-green-300)]/20 via-[var(--color-green-500)]/15 to-[var(--color-amber-300)]/15" />
            )}
            <div className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/88 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {localNoteLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {pickLocalizedText(demo.localNote, locale)}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="space-y-6">
            <DemoComponent />
          </div>

          <aside className="space-y-4">
            <div className="glass-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {whatToTryLabel}
              </p>
              <div className="mt-4 space-y-3">
                {pickLocalizedList(demo.whatToTry, locale).map((item) => (
                  <p key={item} className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                {whatItProvesLabel}
              </p>
              <div className="mt-4 space-y-4">
                {pickLocalizedList(demo.whatItProves, locale).map((item) => (
                  <p key={item} className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            {demo.highlights.map((item) => (
              <div key={pickLocalizedText(item.label, locale)} className="glass-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  {pickLocalizedText(item.label, locale)}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-primary)]">
                  {pickLocalizedText(item.value, locale)}
                </p>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
