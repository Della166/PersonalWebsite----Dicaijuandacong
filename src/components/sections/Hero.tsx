"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-16"
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(127,188,140,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(127,188,140,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)]/50 to-transparent" />

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="mb-4 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl md:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Your Name
        </motion.h1>
        <motion.p
          className="mb-6 text-base text-[var(--text-muted)] sm:text-lg md:text-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {t("tagline")}
        </motion.p>
        <motion.div
          className="mb-4 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {["全栈开发者", "AI 研究者", "全能内容创作者"].map((label, i) => (
            <span
              key={label}
              className="rounded-full border border-[var(--glass-border)] bg-[var(--bg-mid)]/60 px-4 py-1.5 text-sm text-[var(--primary-light)] backdrop-blur-sm"
            >
              {label}
            </span>
          ))}
        </motion.div>
        <motion.a
          href="#about"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--bg-deep)] transition hover:opacity-90"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {t("cta")}
          <ChevronDown className="h-4 w-4" />
        </motion.a>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <a href="#about" className="text-[var(--text-muted)] hover:text-[var(--primary)]">
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
