import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { DEFAULT_LOCALE, isValidLocale, fromContentfulLocale } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";
  const localeParam = searchParams.get("locale") ?? DEFAULT_LOCALE;

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid secret", { status: 401 });
  }

  // Map Contentful locale codes (en-US, it-IT) to route codes (en, it)
  const locale = isValidLocale(localeParam)
    ? localeParam
    : fromContentfulLocale(localeParam);

  // The "home" page lives at /{locale}, not /{locale}/home
  const path = slug === "home" || slug === "/"
    ? ""
    : slug.startsWith("/") ? slug : `/${slug}`;

  const draft = await draftMode();
  draft.enable();

  redirect(`/${locale}${path}`);
}
