import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";
import { AdminFab } from "@/components/shared/admin-fab";
import { MoltenMetal } from "@/features/landing/components/molten-metal";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/Geist-Variable.ttf",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.ttf",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const ibmPlexSansArabic = localFont({
  src: [
    { path: "./fonts/IBMPlexSansArabic-Light.ttf", weight: "300" },
    { path: "./fonts/IBMPlexSansArabic-Regular.ttf", weight: "400" },
    { path: "./fonts/IBMPlexSansArabic-Medium.ttf", weight: "500" },
    { path: "./fonts/IBMPlexSansArabic-SemiBold.ttf", weight: "600" },
    { path: "./fonts/IBMPlexSansArabic-Bold.ttf", weight: "700" },
  ],
  variable: "--font-ibm-plex-sans-arabic",
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
      <body className="relative min-h-full flex flex-col">
        {/* خلفية عامة للمشروع كامل: Molten Metal ثابتة خلف كل الصفحات */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <MoltenMetal
            color1="#8A5E38"
            color2="#C9A47C"
            color3="#F4EFE9"
            speed={0.3}
            scale={3.2}
            detail={2}
            glow={1.1}
            coreSize={0.12}
            swirl={0.8}
            fold={-0.18}
            blackPoint={0.12}
            brightness={1.05}
            grain
            grainIntensity={0.04}
            mouseInteraction
            mouseStrength={0.25}
            opacity={0.55}
          />
          {/* حجاب ناعم لضمان قراءة النصوص فوق الخلفية */}
          <div className="absolute inset-0 bg-background/75" />
        </div>

        <div className="relative z-10 flex min-h-dvh flex-col">
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
        </div>
      </body>
    </html>
  );
}
