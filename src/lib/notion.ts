import { Client } from '@notionhq/client';
import { ContentItem, ContentFrontmatter } from '@/types/content';

function getNotionClient(): Client | null {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return null;
  return new Client({ auth: apiKey });
}

export async function getNotionPosts(databaseId?: string): Promise<ContentItem[]> {
  const notion = getNotionClient();
  if (!notion) return [];

  const dbId = databaseId || process.env.NOTION_DATABASE_ID;
  if (!dbId) return [];

  try {
    const response = await (notion as any).databases.query({
      database_id: dbId,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    // Map Notion pages to ContentItem format
    // This is a skeleton - actual property mapping depends on your Notion database schema
    return response.results.map((page: any) => {
      const properties = page.properties;
      return {
        frontmatter: {
          title: properties.Title?.title?.[0]?.plain_text || 'Untitled',
          date: properties.Date?.date?.start || new Date().toISOString(),
          category: 'blog',
          tags: properties.Tags?.multi_select?.map((t: any) => t.name) || [],
          lang: 'both',
          platforms: ['website'],
          published: true,
        } as ContentFrontmatter,
        content: '',
        slug: page.id,
        source: 'notion' as const,
      };
    });
  } catch (error) {
    console.error('Failed to fetch from Notion:', error);
    return [];
  }
}
