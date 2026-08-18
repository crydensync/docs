import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";

export const metadata = {
  title: "CrydenSync — Own your users",
  description:
    "An embeddable, framework-agnostic authentication engine. Self-hosted, zero telemetry, no vendor lock-in.",
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
