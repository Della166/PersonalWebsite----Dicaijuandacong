import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx";

interface Props {
  source: string;
}

export function MDXRenderer({ source }: Props) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-[var(--text)] prose-p:text-[var(--text-muted)] prose-a:text-[var(--primary)] prose-strong:text-[var(--text)]">
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}
