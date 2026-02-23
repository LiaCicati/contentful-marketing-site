import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getSiteConfig } from "@/lib/contentful";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { SocialLink } from "@/lib/types/contentful";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contentful Marketing Demo",
  description: "A Next.js marketing site powered by Contentful CMS",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const draft = await draftMode();
  const siteConfig = await getSiteConfig(draft.isEnabled);

  const siteName = siteConfig?.fields.siteName ?? "Marketing Demo";
  const logo = siteConfig?.fields.logo;
  const navigation = (siteConfig?.fields.headerNavigation ?? []) as Parameters<typeof Header>[0]["navigation"];
  const copyrightText = siteConfig?.fields.copyrightText ?? `\u00A9 ${new Date().getFullYear()} All rights reserved.`;
  const socialLinks = (siteConfig?.fields.socialLinks ?? []) as SocialLink[];

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header siteName={siteName} logo={logo} navigation={navigation} />
        <main className="flex-1">{children}</main>
        <Footer copyrightText={copyrightText} socialLinks={socialLinks} />
        {draft.isEnabled && (
          <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-900 shadow-lg">
            Draft Mode{" "}
            <a href="/api/disable-draft" className="underline">
              Exit
            </a>
          </div>
        )}
      </body>
    </html>
  );
}
