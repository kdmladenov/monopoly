import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/components/ReduxProvider';
import QueryProvider from '@/components/QueryProvider';
import MuiProvider from '@/components/MuiProvider';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '500', '700', '900'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Europoly',
  description: 'A continent-spanning strategy board game built with Next.js.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${outfit.variable}`}>
      <body className="min-h-full flex flex-col font-[var(--font-outfit)]">
        <MuiProvider>
          <ReduxProvider>
            <QueryProvider>{children}</QueryProvider>
          </ReduxProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
