import "./globals.css";
import type { Metadata } from "next";
import { Outfit, Fraunces } from "next/font/google";
import { CategoryProvider } from "@/context/CategoryContext";
import ConditionalHeader from "@/components/ConditionalHeader";
import ConditionalFooter from "@/components/ConditionalFooter";
import SessionProvider from "@/components/providers/SessionProvider";
import { OrganizationSchema } from "@/components/SEOSchema";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HealthStore - Premium Supplements & Wellness Products | healthstoreinfo7.top",
  description:
    "Discover science-backed supplements, premium fitness gear, and organic wellness products. Shop health products online at HealthStore - Your trusted wellness destination.",
  keywords: [
    "supplements",
    "health products",
    "fitness gear",
    "wellness products",
    "nutra",
    "organic wellness",
    "protein powder",
    "vitamins",
    "fitness equipment",
  ],
  authors: [{ name: "HealthStore", url: "https://healthstoreinfo7.top" }],
  creator: "HealthStore",
  publisher: "HealthStore",
  metadataBase: new URL("https://healthstoreinfo7.top"),
  alternates: {
    canonical: "https://healthstoreinfo7.top",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://healthstoreinfo7.top",
    siteName: "HealthStore",
    title: "HealthStore - Premium Supplements & Wellness Products",
    description:
      "Discover science-backed supplements, premium fitness gear, and organic wellness products. Shop health products online at HealthStore.",
    images: [
      {
        url: "https://healthstoreinfo7.top/og-image.png",
        width: 1200,
        height: 630,
        alt: "HealthStore - Premium Health & Wellness Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthStore - Premium Supplements & Wellness Products",
    description:
      "Discover science-backed supplements and premium wellness products at HealthStore.",
    images: ["https://healthstoreinfo7.top/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>        <meta charSet=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=5\" />
        <meta name=\"theme-color\" content=\"#16a34a\" />
        <link rel=\"manifest\" href=\"/manifest.json\" />
        <link rel=\"icon\" href=\"/favicon.ico\" />
        <link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png\" />
        <meta name=\"format-detection\" content=\"telephone=no\" />
        <meta name=\"mobile-web-app-capable\" content=\"yes\" />
        <meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />
        <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\" />
        <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />
        <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossOrigin=\"anonymous\" />        <OrganizationSchema />
      </head>
      <body className={`${outfit.variable} ${fraunces.variable} antialiased`}>
        <SessionProvider>
          <CategoryProvider>
            <ConditionalHeader />
            {children}
            <ConditionalFooter />
          </CategoryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
