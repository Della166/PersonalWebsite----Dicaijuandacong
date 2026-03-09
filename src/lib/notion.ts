import { Client } from "@notionhq/client";
import type { ContentItem } from "@/types/content";

const notion = process.env.NOTION_API_KEY
  ? new Client({ auth: process.env.NOTION_API_KEY })
  : null;

const DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";

export async function fetchNotionPosts(): Promise<ContentItem[]> {
  if (!notion || !DATABASE_ID) return [];
  try {
    const res = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    });
    return (res.results as unknown as { id: string; properties: Record<string, unknown> }[]).map(
      (page) => ({
        slug: (page.properties?.slug as { rich_text: { plain_text: string }[] })?.rich_text?.[0]?.plain_text ?? page.id,
        frontmatter: {
          title: (page.properties?.title as { title: { plain_text: string }[] })?.title?.[0]?.plain_text ?? "",
          date: new Date().toISOString().slice(0, 10),
          category: "blog",
          tags: [],
          lang: "zh",
          published: true,
        },
        content: "",
      })
    );
  } catch {
    return [];
  }
}
