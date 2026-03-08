'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                 text-[var(--color-text-secondary)] hover:text-[var(--color-green-300)]
                 border border-[var(--color-border-default)] hover:border-[var(--color-border-hover)]
                 bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)]
                 backdrop-blur-md transition-all duration-300"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'zh' ? 'EN' : '中文'}</span>
    </button>
  );
}
