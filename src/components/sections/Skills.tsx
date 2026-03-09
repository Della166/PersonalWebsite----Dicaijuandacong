"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const categories = [
  { key: "ai" as const, skills: ["PyTorch", "Transformers", "Diffusion", "RAG"], level: 90 },
  { key: "engineering" as const, skills: ["TypeScript", "React", "Next.js", "Python"], level: 85 },
  { key: "creative" as const, skills: ["视频剪辑", "写作", "设计"], level: 75 },
];

export default function Skills() {
  const t = useTranslations("Skills");

  return (
    <section id="skills" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <motion.h2
          className="mb-8 text-3xl font-semibold text-[var(--text)]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t("title")}
        </motion.h2>
        <div className="space-y-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              className="glass-card rounded-2xl p-6"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="mb-3 text-lg font-medium text-[var(--primary-light)]">
                {t(cat.key)}
              </h3>
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-[var(--bg-deep)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--primary)]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${cat.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-[var(--glass-border)] bg-[var(--bg-mid)]/50 px-2.5 py-1 text-sm text-[var(--text-muted)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
