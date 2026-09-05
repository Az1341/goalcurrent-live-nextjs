import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { GA } from "@/components/analytics/GA";
import { ServiceWorkerBootstrap } from "@/components/pwa/ServiceWorkerBootstrap";
import { Clarity } from "@/components/analytics/Clarity";
import Layout from "@/components/layout/Layout";
import { FirebaseRoot } from "@/components/firebase/FirebaseRoot";
import { OneSignalInit } from "@/components/push/OneSignalInit";
import ThemeScript from "@/components/theme/ThemeScript";
import { ThemeBootstrap, ThemeProvider } from "@/lib/theme/theme";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import SiteJsonLd from "@/components/seo/SiteJsonLd";
import { FinalLineupVerifier } from "@/components/match/FinalLineupVerifier";
import { routing } from "@/i18n/routing";
import { getDirection } from "@/i18n/locales";
import { BRAND_THEME_COLOR } from "@/lib/site-integrations";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_CARD,
} from "@/lib/seo/constants";
import { SITE_URL, SITE_NAME } from "@/lib/site-url";
import { deployRobotsMetadata } from "@/lib/seo/deploy-robots";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  preload: true,
  adjustFontFallback: true,
});

const ROOT_DESCRIPTION = `${SITE_NAME} — live football scores, fixtures, results, standings and news from major leagues and competitions.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...deployRobotsMetadata(),
  title: {
    template: `%s - ${SITE_NAME}`,
    default: `${SITE_NAME} | Live Football Scores, Fixtures and News`,
  },
  description: ROOT_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} | Live Football Scores, Fixtures and News`,
    description: ROOT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE.url,
        width: DEFAULT_OG_IMAGE.width,
        height: DEFAULT_OG_IMAGE.height,
        alt: DEFAULT_OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: DEFAULT_TWITTER_CARD,
    title: `${SITE_NAME} | Live Football Scores, Fixtures and News`,
    description: ROOT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GoalCurrent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "192x192" }],
  },
  other: {
    "msapplication-TileColor": BRAND_THEME_COLOR,
    "msapplication-TileImage": "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: BRAND_THEME_COLOR,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const direction = getDirection(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <Clarity />
      </head>
      <body className="gc-body">
        <ThemeProvider>
          <ThemeBootstrap />
          <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
            <SiteJsonLd locale={locale} />
            <Layout>{children}</Layout>
            <FinalLineupVerifier />
            <ServiceWorkerBootstrap />
            <GA />
            {isFirebaseConfigured() ? <FirebaseRoot /> : <OneSignalInit />}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
