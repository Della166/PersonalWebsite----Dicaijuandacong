import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  pageExtensions: ["tsx", "ts", "mdx", "md"],
};

export default withNextIntl(nextConfig);
