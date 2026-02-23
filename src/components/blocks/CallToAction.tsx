import Link from "next/link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { ResolvedCallToAction } from "@/lib/types/contentful";
import { getRichTextOptions } from "@/lib/richTextOptions";
import type { Locale } from "@/lib/i18n";

function prefixHref(url: string, locale: Locale): string {
  if (url.startsWith("http") || url.startsWith("#")) return url;
  return `/${locale}${url.startsWith("/") ? url : `/${url}`}`;
}

interface CallToActionProps {
  entry: ResolvedCallToAction;
  locale: Locale;
}

export default function CallToAction({ entry, locale }: CallToActionProps) {
  const { headline, body, buttonLabel, buttonUrl } = entry.fields;
  const entryId = entry.sys.id;

  return (
    <section className="bg-surface-dim py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2
          className="mb-4 text-3xl font-bold"
          data-contentful-entry-id={entryId}
          data-contentful-field-id="headline"
        >
          {headline}
        </h2>
        {body && (
          <div
            className="mx-auto mb-8 max-w-xl text-text-muted"
            data-contentful-entry-id={entryId}
            data-contentful-field-id="body"
          >
            {documentToReactComponents(body, getRichTextOptions(locale))}
          </div>
        )}
        {buttonLabel && buttonUrl && (
          <Link
            href={prefixHref(buttonUrl, locale)}
            className="inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-dark"
            data-contentful-entry-id={entryId}
            data-contentful-field-id="buttonLabel"
          >
            {buttonLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
