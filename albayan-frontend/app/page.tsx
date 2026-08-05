import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Layers,
  Library,
  PlayCircle,
  Sparkles,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Layers,
    title: "مراحل منظمة",
    description: "تصفح المحتوى مرتبًا حسب المرحلة الدراسية بدءًا من الأساسيات.",
  },
  {
    icon: Library,
    title: "مواد دراسية",
    description: "كل المواد في مكان واحد — اختر ما يناسبك وابدأ رحلتك التعليمية.",
  },
  {
    icon: BookOpen,
    title: "دروس متكاملة",
    description: "دروس مفصلة مع مقاطع فيديو وفقرات مقسمة لسهولة المتابعة.",
  },
  {
    icon: ClipboardList,
    title: "تقييمات ذكية",
    description: "اختبر فهمك بتقييمات قبلية وتكوينية ونهائية مع تصحيح فوري.",
  },
];

const STATS = [
  { value: "+١٠٠", label: "درس تعليمي" },
  { value: "+٤٠", label: "مادة دراسية" },
  { value: "+٢٠٠", label: "سؤال تقييمي" },
  { value: "+١٠", label: "مرحلة دراسية" },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "أنشئ حسابك",
    description: "سجّل مجانًا في دقائق وابدأ رحلتك التعليمية.",
  },
  {
    icon: BookOpen,
    title: "اختر مرحلتك ومادتك",
    description: "حدد مستواك الدراسي وابدأ من حيث يناسبك تمامًا.",
  },
  {
    icon: PlayCircle,
    title: "تعلّم وتقيّم",
    description: "تابع الدروس بفيديوهات وفقرات، ثم اختبر فهمك فورًا.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -end-40 size-96 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -start-40 size-96 rounded-full bg-primary/5 blur-3xl"
          />

          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-28">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              منصتك التعليمية الموحّدة
            </span>

            <h1 className="mt-6 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              تعلّم بطريقة <span className="text-primary">منظّمة</span> وبخطوات واضحة
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              مدرستي تجمع الدروس والمناهج والتقييمات في مكان واحد، مصممة لمساعدتك على
              التقدم خطوة بخطوة بمحتوى عربي منظم.
            </p>

            <div className="mt-8 flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-none sm:flex-row">
              <Button asChild size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
                <Link href="/register">
                  ابدأ الآن
                  <ArrowLeft className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
            </div>
            <div className="mt-12 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1 rounded-2xl border bg-card p-4"
                >
                  <span className="text-2xl font-extrabold text-primary sm:text-3xl">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">ماذا ستجد هنا؟</h2>
            <p className="mt-2 text-muted-foreground">
              تجربة تعليمية متكاملة صُممت لتوازن بين البساطة والعمق.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/40 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">كيف تبدأ؟</h2>
              <p className="mt-2 text-muted-foreground">
                ثلاث خطوات بسيطة تفصلك عن أول درس.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative flex flex-col gap-3 rounded-2xl border bg-card p-6">
                  <span className="absolute end-4 top-4 text-4xl font-extrabold text-muted-foreground/15">
                    {index + 1}
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-3xl border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8 text-center sm:p-12">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <GraduationCap className="size-6" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight">جاهز للبدء؟</h2>
            <p className="max-w-md text-muted-foreground">
              أنشئ حسابك المجاني الآن وابدأ رحلة التعلم من حيث يناسب مستواك.
            </p>
            <Button asChild size="lg" className="mt-2 h-12 px-6 text-base">
              <Link href="/register">أنشئ حسابًا مجانيًا</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </span>
            <span className="text-base font-bold tracking-tight">مدرستي</span>
          </div>

          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground hover:underline">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="hover:text-foreground hover:underline">
              إنشاء حساب
            </Link>
          </nav>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-primary" />
            منصة تعليمية عربية مفتوحة — مدرستي
          </p>
        </div>
      </footer>
    </div>
  );
}
