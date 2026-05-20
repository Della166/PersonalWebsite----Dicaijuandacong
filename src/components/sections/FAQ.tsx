'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/ui/SectionTitle';
import { staggerContainer, fadeUp } from '@/lib/motion';

type FAQEntry = { q: string; a: string };

export default function FAQ() {
  const t = useTranslations('faq');
  const items = t.raw('items') as FAQEntry[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="max-w-3xl mx-auto space-y-3"
      >
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`overflow-hidden rounded-2xl border transition-colors duration-300 bg-[var(--color-bg-card)] backdrop-blur-md ${
                open
                  ? 'border-[var(--color-border-hover)]'
                  : 'border-[var(--color-border-default)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left
                           transition-colors duration-200 hover:bg-[var(--color-bg-card-hover)]"
              >
                <div className="flex items-baseline gap-4 flex-1 min-w-0">
                  <span className="font-mono text-xs tabular-nums shrink-0 text-[var(--color-text-muted)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-base sm:text-lg leading-snug text-[var(--color-text-primary)]">
                    {item.q}
                  </span>
                </div>
                <span className="faq-toggle shrink-0" data-open={open} aria-hidden="true" />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mx-6 h-px bg-[var(--color-border-default)]" />
                    <p className="px-6 pt-4 pb-5 leading-relaxed text-[var(--color-text-secondary)]">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
