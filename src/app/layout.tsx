import type { Metadata } from 'next';
import './globals.css';
import ReduxProvider from '@/components/ReduxProvider';
import QueryProvider from '@/components/QueryProvider';
import MuiProvider from '@/components/MuiProvider';

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <MuiProvider>
          <ReduxProvider>
            <QueryProvider>{children}</QueryProvider>
          </ReduxProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
