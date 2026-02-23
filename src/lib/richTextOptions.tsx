import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import type { Options } from "@contentful/rich-text-react-renderer";
import type { Block, Inline } from "@contentful/rich-text-types";
import Image from "next/image";
import Link from "next/link";
import { getAssetUrl, getAssetDimensions } from "./types/contentful";
import type { Asset } from "contentful";
import type { Locale } from "./i18n";

function prefixHref(url: string, locale: Locale): string {
  if (url.startsWith("http") || url.startsWith("#")) return url;
  return `/${locale}${url.startsWith("/") ? url : `/${url}`}`;
}

export function getRichTextOptions(locale: Locale): Options {
  return {
    renderMark: {
      [MARKS.BOLD]: (text) => <strong className="font-bold">{text}</strong>,
      [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
      [MARKS.UNDERLINE]: (text) => <span className="underline">{text}</span>,
      [MARKS.CODE]: (text) => (
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">{text}</code>
      ),
    },

    renderNode: {
      [BLOCKS.PARAGRAPH]: (_node, children) => (
        <p className="mb-4 leading-relaxed">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (_node, children) => (
        <h1 className="mb-4 mt-8 text-4xl font-bold">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (_node, children) => (
        <h2 className="mb-3 mt-6 text-3xl font-bold">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_node, children) => (
        <h3 className="mb-3 mt-5 text-2xl font-semibold">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (_node, children) => (
        <h4 className="mb-2 mt-4 text-xl font-semibold">{children}</h4>
      ),
      [BLOCKS.UL_LIST]: (_node, children) => (
        <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_node, children) => (
        <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_node, children) => <li>{children}</li>,
      [BLOCKS.QUOTE]: (_node, children) => (
        <blockquote className="mb-4 border-l-4 border-blue-500 pl-4 italic text-gray-700">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-gray-300" />,

      [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
        const asset = node.data?.target as Asset | undefined;
        const url = getAssetUrl(asset);
        const dims = getAssetDimensions(asset);
        if (!url) return null;

        return (
          <div className="my-6">
            <Image
              src={`${url}?w=800&fm=webp`}
              alt={asset?.fields?.title as string ?? ""}
              width={dims?.width ?? 800}
              height={dims?.height ?? 450}
              className="rounded-lg"
            />
          </div>
        );
      },

      [INLINES.HYPERLINK]: (node: Block | Inline, children) => {
        const uri = node.data.uri;
        const isExternal = uri.startsWith("http");
        return (
          <Link
            href={isExternal ? uri : prefixHref(uri, locale)}
            className="text-blue-600 underline hover:text-blue-800"
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            {children}
          </Link>
        );
      },

      [INLINES.ENTRY_HYPERLINK]: (node: Block | Inline, children) => {
        const entry = node.data?.target;
        if (!entry) return <>{children}</>;
        const contentType = entry.sys?.contentType?.sys?.id;
        const slug = entry.fields?.slug as string | undefined;
        if (contentType === "blogPost" && slug) {
          return (
            <Link href={`/${locale}/blog/${slug}`} className="text-blue-600 underline hover:text-blue-800">
              {children}
            </Link>
          );
        }
        if (contentType === "page" && slug) {
          return (
            <Link href={`/${locale}/${slug}`} className="text-blue-600 underline hover:text-blue-800">
              {children}
            </Link>
          );
        }
        return <>{children}</>;
      },
    },
  };
}
