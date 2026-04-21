import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from './og-defaults';

const DEFAULT_OG_TYPE = 'website';
const DEFAULT_OG_SITE_NAME = 'JK.com';
const DEFAULT_TWITTER_CARD = 'summary_large_image';

interface BuildSeoMetadataOptions {
  site: URL;
  pathname: string;
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: string;
  ogSiteName: string;
  ogImageUrl: string;
  twitterCard: string;
}

export const buildSeoMetadata = ({
  site,
  pathname,
  title,
  description,
  ogImage,
}: BuildSeoMetadataOptions): SeoMetadata => {
  const resolvedTitle = title?.trim() || DEFAULT_OG_TITLE;
  const resolvedDescription = description?.trim() || DEFAULT_OG_DESCRIPTION;
  const canonicalUrl = new URL(pathname, site);

  const ogImageUrl = ogImage
    ? new URL(ogImage, site).href
    : (() => {
        const routePath = canonicalUrl.pathname.split('/').filter(Boolean).join('/');
        const dynamicOgPath = routePath ? `/api/og/${routePath}` : '/api/og';
        const dynamicOgUrl = new URL(dynamicOgPath, site);
        dynamicOgUrl.searchParams.set('title', resolvedTitle);
        dynamicOgUrl.searchParams.set('description', resolvedDescription);
        return dynamicOgUrl.href;
      })();

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    canonicalUrl: canonicalUrl.href,
    ogType: DEFAULT_OG_TYPE,
    ogSiteName: DEFAULT_OG_SITE_NAME,
    ogImageUrl,
    twitterCard: DEFAULT_TWITTER_CARD,
  };
};
