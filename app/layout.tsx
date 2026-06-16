import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron, Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { LayoutWrapper } from "./components/layout-wrapper";
import { LanguageProvider } from "./contexts/LanguageContext";
import CookieConsent from "./components/CookieConsent";
import ThemeSwitcher from "./components/ThemeSwitcher";
import ChristmasSnowfall from "./components/ChristmasSnowfall";
import { Analytics } from "@vercel/analytics/next"
import brandingConfig from "./config/sections/branding.json";
import type { BrandingConfig } from "./types/branding";

const branding = brandingConfig as BrandingConfig;
const siteUrl = branding.websiteUrl.replace(/\/$/, "");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
// hi there
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});
// hello again
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e40af" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" }
  ],
}

export const metadata: Metadata = {
  title: {
    default: `${branding.fullName} - ${branding.tagline}`,
    template: `%s | ${branding.fullName}`
  },
  description: branding.description,
  keywords: [
    "game hosting",
    "minecraft hosting",
    "discord bot hosting",
    "VPS hosting",
    "dedicated servers",
    "cloud servers",
    "gaming servers",
    branding.fullName,
    "low latency hosting",
    "DDoS protection",
    "24/7 support",
    "custom server hosting",
    "modded game hosting",
    "server rental"
  ],
  authors: [{ name: branding.fullName }],
  creator: branding.fullName,
  publisher: branding.fullName,
  category: "Game Hosting & Server Solutions",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: `${branding.fullName} - Game Hosting & Servers`,
    title: `${branding.fullName} - ${branding.tagline}`,
    description: branding.description,
    images: [
      {
        url: `${siteUrl}/meta/Banner.png`,
        width: 1200,
        height: 630,
        alt: `${branding.fullName} - ${branding.tagline}`,
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${branding.fullName} - ${branding.tagline}`,
    description: branding.description,
    images: [`${siteUrl}/meta/Banner.png`]
  },
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    google: "vzsKvhNUgAPlCbf1annB0Sl-bttSFos87mhOyQSU2aY", 
  },

  applicationName: branding.fullName,
  referrer: "origin-when-cross-origin",

  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/meta/Logo.png", sizes: "32x32", type: "image/png" },
      { url: "/meta/Logo.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/meta/Logo.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/meta/Logo.png"
  },

  alternates: {
    canonical: siteUrl
  },
  other: {
    "msapplication-TileColor": "#1e40af",
    "msapplication-config": "/browserconfig.xml",
    "terms-of-service": `${siteUrl}/terms-of-services`,
    "privacy-policy": `${siteUrl}/privacy-policy`
  }
};
// yo yo, wassup, ma name is big A aka the big ANTHONYYYYYYYYYYYYYYYYYY. like my work so far? rate it a 5 star on BBB pweaseeeeeeeeee
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={branding.fullName} />
        <meta name="crawl-delay" content="10" />
        <meta name="revisit-after" content="7 days" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": branding.fullName,
              "url": siteUrl,
              "logo": `${siteUrl}/meta/Logo.png`,
              "description": branding.description,
              "serviceType": ["Game Server Hosting", "VPS Hosting", "Dedicated Servers", "Cloud Infrastructure"],
              "areaServed": "Worldwide",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Gaming & Server Solutions",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Game Server Hosting",
                      "description": "High-performance game servers with DDoS protection"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "VPS Hosting",
                      "description": "Virtual private servers with full root access"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "Dedicated Servers",
                      "description": "Bare metal servers for maximum performance"
                    }
                  }
                ]
              },
              "sameAs": [
                brandingConfig.discordUrl
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "English",
                "serviceType": "Technical Support",
                "url": brandingConfig.discordUrl
              },
              "founder": {
                "@type": "Person",
                "name": "Anthony "
              },
              "termsOfService": `${siteUrl}/terms-of-services`,
              "privacyPolicy": `${siteUrl}/privacy-policy`
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${quicksand.variable} antialiased min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <ChristmasSnowfall />
            <LayoutWrapper>
              {children}
              <Analytics />
            </LayoutWrapper>
            <CookieConsent />
            <ThemeSwitcher />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
