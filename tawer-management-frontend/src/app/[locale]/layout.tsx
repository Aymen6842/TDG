import "./globals.css";
import React from "react";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import GoogleAnalyticsInit from "@/lib/ga";
import { fontVariables } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";
import { ActiveThemeProvider } from "@/components/active-theme";
import { Toaster } from "@/components/ui/sonner";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import ReactQueryProvider from "@/utils/providers/react-query-provider";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.root");

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/logo.png"
    }
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn("bg-background group/layout font-sans", fontVariables)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <ReactQueryProvider>
              <ActiveThemeProvider>
                {children}
                <Toaster position="top-center" richColors />
                <NextTopLoader
                  color="var(--primary)"
                  showSpinner={false}
                  height={2}
                  shadow-sm="none"
                />
                {process.env.NODE_ENV === "production" ? <GoogleAnalyticsInit /> : null}
              </ActiveThemeProvider>
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
