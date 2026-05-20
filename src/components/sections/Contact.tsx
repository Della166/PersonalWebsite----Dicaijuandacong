'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Mail,
  Github,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  User,
  MessageSquare,
  Lock,
} from 'lucide-react';
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
] as const;

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WECHAT_ID = 'dicaijuandacong';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FormState = { name: string; email: string; message: string };
type FlagMap = Partial<Record<keyof FormState, boolean>>;

function isFieldValid(key: keyof FormState, value: string): boolean {
  if (key === 'email') return EMAIL_RE.test(value);
  return value.trim().length > 0;
}

export default function Contact() {
  const t = useTranslations('contact');
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FlagMap>({});
  const [touched, setTouched] = useState<FlagMap>({});
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);

  const submitting = status === 'submitting';

  const validateAll = (): boolean => {
    const next: FlagMap = {};
    (Object.keys(form) as Array<keyof FormState>).forEach((k) => {
      if (!isFieldValid(k, form[k])) next[k] = true;
    });
    setErrors(next);
    setTouched({ name: true, email: true, message: true });
    return Object.keys(next).length === 0;
  };

  const update =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      // 已经显示过错误的字段：用户开始修改时即时清掉
      if (errors[key] && isFieldValid(key, value)) {
        setErrors((prev) => ({ ...prev, [key]: false }));
      }
    };

  const handleBlur = (key: keyof FormState) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: !isFieldValid(key, form[key]) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAll()) return;
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
        setTouched({});
        setErrors({});
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const sendAnother = () => setStatus('idle');

  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText(WECHAT_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore — older browsers / blocked clipboard */
    }
  };

  // 字段实际报错条件：被 touched 过 + 当前无效。submit 后所有字段都会被标记 touched。
  const showErr = (key: keyof FormState) => !!(touched[key] && errors[key]);

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
              <div className="flex flex-col items-center text-center py-10">
                <div className="inline-flex p-4 rounded-full bg-[var(--color-green-300)]/10 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[var(--color-green-300)]" />
                </div>
                <p className="text-[var(--color-text-primary)] font-medium max-w-sm mb-5">
                  {t('form_success')}
                </p>
                <button
                  type="button"
                  onClick={sendAnother}
                  className="button-secondary-outline inline-flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  {t('form_send_another')}
                </button>
              </div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                noValidate
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                className="space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <motion.div variants={fadeUp}>
                    <label
                      htmlFor="contact-name"
                      className="block mb-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
                    >
                      {t('form_lbl_name')}
                      <span className="ml-0.5 text-[var(--color-green-300)]">*</span>
                    </label>
                    <div className="relative">
                      <User className="field-icon field-icon--center" />
                      <input
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        disabled={submitting}
                        className={`form-field form-field--icon ${showErr('name') ? 'form-field--error' : ''}`}
                        placeholder={t('form_name')}
                        value={form.name}
                        onChange={update('name')}
                        onBlur={handleBlur('name')}
                      />
                    </div>
                    {showErr('name') && (
                      <p className="mt-1.5 ml-3 text-xs text-[#e06c75]">{t('form_err_name')}</p>
                    )}
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <label
                      htmlFor="contact-email"
                      className="block mb-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
                    >
                      {t('form_lbl_email')}
                      <span className="ml-0.5 text-[var(--color-green-300)]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="field-icon field-icon--center" />
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        disabled={submitting}
                        className={`form-field form-field--icon ${showErr('email') ? 'form-field--error' : ''}`}
                        placeholder={t('form_email')}
                        value={form.email}
                        onChange={update('email')}
                        onBlur={handleBlur('email')}
                      />
                    </div>
                    {showErr('email') && (
                      <p className="mt-1.5 ml-3 text-xs text-[#e06c75]">{t('form_err_email')}</p>
                    )}
                  </motion.div>
                </div>

                <motion.div variants={fadeUp}>
                  <label
                    htmlFor="contact-message"
                    className="block mb-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
                  >
                    {t('form_lbl_message')}
                    <span className="ml-0.5 text-[var(--color-green-300)]">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="field-icon field-icon--top" />
                    <textarea
                      id="contact-message"
                      disabled={submitting}
                      className={`form-field form-field--textarea form-field--icon ${showErr('message') ? 'form-field--error' : ''}`}
                      placeholder={t('form_message')}
                      value={form.message}
                      onChange={update('message')}
                      onBlur={handleBlur('message')}
                      rows={4}
                    />
                  </div>
                  {showErr('message') && (
                    <p className="mt-1.5 ml-3 text-xs text-[#e06c75]">{t('form_err_message')}</p>
                  )}
                </motion.div>

                {status === 'error' && (
                  <p className="text-sm text-[#e06c75]">{t('form_error')}</p>
                )}

                <motion.div variants={fadeUp} className="space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="button-primary-solid w-full inline-flex items-center justify-center gap-2 py-3 disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {submitting ? t('form_sending') : t('form_submit')}
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <Lock className="w-3 h-3" />
                    {t('form_privacy')}
                  </p>
                </motion.div>
              </motion.form>
            )}

            {/* 横线分隔 + 中间文字 —— 经典 OR divider */}
            <div className="relative flex items-center my-8" aria-hidden="true">
              <div className="flex-1 h-px bg-[var(--color-border-default)]" />
              <span className="px-3 text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                {t('or_reach')}
              </span>
              <div className="flex-1 h-px bg-[var(--color-border-default)]" />
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid sm:grid-cols-3 gap-3"
            >
              {contactLinks.map((link) => {
                const Icon = link.icon;
                const isWechat = link.key === 'wechat';
                const shared =
                  'flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border-default)] ' +
                  'hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-card)] ' +
                  'transition-all duration-300 group w-full text-center';
                const inner = (
                  <>
                    <Icon
                      className="w-5 h-5 transition-colors duration-300"
                      style={{ color: link.color }}
                    />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {t(link.key)}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-green-300)] transition-colors">
                      {isWechat && copied ? t('wechat_copied') : link.value}
                    </span>
                  </>
                );
                return (
                  <motion.div key={link.key} variants={fadeUp}>
                    {isWechat ? (
                      <button
                        type="button"
                        onClick={copyWechat}
                        aria-label={`Copy WeChat ID: ${link.value}`}
                        className={shared}
                      >
                        {inner}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className={shared}
                      >
                        {inner}
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
