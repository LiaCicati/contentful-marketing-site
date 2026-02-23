import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { getBlogPost, getBlogPosts } from "@/lib/contentful";
import { getAssetUrl, getAssetDimensions } from "@/lib/types/contentful";
import { richTextOptions } from "@/lib/richTextOptions";
import type { Metadata } from "next";

export const revalidate = 60;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.fields.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.fields.title,
    description: post.fields.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const draft = await draftMode();
  const post = await getBlogPost(slug, draft.isEnabled);
  if (!post) notFound();

  const imageUrl = getAssetUrl(post.fields.featuredImage);
  const dims = getAssetDimensions(post.fields.featuredImage);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted transition hover:text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      <h1 className="mb-4 text-4xl font-bold md:text-5xl">{post.fields.title}</h1>

      <div className="mb-8 flex items-center gap-4 text-sm text-text-muted">
        {post.fields.author && <span>By {post.fields.author}</span>}
        {post.fields.publishedDate && (
          <>
            <span aria-hidden="true">&middot;</span>
            <time>
              {new Date(post.fields.publishedDate).toLocaleDateString("en-US", {
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
