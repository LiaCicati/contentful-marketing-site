# Contentful Marketing Demo

A modern marketing website built with **Next.js 15** (App Router, Server Components, TypeScript) and **Contentful** headless CMS. Styled with **Tailwind CSS 4**.

## Architecture

This project demonstrates composable content architecture with Contentful. Every visual block is a standalone content type that can be independently created, edited, and reused across multiple pages via references.

### Content Model (8 types / 25 limit)

```
SiteConfig (singleton)
├── siteName, logo, copyrightText, socialLinks (JSON)
└── headerNavigation ──→ [NavigationItem]
                              └── children ──→ [NavigationItem] (self-referencing)

Page (collection)
├── title, slug, metaDescription
└── body ──→ [Hero | TextWithImage | CallToAction | RichTextBlock]

BlogPost (collection)
├── title, slug, excerpt, author, publishedDate
├── content (Rich Text)
└── featuredImage (Asset)

Hero (reusable block)
├── internalName, headline, subheadline
├── ctaLabel, ctaUrl, backgroundImage
└── variant: "full-width" | "compact"

TextWithImage (reusable block)
├── internalName, content (Rich Text), image
└── layout: "image-left" | "image-right"

CallToAction (reusable block)
├── internalName, headline, body (Rich Text)
└── buttonLabel, buttonUrl

RichTextBlock (reusable block)
├── internalName
└── body (Rich Text)

NavigationItem (standalone)
├── label, url, openInNewTab
└── children ──→ [NavigationItem]
```

**17 content type slots remain free** for future expansion.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `CONTENTFUL_SPACE_ID` | Contentful Space ID | Yes |
| `CONTENTFUL_DELIVERY_TOKEN` | Content Delivery API access token | Yes |
| `CONTENTFUL_PREVIEW_TOKEN` | Content Preview API access token | Yes |
| `CONTENTFUL_MANAGEMENT_TOKEN` | Personal access token (setup script only) | For setup |
| `CONTENTFUL_PREVIEW_SECRET` | Secret string for Draft Mode | Yes |
| `CONTENTFUL_ENVIRONMENT` | Contentful environment (default: `master`) | No |

## Getting Started

### 1. Create a Contentful Space

1. Sign up at [contentful.com](https://www.contentful.com) (free tier)
2. Create a new Space
3. Go to **Settings > API keys** and create a new API key
4. Copy the Space ID, Delivery token, and Preview token
5. Go to **Settings > CMA tokens** and generate a personal access token

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your Contentful credentials in `.env.local`.

### 3. Run the Setup Script

This creates all 8 content types and seeds demo content (pages, blog posts, navigation, site config) with placeholder images:

```bash
npx tsx scripts/setup-contentful.ts
```

The script is idempotent — safe to run multiple times.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|---|---|
| `/` | Home page (fetches Page with slug `home`, renders blocks) |
| `/[slug]` | Dynamic page route for any Page entry |
| `/blog` | Blog listing (card grid of all BlogPost entries) |
| `/blog/[slug]` | Individual blog post |
| `/api/draft?secret=...&slug=...` | Enable Draft Mode |
| `/api/disable-draft` | Disable Draft Mode |

## Draft Mode / Preview

To preview unpublished content:

1. Enable Draft Mode by visiting:
   ```
   /api/draft?secret=YOUR_PREVIEW_SECRET&slug=/
   ```
2. The site switches to the Contentful Preview API
3. A yellow "Draft Mode" badge appears in the bottom-right corner
4. Click "Exit" or visit `/api/disable-draft` to return to published content

### Contentful Webhook Setup (optional)

In Contentful, go to **Settings > Webhooks** and add a webhook pointing to your deployed URL's draft endpoint to automatically preview changes.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with Header/Footer
│   ├── page.tsx                # Home page
│   ├── not-found.tsx           # 404 page
│   ├── [slug]/page.tsx         # Dynamic pages
│   ├── blog/
│   │   ├── page.tsx            # Blog listing
│   │   └── [slug]/page.tsx     # Blog post
│   └── api/
│       ├── draft/route.ts      # Enable Draft Mode
│       └── disable-draft/route.ts
├── components/
│   ├── BlockRenderer.tsx       # Maps content types to components
│   ├── blocks/
│   │   ├── Hero.tsx
│   │   ├── TextWithImage.tsx
│   │   ├── CallToAction.tsx
│   │   └── RichTextBlock.tsx
│   └── layout/
│       ├── Header.tsx          # Responsive nav with nested dropdowns
│       └── Footer.tsx
└── lib/
    ├── contentful.ts           # Delivery/Preview client + fetch helpers
    ├── richTextOptions.tsx     # Rich text render configuration
    └── types/contentful.ts     # TypeScript interfaces for all content types
scripts/
└── setup-contentful.ts         # Idempotent setup/seed script
```

## Extending the Content Model

### Add a New Block Type

1. Define the content type in `scripts/setup-contentful.ts`
2. Add TypeScript types in `src/lib/types/contentful.ts`
3. Create a component in `src/components/blocks/`
4. Register it in `src/components/BlockRenderer.tsx`
5. Add it to the Page `body` field validations in Contentful

### Add a New Page

Create a new Page entry in Contentful with a unique slug. It will automatically be available at `/{slug}`.

### Free Tier Limits

- **25 content types** (8 used, 17 free)
- **1M API calls/month**
- **0.1TB CDN bandwidth**
- **2 environments** (master + 1 for staging)

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (sets up project on first run)
vercel

# Set environment variables
vercel env add CONTENTFUL_SPACE_ID
vercel env add CONTENTFUL_DELIVERY_TOKEN
vercel env add CONTENTFUL_PREVIEW_TOKEN
vercel env add CONTENTFUL_PREVIEW_SECRET

# Deploy to production
vercel --prod
```

## Tech Stack

- **Next.js 15** — App Router, Server Components, ISR
- **Contentful** — Headless CMS (free tier)
- **Tailwind CSS 4** — Utility-first styling
- **TypeScript** — Full type safety
- **contentful SDK v11+** — Content Delivery & Preview APIs
- **@contentful/rich-text-react-renderer v16+** — Rich text rendering
