import './globals.css';
import { Inter } from 'next/font/google';
import { defaultMetadata } from './metadata';

const inter = Inter({ subsets: ['latin'] });

export const metadata = defaultMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
        {/* PWA primary color */}
        <meta name="theme-color" content="#1E40AF" />
        {/* PWA capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* PWA status bar */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
