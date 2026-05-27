import type { Metadata } from "next";
import { Nunito } from 'next/font/google';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
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
  metadataBase: new URL('https://fulingchen.me'),
  title: {
    default: 'fulingchen — AI Engineer & Creator',
    template: '%s · fulingchen',
  },
  description:
    'AI 工程师 / 全栈开发 / 内容创作者作品集。10 个含真实代码细节的工业级 AI 项目案例：NL2SQL 微调、DPO Agent、LangExtract RAG、Deep Research、GRPO、VLM RL …',
  applicationName: 'fulingchen',
  authors: [{ name: 'fulingchen', url: 'https://fulingchen.me' }],
  keywords: [
    'AI Engineer', 'LangChain', 'LangExtract', 'GRPO', 'DPO', 'NL2SQL',
    'Multimodal RAG', 'Qwen', 'DeepSeek', 'Agent', 'fulingchen',
    'AI 工程师', '大模型应用', '智能体开发',
  ],
  openGraph: {
    type: 'website',
    siteName: 'fulingchen',
    title: 'fulingchen — AI Engineer & Creator',
    description:
      'AI 工程师 / 全栈开发 / 内容创作者作品集。10 个含真实代码细节的工业级 AI 项目案例。',
    locale: 'zh_CN',
    alternateLocale: ['en_US'],
    url: 'https://fulingchen.me',
    images: [
      {
        url: 'https://fulingchen.me/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'fulingchen — AI Engineer & Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'fulingchen — AI Engineer & Creator',
    description: '10 个含真实代码细节的工业级 AI 项目案例。',
    images: ['https://fulingchen.me/opengraph-image'],
  },
  alternates: {
    canonical: 'https://fulingchen.me',
    languages: {
      'zh-CN': 'https://fulingchen.me/zh',
      'en-US': 'https://fulingchen.me/en',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
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

  // 启用 next-intl 静态渲染 —— 避免 getMessages 走 headers() 导致动态化
  setRequestLocale(locale);

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
