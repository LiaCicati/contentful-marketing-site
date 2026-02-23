"use client";

import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";
import type { PropsWithChildren } from "react";

interface Props {
  locale: string;
  isDraftMode: boolean;
}

export default function ContentfulPreviewProvider({
  children,
  locale,
  isDraftMode,
}: PropsWithChildren<Props>) {
  if (!isDraftMode) return <>{children}</>;

  return (
    <ContentfulLivePreviewProvider
      locale={locale}
      enableInspectorMode={isDraftMode}
      enableLiveUpdates={isDraftMode}
    >
      {children}
    </ContentfulLivePreviewProvider>
  );
}
