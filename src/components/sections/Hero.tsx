'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import Magnetic from '@/components/ui/Magnetic';
import SplitText from '@/components/ui/SplitText';
import { staggerContainer, fadeUp } from '@/lib/motion';

const identityTags = [
  { zh: 'Full-Stack Builder', en: 'Full-Stack Builder', icon: '⚡' },
  { zh: 'AI 研究者', en: 'AI Researcher', icon: '🧠' },
  { zh: '内容创作者', en: 'Creator', icon: '🎬' },
];

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      {/* 统一编排：父容器 stagger，子元素从下、由虚到实依次浮现 */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4">
          <motion.span variants={fadeUp} className="inline-block text-[var(--color-text-primary)]">
            {t('greeting')}
          </motion.span>
          <br />
          <SplitText
            text={t('name')}
            splitBy="char"
            trigger="parent"
            stagger={0.045}
            delayChildren={0.05}
            charClassName="hero-name-shimmer bg-gradient-to-r from-[var(--color-green-300)] via-[var(--color-amber-300)] to-[var(--color-green-300)] bg-clip-text text-transparent"
          />
        </h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mb-6 max-w-[40ch] text-lg leading-[1.68] tracking-[-0.008em] text-[var(--color-text-secondary)] md:text-xl md:leading-[1.65]"
        >
          {t('description')}
        </motion.p>

        {/* 标签行：嵌套 stagger —— 每个标签再依次浮现 */}
        <motion.div variants={staggerContainer} className="flex flex-wrap justify-center gap-3 mb-10">
          {identityTags.map((tag, i) => (
            <motion.span
              key={i}
              variants={fadeUp}
              className="px-4 py-2 rounded-full text-sm font-medium
                         border border-[var(--color-border-default)] bg-[var(--color-bg-card)]
                         backdrop-blur-sm text-[var(--color-text-secondary)]"
            >
              <span className="mr-1.5">{tag.icon}</span>
              {t('tagline').includes('·') ? tag.zh : tag.en}
            </motion.span>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
          <Magnetic>
            <a
              href="#projects"
              className="button-primary-solid group inline-flex items-center gap-2 px-6 py-3"
            >
              {t('cta_projects')}
              <ArrowRight className="w-4 h-4 transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              className="button-secondary-outline inline-flex items-center gap-2 px-6 py-3"
            >
              {t('cta_contact')}
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent" />
    </section>
  );
}
