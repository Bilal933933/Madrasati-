"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, type Variants } from "motion/react";
import {
  BookOpenCheck,
  CalendarDays,
  Check,
  School,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { exploreApi } from "@/features/explore/services/exploreApi";
import type { ExploreGrade, ExploreSemester, ExploreStage } from "@/features/explore/types/explore.types";
import { EXPLORE_ICONS } from "@/features/explore/lib/exploreIcons";
import { showApiError } from "@/lib/apiErrors";
import { studentHomeApi } from "../services/studentHomeApi";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";

/** خطوات تهيئة المسار الدراسي للطالب الجديد. */
const STEPS = [
  { key: "stage", label: "المرحلة الدراسية" },
  { key: "grade", label: "الصف الدراسي" },
  { key: "semester", label: "الفصل الدراسي" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/** ظهور تدريجي (Stagger) لبطاقات الاختيار. */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/** محلّ أيقونة الكيان (مرحلة/صف) إلى مكوّن SVG مع بديل ثابت. */
function resolveIcon(name: string | null, fallback: LucideIcon): LucideIcon {
  return EXPLORE_ICONS[name ?? ""] ?? fallback;
}

/**
 * مؤشر خطوات التهيئة الثلاث: مكتمل (علامة ✓) / نشط (توهّج) / قادم،
 * مع إمكانية الرجوع لأي خطوة مكتملة بتغيير اختيار سابق.
 */
function Stepper({
  current,
  completed,
  canNavigate,
  onJump,
}: {
  current: number;
  completed: StepKey[];
  canNavigate: (index: number) => boolean;
  onJump: (index: number) => void;
}) {
  return (
    <ol className="flex w-full items-start gap-2 sm:items-center sm:gap-3">
      {STEPS.map((step, index) => {
        const stepIndex = index + 1;
        const isDone = completed.includes(step.key);
        const isActive = stepIndex === current;
        const isLast = index === STEPS.length - 1;
        const navigable = canNavigate(index);

        return (
          <li key={step.key} className={cn("flex items-center gap-2 sm:gap-3", !isLast && "flex-1")}>
            <button
              type="button"
              disabled={!navigable}
              onClick={() => onJump(index)}
              className={cn(
                "flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-2.5",
                navigable ? "cursor-pointer" : "cursor-default",
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-primary/10 text-primary ring-4 ring-primary/15",
                  !isDone && !isActive && "border-border bg-card text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-4" strokeWidth={3} /> : stepIndex}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-sm font-semibold transition-colors",
                  isDone && "text-primary",
                  isActive && "text-foreground",
                  !isDone && !isActive && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </button>

            {!isLast && (
              <span
                aria-hidden
                className={cn("h-px flex-1 transition-colors duration-300", isDone ? "bg-primary/60" : "bg-border")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** بطاقة اختيار بصرية: أيقونة ملونة + عنوان + تلميح، مع تأثيرات Hover/Active وعلامة اختيار. */
function ChoiceCard({
  label,
  hint,
  icon: Icon,
  color,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  icon: LucideIcon;
  color: string | null;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      variants={cardVariants}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full flex-col items-center gap-3 rounded-3xl border bg-card px-4 py-6 text-center outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary/70 shadow-lg shadow-primary/15"
          : "border-border/60 hover:border-primary/40 hover:bg-primary/[0.03]",
      )}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute end-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
        >
          <Check className="size-4" strokeWidth={3} />
        </motion.span>
      )}

      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
          !color && "bg-primary/10 text-primary",
        )}
        style={color ? { backgroundColor: `${color}1A`, color } : undefined}
      >
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="text-sm font-bold sm:text-base">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </motion.button>
  );
}

/** شبكة هيكلية لبطاقات التحميل أثناء جلب الخيارات. */
function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-44 animate-pulse flex-col items-center justify-center gap-3 rounded-3xl border bg-card p-6"
        >
          <div className="size-14 rounded-2xl bg-muted" />
          <div className="h-4 w-24 rounded-full bg-muted" />
          <div className="h-3 w-16 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface OptionItem {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  hint?: string;
}

/** شبكة الخيارات البصرية لخطوة واحدة (تحميل / فارغ / بطاقات متدرّجة). */
function OptionGrid({
  items,
  selectedId,
  loading,
  fallbackIcon,
  emptyText,
  onSelect,
}: {
  items: OptionItem[];
  selectedId: number | null;
  loading: boolean;
  fallbackIcon: LucideIcon;
  emptyText: string;
  onSelect: (id: number) => void;
}) {
  if (loading) return <CardsSkeleton count={3} />;

  if (items.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed bg-card/40 py-12 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item) => (
        <ChoiceCard
          key={item.id}
          label={item.name}
          hint={item.hint}
          icon={resolveIcon(item.icon, fallbackIcon)}
          color={item.color}
          selected={selectedId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </motion.div>
  );
}

/** بند واحد في بطاقة ملخص المسار المختار. */
function SummaryItem({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          !color && "bg-primary/10 text-primary",
        )}
        style={color ? { backgroundColor: `${color}1A`, color } : undefined}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

/** عنوان الخطوة الحالية داخل تجربة التهيئة. */
function StepHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <header className="mb-6">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </header>
  );
}

/**
 * ربط الطالب بالمحتوى: تجربة إعداد تفاعلية (Stepper + بطاقات بصرية + ملخص)
 * اختيار المرحلة ← الصف ← الفصل ثم حفظ بياناته الدراسية.
 * يظهر عند أول دخول لبيت الطالب دون ملف دراسي (student_profile).
 */
export function StudentSetup() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [stage, setStage] = useState<ExploreStage | null>(null);
  const [grade, setGrade] = useState<ExploreGrade | null>(null);
  const [semester, setSemester] = useState<ExploreSemester | null>(null);

  const { data: stagesData, isLoading: stagesLoading } = useQuery({
    queryKey: ["explore", "stages"],
    queryFn: exploreApi.stages,
  });

  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ["explore", "grades", stage?.key],
    queryFn: () => exploreApi.grades(stage!.key),
    enabled: Boolean(stage),
  });

  const { data: semestersData, isLoading: semestersLoading } = useQuery({
    queryKey: ["explore", "semesters", stage?.key, grade?.key],
    queryFn: () => exploreApi.semesters(stage!.key, grade!.key),
    enabled: Boolean(stage && grade),
  });

  const stages = stagesData?.data ?? [];
  const grades = gradesData?.data ?? [];
  const semesters = semestersData?.data ?? [];

  const completedKeys: StepKey[] = [];
  if (stage) completedKeys.push("stage");
  if (grade) completedKeys.push("grade");
  if (semester) completedKeys.push("semester");

  const canNavigate = (index: number): boolean => {
    const key = STEPS[index].key;
    if (key === "stage") return true;
    if (key === "grade") return Boolean(stage);
    return Boolean(grade);
  };

  const ready = Boolean(stage && grade && semester);
  const canSave = ready && !saving;

  const handleSelectStage = (item: ExploreStage) => {
    setStage(item);
    setGrade(null);
    setSemester(null);
    setCurrentStep(2);
  };

  const handleSelectGrade = (item: ExploreGrade) => {
    setGrade(item);
    setSemester(null);
    setCurrentStep(3);
  };

  const handleSelectSemester = (item: ExploreSemester) => {
    setSemester(item);
  };

  const handleSave = async () => {
    if (!grade || !semester) return;

    setSaving(true);
    try {
      const result = await studentHomeApi.saveProfile({
        grade_id: grade.id,
        semester_id: semester.id,
      });
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      showApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const stageIcon = resolveIcon(stage?.icon ?? null, School);
  const gradeIcon = resolveIcon(grade?.icon ?? null, School);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 pb-20 pt-14 sm:px-6">
      {/* توهّج خلفي ناعم */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute end-0 top-0 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute start-0 top-32 size-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* الغلاف */}
      <ScrollReveal>
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpenCheck className="size-8" />
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">لنبدأ رحلتك التعليمية</h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            اختر مرحلتك الدراسية ثم صفّك وفصلك حتى نعرض لك موادّك الدراسية.
          </p>
        </div>
      </ScrollReveal>

      {/* مؤشر الخطوات */}
      <ScrollReveal delay={120} className="mt-10">
        <Stepper
          current={currentStep}
          completed={completedKeys}
          canNavigate={canNavigate}
          onJump={setCurrentStep}
        />
      </ScrollReveal>

      {/* محتوى الخطوة النشطة */}
      <ScrollReveal delay={200} className="mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {currentStep === 1 && (
              <section>
                <StepHeading
                  title="اختر مرحلتك الدراسية"
                  hint="ستُبنى قائمتا الصفوف والفصول تلقائيًا بناءً على اختيارك."
                />
                <OptionGrid
                  loading={stagesLoading}
                  items={stages.map((item) => ({
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                    color: item.color,
                    hint: `${item.grades_count} صفوف`,
                  }))}
                  selectedId={stage?.id ?? null}
                  fallbackIcon={School}
                  emptyText="لا توجد مراحل دراسية متاحة حاليًا."
                  onSelect={(id) => {
                    const item = stages.find((s) => s.id === id);
                    if (item) handleSelectStage(item);
                  }}
                />
              </section>
            )}

            {currentStep === 2 && (
              <section>
                <StepHeading title="اختر صفك الدراسي" hint="حدّد صفك لتصبح الفصول المتاحة له أمامك." />
                <OptionGrid
                  loading={gradesLoading}
                  items={grades.map((item) => ({
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                    color: item.color,
                    hint: `${item.semesters_count} فصول`,
                  }))}
                  selectedId={grade?.id ?? null}
                  fallbackIcon={School}
                  emptyText="لا توجد صفوف متاحة لهذه المرحلة حاليًا."
                  onSelect={(id) => {
                    const item = grades.find((g) => g.id === id);
                    if (item) handleSelectGrade(item);
                  }}
                />
              </section>
            )}

            {currentStep === 3 && (
              <section>
                <StepHeading title="اختر فصلك الدراسي" hint="أخيرًا، حدّد الفصل الذي تدرس فيه الآن." />
                <OptionGrid
                  loading={semestersLoading}
                  items={semesters.map((item) => ({
                    id: item.id,
                    name: item.name,
                    icon: null,
                    color: null,
                    hint: `${item.subjects_count} مواد`,
                  }))}
                  selectedId={semester?.id ?? null}
                  fallbackIcon={CalendarDays}
                  emptyText="لا توجد فصول متاحة لهذا الصف حاليًا."
                  onSelect={(id) => {
                    const item = semesters.find((s) => s.id === id);
                    if (item) handleSelectSemester(item);
                  }}
                />
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollReveal>

      {/* بطاقة الملخص والتأكيد */}
      <AnimatePresence>
        {ready && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-10"
          >
            <div className="rounded-3xl border border-primary/20 bg-card/60 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpenCheck className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-bold">مسارك الدراسي</h3>
                  <p className="text-sm text-muted-foreground">تأكيد اختياراتك قبل بدء رحلتك التعليمية.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <SummaryItem label="المرحلة الدراسية" value={stage!.name} icon={stageIcon} color={stage!.color} />
                <SummaryItem label="الصف الدراسي" value={grade!.name} icon={gradeIcon} color={grade!.color} />
                <SummaryItem
                  label="الفصل الدراسي"
                  value={semester!.name}
                  icon={CalendarDays}
                  color={null}
                />
              </div>

              <Button size="lg" className="mt-6 w-full" onClick={handleSave} disabled={!canSave}>
                {saving ? <Spinner className="size-4" /> : null}
                {saving ? "جارٍ الحفظ..." : "بدء التعلم"}
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
