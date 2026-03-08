'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Code2, Brain, Film, Target, Microscope } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';

const identities = [
  { key: 'dev', icon: Code2 },
  { key: 'researcher', icon: Brain },
  { key: 'creator', icon: Film },
];

export default function About() {
  const t = useTranslations('about');

  const researchAreas: string[] = t.raw('research_areas');

  return (
    <section id="about" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* 求职方向 */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--color-amber-300)]/10">
              <Target className="w-6 h-6 text-[var(--color-amber-300)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {t('career_direction')}
            </h3>
          </div>
          <p className="text-lg font-medium text-[var(--color-green-300)]">
            {t('career_roles')}
          </p>
        </GlassCard>

        {/* 研究领域 */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--color-green-300)]/10">
              <Microscope className="w-6 h-6 text-[var(--color-green-300)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {t('research_title')}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {researchAreas.map((area: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1.5 text-sm rounded-full
                           border border-[var(--color-border-default)]
                           text-[var(--color-text-secondary)] bg-[var(--color-bg-card)]"
              >
                {area}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 三重身份 */}
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] text-center mb-6">
        {t('identity_title')}
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        {identities.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <GlassCard className="text-center h-full">
                <div className="inline-flex p-3 rounded-xl bg-[var(--color-green-300)]/10 mb-4">
                  <Icon className="w-8 h-8 text-[var(--color-green-300)]" />
                </div>
                <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {t(`identity_${item.key}`)}
                </h4>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t(`identity_${item.key}_desc`)}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
