"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ResolvedNavigationItem } from "@/lib/types/contentful";
import { getAssetUrl } from "@/lib/types/contentful";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Asset } from "contentful";

interface HeaderProps {
  siteName: string;
  logo: Asset | undefined;
  navigation: (ResolvedNavigationItem | undefined)[];
  locale: Locale;
}

function prefixHref(url: string, locale: Locale): string {
  if (url.startsWith("http") || url.startsWith("#")) return url;
  return `/${locale}${url.startsWith("/") ? url : `/${url}`}`;
}

function DesktopDropdown({ item, locale }: { item: ResolvedNavigationItem; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const children = (item.fields.children ?? []).filter(Boolean) as ResolvedNavigationItem[];

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (children.length === 0) {
    return (
      <Link
        href={prefixHref(item.fields.url, locale)}
        className="px-3 py-2 text-sm font-medium text-gray-700 transition hover:text-primary"
        target={item.fields.openInNewTab ? "_blank" : undefined}
        rel={item.fields.openInNewTab ? "noopener noreferrer" : undefined}
      >
        {item.fields.label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition hover:text-primary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Link href={prefixHref(item.fields.url, locale)}>{item.fields.label}</Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-border bg-white py-2 shadow-lg">
          {children.map((child) => (
            <Link
              key={child.sys.id}
              href={prefixHref(child.fields.url, locale)}
              className="block px-4 py-2 text-sm text-gray-700 transition hover:bg-surface-dim hover:text-primary"
              target={child.fields.openInNewTab ? "_blank" : undefined}
              rel={child.fields.openInNewTab ? "noopener noreferrer" : undefined}
            >
              {child.fields.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileNavItem({ item, locale, onClose }: { item: ResolvedNavigationItem; locale: Locale; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const children = (item.fields.children ?? []).filter(Boolean) as ResolvedNavigationItem[];

  if (children.length === 0) {
    return (
      <Link
        href={prefixHref(item.fields.url, locale)}
        className="block px-4 py-3 text-gray-700 transition hover:bg-surface-dim"
        onClick={onClose}
      >
        {item.fields.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-gray-700 transition hover:bg-surface-dim"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <Link href={prefixHref(item.fields.url, locale)} onClick={onClose}>
          {item.fields.label}
        </Link>
        <svg
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? "max-h-96" : "max-h-0"
        }`}
      >
        {children.map((child) => (
          <Link
            key={child.sys.id}
            href={prefixHref(child.fields.url, locale)}
            className="block py-2 pl-8 pr-4 text-sm text-gray-600 transition hover:bg-surface-dim hover:text-primary"
            onClick={onClose}
          >
            {child.fields.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header({ siteName, logo, navigation, locale }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoUrl = getAssetUrl(logo);
  const items = navigation.filter(Boolean) as ResolvedNavigationItem[];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          {logoUrl && (
            <Image src={`${logoUrl}?w=40&h=40&fm=webp`} alt="" width={40} height={40} className="rounded" />
          )}
          <span className="text-lg font-bold text-gray-900">{siteName}</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Main navigation">
            {items.map((item) => (
              <DesktopDropdown key={item.sys.id} item={item} locale={locale} />
            ))}
          </div>

          <LanguageSwitcher currentLocale={locale} />

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t(locale, "header.closeMenu") : t(locale, "header.openMenu")}
            aria-expanded={mobileOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-border transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-[80vh]" : "max-h-0 border-t-0"
        }`}
      >
        <div className="bg-white py-2">
          {items.map((item) => (
            <MobileNavItem key={item.sys.id} item={item} locale={locale} onClose={() => setMobileOpen(false)} />
          ))}
        </div>
      </div>
    </header>
  );
}
