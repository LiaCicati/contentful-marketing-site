import type { ResolvedBlock } from "@/lib/types/contentful";
import Hero from "./blocks/Hero";
import TextWithImage from "./blocks/TextWithImage";
import CallToAction from "./blocks/CallToAction";
import RichTextBlock from "./blocks/RichTextBlock";
import type { ResolvedHero, ResolvedTextWithImage, ResolvedCallToAction, ResolvedRichTextBlock } from "@/lib/types/contentful";

interface BlockRendererProps {
  blocks: (ResolvedBlock | undefined | null)[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        if (!block) return null;

        const contentTypeId = block.sys.contentType?.sys?.id;

        switch (contentTypeId) {
          case "hero":
            return <Hero key={block.sys.id} entry={block as ResolvedHero} />;
          case "textWithImage":
            return <TextWithImage key={block.sys.id} entry={block as ResolvedTextWithImage} />;
          case "callToAction":
            return <CallToAction key={block.sys.id} entry={block as ResolvedCallToAction} />;
          case "richTextBlock":
            return <RichTextBlock key={block.sys.id} entry={block as ResolvedRichTextBlock} />;
          default:
            console.warn(`BlockRenderer: unrecognized content type "${contentTypeId}"`);
            return null;
        }
      })}
    </>
  );
}
