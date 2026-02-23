import type { Asset, Entry, EntrySkeletonType, EntryFieldTypes } from "contentful";

// ─── Field Skeletons ───────────────────────────────────────────

export interface NavigationItemFields {
  label: EntryFieldTypes.Text;
  url: EntryFieldTypes.Text;
  openInNewTab?: EntryFieldTypes.Boolean;
  children?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<NavigationItemSkeleton>>;
}

export interface NavigationItemSkeleton extends EntrySkeletonType {
  contentTypeId: "navigationItem";
  fields: NavigationItemFields;
}

export interface HeroFields {
  internalName: EntryFieldTypes.Text;
  headline: EntryFieldTypes.Text;
  subheadline?: EntryFieldTypes.Text;
  ctaLabel?: EntryFieldTypes.Text;
  ctaUrl?: EntryFieldTypes.Text;
  backgroundImage?: EntryFieldTypes.AssetLink;
  variant: EntryFieldTypes.Text;
}

export interface HeroSkeleton extends EntrySkeletonType {
  contentTypeId: "hero";
  fields: HeroFields;
}

export interface TextWithImageFields {
  internalName: EntryFieldTypes.Text;
  content: EntryFieldTypes.RichText;
  image?: EntryFieldTypes.AssetLink;
  layout: EntryFieldTypes.Text;
}

export interface TextWithImageSkeleton extends EntrySkeletonType {
  contentTypeId: "textWithImage";
  fields: TextWithImageFields;
}

export interface CallToActionFields {
  internalName: EntryFieldTypes.Text;
  headline: EntryFieldTypes.Text;
  body?: EntryFieldTypes.RichText;
  buttonLabel?: EntryFieldTypes.Text;
  buttonUrl?: EntryFieldTypes.Text;
}

export interface CallToActionSkeleton extends EntrySkeletonType {
  contentTypeId: "callToAction";
  fields: CallToActionFields;
}

export interface RichTextBlockFields {
  internalName: EntryFieldTypes.Text;
  body: EntryFieldTypes.RichText;
}

export interface RichTextBlockSkeleton extends EntrySkeletonType {
  contentTypeId: "richTextBlock";
  fields: RichTextBlockFields;
}

export type BlockSkeleton =
  | HeroSkeleton
  | TextWithImageSkeleton
  | CallToActionSkeleton
  | RichTextBlockSkeleton;

export interface PageFields {
  title: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Text;
  metaDescription?: EntryFieldTypes.Text;
  body?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<BlockSkeleton>>;
}

export interface PageSkeleton extends EntrySkeletonType {
  contentTypeId: "page";
  fields: PageFields;
}

export interface BlogPostFields {
  title: EntryFieldTypes.Text;
  slug: EntryFieldTypes.Text;
  excerpt?: EntryFieldTypes.Text;
  content?: EntryFieldTypes.RichText;
  featuredImage?: EntryFieldTypes.AssetLink;
  publishedDate?: EntryFieldTypes.Date;
  author?: EntryFieldTypes.Text;
}

export interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: "blogPost";
  fields: BlogPostFields;
}

export interface SocialLink {
  [key: string]: string;
  platform: string;
  url: string;
}

export interface SiteConfigFields {
  siteName: EntryFieldTypes.Text;
  logo?: EntryFieldTypes.AssetLink;
  headerNavigation?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<NavigationItemSkeleton>>;
  copyrightText?: EntryFieldTypes.Text;
  socialLinks?: EntryFieldTypes.Object<SocialLink[]>;
}

export interface SiteConfigSkeleton extends EntrySkeletonType {
  contentTypeId: "siteConfig";
  fields: SiteConfigFields;
}

// ─── Resolved Types (what you get after fetching) ──────────────

export type ResolvedNavigationItem = Entry<NavigationItemSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
export type ResolvedHero = Entry<HeroSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
export type ResolvedTextWithImage = Entry<TextWithImageSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
export type ResolvedCallToAction = Entry<CallToActionSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
export type ResolvedRichTextBlock = Entry<RichTextBlockSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
export type ResolvedPage = Entry<PageSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
export type ResolvedBlogPost = Entry<BlogPostSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
export type ResolvedSiteConfig = Entry<SiteConfigSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;

export type ResolvedBlock =
  | ResolvedHero
  | ResolvedTextWithImage
  | ResolvedCallToAction
  | ResolvedRichTextBlock;

// Helper to extract asset URL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAssetUrl(asset: any): string | null {
  const url = asset?.fields?.file?.url;
  if (!url || typeof url !== "string") return null;
  return url.startsWith("//") ? `https:${url}` : url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAssetDimensions(asset: any): { width: number; height: number } | null {
  const details = asset?.fields?.file?.details;
  if (!details || !details.image) return null;
  return { width: details.image.width, height: details.image.height };
}
