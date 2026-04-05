'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, FileText, Sparkles } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import { projects, ProjectCategory } from '@/data/projects';
import { getProjectDemoHref, isInternalProjectDemo } from '@/lib/project-links';

const filterTabs: { key: string; value: ProjectCategory | 'all' }[] = [
  { key: 'filter_all', value: 'all' },
  { key: 'filter_platform', value: 'platform' },
  { key: 'filter_document', value: 'document' },
  { key: 'filter_agent', value: 'agent' },
  { key: 'filter_ml', value: 'ml' },
];

const categoryCoverStyles: Record<ProjectCategory, string> = {
  platform: 'from-[var(--color-green-300)]/25 via-[var(--color-green-500)]/20 to-[var(--color-amber-300)]/20',
  document: 'from-[var(--color-amber-300)]/25 via-[var(--color-green-300)]/15 to-[var(--color-green-500)]/15',
  agent: 'from-[var(--color-green-500)]/25 via-[var(--color-green-300)]/15 to-transparent',
  ml: 'from-[var(--color-amber-300)]/25 via-[var(--color-amber-500)]/15 to-[var(--color-green-500)]/15',
};

export default function Projects() {
  const t = useTranslations('projects');
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<ProjectCategory | 'all'>('all');

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="projects" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === tab.value
                ? 'bg-[var(--color-green-500)] text-white shadow-[0_0_20px_var(--color-glow-green)]'
                : 'border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-green-300)]'
            }`}
          >
            {t(tab.key)}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => {
            const demoHref = project.demo
              ? getProjectDemoHref({ demo: project.demo, locale, slug: project.slug })
              : null;
            const actionItems = [
              {
                key: 'details',
                label: t('action_details'),
                icon: FileText,
                href: project.slug ? `/${locale}/projects/${project.slug}` : null,
                tone: 'accent' as const,
                external: false,
              },
              {
                key: 'demo',
                label: t('action_demo'),
                icon: ExternalLink,
                href: project.demo && demoHref ? demoHref : null,
                tone: 'green' as const,
                external: Boolean(project.demo && demoHref && !isInternalProjectDemo(project.demo)),
              },
              {
                key: 'code',
                label: t('action_code'),
                icon: Github,
                href: project.github ?? null,
                tone: 'neutral' as const,
                external: true,
              },
            ];

            return (
              <motion.div
                key={project.title}
                className="h-full"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <GlassCard className="h-full flex flex-col">
                  <div className="relative mb-5 overflow-hidden rounded-2xl border border-[var(--color-border-default)] aspect-[16/10]">
                    {project.cover ? (
                      <Image
                        src={project.cover}
                        alt={locale === 'zh' ? project.title : project.title_en}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className={`relative h-full w-full bg-gradient-to-br ${categoryCoverStyles[project.category]}`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(127,188,140,0.18),transparent_45%)]" />
                        <div className="relative flex h-full flex-col justify-between p-5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="inline-flex items-center rounded-full border border-[var(--color-border-hover)] bg-[var(--color-bg-card)]/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)] backdrop-blur-sm">
                              {t(`filter_${project.category}`)}
                            </span>
                            <div className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-card)]/70 p-2 backdrop-blur-sm">
                              <Sparkles className="h-4 w-4 text-[var(--color-green-200)]" />
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                              {t('case_study')}
                            </p>
                            <h3 className="max-w-[16rem] text-xl font-semibold leading-snug text-[var(--color-text-primary)]">
                              {locale === 'zh' ? project.title : project.title_en}
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/60 via-black/10 to-transparent px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                        {t(`filter_${project.category}`)}
                      </span>
                      {project.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-amber-300)]/30 bg-[var(--color-bg-card)]/80 px-3 py-1 text-[11px] font-medium text-[var(--color-amber-300)] backdrop-blur-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                          {t('featured_case_study')}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mb-2 text-lg font-bold leading-[1.2] tracking-[-0.02em] text-[var(--color-text-primary)]">
                    {locale === 'zh' ? project.title : project.title_en}
                  </h3>
                  <p className="mb-4 max-w-[42ch] flex-grow text-[15px] font-medium leading-[1.65] tracking-[-0.006em] text-[var(--color-text-soft)]">
                    {locale === 'zh' ? project.description : project.description_en}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full
                                 bg-[var(--color-green-300)]/10 text-[var(--color-green-300)]
                                 border border-[var(--color-green-300)]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto border-t border-[var(--color-border-default)] pt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {actionItems.map((action) => {
                        const Icon = action.icon;
                        const baseClassName =
                          'inline-flex w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-medium transition-colors sm:text-sm';
                        const toneClassName =
                          action.tone === 'accent' ? 'project-action-primary' : 'project-action-secondary';
                        const disabledClassName = 'project-action-disabled';

                        if (!action.href) {
                          return (
                            <span
                              key={action.key}
                              aria-disabled="true"
                              className={`${baseClassName} ${disabledClassName}`}
                            >
                              <Icon className="h-4 w-4" />
                              {action.label}
                            </span>
                          );
                        }

                        if (action.external) {
                          return (
                            <a
                              key={action.key}
                              href={action.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${baseClassName} ${toneClassName}`}
                            >
                              <Icon className="h-4 w-4" />
                              {action.label}
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={action.key}
                            href={action.href}
                            className={`${baseClassName} ${toneClassName}`}
                          >
                            <Icon className="h-4 w-4" />
                            {action.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
