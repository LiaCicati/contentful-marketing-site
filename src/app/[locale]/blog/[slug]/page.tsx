import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { getBlogPost, getBlogPosts } from "@/lib/contentful";
import { getAssetUrl, getAssetDimensions } from "@/lib/types/contentful";
import { LOCALES, isValidLocale, getDateLocale, t, type Locale } from "@/lib/i18n";
import { richTextOptions } from "@/lib/richTextOptions";
import type { Metadata } from "next";

export const revalidate = 60;

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const results: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    const posts = await getBlogPosts(false, locale);
    for (const p of posts) {
      results.push({ locale, slug: p.fields.slug });
    }
  }
  return results;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isValidLocale(localeParam)) return {};
  const post = await getBlogPost(slug, false, localeParam as Locale);
  if (!post) return {};
  return {
    title: post.fields.title,
    description: post.fields.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const draft = await draftMode();
  const post = await getBlogPost(slug, draft.isEnabled, locale);
  if (!post) notFound();

  const imageUrl = getAssetUrl(post.fields.featuredImage);
  const dims = getAssetDimensions(post.fields.featuredImage);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={`/${locale}/blog`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted transition hover:text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t(locale, "blog.back")}
      </Link>

      <h1 className="mb-4 text-4xl font-bold md:text-5xl">{post.fields.title}</h1>

      <div className="mb-8 flex items-center gap-4 text-sm text-text-muted">
        {post.fields.author && <span>{t(locale, "blog.by")} {post.fields.author}</span>}
        {post.fields.publishedDate && (
          <>
            <span aria-hidden="true">&middot;</span>
            <time>
              {new Date(post.fields.publishedDate).toLocaleDateString(getDateLocale(locale), {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </>
        )}
      </div>

      {imageUrl && (
        <div className="mb-10 overflow-hidden rounded-lg">
          <Image
            src={`${imageUrl}?w=900&fm=webp`}
            alt={post.fields.title}
            width={dims?.width ?? 900}
            height={dims?.height ?? 506}
            className="w-full"
            priority
          />
        </div>
      )}

      {post.fields.content && (
        <div className="prose max-w-none">
          {documentToReactComponents(post.fields.content, richTextOptions)}
        </div>
      )}
    </article>
  );
}
