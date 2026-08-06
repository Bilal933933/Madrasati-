import type { ReactNode } from "react";
import { LandingFooter } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";

/**
 * هيكل صفحة الاستكشاف: بار التنقل العام + محتوى + فوتر البوابة.
 */
export function ExploreShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LandingNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
