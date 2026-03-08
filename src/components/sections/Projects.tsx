'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import { projects, ProjectCategory } from '@/data/projects';

const filterTabs: { key: string; value: ProjectCategory | 'all' }[] = [
  { key: 'filter_all', value: 'all' },
  { key: 'filter_agent', value: 'agent' },
  { key: 'filter_webapp', value: 'webapp' },
  { key: 'filter_miniapp', value: 'miniapp' },
  { key: 'filter_other', value: 'other' },
];

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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <motion.div
              key={project.title}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <GlassCard className="h-full flex flex-col">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {locale === 'zh' ? project.title : project.title_en}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4 flex-grow">
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

                {/* Links */}
                <div className="flex gap-3 pt-2 border-t border-[var(--color-border-default)]">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-green-300)] transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      {t('view_github')}
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-amber-300)] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('view_demo')}
                    </a>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
