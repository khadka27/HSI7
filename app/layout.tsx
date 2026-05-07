import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CategoryProvider } from '@/context/CategoryContext';
import ConditionalHeader from '@/components/ConditionalHeader';
import ConditionalFooter from '@/components/ConditionalFooter';
import SessionProvider from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HealthStore - Premium Nutra & Wellness Products',
  description: 'Discover science-backed supplements, fitness gear, and organic wellness products at HealthStore.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F9FAFB]`}>
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
