import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/contentful";
import BlockRenderer from "@/components/BlockRenderer";
import type { Metadata } from "next";
import type { ResolvedBlock } from "@/lib/types/contentful";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  if (!page) return {};
  return {
    title: page.fields.title,
    description: page.fields.metaDescription ?? undefined,
  };
}

export default async function HomePage() {
  const draft = await draftMode();
  const page = await getPage("home", draft.isEnabled);
  if (!page) notFound();

  const blocks = (page.fields.body ?? []) as (ResolvedBlock | undefined)[];

  return <BlockRenderer blocks={blocks} />;
}
