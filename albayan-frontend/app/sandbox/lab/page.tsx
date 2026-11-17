import { ArrowLeft, FlaskConical } from "lucide-react";
import Link from "next/link";
import { LABS } from "@/features/lab-sandbox/mock/labs";

/** فهرس البيئة المعزولة — بيانات ثابتة، بلا شبكة */
export default function SandboxIndexRoute() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground">
          <FlaskConical className="size-3.5 text-amber-500" aria-hidden />
          بيئة معزولة · مختبر ثلاثي الأبعاد
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold">مختبرات الفيزياء التجريبية</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          نسخة تجريبية لتقييم دمج مختبر تفاعلي في محرك الدرس. البيانات ثابتة داخل المستودع،
          ولا يوجد أي اتصال بالخادم أو تخزين محلي.
        </p>
      </header>

      <Link
        href="/sandbox/lesson?variant=compact"
        className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-primary">محاكاة محرك الدرس كاملاً</span>
          <span className="font-heading text-base font-bold">البداية ← محتوى 3D ← تقييم تكويني ← تقييم ختامي ← ختام</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
          تجربة الدرس
          <ArrowLeft className="size-3" aria-hidden />
        </span>
      </Link>

      <Link
        href="/sandbox/lab/scene"
        className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4 transition-colors hover:bg-sky-500/10"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
            جديد · مشهد من بيانات JSON
          </span>
          <span className="font-heading text-base font-bold">عارض مشاهد عام لأي مادة</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300">
          تجربة العارض
          <ArrowLeft className="size-3" aria-hidden />
        </span>
      </Link>

      <Link
        href="/sandbox/scenes"
        className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 transition-colors hover:bg-violet-500/10"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300">
            ١٠ دروس · ١٠ مشاهد
          </span>
          <span className="font-heading text-base font-bold">
            علوم · كيمياء · أحياء · جغرافيا · عربية · رياضيات · فيزياء · تقنية · تاريخ
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 dark:text-violet-300">
          فهرس الدروس
          <ArrowLeft className="size-3" aria-hidden />
        </span>
      </Link>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => (
          <li key={lab.id}>
            <Link
              href={`/sandbox/lab/${lab.id}?variant=book`}
              className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-amber-500/40 hover:bg-muted/40"
            >
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                {lab.badge}
              </span>
              <span className="font-heading text-base font-bold leading-tight">{lab.label}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">{lab.title}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground group-hover:text-foreground">
                فتح المختبر
                <ArrowLeft className="size-3" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
