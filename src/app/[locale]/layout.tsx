import type { Metadata } from "next";
import { Nunito } from 'next/font/google';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import BackToTop from '@/components/ui/BackToTop';
import CustomCursor from '@/components/ui/CustomCursor';
import MotionProvider from '@/components/providers/MotionProvider';
import "../globals.css";

// 圆润可爱字体（拉丁/数字）。中文走系统字体（PingFang SC / 微软雅黑），
// 不引 Noto Sans SC —— CJK web 字体体积大，国内从 Google 拉取不稳定。
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Personal Website | AI Engineer & Creator",
  description: "AI Engineer, Full-Stack Developer, and Content Creator portfolio",
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`light ${nunito.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){var t=localStorage.getItem('theme')||'light';var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(t)})()`}
        </Script>
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>
            <div className="grain-overlay" aria-hidden="true" />
            <CustomCursor />
            <ScrollProgress />
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
            <BackToTop />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
