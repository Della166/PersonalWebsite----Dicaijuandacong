"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function About() {
  const t = useTranslations("About");

  return (
    <section id="about" className="section-padding scroll-mt-20 bg-[var(--bg-mid)]/30">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <motion.h2
          className="mb-8 text-3xl font-semibold text-[var(--text)]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {t("title")}
        </motion.h2>
        <motion.div
          className="glass-card rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            <div className="h-32 w-32 shrink-0 rounded-xl bg-[var(--primary)]/20 md:h-40 md:w-40" />
            <div className="space-y-4">
              <p className="text-[var(--text)]">
                个人介绍段落：AI / ML 方向工程师，关注视频生成、图像生成与多模态。全栈开发与内容创作爱好者。
              </p>
              <div>
                <h3 className="mb-2 text-sm font-medium text-[var(--primary)]">{t("role")}</h3>
                <p className="text-[var(--text-muted)]">AI Engineer / ML Engineer</p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-[var(--primary)]">{t("research")}</h3>
                <p className="text-[var(--text-muted)]">
                  视频生成、图像生成、多模态理解与生成
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
