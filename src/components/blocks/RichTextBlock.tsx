import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { ResolvedRichTextBlock } from "@/lib/types/contentful";
import { richTextOptions } from "@/lib/richTextOptions";

interface RichTextBlockProps {
  entry: ResolvedRichTextBlock;
}

export default function RichTextBlock({ entry }: RichTextBlockProps) {
  const { body } = entry.fields;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="prose max-w-none">
          {documentToReactComponents(body, richTextOptions)}
        </div>
      </div>
    </section>
  );
}
