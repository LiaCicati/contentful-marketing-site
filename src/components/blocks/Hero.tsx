import Image from "next/image";
import Link from "next/link";
import type { ResolvedHero } from "@/lib/types/contentful";
import { getAssetUrl } from "@/lib/types/contentful";

interface HeroProps {
  entry: ResolvedHero;
}

export default function Hero({ entry }: HeroProps) {
  const { headline, subheadline, ctaLabel, ctaUrl, backgroundImage, variant } = entry.fields;
  const bgUrl = getAssetUrl(backgroundImage);
  const isFullWidth = variant === "full-width";

  return (
    <section
      className={`relative flex items-center justify-center overflow-hidden ${
        isFullWidth ? "min-h-[70vh]" : "min-h-[40vh]"
      }`}
    >
      {bgUrl && (
        <Image
          src={`${bgUrl}?w=1600&fm=webp`}
          alt=""
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center text-white">
        <h1
          className={`mb-4 font-bold tracking-tight ${
            isFullWidth ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"
          }`}
        >
          {headline}
        </h1>
        {subheadline && (
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/90 md:text-xl">{subheadline}</p>
        )}
        {ctaLabel && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
