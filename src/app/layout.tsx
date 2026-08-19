import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://crydensync-docs.vercel.app";
const SITE_NAME = "CrydenSync";
const TITLE = "CrydenSync — Own your users";
const DESCRIPTION =
  "An embeddable, framework-agnostic authentication engine for Go. Self-hosted, zero telemetry, no vendor lock-in.";
// Swap in the real logo file once it's added to /public (any of these
// filenames work — just make sure the file on disk matches one below).
const LOGO_PATH = "/logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — CrydenSync",
  },
  description: DESCRIPTION,
  keywords: [
    "authentication",
    "auth engine",
    "self-hosted authentication",
    "Go authentication library",
    "JWT",
    "Open Source",
    "PostgreSQL",
    "session management",
    "CrydenSync",
  ],
  authors: [{ name: "Raymond Nicholas", url: "https://github.com/raymondproguy" }],
  creator: "Raymond Nicholas",
  icons: {
    icon: LOGO_PATH,
    apple: LOGO_PATH,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: LOGO_PATH, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@CrydenSync",
    creator: "@raymondproguy",
    title: TITLE,
    description: DESCRIPTION,
    images: [LOGO_PATH],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
