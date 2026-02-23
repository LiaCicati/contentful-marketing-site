"use client";

import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import type { ResolvedBlock, ResolvedHero, ResolvedTextWithImage, ResolvedCallToAction, ResolvedRichTextBlock } from "@/lib/types/contentful";
import type { Locale } from "@/lib/i18n";
import Hero from "./blocks/Hero";
import TextWithImage from "./blocks/TextWithImage";
import CallToAction from "./blocks/CallToAction";
import RichTextBlock from "./blocks/RichTextBlock";

/** Renders a single block with live updates from Contentful. */
function LiveBlock({ block, locale }: { block: ResolvedBlock; locale: Locale }) {
  const updated = useContentfulLiveUpdates(block);
  const contentTypeId = updated.sys.contentType?.sys?.id;

  switch (contentTypeId) {
    case "hero":
      return <Hero entry={updated as ResolvedHero} locale={locale} />;
    case "textWithImage":
      return <TextWithImage entry={updated as ResolvedTextWithImage} locale={locale} />;
    case "callToAction":
      return <CallToAction entry={updated as ResolvedCallToAction} locale={locale} />;
    case "richTextBlock":
      return <RichTextBlock entry={updated as ResolvedRichTextBlock} locale={locale} />;
    default:
      return null;
  }
}

interface LiveBlockRendererProps {
  blocks: (ResolvedBlock | undefined | null)[];
  locale: Locale;
}

/** Client-side block renderer with live preview updates (used in draft mode). */
export default function LiveBlockRenderer({ blocks, locale }: LiveBlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        if (!block || !block.sys?.contentType?.sys?.id) return null;
        return <LiveBlock key={block.sys.id} block={block} locale={locale} />;
      })}
    </>
  );
}
