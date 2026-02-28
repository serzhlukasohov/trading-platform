import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemedToaster from '@/components/ThemedToaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CoinPulse',
  description: 'Crypto Screener App with a built-in High-Frequency Terminal & Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('coinpulse-theme')||'dark';document.documentElement.className=t;}catch(e){document.documentElement.className='dark';}`,
          }}
        />
        <ThemeProvider>
          <Header />
          {children}
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
