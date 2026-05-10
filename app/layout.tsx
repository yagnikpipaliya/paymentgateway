import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

/** Primary / display — headings, marketing copy, cardholder & expiry on preview. */
const fontPrimary = Fraunces({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

/** Secondary — UI labels, inputs, buttons, metadata. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payment Gateway Lab · Mock Checkout",
  description:
    "Next.js App Router payment UI with a simulated gateway, resilient retries, and accessible forms.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

const RootLayout = ({ children }: RootLayoutProps) => (
  <html
    lang="en"
    suppressHydrationWarning
    className={`${fontPrimary.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  >
    <body className="flex min-h-full flex-col">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
