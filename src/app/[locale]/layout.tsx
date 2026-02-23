import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/contentful";
import { LOCALES, isValidLocale, getContentfulLocale, t, type Locale } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContentfulPreviewProvider from "@/components/ContentfulPreviewProvider";
import type { SocialLink } from "@/lib/types/contentful";

export const metadata: Metadata = {
  title: "Contentful Marketing Demo",
  description: "A Next.js marketing site powered by Contentful CMS",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const draft = await draftMode();
  const siteConfig = await getSiteConfig(draft.isEnabled, locale);

  const siteName = siteConfig?.fields.siteName ?? "Marketing Demo";
  const logo = siteConfig?.fields.logo;
  const navigation = (siteConfig?.fields.headerNavigation ?? []) as Parameters<typeof Header>[0]["navigation"];
  const copyrightText = siteConfig?.fields.copyrightText ?? `\u00A9 ${new Date().getFullYear()} All rights reserved.`;
  const socialLinks = (siteConfig?.fields.socialLinks ?? []) as SocialLink[];

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <ContentfulPreviewProvider locale={getContentfulLocale(locale)} isDraftMode={draft.isEnabled}>
          <Header siteName={siteName} logo={logo} navigation={navigation} locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer copyrightText={copyrightText} socialLinks={socialLinks} />
          {draft.isEnabled && (
            <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-900 shadow-lg">
              {t(locale, "draft.label")}{" "}
              <a href="/api/disable-draft" className="underline">
                {t(locale, "draft.exit")}
              </a>
            </div>
          )}
        </ContentfulPreviewProvider>
      </body>
    </html>
  );
}
