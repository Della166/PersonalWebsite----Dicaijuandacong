'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

const identityTags = [
  { zh: '全栈开发者', en: 'Full-Stack Dev', icon: '⚡' },
  { zh: 'AI 研究者', en: 'AI Researcher', icon: '🧠' },
  { zh: '内容创作者', en: 'Creator', icon: '🎬' },
];

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full
                       border border-[var(--color-border-default)] bg-[var(--color-bg-card)]
                       backdrop-blur-md text-sm text-[var(--color-text-secondary)]"
          >
            <Sparkles className="w-4 h-4 text-[var(--color-amber-300)]" />
            <span>AI Engineer & Content Creator</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4">
            <span className="text-[var(--color-text-primary)]">{t('greeting')}</span>
            <br />
            <span className="bg-gradient-to-r from-[var(--color-green-300)] via-[var(--color-green-200)] to-[var(--color-amber-300)] bg-clip-text text-transparent">
              {t('name')}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mb-6 max-w-[40ch] text-lg leading-[1.68] tracking-[-0.008em] text-[var(--color-text-secondary)] md:text-xl md:leading-[1.65]"
          >
            {t('description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {identityTags.map((tag, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm font-medium
                           border border-[var(--color-border-default)] bg-[var(--color-bg-card)]
                           backdrop-blur-sm text-[var(--color-text-secondary)]"
              >
                <span className="mr-1.5">{tag.icon}</span>
                {t('tagline').includes('·') ? tag.zh : tag.en}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              href="#projects"
              className="button-primary-solid inline-flex items-center gap-2 px-6 py-3 hover:shadow-[0_0_26px_var(--color-glow-green)]"
            >
              {t('cta_projects')}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#contact"
              className="button-secondary-outline inline-flex items-center gap-2 px-6 py-3 hover:shadow-[0_0_16px_var(--color-glow-green)]"
            >
              {t('cta_contact')}
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent" />
    </section>
  );
}
