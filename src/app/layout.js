import { Geist, Geist_Mono } from "next/font/google";
import { Gabarito } from 'next/font/google';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const gabarito = Gabarito({
  subsets: ['latin'],
  weight: ['400', '700'], // Specify needed weights
  variable: '--font-gabarito', // Optional: for Tailwind
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bdsaaszone.site';

export const metadata = {
  title: {
    default: "BD SaaS Zone | The Directory of Bangladeshi Startups",
    template: "%s | BD SaaS Zone"
  },
  description: "The definitive directory for Made-in-Bangladesh software. A platform for founders to showcase startups, buyers to acquire products, and developers to find inspiration.",
  metadataBase: new URL(APP_URL),
  keywords: ["SaaS", "Bangladesh", "Startups", "Directory", "Software", "Tech Bangladesh", "BD SaaS"],
  authors: [{ name: "BD SaaS Zone Team" }],
  creator: "BD SaaS Zone",
  publisher: "BD SaaS Zone",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "BD SaaS Zone",
    title: "BD SaaS Zone | The Directory of Bangladeshi Startups",
    description: "The definitive directory for Made-in-Bangladesh software. Discover amazing products built in Bangladesh.",
    images: [
      {
        url: `${APP_URL}/logo.svg`,
        width: 800,
        height: 600,
        alt: "BD SaaS Zone Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BD SaaS Zone | The Directory of Bangladeshi Startups",
    description: "The definitive directory for Made-in-Bangladesh software. Discover amazing products built in Bangladesh.",
    images: [`${APP_URL}/logo.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification:{
    google:"XXiwGdX-YB-hkEWB0LVy9t-1AcjvSxdWKMxJuOxcLT0",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/1dev-hridoy/1dev-hridoy/buy-me-a-cha-style.css"
        />
      </head>
      <body

        className={`${gabarito.className} antialiased bg-slate-200`}
        
      >
        {children}
      </body>
    </html>
  );
}
