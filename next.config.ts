import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isGithubPages = process.env.NEXT_OUTPUT === 'export';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  ...(isGithubPages && {
    output: 'export',
    basePath: '',
    images: { unoptimized: true },
  }),
  ...(!isGithubPages && {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
  }),
};

export default withNextIntl(nextConfig);
