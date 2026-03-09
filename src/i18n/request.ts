import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: string;
  try {
    const requested = await requestLocale;
    locale = routing.locales.includes(requested as typeof routing.locales[number])
      ? (requested as string)
      : routing.defaultLocale;
  } catch {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
