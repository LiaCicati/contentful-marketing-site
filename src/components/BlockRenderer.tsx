import type { ResolvedBlock } from "@/lib/types/contentful";
import type { Locale } from "@/lib/i18n";
import Hero from "./blocks/Hero";
import TextWithImage from "./blocks/TextWithImage";
import CallToAction from "./blocks/CallToAction";
import RichTextBlock from "./blocks/RichTextBlock";
import type { ResolvedHero, ResolvedTextWithImage, ResolvedCallToAction, ResolvedRichTextBlock } from "@/lib/types/contentful";

interface BlockRendererProps {
  blocks: (ResolvedBlock | undefined | null)[];
  locale: Locale;
}

export default function BlockRenderer({ blocks, locale }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        if (!block) return null;

        const contentTypeId = block.sys.contentType?.sys?.id;

        switch (contentTypeId) {
          case "hero":
            return <Hero key={block.sys.id} entry={block as ResolvedHero} locale={locale} />;
          case "textWithImage":
            return <TextWithImage key={block.sys.id} entry={block as ResolvedTextWithImage} locale={locale} />;
          case "callToAction":
            return <CallToAction key={block.sys.id} entry={block as ResolvedCallToAction} locale={locale} />;
          case "richTextBlock":
            return <RichTextBlock key={block.sys.id} entry={block as ResolvedRichTextBlock} locale={locale} />;
          default:
            console.warn(`BlockRenderer: unrecognized content type "${contentTypeId}"`);
            return null;
        }
      })}
    </>
  );
}
