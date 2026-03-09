"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--bg-deep)]/60 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-[var(--text-muted)] md:px-6">
        © {new Date().getFullYear()} {t("rights")}
      </div>
    </footer>
  );
}
