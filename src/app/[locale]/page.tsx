import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/contentful";
import { isValidLocale, type Locale } from "@/lib/i18n";
import BlockRenderer from "@/components/BlockRenderer";
import type { Metadata } from "next";
import type { ResolvedBlock } from "@/lib/types/contentful";

export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) return {};
  const page = await getPage("home", false, localeParam as Locale);
  if (!page) return {};
  return {
    title: page.fields.title,
    description: page.fields.metaDescription ?? undefined,
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const draft = await draftMode();
  const page = await getPage("home", draft.isEnabled, locale);
  if (!page) notFound();

  const blocks = (page.fields.body ?? []) as (ResolvedBlock | undefined)[];

  return <BlockRenderer blocks={blocks} />;
}
