import type { Metadata } from 'next';
import { Kulim_Park } from 'next/font/google';
import './globals.css';

const kulim = Kulim_Park({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={kulim.className}>{children}</body>
    </html>
  );
}
