import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/contentful";
import { getAssetUrl } from "@/lib/types/contentful";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Read our latest articles and insights.",
};

export default async function BlogListingPage() {
  const draft = await draftMode();
  const posts = await getBlogPosts(draft.isEnabled);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold">Blog</h1>
      <p className="mb-12 text-lg text-text-muted">Latest articles and insights</p>

      {posts.length === 0 ? (
        <p className="text-text-muted">No posts yet. Check back soon!</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const imageUrl = getAssetUrl(post.fields.featuredImage);
            return (
              <Link
                key={post.sys.id}
                href={`/blog/${post.fields.slug}`}
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
                      {new Date(post.fields.publishedDate).toLocaleDateString("en-US", {
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
                      By {post.fields.author}
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
