interface ProjectDemoLinkOptions {
  demo: string;
  locale: string;
  slug?: string;
}

export function getProjectDemoHref({ demo, locale, slug }: ProjectDemoLinkOptions) {
  if (demo.startsWith('#')) {
    return slug ? `/${locale}/projects/${slug}${demo}` : demo;
  }

  if (demo.startsWith('/')) {
    return `/${locale}${demo}`;
  }

  return demo;
}

export function isInternalProjectDemo(demo: string) {
  return demo.startsWith('#') || demo.startsWith('/');
}

export function isPreviewProjectDemo(demo: string) {
  return demo.startsWith('#') || demo.startsWith('/');
}
