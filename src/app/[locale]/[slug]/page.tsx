import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getPage, getAllPages } from "@/lib/contentful";
import { LOCALES, isValidLocale, type Locale } from "@/lib/i18n";
import BlockRenderer from "@/components/BlockRenderer";
import LiveBlockRenderer from "@/components/LiveBlockRenderer";
import type { Metadata } from "next";
import type { ResolvedBlock } from "@/lib/types/contentful";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const results: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    const pages = await getAllPages(false, locale);
    for (const p of pages) {
      if (p.fields.slug !== "home") {
        results.push({ locale, slug: p.fields.slug });
      }
    }
  }
  return results;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isValidLocale(localeParam)) return {};
  const page = await getPage(slug, false, localeParam as Locale);
  if (!page) return {};
  return {
    title: page.fields.title,
    description: page.fields.metaDescription ?? undefined,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const draft = await draftMode();
  const page = await getPage(slug, draft.isEnabled, locale);
  if (!page) notFound();

  const blocks = (page.fields.body ?? []) as (ResolvedBlock | undefined)[];

  return draft.isEnabled
    ? <LiveBlockRenderer blocks={blocks} locale={locale} />
    : <BlockRenderer blocks={blocks} locale={locale} />;
}
