'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Github, MessageCircle, Send, Loader2, CheckCircle2 } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import GlassCard from '@/components/ui/GlassCard';
import { staggerContainer, fadeUp } from '@/lib/motion';

const contactLinks = [
  {
    key: 'email',
    icon: Mail,
    href: 'mailto:cmu2018hhh@gmail.com',
    value: 'cmu2018hhh@gmail.com',
    color: 'var(--color-amber-300)',
  },
  {
    key: 'github',
    icon: Github,
    href: 'https://github.com/Della166',
    value: '@Della166',
    color: 'var(--color-text-primary)',
  },
  {
    key: 'wechat',
    icon: MessageCircle,
    href: '#',
    value: 'dicaijuandacong',
    color: 'var(--color-green-300)',
  },
];

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FormState = { name: string; email: string; message: string };
type FieldErrors = Partial<Record<keyof FormState, boolean>>;

export default function Contact() {
  const t = useTranslations('contact');
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = true;
    if (!EMAIL_RE.test(form.email)) next.email = true;
    if (!form.message.trim()) next.message = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const update =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: form.name,
          email: form.email,
          message: form.message,
          subject: `Portfolio contact from ${form.name}`,
          from_name: 'Personal Website',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

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
          <GlassCard hover={false} animateIn={false}>
            {status === 'success' ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="inline-flex p-4 rounded-full bg-[var(--color-green-300)]/10 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[var(--color-green-300)]" />
                </div>
                <p className="text-[var(--color-text-primary)] font-medium max-w-sm">
                  {t('form_success')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                  {t('description')}
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      className={`form-field ${errors.name ? 'form-field--error' : ''}`}
                      placeholder={t('form_name')}
                      value={form.name}
                      onChange={update('name')}
                      aria-label={t('form_name')}
                    />
                    {errors.name && (
                      <p className="mt-1.5 ml-3 text-xs text-[#e06c75]">{t('form_err_name')}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      className={`form-field ${errors.email ? 'form-field--error' : ''}`}
                      placeholder={t('form_email')}
                      value={form.email}
                      onChange={update('email')}
                      aria-label={t('form_email')}
                    />
                    {errors.email && (
                      <p className="mt-1.5 ml-3 text-xs text-[#e06c75]">{t('form_err_email')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <textarea
                    className={`form-field form-field--textarea ${errors.message ? 'form-field--error' : ''}`}
                    placeholder={t('form_message')}
                    value={form.message}
                    onChange={update('message')}
                    rows={4}
                    aria-label={t('form_message')}
                  />
                  {errors.message && (
                    <p className="mt-1.5 ml-3 text-xs text-[#e06c75]">{t('form_err_message')}</p>
                  )}
                </div>

                {status === 'error' && (
                  <p className="text-sm text-[#e06c75]">{t('form_error')}</p>
                )}

                <div className="flex justify-center pt-1">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="button-primary-solid inline-flex items-center gap-2 px-7 py-3 disabled:opacity-60"
                  >
                    {status === 'submitting' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {status === 'submitting' ? t('form_sending') : t('form_submit')}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-[var(--color-border-default)]">
              <p className="text-center text-xs text-[var(--color-text-muted)] mb-4">
                {t('or_reach')}
              </p>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                className="grid sm:grid-cols-3 gap-4"
              >
                {contactLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <motion.a
                      key={link.key}
                      variants={fadeUp}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
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
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
