'use client';

import { motion, type Variants } from 'framer-motion';
import SplitText from './SplitText';
import { fadeUp } from '@/lib/motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  /** 拆分粒度：'char' 字符级揭示（默认），'word' 词级 */
  splitBy?: 'word' | 'char';
}

/** 外层容器 —— 标题独立 inView 自驱，subtitle / bar 在标题展开过半后接力浮现 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

export default function SectionTitle({ title, subtitle, splitBy = 'char' }: SectionTitleProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-3">
        <SplitText
          text={title}
          splitBy={splitBy}
          trigger="inView"
          stagger={splitBy === 'char' ? 0.025 : 0.07}
        />
      </h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className="mx-auto max-w-3xl text-lg leading-[1.65] tracking-[-0.006em] text-[var(--color-text-muted)]"
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div variants={fadeUp} className="section-title-bar mt-4 mx-auto w-20 h-1 rounded-full" />
    </motion.div>
  );
}
