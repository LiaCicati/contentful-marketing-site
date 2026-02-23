import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getPage, getAllPages } from "@/lib/contentful";
import BlockRenderer from "@/components/BlockRenderer";
import type { Metadata } from "next";
import type { ResolvedBlock } from "@/lib/types/contentful";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages
    .filter((p) => p.fields.slug !== "home")
    .map((p) => ({ slug: p.fields.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.fields.title,
    description: page.fields.metaDescription ?? undefined,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const draft = await draftMode();
  const page = await getPage(slug, draft.isEnabled);
  if (!page) notFound();

  const blocks = (page.fields.body ?? []) as (ResolvedBlock | undefined)[];

  return <BlockRenderer blocks={blocks} />;
}
