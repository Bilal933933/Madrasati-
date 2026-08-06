import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";
import { AdminFab } from "@/components/shared/admin-fab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "مدرستي — تعلّم خطوة بخطوة حتى تتقن الدرس",
    template: "%s | مدرستي",
  },
  description:
    "منصة مدرستي: تعلّم خطوة بخطوة مع قياس فهمك بعد كل فقرة — ابدأ أول درس مجانًا دون تسجيل، واستكشف المواد والوحدات والدروس بحرية.",
  openGraph: {
    title: "مدرستي — تعلّم خطوة بخطوة حتى تتقن الدرس",
    description:
      "رحلة تفاعلية تقيس فهمك بعد كل خطوة. جرّب أول درس مجانًا دون تسجيل، وعندما تريد أن تكمل، حسابك يستغرق دقيقة.",
    locale: "ar_AR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DirectionProvider dir="rtl">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>{children}</Providers>
            <AdminFab />
          </ThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
