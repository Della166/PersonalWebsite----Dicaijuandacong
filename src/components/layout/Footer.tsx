import { useTranslations } from 'next-intl';
import { Github, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span>© {year}</span>
            <span>·</span>
            <span>{t('copyright')}</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-green-300)] transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:your@email.com"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-green-300)] transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
            <span>{t('built_with')}</span>
            <Heart className="w-3.5 h-3.5 text-[var(--color-amber-300)]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
