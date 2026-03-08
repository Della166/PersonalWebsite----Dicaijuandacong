'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { FileText, Code2, Calendar } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import { papers } from '@/data/papers';

export default function Research() {
  const t = useTranslations('research');
  const locale = useLocale();

  return (
    <section id="research" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      <div className="space-y-6 max-w-4xl mx-auto">
        {papers.map((paper, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <GlassCard>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {locale === 'zh' ? paper.title : paper.title_en}
                </h3>
                <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-amber-300)]/10 text-[var(--color-amber-300)]">
                  <Calendar className="w-3 h-3" />
                  {paper.venue} {paper.year}
                </span>
              </div>

              <p className="text-sm text-[var(--color-text-muted)] mb-2">{paper.authors}</p>

              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                {locale === 'zh' ? paper.abstract : paper.abstract_en}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {paper.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-green-300)]/10 text-[var(--color-green-300)] border border-[var(--color-green-300)]/20">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 ml-auto">
                  {paper.paper_url && (
                    <a href={paper.paper_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-green-300)] transition-colors">
                      <FileText className="w-4 h-4" />
                      {t('view_paper')}
                    </a>
                  )}
                  {paper.code_url && (
                    <a href={paper.code_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-amber-300)] transition-colors">
                      <Code2 className="w-4 h-4" />
                      {t('view_code')}
                    </a>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
