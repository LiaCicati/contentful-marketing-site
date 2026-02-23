import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { ResolvedRichTextBlock } from "@/lib/types/contentful";
import { getRichTextOptions } from "@/lib/richTextOptions";
import type { Locale } from "@/lib/i18n";

interface RichTextBlockProps {
  entry: ResolvedRichTextBlock;
  locale: Locale;
}

export default function RichTextBlock({ entry, locale }: RichTextBlockProps) {
  const { body } = entry.fields;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div
          className="prose max-w-none"
          data-contentful-entry-id={entry.sys.id}
          data-contentful-field-id="body"
        >
          {documentToReactComponents(body, getRichTextOptions(locale))}
        </div>
      </div>
    </section>
  );
}
