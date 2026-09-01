import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import JsonLd from "@/components/JsonLd";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_URL } from "@/lib/site";
import { LOGO } from "@/lib/media";
import { SITE_NAME, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const DEFAULT_TITLE =
  "OKHub Technology: Training Minds. Building Solutions. Powering Africa’s Future.";
const DEFAULT_DESCRIPTION =
  "OKHub Technology trains people in AI, robotics and software, and builds systems across commerce, agriculture, health, civic tech and more, out of Ibadan, Nigeria.";

export const metadata: Metadata = {
  // `template` composes every child page's own (short) title automatically,
  // so a page sets title: "Networking" and the rendered <title> and
  // og:title both become "Networking | OKHub Technology" with no page having
  // to spell the suffix out itself - eleven pages did, inconsistently
  // ("| OKHub" vs "| OKHub Technology"), before this.
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: LOGO.og.src,
        width: LOGO.og.width,
        height: LOGO.og.height,
        alt: SITE_NAME,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [LOGO.og.src],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${sora.variable} antialiased bg-white text-[#050505] dark:bg-black dark:text-white`}
      >
        <JsonLd data={organizationJsonLd(SITE_URL)} />
        <JsonLd data={websiteJsonLd(SITE_URL)} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="noise-bg relative min-h-screen overflow-clip bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-[#050505] dark:to-[#050505]">
            <div className="relative z-10 flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <FloatingContact />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
