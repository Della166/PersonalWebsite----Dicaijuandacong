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
              className="overflow-hidden rounded-2xl border border-[var(--color-border-default)]
                         bg-[var(--color-bg-card)] backdrop-blur-md"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left
                           transition-colors duration-200 hover:bg-[var(--color-bg-card-hover)]"
              >
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {item.q}
                </span>
                <span className="faq-toggle" data-open={open} aria-hidden="true" />
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
                    <p className="px-5 pb-4 leading-relaxed text-[var(--color-text-secondary)]">
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
