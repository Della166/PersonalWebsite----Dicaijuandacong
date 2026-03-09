"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, Github } from "lucide-react";

export default function Contact() {
  const t = useTranslations("Contact");

  return (
    <section id="contact" className="section-padding scroll-mt-20 bg-[var(--bg-mid)]/30">
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
          className="glass-card flex flex-wrap gap-6 rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <a
            href="mailto:your@email.com"
            className="flex items-center gap-3 text-[var(--text)] transition hover:text-[var(--primary)]"
          >
            <Mail className="h-6 w-6" />
            <span>{t("email")}: your@email.com</span>
          </a>
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[var(--text)] transition hover:text-[var(--primary)]"
          >
            <Github className="h-6 w-6" />
            <span>{t("github")}: yourusername</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
