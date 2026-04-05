'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import { skillClusters, skillHighlight } from '@/data/skills';

export default function Skills() {
  const t = useTranslations('skills');
  const locale = useLocale();

  return (
    <section id="skills" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      <GlassCard className="mb-6" hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/25 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              {locale === 'zh' ? skillHighlight.label : skillHighlight.label_en}
            </div>
            <p className="mt-4 max-w-[68ch] text-base leading-[1.72] tracking-[-0.006em] text-[var(--color-text-secondary)]">
              {locale === 'zh' ? skillHighlight.summary : skillHighlight.summary_en}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {skillHighlight.leadWith.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--color-green-400)]/18 bg-[var(--color-green-500)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-green-400)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {skillClusters.map((cluster, ci) => (
          <motion.div
            key={cluster.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ci * 0.15, duration: 0.5 }}
          >
            <GlassCard className="h-full" hover={false}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-green-400)]">
                    {locale === 'zh' ? cluster.title : cluster.title_en}
                  </h3>
                  <p className="mt-3 max-w-[44ch] text-[15px] leading-[1.68] tracking-[-0.006em] text-[var(--color-text-muted)]">
                    {locale === 'zh' ? cluster.description : cluster.description_en}
                  </p>
                </div>

                {cluster.featured && (
                  <span className="rounded-full border border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-amber-300)]">
                    {locale === 'zh' ? '差异化优势' : 'Differentiator'}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {cluster.items.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-3 py-1.5 text-xs leading-5 ${
                      cluster.featured
                        ? 'border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 text-[var(--color-amber-300)]'
                        : 'border-[var(--color-green-400)]/18 bg-[var(--color-green-500)]/10 text-[var(--color-green-400)]'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
