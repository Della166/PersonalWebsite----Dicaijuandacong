import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const isExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  pageExtensions: ["tsx", "ts", "mdx", "md"],
  ...(isExport && {
    output: "export",
    images: { unoptimized: true },
  }),
};

export default withNextIntl(nextConfig);
