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
  title: "HealthStore - Premium Nutra & Wellness Products",
  description:
    "Discover science-backed supplements, fitness gear, and organic wellness products at HealthStore.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
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
