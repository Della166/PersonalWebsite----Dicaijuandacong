"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { papers } from "@/data/papers";

export default function Research() {
  const t = useTranslations("Research");

  return (
    <section id="research" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <motion.h2
          className="mb-8 text-3xl font-semibold text-[var(--text)]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t("title")}
        </motion.h2>
        <div className="space-y-4">
          {papers.length === 0 ? (
            <p className="text-[var(--text-muted)]">暂无论文数据，请在 src/data/papers.ts 中添加。</p>
          ) : (
            papers.map((paper, i) => (
              <motion.div
                key={paper.id}
                className="glass-card rounded-xl p-5"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-[var(--text)]">{paper.title}</h3>
                    <p className="mt-1 text-sm text-[var(--primary)]">{t("venue")}: {paper.venue}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
                      {paper.abstract}
                    </p>
                  </div>
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-[var(--primary)] hover:opacity-80"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
