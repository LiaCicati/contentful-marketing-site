import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { ResolvedTextWithImage } from "@/lib/types/contentful";
import { getAssetUrl, getAssetDimensions } from "@/lib/types/contentful";
import { richTextOptions } from "@/lib/richTextOptions";

interface TextWithImageProps {
  entry: ResolvedTextWithImage;
}

export default function TextWithImage({ entry }: TextWithImageProps) {
  const { content, image, layout } = entry.fields;
  const imageUrl = getAssetUrl(image);
  const dims = getAssetDimensions(image);
  const isImageLeft = layout === "image-left";

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={`flex flex-col items-center gap-12 md:flex-row ${
            isImageLeft ? "" : "md:flex-row-reverse"
          }`}
        >
          {imageUrl && (
            <div className="w-full md:w-1/2">
              <Image
                src={`${imageUrl}?w=700&fm=webp`}
                alt={image?.fields?.title as string ?? ""}
                width={dims?.width ?? 700}
                height={dims?.height ?? 467}
                className="rounded-lg shadow-md"
              />
            </div>
          )}
          <div className="w-full md:w-1/2">
            <div className="prose max-w-none">
              {documentToReactComponents(content, richTextOptions)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
