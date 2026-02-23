export const LOCALES = ["en", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

const CONTENTFUL_LOCALE_MAP: Record<Locale, string> = {
  en: "en-US",
  it: "it-IT",
};

export function getContentfulLocale(locale: Locale): string {
  return CONTENTFUL_LOCALE_MAP[locale] ?? CONTENTFUL_LOCALE_MAP[DEFAULT_LOCALE];
}

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

// Date formatting locale codes
const DATE_LOCALE_MAP: Record<Locale, string> = {
  en: "en-US",
  it: "it-IT",
};

export function getDateLocale(locale: Locale): string {
  return DATE_LOCALE_MAP[locale] ?? DATE_LOCALE_MAP[DEFAULT_LOCALE];
}

// UI-only strings not managed in Contentful
const UI_STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    "blog.title": "Blog",
    "blog.subtitle": "Latest articles and insights",
    "blog.empty": "No posts yet. Check back soon!",
    "blog.back": "Back to Blog",
    "blog.by": "By",
    "notFound.code": "404",
    "notFound.title": "Page Not Found",
    "notFound.description": "The page you're looking for doesn't exist or has been moved.",
    "notFound.cta": "Go Home",
    "draft.label": "Draft Mode",
    "draft.exit": "Exit",
    "header.openMenu": "Open menu",
    "header.closeMenu": "Close menu",
  },
  it: {
    "blog.title": "Blog",
    "blog.subtitle": "Ultimi articoli e approfondimenti",
    "blog.empty": "Nessun articolo ancora. Torna presto!",
    "blog.back": "Torna al Blog",
    "blog.by": "Di",
    "notFound.code": "404",
    "notFound.title": "Pagina non trovata",
    "notFound.description": "La pagina che stai cercando non esiste o è stata spostata.",
    "notFound.cta": "Vai alla Home",
    "draft.label": "Modalità bozza",
    "draft.exit": "Esci",
    "header.openMenu": "Apri menu",
    "header.closeMenu": "Chiudi menu",
  },
};

export function t(locale: Locale, key: string): string {
  return UI_STRINGS[locale]?.[key] ?? UI_STRINGS[DEFAULT_LOCALE]?.[key] ?? key;
}
