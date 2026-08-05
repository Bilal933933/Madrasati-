import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";

export default function TrialPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LandingNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold">النسخة التجريبية</h1>
        <p className="max-w-md text-muted-foreground">
          هذه الصفحة قيد الإنشاء — ستتضمن تجربة درسًا حقيقيًا قبل التسجيل.
        </p>
        <Button asChild variant="outline">
          <Link href="/">العودة للبوابة</Link>
        </Button>
      </main>
    </div>
  );
}
