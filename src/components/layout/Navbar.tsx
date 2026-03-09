"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Languages } from "lucide-react";

const navKeys = [
  "home",
  "about",
  "skills",
  "projects",
  "research",
  "blog",
  "creative",
  "contact",
] as const;

const sectionIds: Record<(typeof navKeys)[number], string> = {
  home: "hero",
  about: "about",
  skills: "skills",
  projects: "projects",
  research: "research",
  blog: "blog",
  creative: "creative",
  contact: "contact",
};

export default function Navbar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const isHome = pathname === "/zh" || pathname === "/en";
  const base = pathname.startsWith("/en") ? "/en" : "/zh";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--glass-border)] bg-[var(--bg-deep)]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          {navKeys.map((key) => {
            const href =
              key === "home"
                ? base
                : key === "blog"
                  ? `${base}/blog`
                  : isHome
                    ? `#${sectionIds[key]}`
                    : `${base}#${sectionIds[key]}`;
            return (
              <Link
                key={key}
                href={href}
                className="text-sm text-[var(--text-muted)] transition hover:text-[var(--primary)]"
              >
                {t(key)}
              </Link>
            );
          })}
        </div>
        <Link
          href={pathname}
          locale={pathname.startsWith("/en") ? "zh" : "en"}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-3 py-1.5 text-sm text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          <Languages className="h-4 w-4" />
          {t("langSwitch")}
        </Link>
      </nav>
    </header>
  );
}
