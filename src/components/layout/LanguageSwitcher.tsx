"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LOCALES, type Locale } from "@/lib/i18n";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  it: "IT",
};

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  function getLocalizedPath(targetLocale: Locale) {
    // Replace the locale segment in the current path
    const segments = pathname.split("/");
    segments[1] = targetLocale;
    return segments.join("/");
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={getLocalizedPath(locale)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
            locale === currentLocale
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text"
          }`}
          aria-label={`Switch to ${locale === "en" ? "English" : "Italiano"}`}
          aria-current={locale === currentLocale ? "true" : undefined}
        >
          {LOCALE_LABELS[locale]}
        </Link>
      ))}
    </div>
  );
}
