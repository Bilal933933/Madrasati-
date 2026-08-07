import {
  BookOpen,
  Calculator,
  ChevronLeft,
  Cpu,
  FlaskConical,
  HelpCircle,
  Landmark,
  Layers,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";
import { StaggerGroup } from "./stagger-group";

const SUBJECTS = [
  {
    name: "العربية",
    icon: BookOpen,
    units: 5,
    lessons: 48,
    questions: 163,
  },
  {
    name: "الرياضيات",
    icon: Calculator,
    units: 7,
    lessons: 36,
    questions: 121,
  },
  {
    name: "العلوم",
    icon: FlaskConical,
    units: 6,
    lessons: 28,
    questions: 94,
  },
  {
    name: "الدراسات",
    icon: Landmark,
    units: 5,
    lessons: 24,
    questions: 86,
  },
  {
    name: "الحاسب",
    icon: Cpu,
    units: 4,
    lessons: 18,
    questions: 63,
  },
];

/**
 * قسم "المواد" كمكتبة كتب: كل مادة غلاف كتاب يفتح قليلًا عند التمرير عليه
 * (Hover) ويظهر إحصائياتها (وحدات/دروس/أسئلة) وزر "ابدأ من هنا".
 */
export function Subjects() {
  return (
    <section id="subjects" className="scroll-mt-24 border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            أين تريد أن تبدأ؟
          </h2>
          <p className="mt-3 text-muted-foreground">
            أخرج كتابًا من المكتبة — كل المواد متاحة للاستعراض دون تسجيل.
          </p>
        </ScrollReveal>

        <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" step={120}>
          {SUBJECTS.map((subject) => (
            <div
              key={subject.name}
              className="group relative flex flex-col items-center overflow-hidden rounded-2xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
            >
              <span className="mb-4 text-primary transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
                {(() => {
                  const Icon = subject.icon;
                  return <Icon className="size-9" aria-hidden />;
                })()}
              </span>
              <h3 className="font-bold">{subject.name}</h3>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center justify-center gap-1.5">
                  <Layers className="size-3.5" aria-hidden /> {subject.units} وحدات
                </p>
                <p className="flex items-center justify-center gap-1.5">
                  <PlayCircle className="size-3.5" aria-hidden /> {subject.lessons} درسًا
                </p>
                <p className="flex items-center justify-center gap-1.5">
                  <HelpCircle className="size-3.5" aria-hidden /> {subject.questions} سؤالًا
                </p>
              </div>

              <div className="mt-4 flex max-h-0 items-center gap-1.5 overflow-hidden text-sm font-medium text-primary transition-all duration-300 group-hover:max-h-8 group-hover:mt-4">
                <Link href="/explore" className="flex items-center gap-1.5">
                  ابدأ من هنا
                  <ChevronLeft className="size-4 rtl:rotate-180" />
                </Link>
              </div>
              <p className="mt-3 text-[0.65rem] text-muted-foreground/70">
                آخر تحديث: اليوم
              </p>
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
