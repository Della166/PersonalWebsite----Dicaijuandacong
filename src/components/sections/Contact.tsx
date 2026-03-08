'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Github, MessageCircle, Send } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';

const contactLinks = [
  {
    key: 'email',
    icon: Mail,
    href: 'mailto:your@email.com',
    value: 'your@email.com',
    color: 'var(--color-amber-300)',
  },
  {
    key: 'github',
    icon: Github,
    href: 'https://github.com/yourusername',
    value: '@yourusername',
    color: 'var(--color-text-primary)',
  },
  {
    key: 'wechat',
    icon: MessageCircle,
    href: '#',
    value: 'your_wechat_id',
    color: 'var(--color-green-300)',
  },
];

export default function Contact() {
  const t = useTranslations('contact');

  return (
    <section id="contact" className="section-container">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard hover={false} className="text-center">
            <div className="inline-flex p-4 rounded-full bg-[var(--color-green-300)]/10 mb-6">
              <Send className="w-8 h-8 text-[var(--color-green-300)]" />
            </div>

            <p className="text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto">
              {t('description')}
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {contactLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.key}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl
                               border border-[var(--color-border-default)]
                               hover:border-[var(--color-border-hover)]
                               hover:bg-[var(--color-bg-card)]
                               transition-all duration-300 group"
                  >
                    <Icon
                      className="w-6 h-6 transition-colors duration-300"
                      style={{ color: link.color }}
                    />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {t(link.key)}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-green-300)] transition-colors">
                      {link.value}
                    </span>
                  </motion.a>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
