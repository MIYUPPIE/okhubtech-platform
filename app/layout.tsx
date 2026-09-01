import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_URL } from "@/lib/site";
import { LOGO } from "@/lib/media";
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

export const metadata: Metadata = {
  title: "OKHub Technology: Training Minds. Building Solutions. Powering Africa’s Future.",
  description:
    "OKHub Technology trains people in AI, robotics and software, and builds systems across commerce, agriculture, health, civic tech and more, out of Ibadan, Nigeria.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "OKHub Technology | Fourth Industrial Revolution for Africa",
    description:
      "Training minds, building solutions, and powering Africa’s future through AI, robotics, IoT, data, and immersive ecosystems.",
    url: SITE_URL,
    siteName: "OKHub Technology",
    images: [
      {
        url: LOGO.og.src,
        width: LOGO.og.width,
        height: LOGO.og.height,
        alt: "OKHub Technology",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OKHub Technology | Africa’s 4IR Engine",
    description:
      "Training minds, building solutions, and powering Africa’s future through AI, robotics, IoT, data, and immersive ecosystems.",
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
