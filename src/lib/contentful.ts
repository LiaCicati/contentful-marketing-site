import { createClient } from "contentful";
import type {
  PageSkeleton,
  BlogPostSkeleton,
  SiteConfigSkeleton,
  ResolvedPage,
  ResolvedBlogPost,
  ResolvedSiteConfig,
} from "./types/contentful";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN!;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_TOKEN!;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

const deliveryClient = createClient({
  space: SPACE_ID,
  accessToken: DELIVERY_TOKEN,
  environment: ENVIRONMENT,
});

const previewClient = createClient({
  space: SPACE_ID,
  accessToken: PREVIEW_TOKEN,
  environment: ENVIRONMENT,
  host: "preview.contentful.com",
});

function getClient(preview = false) {
  return (preview ? previewClient : deliveryClient).withoutUnresolvableLinks;
}

// ─── Pages ─────────────────────────────────────────────────────

export async function getPage(slug: string, preview = false): Promise<ResolvedPage | null> {
  const entries = await getClient(preview).getEntries<PageSkeleton>({
    content_type: "page",
    "fields.slug": slug,
    include: 10,
    limit: 1,
  });
  return (entries.items[0] as ResolvedPage) ?? null;
}

export async function getAllPages(preview = false): Promise<ResolvedPage[]> {
  const entries = await getClient(preview).getEntries<PageSkeleton>({
    content_type: "page",
    include: 10,
  });
  return entries.items as ResolvedPage[];
}

// ─── Blog Posts ────────────────────────────────────────────────

export async function getBlogPosts(preview = false): Promise<ResolvedBlogPost[]> {
  const entries = await getClient(preview).getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    order: ["-fields.publishedDate"],
    include: 2,
  });
  return entries.items as ResolvedBlogPost[];
}

export async function getBlogPost(slug: string, preview = false): Promise<ResolvedBlogPost | null> {
  const entries = await getClient(preview).getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    "fields.slug": slug,
    include: 2,
    limit: 1,
  });
  return (entries.items[0] as ResolvedBlogPost) ?? null;
}

// ─── Site Config ───────────────────────────────────────────────

export async function getSiteConfig(preview = false): Promise<ResolvedSiteConfig | null> {
  const entries = await getClient(preview).getEntries<SiteConfigSkeleton>({
    content_type: "siteConfig",
    include: 10,
    limit: 1,
  });
  return (entries.items[0] as ResolvedSiteConfig) ?? null;
}
