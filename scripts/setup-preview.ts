/**
 * Prints Content Preview URL configuration for Contentful.
 *
 * To configure preview in Contentful:
 * 1. Go to Settings → Content preview
 * 2. Click "Add content preview"
 * 3. Name it "Next.js Website Preview"
 * 4. Add the URL templates below for each content type
 *
 * These URLs enable the "Open preview" button in Contentful's entry editor,
 * which opens draft content on the live site with live preview & inspector mode.
 */

import "dotenv/config";

const PREVIEW_SECRET = process.env.CONTENTFUL_PREVIEW_SECRET ?? "preview-secret-xk9m2q";
const SITE_URL = process.env.SITE_URL ?? "https://contentful-marketing-demo-two.vercel.app";

const draftUrl = `${SITE_URL}/api/draft?secret=${PREVIEW_SECRET}`;

console.log("📋 Content Preview URL Templates for Contentful\n");
console.log("Configure these in: Settings → Content preview → Add content preview\n");
console.log("─".repeat(70));

const configs = [
  {
    name: "Page",
    contentType: "page",
    url: `${draftUrl}&slug={entry.fields.slug}&locale={locale}`,
  },
  {
    name: "Blog Post",
    contentType: "blogPost",
    url: `${draftUrl}&slug=/blog/{entry.fields.slug}&locale={locale}`,
  },
];

for (const c of configs) {
  console.log(`\n  Content type: ${c.contentType} (${c.name})`);
  console.log(`  URL: ${c.url}`);
}

console.log("\n" + "─".repeat(70));
console.log("\n🔗 Test draft mode manually:");
console.log(`  ${draftUrl}&slug=/&locale=en`);
console.log(`  ${draftUrl}&slug=/&locale=it\n`);
