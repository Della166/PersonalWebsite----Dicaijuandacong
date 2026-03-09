import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Website",
  description: "Personal portfolio and blog",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let locale = "zh";
  let messages: Awaited<ReturnType<typeof getMessages>> = {};
  try {
    locale = await getLocale();
    messages = (await getMessages()) ?? {};
  } catch {
    // fallback when no locale (e.g. redirect from /)
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
