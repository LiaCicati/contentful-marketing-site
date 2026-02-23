import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";
  const locale = searchParams.get("locale") ?? DEFAULT_LOCALE;

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid secret", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(`/${locale}${slug.startsWith("/") ? slug : `/${slug}`}`);
}
