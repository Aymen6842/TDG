import "./globals.css";
import React from "react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import GoogleAnalyticsInit from "@/lib/ga";
import { fontVariables } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";
import { ActiveThemeProvider } from "@/components/active-theme";
import { Toaster } from "@/components/ui/sonner";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import ReactQueryProvider from "@/utils/providers/react-query-provider";
import MockToggle from "@/lib/mock-toggle"; // REMOVE THIS LINE FOR PROD

export const metadata = {
  title: 'Tawer MGT',
  description: 'A platform to manage teams efficiently', // Meta description for SEO
  icons: {
    icon: '/logo.png', // path to your icon
  },
};

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
                <MockToggle />{/* REMOVE THIS LINE FOR PROD */}
              </ActiveThemeProvider>
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
