import { createClient } from "contentful-management";
import type { Environment, Entry } from "contentful-management";

// ─── Configuration ─────────────────────────────────────────────

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN.");
  console.error("Ensure your .env.local file is populated or pass them as env vars.");
  process.exit(1);
}

// ─── Helpers ───────────────────────────────────────────────────

async function getOrCreateContentType(
  env: Environment,
  id: string,
  data: Parameters<Environment["createContentTypeWithId"]>[1]
) {
  try {
    const existing = await env.getContentType(id);
    console.log(`  Content type "${id}" already exists, updating...`);
    existing.name = data.name;
    existing.fields = data.fields;
    existing.displayField = data.displayField;
    const updated = await existing.update();
    await updated.publish();
    return updated;
  } catch {
    console.log(`  Creating content type "${id}"...`);
    const ct = await env.createContentTypeWithId(id, data);
    await ct.publish();
    return ct;
  }
}

async function findEntry(env: Environment, contentTypeId: string, field: string, value: string): Promise<Entry | null> {
  const entries = await env.getEntries({
    content_type: contentTypeId,
    [`fields.${field}`]: value,
    limit: 1,
  });
  return entries.items[0] ?? null;
}

async function uploadAsset(env: Environment, title: string, imageUrl: string, id?: string): Promise<Entry> {
  if (id) {
    try {
      const existing = await env.getAsset(id);
      console.log(`  Asset "${title}" already exists.`);
      return existing as unknown as Entry;
    } catch {
      // Does not exist, create it
    }
  }

  console.log(`  Uploading asset "${title}" from ${imageUrl}...`);

  const createParams: Parameters<Environment["createAsset"]>[0] = {
    fields: {
      title: { "en-US": title },
      file: {
        "en-US": {
          contentType: "image/jpeg",
          fileName: `${title.toLowerCase().replace(/\s+/g, "-")}.jpg`,
          upload: imageUrl,
        },
      },
    },
  };

  let asset;
  if (id) {
    asset = await env.createAssetWithId(id, createParams);
  } else {
    asset = await env.createAsset(createParams);
  }

  const processed = await asset.processForAllLocales();

  let attempts = 0;
  while (attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000));
    const refreshed = await env.getAsset(processed.sys.id);
    const file = refreshed.fields.file?.["en-US"];
    if (file && "url" in file && file.url) {
      await refreshed.publish();
      console.log(`  Asset "${title}" published.`);
      return refreshed as unknown as Entry;
    }
    attempts++;
  }
  throw new Error(`Asset "${title}" processing timed out.`);
}

function makeLink(id: string, linkType: "Entry" | "Asset" = "Entry") {
  return {
    sys: { type: "Link" as const, linkType, id },
  };
}

// ─── Locale Setup ──────────────────────────────────────────────

async function ensureItalianLocale(env: Environment) {
  console.log("\n🌍 Ensuring Italian locale (it-IT) is enabled...\n");

  const locales = await env.getLocales();
  const hasItalian = locales.items.some((l) => l.code === "it-IT");

  if (hasItalian) {
    console.log("  Locale it-IT already exists.");
    return;
  }

  await env.createLocale({
    name: "Italian",
    code: "it-IT",
    fallbackCode: "en-US",
    optional: true,
  });
  console.log("  Locale it-IT created with fallback to en-US.");
}

// ─── Content Type Definitions ──────────────────────────────────

async function createAllContentTypes(env: Environment) {
  console.log("\n📋 Creating content types...\n");

  await getOrCreateContentType(env, "navigationItem", {
    name: "Navigation Item",
    displayField: "label",
    fields: [
      { id: "label", name: "Label", type: "Symbol", required: true, localized: true },
      { id: "url", name: "URL", type: "Symbol", required: true },
      { id: "openInNewTab", name: "Open in New Tab", type: "Boolean", required: false },
      {
        id: "children",
        name: "Children",
        type: "Array",
        required: false,
        items: {
          type: "Link",
          linkType: "Entry",
          validations: [{ linkContentType: ["navigationItem"] }],
        },
      },
    ],
  });

  await getOrCreateContentType(env, "hero", {
    name: "Hero",
    displayField: "internalName",
    fields: [
      { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
      { id: "headline", name: "Headline", type: "Symbol", required: true, localized: true },
      { id: "subheadline", name: "Subheadline", type: "Symbol", required: false, localized: true },
      { id: "ctaLabel", name: "CTA Label", type: "Symbol", required: false, localized: true },
      { id: "ctaUrl", name: "CTA URL", type: "Symbol", required: false },
      {
        id: "backgroundImage",
        name: "Background Image",
        type: "Link",
        linkType: "Asset",
        required: false,
      },
      {
        id: "variant",
        name: "Variant",
        type: "Symbol",
        required: true,
        validations: [{ in: ["full-width", "compact"] }],
      },
    ],
  });

  await getOrCreateContentType(env, "textWithImage", {
    name: "Text With Image",
    displayField: "internalName",
    fields: [
      { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
      { id: "content", name: "Content", type: "RichText", required: true, localized: true },
      {
        id: "image",
        name: "Image",
        type: "Link",
        linkType: "Asset",
        required: false,
      },
      {
        id: "layout",
        name: "Layout",
        type: "Symbol",
        required: true,
        validations: [{ in: ["image-left", "image-right"] }],
      },
    ],
  });

  await getOrCreateContentType(env, "callToAction", {
    name: "Call To Action",
    displayField: "internalName",
    fields: [
      { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
      { id: "headline", name: "Headline", type: "Symbol", required: true, localized: true },
      { id: "body", name: "Body", type: "RichText", required: false, localized: true },
      { id: "buttonLabel", name: "Button Label", type: "Symbol", required: false, localized: true },
      { id: "buttonUrl", name: "Button URL", type: "Symbol", required: false },
    ],
  });

  await getOrCreateContentType(env, "richTextBlock", {
    name: "Rich Text Block",
    displayField: "internalName",
    fields: [
      { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
      { id: "body", name: "Body", type: "RichText", required: true, localized: true },
    ],
  });

  await getOrCreateContentType(env, "page", {
    name: "Page",
    displayField: "title",
    fields: [
      { id: "title", name: "Title", type: "Symbol", required: true, localized: true },
      {
        id: "slug",
        name: "Slug",
        type: "Symbol",
        required: true,
        validations: [{ unique: true }],
      },
      { id: "metaDescription", name: "Meta Description", type: "Symbol", required: false, localized: true },
      {
        id: "body",
        name: "Body",
        type: "Array",
        required: false,
        items: {
          type: "Link",
          linkType: "Entry",
          validations: [
            { linkContentType: ["hero", "textWithImage", "callToAction", "richTextBlock"] },
          ],
        },
      },
    ],
  });

  await getOrCreateContentType(env, "blogPost", {
    name: "Blog Post",
    displayField: "title",
    fields: [
      { id: "title", name: "Title", type: "Symbol", required: true, localized: true },
      {
        id: "slug",
        name: "Slug",
        type: "Symbol",
        required: true,
        validations: [{ unique: true }],
      },
      { id: "excerpt", name: "Excerpt", type: "Symbol", required: false, localized: true },
      { id: "content", name: "Content", type: "RichText", required: false, localized: true },
      {
        id: "featuredImage",
        name: "Featured Image",
        type: "Link",
        linkType: "Asset",
        required: false,
      },
      { id: "publishedDate", name: "Published Date", type: "Date", required: false },
      { id: "author", name: "Author", type: "Symbol", required: false },
    ],
  });

  await getOrCreateContentType(env, "siteConfig", {
    name: "Site Config",
    displayField: "siteName",
    fields: [
      { id: "siteName", name: "Site Name", type: "Symbol", required: true, localized: true },
      {
        id: "logo",
        name: "Logo",
        type: "Link",
        linkType: "Asset",
        required: false,
      },
      {
        id: "headerNavigation",
        name: "Header Navigation",
        type: "Array",
        required: false,
        items: {
          type: "Link",
          linkType: "Entry",
          validations: [{ linkContentType: ["navigationItem"] }],
        },
      },
      { id: "copyrightText", name: "Copyright Text", type: "Symbol", required: false, localized: true },
      { id: "socialLinks", name: "Social Links", type: "Object", required: false },
    ],
  });

  console.log("\n✅ All 8 content types created and published.\n");
}

// ─── Demo Content ──────────────────────────────────────────────

function richTextParagraphs(...paragraphs: string[]) {
  return {
    nodeType: "document" as const,
    data: {},
    content: paragraphs.map((text) => ({
      nodeType: "paragraph" as const,
      data: {},
      content: [{ nodeType: "text" as const, value: text, marks: [], data: {} }],
    })),
  };
}

async function createDemoContent(env: Environment) {
  console.log("📝 Creating demo content...\n");

  // ─── Upload Assets ───────────────────────────────────────────

  const heroAsset = await uploadAsset(env, "Hero Background", "https://picsum.photos/id/1015/1600/900", "hero-bg");
  const aboutAsset = await uploadAsset(env, "About Image", "https://picsum.photos/id/180/700/467", "about-img");
  const blog1Asset = await uploadAsset(env, "Contentful Blog Image", "https://picsum.photos/id/0/900/506", "blog1-img");
  const blog2Asset = await uploadAsset(env, "Next.js Blog Image", "https://picsum.photos/id/1/900/506", "blog2-img");
  const logoAsset = await uploadAsset(env, "Site Logo", "https://picsum.photos/id/1062/80/80", "site-logo");

  // ─── Navigation Items ────────────────────────────────────────

  console.log("  Creating navigation items...");

  let blogChildContentful = await findEntry(env, "navigationItem", "label", "Getting Started with Contentful");
  if (!blogChildContentful) {
    blogChildContentful = await env.createEntry("navigationItem", {
      fields: {
        label: { "en-US": "Getting Started with Contentful" },
        url: { "en-US": "/blog/getting-started-with-contentful" },
        openInNewTab: { "en-US": false },
      },
    });
    await blogChildContentful.publish();
  }

  let blogChildNextjs = await findEntry(env, "navigationItem", "label", "Building with Next.js");
  if (!blogChildNextjs) {
    blogChildNextjs = await env.createEntry("navigationItem", {
      fields: {
        label: { "en-US": "Building with Next.js" },
        url: { "en-US": "/blog/building-with-nextjs" },
        openInNewTab: { "en-US": false },
      },
    });
    await blogChildNextjs.publish();
  }

  let navHome = await findEntry(env, "navigationItem", "label", "Home");
  if (!navHome) {
    navHome = await env.createEntry("navigationItem", {
      fields: {
        label: { "en-US": "Home" },
        url: { "en-US": "/" },
        openInNewTab: { "en-US": false },
      },
    });
    await navHome.publish();
  }

  let navBlog = await findEntry(env, "navigationItem", "label", "Blog");
  if (!navBlog) {
    navBlog = await env.createEntry("navigationItem", {
      fields: {
        label: { "en-US": "Blog" },
        url: { "en-US": "/blog" },
        openInNewTab: { "en-US": false },
        children: {
          "en-US": [
            makeLink(blogChildContentful.sys.id),
            makeLink(blogChildNextjs.sys.id),
          ],
        },
      },
    });
    await navBlog.publish();
  }

  // ─── Block Entries ───────────────────────────────────────────

  console.log("  Creating block entries...");

  let heroEntry = await findEntry(env, "hero", "internalName", "Homepage Hero");
  if (!heroEntry) {
    heroEntry = await env.createEntry("hero", {
      fields: {
        internalName: { "en-US": "Homepage Hero" },
        headline: { "en-US": "Build Modern Websites with Contentful & Next.js" },
        subheadline: { "en-US": "A composable content platform that lets your team create, manage, and deliver digital experiences at scale." },
        ctaLabel: { "en-US": "Read Our Blog" },
        ctaUrl: { "en-US": "/blog" },
        backgroundImage: { "en-US": makeLink(heroAsset.sys.id, "Asset") },
        variant: { "en-US": "full-width" },
      },
    });
    await heroEntry.publish();
  }

  let textWithImageEntry = await findEntry(env, "textWithImage", "internalName", "Homepage About");
  if (!textWithImageEntry) {
    textWithImageEntry = await env.createEntry("textWithImage", {
      fields: {
        internalName: { "en-US": "Homepage About" },
        content: {
          "en-US": richTextParagraphs(
            "Welcome to our demo marketing site built with Next.js and Contentful. This project showcases how a headless CMS can power a modern, high-performance website.",
            "Every section you see on this page is a reusable content block managed in Contentful. Content editors can create, rearrange, and reuse blocks across multiple pages without touching any code.",
            "This architecture enables teams to iterate quickly on content while developers maintain a clean, type-safe codebase."
          ),
        },
        image: { "en-US": makeLink(aboutAsset.sys.id, "Asset") },
        layout: { "en-US": "image-right" },
      },
    });
    await textWithImageEntry.publish();
  }

  let ctaEntry = await findEntry(env, "callToAction", "internalName", "Homepage Blog CTA");
  if (!ctaEntry) {
    ctaEntry = await env.createEntry("callToAction", {
      fields: {
        internalName: { "en-US": "Homepage Blog CTA" },
        headline: { "en-US": "Ready to Learn More?" },
        body: {
          "en-US": richTextParagraphs(
            "Dive into our blog for tutorials on getting started with Contentful and building high-performance sites with Next.js."
          ),
        },
        buttonLabel: { "en-US": "Visit the Blog" },
        buttonUrl: { "en-US": "/blog" },
      },
    });
    await ctaEntry.publish();
  }

  // ─── Pages ───────────────────────────────────────────────────

  console.log("  Creating pages...");

  let homePage = await findEntry(env, "page", "slug", "home");
  if (!homePage) {
    homePage = await env.createEntry("page", {
      fields: {
        title: { "en-US": "Home" },
        slug: { "en-US": "home" },
        metaDescription: { "en-US": "A Next.js marketing demo site powered by Contentful CMS. Explore composable content architecture." },
        body: {
          "en-US": [
            makeLink(heroEntry.sys.id),
            makeLink(textWithImageEntry.sys.id),
            makeLink(ctaEntry.sys.id),
          ],
        },
      },
    });
    await homePage.publish();
  }

  // ─── Blog Posts ──────────────────────────────────────────────

  console.log("  Creating blog posts...");

  let blogPost1 = await findEntry(env, "blogPost", "slug", "getting-started-with-contentful");
  if (!blogPost1) {
    blogPost1 = await env.createEntry("blogPost", {
      fields: {
        title: { "en-US": "Getting Started with Contentful" },
        slug: { "en-US": "getting-started-with-contentful" },
        excerpt: { "en-US": "Learn how to set up a Contentful space, define content models, and start managing your content like a pro." },
        author: { "en-US": "Demo Author" },
        publishedDate: { "en-US": "2025-01-15" },
        featuredImage: { "en-US": makeLink(blog1Asset.sys.id, "Asset") },
        content: {
          "en-US": richTextParagraphs(
            "Contentful is a headless content management system that gives you the flexibility to manage content separately from how it is displayed. Unlike traditional CMS platforms, Contentful stores your content as structured data accessible through APIs, making it perfect for modern web development.",
            "To get started, create a free Contentful account and set up your first space. A space is your content repository where you define content types, create entries, and manage assets. The free tier is generous enough for most demo and small production projects with up to 25 content types and 1 million API calls per month.",
            "Content modeling is the heart of Contentful. You define content types with specific fields — text, rich text, media, references, and more. The key insight is that referenced entries are reusable: a single Hero block can appear on multiple pages without duplication. This composable approach is what makes Contentful powerful.",
            "Once your content model is in place, you can use the Content Delivery API to fetch published content or the Content Preview API to see draft changes before publishing. Both APIs return JSON that you can render in any frontend framework."
          ),
        },
      },
    });
    await blogPost1.publish();
  }

  let blogPost2 = await findEntry(env, "blogPost", "slug", "building-with-nextjs");
  if (!blogPost2) {
    blogPost2 = await env.createEntry("blogPost", {
      fields: {
        title: { "en-US": "Building with Next.js" },
        slug: { "en-US": "building-with-nextjs" },
        excerpt: { "en-US": "Discover how Next.js App Router and Server Components create the perfect frontend for Contentful-powered sites." },
        author: { "en-US": "Demo Author" },
        publishedDate: { "en-US": "2025-02-01" },
        featuredImage: { "en-US": makeLink(blog2Asset.sys.id, "Asset") },
        content: {
          "en-US": richTextParagraphs(
            "Next.js is the ideal frontend framework for Contentful-powered websites. With the App Router introduced in Next.js 13 and refined in subsequent versions, you get Server Components by default — meaning your Contentful API calls happen on the server with zero client-side JavaScript overhead.",
            "Server Components fetch data at request time or build time, then stream HTML to the browser. Combined with Incremental Static Regeneration (ISR), you get the performance of static sites with the freshness of dynamic content. Set a revalidation period and Next.js automatically refreshes content in the background.",
            "The Draft Mode feature in Next.js pairs perfectly with Contentful's Preview API. Content editors can see unpublished changes in the context of the real site by enabling draft mode through a secure API route. This workflow bridges the gap between content creation and publishing.",
            "TypeScript and the Contentful SDK work together to give you full type safety from API response to rendered component. Define your content type interfaces once, and your IDE will autocomplete field names, catch typos, and ensure you handle optional fields correctly throughout your entire application."
          ),
        },
      },
    });
    await blogPost2.publish();
  }

  // ─── Site Config ─────────────────────────────────────────────

  console.log("  Creating site config...");

  const existing = await env.getEntries({ content_type: "siteConfig", limit: 1 });
  let siteConfigEntry: Entry;
  if (existing.items.length === 0) {
    siteConfigEntry = await env.createEntry("siteConfig", {
      fields: {
        siteName: { "en-US": "Acme Marketing" },
        logo: { "en-US": makeLink(logoAsset.sys.id, "Asset") },
        headerNavigation: {
          "en-US": [makeLink(navHome.sys.id), makeLink(navBlog.sys.id)],
        },
        copyrightText: { "en-US": "\u00A9 2025 Acme Marketing. All rights reserved." },
        socialLinks: {
          "en-US": [
            { platform: "Twitter", url: "https://twitter.com" },
            { platform: "GitHub", url: "https://github.com" },
            { platform: "LinkedIn", url: "https://linkedin.com" },
          ],
        },
      },
    });
    await siteConfigEntry.publish();
  } else {
    siteConfigEntry = existing.items[0];
    console.log("  Site config already exists.");
  }

  console.log("\n✅ All demo content created and published.\n");

  // Return references for Italian content pass
  return {
    heroEntry,
    textWithImageEntry,
    ctaEntry,
    homePage,
    blogPost1,
    blogPost2,
    siteConfigEntry,
    blogChildContentful,
    blogChildNextjs,
    navHome,
    navBlog,
  };
}

// ─── Italian Content ───────────────────────────────────────────

async function addItalianContent(
  env: Environment,
  refs: Awaited<ReturnType<typeof createDemoContent>>
) {
  console.log("🇮🇹 Adding Italian translations...\n");

  async function updateEntryWithItalian(entry: Entry, italianFields: Record<string, unknown>) {
    // Re-fetch to get latest version
    const fresh = await env.getEntry(entry.sys.id);
    for (const [field, value] of Object.entries(italianFields)) {
      if (!fresh.fields[field]) fresh.fields[field] = {};
      (fresh.fields[field] as Record<string, unknown>)["it-IT"] = value;
    }
    const updated = await fresh.update();
    await updated.publish();
  }

  // Navigation items
  console.log("  Translating navigation items...");
  await updateEntryWithItalian(refs.blogChildContentful, {
    label: "Iniziare con Contentful",
  });
  await updateEntryWithItalian(refs.blogChildNextjs, {
    label: "Costruire con Next.js",
  });
  await updateEntryWithItalian(refs.navHome, {
    label: "Pagina iniziale",
  });
  await updateEntryWithItalian(refs.navBlog, {
    label: "Articoli",
  });

  // Hero
  console.log("  Translating hero...");
  await updateEntryWithItalian(refs.heroEntry, {
    headline: "Crea siti web moderni con Contentful e Next.js",
    subheadline: "Una piattaforma di contenuti componibile che permette al tuo team di creare, gestire e distribuire esperienze digitali su larga scala.",
    ctaLabel: "Leggi il nostro Blog",
  });

  // TextWithImage
  console.log("  Translating text with image...");
  await updateEntryWithItalian(refs.textWithImageEntry, {
    content: richTextParagraphs(
      "Benvenuto nel nostro sito di marketing demo costruito con Next.js e Contentful. Questo progetto mostra come un CMS headless possa alimentare un sito web moderno e ad alte prestazioni.",
      "Ogni sezione che vedi in questa pagina \u00e8 un blocco di contenuto riutilizzabile gestito in Contentful. Gli editor di contenuti possono creare, riordinare e riutilizzare i blocchi su pi\u00f9 pagine senza toccare il codice.",
      "Questa architettura permette ai team di iterare rapidamente sui contenuti mentre gli sviluppatori mantengono un codice pulito e tipizzato."
    ),
  });

  // CallToAction
  console.log("  Translating call to action...");
  await updateEntryWithItalian(refs.ctaEntry, {
    headline: "Pronto a saperne di pi\u00f9?",
    body: richTextParagraphs(
      "Esplora il nostro blog per tutorial su come iniziare con Contentful e costruire siti ad alte prestazioni con Next.js."
    ),
    buttonLabel: "Visita il Blog",
  });

  // Home page
  console.log("  Translating home page...");
  await updateEntryWithItalian(refs.homePage, {
    title: "Home",
    metaDescription: "Un sito demo di marketing con Next.js alimentato dal CMS Contentful. Esplora l'architettura dei contenuti componibili.",
  });

  // Blog Post 1
  console.log("  Translating blog posts...");
  await updateEntryWithItalian(refs.blogPost1, {
    title: "Iniziare con Contentful",
    excerpt: "Scopri come configurare uno spazio Contentful, definire modelli di contenuto e iniziare a gestire i tuoi contenuti come un professionista.",
    content: richTextParagraphs(
      "Contentful \u00e8 un sistema di gestione dei contenuti headless che ti offre la flessibilit\u00e0 di gestire i contenuti separatamente da come vengono visualizzati. A differenza delle piattaforme CMS tradizionali, Contentful archivia i contenuti come dati strutturati accessibili tramite API, rendendolo perfetto per lo sviluppo web moderno.",
      "Per iniziare, crea un account Contentful gratuito e configura il tuo primo spazio. Uno spazio \u00e8 il tuo repository di contenuti dove definisci i tipi di contenuto, crei le voci e gestisci le risorse. Il piano gratuito \u00e8 sufficientemente generoso per la maggior parte dei progetti demo e piccoli progetti di produzione, con fino a 25 tipi di contenuto e 1 milione di chiamate API al mese.",
      "La modellazione dei contenuti \u00e8 il cuore di Contentful. Definisci i tipi di contenuto con campi specifici: testo, rich text, media, riferimenti e altro. L'intuizione chiave \u00e8 che le voci referenziate sono riutilizzabili: un singolo blocco Hero pu\u00f2 apparire su pi\u00f9 pagine senza duplicazione. Questo approccio componibile \u00e8 ci\u00f2 che rende Contentful potente.",
      "Una volta che il modello di contenuto \u00e8 pronto, puoi usare la Content Delivery API per recuperare i contenuti pubblicati o la Content Preview API per vedere le modifiche in bozza prima della pubblicazione. Entrambe le API restituiscono JSON che puoi renderizzare in qualsiasi framework frontend."
    ),
  });

  // Blog Post 2
  await updateEntryWithItalian(refs.blogPost2, {
    title: "Costruire con Next.js",
    excerpt: "Scopri come l'App Router di Next.js e i Server Components creano il frontend perfetto per i siti alimentati da Contentful.",
    content: richTextParagraphs(
      "Next.js \u00e8 il framework frontend ideale per i siti web alimentati da Contentful. Con l'App Router introdotto in Next.js 13 e perfezionato nelle versioni successive, ottieni i Server Components per impostazione predefinita, il che significa che le chiamate API a Contentful avvengono sul server senza alcun overhead JavaScript lato client.",
      "I Server Components recuperano i dati al momento della richiesta o durante la build, quindi inviano l'HTML in streaming al browser. Combinato con l'Incremental Static Regeneration (ISR), ottieni le prestazioni dei siti statici con la freschezza dei contenuti dinamici. Imposta un periodo di rivalidazione e Next.js aggiorna automaticamente i contenuti in background.",
      "La funzionalit\u00e0 Draft Mode di Next.js si abbina perfettamente alla Preview API di Contentful. Gli editor di contenuti possono vedere le modifiche non pubblicate nel contesto del sito reale abilitando la modalit\u00e0 bozza tramite un percorso API sicuro. Questo flusso di lavoro colma il divario tra creazione e pubblicazione dei contenuti.",
      "TypeScript e il SDK di Contentful lavorano insieme per offrirti piena sicurezza dei tipi, dalla risposta API al componente renderizzato. Definisci le interfacce dei tipi di contenuto una volta sola, e il tuo IDE completer\u00e0 automaticamente i nomi dei campi, individuer\u00e0 gli errori di battitura e ti assicurer\u00e0 di gestire correttamente i campi opzionali in tutta l'applicazione."
    ),
  });

  // Site Config
  console.log("  Translating site config...");
  await updateEntryWithItalian(refs.siteConfigEntry, {
    siteName: "Acme Marketing",
    copyrightText: "\u00A9 2025 Acme Marketing. Tutti i diritti riservati.",
  });

  console.log("\n✅ Italian translations added.\n");
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Contentful Setup Script");
  console.log("==========================\n");
  console.log(`Space: ${SPACE_ID}`);
  console.log(`Environment: ${ENVIRONMENT_ID}\n`);

  const client = createClient({
    accessToken: MANAGEMENT_TOKEN!,
  });

  const space = await client.getSpace(SPACE_ID!);
  const env = await space.getEnvironment(ENVIRONMENT_ID);

  await ensureItalianLocale(env);
  await createAllContentTypes(env);
  const refs = await createDemoContent(env);
  await addItalianContent(env, refs);

  console.log("🎉 Setup complete! You can now run: npm run dev");
}

main().catch((err) => {
  console.error("\n❌ Setup failed:", err.message ?? err);
  if (err.details?.errors) {
    console.error("Validation errors:", JSON.stringify(err.details.errors, null, 2));
  }
  process.exit(1);
});
