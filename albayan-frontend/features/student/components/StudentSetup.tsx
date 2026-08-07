"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BookOpenCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exploreApi } from "@/features/explore/services/exploreApi";
import type { ExploreGrade, ExploreSemester, ExploreStage } from "@/features/explore/types/explore.types";
import { showApiError } from "@/lib/apiErrors";
import { studentHomeApi } from "../services/studentHomeApi";

/**
 * ربط الطالب بالمحتوى: اختيار المرحلة ← الصف ← الفصل ثم حفظ بياناته الدراسية.
 * يظهر عند أول دخول لبيت الطالب دون ملف دراسي (student_profile).
 */
export function StudentSetup() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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

  const canSave = Boolean(stage && grade && semester) && !saving;

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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-16 sm:px-6">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BookOpenCheck className="size-8" />
      </span>

      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        لنبدأ رحلتك التعليمية
      </h1>
      <p className="mt-3 max-w-md text-center text-muted-foreground">
        اختر مرحلتك الدراسية ثم صفّك وفصلك حتى نعرض لك موادّك الدراسية.
      </p>

      <div className="mt-8 w-full max-w-md space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">المرحلة الدراسية</label>
          <Select
            value={stage ? String(stage.id) : ""}
            onValueChange={(value) => {
              const next = stages.find((item) => String(item.id) === value) ?? null;
              setStage(next);
              setGrade(null);
              setSemester(null);
            }}
          >
            <SelectTrigger aria-label="المرحلة الدراسية">
              <SelectValue placeholder={stagesLoading ? "جارٍ التحميل..." : "اختر المرحلة"} />
            </SelectTrigger>
            <SelectContent>
              {stages.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">الصف الدراسي</label>
          <Select
            value={grade ? String(grade.id) : ""}
            onValueChange={(value) => {
              const next = grades.find((item) => String(item.id) === value) ?? null;
              setGrade(next);
              setSemester(null);
            }}
            disabled={!stage}
          >
            <SelectTrigger aria-label="الصف الدراسي">
              <SelectValue
                placeholder={
                  !stage ? "اختر المرحلة أولًا" : gradesLoading ? "جارٍ التحميل..." : "اختر الصف"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {grades.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">الفصل الدراسي</label>
          <Select
            value={semester ? String(semester.id) : ""}
            onValueChange={(value) => {
              const next = semesters.find((item) => String(item.id) === value) ?? null;
              setSemester(next);
            }}
            disabled={!grade}
          >
            <SelectTrigger aria-label="الفصل الدراسي">
              <SelectValue
                placeholder={
                  !grade ? "اختر الصف أولًا" : semestersLoading ? "جارٍ التحميل..." : "اختر الفصل"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          size="lg"
          className="mt-2 w-full"
          onClick={handleSave}
          disabled={!canSave}
        >
          {saving ? <Spinner className="size-4" /> : null}
          {saving ? "جارٍ الحفظ..." : "بدء التعلم"}
        </Button>
      </div>
    </div>
  );
}
