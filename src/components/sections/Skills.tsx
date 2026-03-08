'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import { skillCategories } from '@/data/skills';

export default function Skills() {
  const t = useTranslations('skills');
  const locale = useLocale();

  const categoryLabels: Record<string, string> = {
    ai: t('category_ai'),
    dev: t('category_dev'),
    creative: t('category_creative'),
  };

  return (
    <section id="skills" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      <div className="grid md:grid-cols-3 gap-6">
        {skillCategories.map((category, ci) => (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ci * 0.15, duration: 0.5 }}
          >
            <GlassCard className="h-full" hover={false}>
              <h3 className="text-lg font-semibold text-[var(--color-green-300)] mb-6">
                {categoryLabels[category.key]}
              </h3>
              <div className="space-y-4">
                {category.skills.map((skill, si) => (
                  <div key={si}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-[var(--color-text-primary)]">
                        {locale === 'zh' ? skill.name : skill.name_en}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: ci * 0.1 + si * 0.05, duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-green-500)] to-[var(--color-green-300)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
