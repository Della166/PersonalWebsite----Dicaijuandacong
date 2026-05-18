'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { wordReveal, fadeUp } from '@/lib/motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

/** 标题容器 —— 词逐个 reveal，副标题与装饰条随后浮现 */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  const words = title.split(' ');

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-3">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden align-top">
              <motion.span variants={wordReveal} className="inline-block">
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
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
