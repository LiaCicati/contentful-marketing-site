"use client";

import Image from "next/image";
import Link from "next/link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import type { ResolvedBlogPost } from "@/lib/types/contentful";
import { getAssetUrl, getAssetDimensions } from "@/lib/types/contentful";
import { getDateLocale, t, type Locale } from "@/lib/i18n";
import { getRichTextOptions } from "@/lib/richTextOptions";

interface LiveBlogPostProps {
  post: ResolvedBlogPost;
  locale: Locale;
}

/** Client-side blog post renderer with live preview updates (used in draft mode). */
export default function LiveBlogPost({ post, locale }: LiveBlogPostProps) {
  const updated = useContentfulLiveUpdates(post);

  const imageUrl = getAssetUrl(updated.fields.featuredImage);
  const dims = getAssetDimensions(updated.fields.featuredImage);

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

      <h1
        className="mb-4 text-4xl font-bold md:text-5xl"
        data-contentful-entry-id={updated.sys.id}
        data-contentful-field-id="title"
      >
        {updated.fields.title}
      </h1>

      <div className="mb-8 flex items-center gap-4 text-sm text-text-muted">
        {updated.fields.author && (
          <span data-contentful-entry-id={updated.sys.id} data-contentful-field-id="author">
            {t(locale, "blog.by")} {updated.fields.author}
          </span>
        )}
        {updated.fields.publishedDate && (
          <>
            <span aria-hidden="true">&middot;</span>
            <time>
              {new Date(updated.fields.publishedDate).toLocaleDateString(getDateLocale(locale), {
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
            alt={updated.fields.title}
            width={dims?.width ?? 900}
            height={dims?.height ?? 506}
            className="w-full"
            priority
          />
        </div>
      )}

      {updated.fields.content && (
        <div
          className="prose max-w-none"
          data-contentful-entry-id={updated.sys.id}
          data-contentful-field-id="content"
        >
          {documentToReactComponents(updated.fields.content, getRichTextOptions(locale))}
        </div>
      )}
    </article>
  );
}
