import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/contentful";
import { getAssetUrl } from "@/lib/types/contentful";
import { isValidLocale, getDateLocale, t, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) return {};
  return {
    title: t(localeParam as Locale, "blog.title"),
    description: t(localeParam as Locale, "blog.subtitle"),
  };
}

export default async function BlogListingPage({ params }: BlogPageProps) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const draft = await draftMode();
  const posts = await getBlogPosts(draft.isEnabled, locale);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold">{t(locale, "blog.title")}</h1>
      <p className="mb-12 text-lg text-text-muted">{t(locale, "blog.subtitle")}</p>

      {posts.length === 0 ? (
        <p className="text-text-muted">{t(locale, "blog.empty")}</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const imageUrl = getAssetUrl(post.fields.featuredImage);
            return (
              <Link
                key={post.sys.id}
                href={`/${locale}/blog/${post.fields.slug}`}
                className="group overflow-hidden rounded-lg border border-border transition hover:shadow-lg"
              >
                {imageUrl && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={`${imageUrl}?w=600&h=340&fm=webp&fit=fill`}
                      alt={post.fields.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  {post.fields.publishedDate && (
                    <time className="mb-2 block text-sm text-text-muted">
                      {new Date(post.fields.publishedDate).toLocaleDateString(getDateLocale(locale), {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  <h2 className="mb-2 text-xl font-semibold group-hover:text-primary">
                    {post.fields.title}
                  </h2>
                  {post.fields.excerpt && (
                    <p className="text-sm text-text-muted line-clamp-2">{post.fields.excerpt}</p>
                  )}
                  {post.fields.author && (
                    <p className="mt-3 text-xs font-medium text-text-muted">
                      {t(locale, "blog.by")} {post.fields.author}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
