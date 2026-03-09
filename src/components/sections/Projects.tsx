"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { projects } from "@/data/projects";
import type { ProjectItem, ProjectCategory } from "@/data/projects";

const tabs = ["all", "agent", "webapp", "miniapp", "other"] as const;

export default function Projects() {
  const t = useTranslations("Projects");
  const [active, setActive] = useState<(typeof tabs)[number]>("all");

  const filtered: ProjectItem[] =
    active === "all"
      ? projects
      : projects.filter((p) => p.category === (active as ProjectCategory));

  return (
    <section id="projects" className="section-padding scroll-mt-20 bg-[var(--bg-mid)]/30">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <motion.h2
          className="mb-6 text-3xl font-semibold text-[var(--text)]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t("title")}
        </motion.h2>
        <motion.div
          className="mb-8 flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                active === tab
                  ? "border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--primary-light)]"
                  : "border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--primary)]/50"
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.length === 0 ? (
            <p className="col-span-2 text-[var(--text-muted)]">暂无项目数据，请在 src/data/projects.ts 中添加。</p>
          ) : (
            filtered.map((p, i) => (
              <motion.a
                key={p.id}
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card block rounded-xl p-5 transition hover:border-[var(--primary)]/50"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-medium text-[var(--text)]">{p.name}</h3>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                </div>
                <p className="mb-3 text-sm text-[var(--text-muted)]">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-[var(--bg-deep)]/60 px-2 py-0.5 text-xs text-[var(--primary-light)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.a>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
