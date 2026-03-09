"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function Creative() {
  const t = useTranslations("Creative");

  return (
    <section id="creative" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <motion.h2
          className="mb-8 text-3xl font-semibold text-[var(--text)]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t("title")}
        </motion.h2>
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-xl border border-[var(--glass-border)] bg-[var(--bg-mid)]/60"
            />
          ))}
        </motion.div>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          视频作品可从 content/creative 的 MDX 与媒体管道加载展示。
        </p>
      </div>
    </section>
  );
}
