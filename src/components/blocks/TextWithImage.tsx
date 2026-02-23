import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { ResolvedTextWithImage } from "@/lib/types/contentful";
import { getAssetUrl, getAssetDimensions } from "@/lib/types/contentful";
import { getRichTextOptions } from "@/lib/richTextOptions";
import type { Locale } from "@/lib/i18n";

interface TextWithImageProps {
  entry: ResolvedTextWithImage;
  locale: Locale;
}

export default function TextWithImage({ entry, locale }: TextWithImageProps) {
  const { content, image, layout } = entry.fields;
  const imageUrl = getAssetUrl(image);
  const dims = getAssetDimensions(image);
  const isImageLeft = layout === "image-left";
  const entryId = entry.sys.id;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={`flex flex-col items-center gap-12 md:flex-row ${
            isImageLeft ? "" : "md:flex-row-reverse"
          }`}
        >
          {imageUrl && (
            <div
              className="w-full md:w-1/2"
              data-contentful-entry-id={entryId}
              data-contentful-field-id="image"
            >
              <Image
                src={`${imageUrl}?w=700&fm=webp`}
                alt={image?.fields?.title as string ?? ""}
                width={dims?.width ?? 700}
                height={dims?.height ?? 467}
                className="rounded-lg shadow-md"
              />
            </div>
          )}
          <div
            className="w-full md:w-1/2"
            data-contentful-entry-id={entryId}
            data-contentful-field-id="content"
          >
            <div className="prose max-w-none">
              {documentToReactComponents(content, getRichTextOptions(locale))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
