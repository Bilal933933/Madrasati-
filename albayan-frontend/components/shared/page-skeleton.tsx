import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageSkeletonVariant = "home" | "student" | "admin" | "lesson" | "content";

/**
 * هيكل تحميل خفيف للمسارات: يحجز مواضع المحتوى الحقيقية، لذلك لا تقفز
 * الصفحة عند وصول البيانات. يُستخدم من ملفات loading.tsx فقط.
 */
export function PageSkeleton({ variant = "content" }: { variant?: PageSkeletonVariant }) {
  if (variant === "home") {
    return <StudentHomeSkeleton />;
  }

  if (variant === "lesson") {
    return <LessonSkeleton />;
  }

  if (variant === "admin") {
    return <AdminSkeleton />;
  }

  return <ContentSkeleton student={variant === "student"} />;
}

/** نسخة هيكلية مطابقة لترتيب صفحة «بيتي التعليمي». */
function StudentHomeSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 pb-32 sm:px-6" aria-label="جارٍ تحميل بيتي التعليمي" aria-busy="true">
      <section className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-10 w-4/5" />
          <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="flex items-center justify-between"><Skeleton className="h-4 w-40" /><Skeleton className="h-5 w-10" /></div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="aspect-[16/9] w-full rounded-2xl lg:col-span-7 lg:h-96 lg:aspect-auto lg:rounded-none" />
      </section>

      <section className="rounded-3xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div className="w-full space-y-3"><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-44" /><Skeleton className="h-2 w-48" /></div>
          <Skeleton className="h-12 w-36 rounded-2xl" />
        </div>
      </section>

      <div className="flex items-center gap-4"><Skeleton className="h-px flex-1" /><Skeleton className="h-4 w-14" /><Skeleton className="h-px flex-1" /></div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-2xl border border-border/60 p-5"><Skeleton className="h-36 w-full rounded-xl" /><Skeleton className="h-6 w-3/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-32" /></div>
        ))}
      </section>
    </main>
  );
}

function ContentSkeleton({ student }: { student: boolean }) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8" aria-label="جارٍ تحميل الصفحة" aria-busy="true">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-56 sm:w-80" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      {student && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}
        </div>
      )}
      <div className={cn("grid gap-4", student ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-2xl border border-border/60 p-5">
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-9 w-28" />
          </div>
        ))}
      </div>
    </main>
  );
}

function AdminSkeleton() {
  return (
    <main className="space-y-6 p-4 sm:p-6" aria-label="جارٍ تحميل لوحة الإدارة" aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-xl border">
        <div className="flex gap-4 border-b p-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-4 flex-1" />)}</div>
        {Array.from({ length: 7 }).map((_, index) => <div key={index} className="flex gap-4 border-b p-4 last:border-0">{Array.from({ length: 4 }).map((__, cell) => <Skeleton key={cell} className="h-5 flex-1" />)}</div>)}
      </div>
    </main>
  );
}

function LessonSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col" aria-label="جارٍ تحميل الدرس" aria-busy="true">
      <header className="space-y-3 border-b px-4 py-4 sm:px-8"><Skeleton className="mx-auto h-4 w-44" /><Skeleton className="h-1.5 w-full" /></header>
      <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-3xl space-y-6"><Skeleton className="h-7 w-1/3" /><Skeleton className="h-10 w-3/4" /><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-14 w-full" /></div>
      </main>
    </div>
  );
}
