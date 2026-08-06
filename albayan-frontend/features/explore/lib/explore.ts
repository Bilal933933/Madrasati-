import { notFound } from "next/navigation";
import { exploreApi } from "../services/exploreApi";

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]> | null;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "status" in error;
}

/**
 * يُحوِّل خطأ 404 من الـ API إلى صفحة notFound في Next.js،
 * ويعيد رمي أي خطأ آخر ليُعالج من طبقة الأخطاء.
 */
export function throwIfNotFound(error: unknown): never {
  if (isApiError(error) && error.status === 404) {
    notFound();
  }
  throw error;
}

/** اسم المرحلة من مفتاحها (لأغراض الـ Breadcrumb). */
export async function stageName(stageKey: string): Promise<string> {
  const { data } = await exploreApi.stages();
  return data.find((item) => item.key === stageKey)?.name ?? stageKey;
}

/** اسم الصف من مفتاحيه (المرحلة + الصف) — للـ Breadcrumb. */
export async function gradeName(stageKey: string, gradeKey: string): Promise<string> {
  const { data } = await exploreApi.grades(stageKey);
  return data.find((item) => item.key === gradeKey)?.name ?? gradeKey;
}

/** اسم الفصل من مفاتيحه الثلاثة — للـ Breadcrumb. */
export async function semesterName(
  stageKey: string,
  gradeKey: string,
  semesterKey: string
): Promise<string> {
  const { data } = await exploreApi.semesters(stageKey, gradeKey);
  return data.find((item) => item.key === semesterKey)?.name ?? semesterKey;
}
