"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import type { ListEntry } from "@/lib/content-loader";

export default function BlogList({
  list,
  locale,
}: {
  list: ListEntry[];
  locale: string;
}) {
  const isEn = locale === "en";
  return (
    <ul className="space-y-4">
      {list.length === 0 ? (
        <li className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-mid)]/40 p-6 text-[var(--text-muted)]">
          暂无文章
        </li>
      ) : (
        list.map((entry, i) => (
          <motion.li
            key={entry.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/blog/${entry.slug}`}
              className="glass-card block rounded-xl p-5 transition hover:border-[var(--primary)]/50"
            >
              <h2 className="font-medium text-[var(--text)]">
                {isEn && entry.titleEn ? entry.titleEn : entry.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{entry.date}</p>
              {(entry.excerpt || entry.excerptEn) && (
                <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
                  {isEn && entry.excerptEn ? entry.excerptEn : entry.excerpt}
                </p>
              )}
            </Link>
          </motion.li>
        ))
      )}
    </ul>
  );
}
