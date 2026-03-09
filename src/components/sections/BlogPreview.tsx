"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import type { ListEntry } from "@/lib/content-loader";

interface BlogPreviewProps {
  list: ListEntry[];
}

export default function BlogPreview({ list }: BlogPreviewProps) {
  const t = useTranslations("Blog");
  const preview = list.slice(0, 3);

  return (
    <section id="blog" className="section-padding scroll-mt-20 bg-[var(--bg-mid)]/30">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <motion.h2
            className="text-3xl font-semibold text-[var(--text)]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t("title")}
          </motion.h2>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-[var(--primary)] hover:underline"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {preview.length === 0 ? (
          <motion.div
            className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-deep)]/40 p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[var(--text-muted)]">暂无文章，请在 content/blog 添加 MDX。</p>
            <Link href="/blog" className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline">
              {t("viewAll")}
            </Link>
          </motion.div>
        ) : (
          <ul className="space-y-4">
            {preview.map((entry, i) => (
              <motion.li
                key={entry.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/blog/${entry.slug}`}
                  className="glass-card block rounded-xl p-5 transition hover:border-[var(--primary)]/50"
                >
                  <h3 className="font-medium text-[var(--text)]">{entry.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{entry.date}</p>
                  {entry.excerpt && <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{entry.excerpt}</p>}
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
