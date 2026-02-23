import Link from "next/link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { ResolvedCallToAction } from "@/lib/types/contentful";
import { richTextOptions } from "@/lib/richTextOptions";

interface CallToActionProps {
  entry: ResolvedCallToAction;
}

export default function CallToAction({ entry }: CallToActionProps) {
  const { headline, body, buttonLabel, buttonUrl } = entry.fields;

  return (
    <section className="bg-surface-dim py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold">{headline}</h2>
        {body && (
          <div className="mx-auto mb-8 max-w-xl text-text-muted">
            {documentToReactComponents(body, richTextOptions)}
          </div>
        )}
        {buttonLabel && buttonUrl && (
          <Link
            href={buttonUrl}
            className="inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            {buttonLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
