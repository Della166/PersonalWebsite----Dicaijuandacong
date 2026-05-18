import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    request.nextUrl.host;

  if (host === 'www.fulingchen.me') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.hostname = 'fulingchen.me';

    return NextResponse.redirect(redirectUrl, 308);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*'],
};
