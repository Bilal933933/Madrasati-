import type { components } from "@/types/api.generated";

type SchemaCourse = components["schemas"]["CourseResource"];
type SchemaCourseRequest = components["schemas"]["CourseRequest"];

/**
 * نوع المقرر مشتق من مخطط الباك المولّد (types/api.generated.ts).
 * الحقول الموثوقة (name, slug) تأتي من المخطط مباشرة، والحقول التي
 * تولّدها المواصفة كنصوص تُصحَّح هنا إلى أنواعها التشغيلية الفعلية.
 */
export type Course = Omit<
  SchemaCourse,
  | "id"
  | "subject_id"
  | "description"
  | "image"
  | "icon"
  | "color"
  | "sort_order"
  | "is_published"
  | "children"
> & {
  id: number;
  subject_id: number;
  description: string | null;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number | null;
  is_published: boolean | null;
};

/** حمولة الإنشاء/التحديث مطابقة لـ CourseRequest في المخطط المولّد */
export type CoursePayload = SchemaCourseRequest;

export interface CourseListResponse {
  data: Course[];
}

export interface CourseMutationResponse {
  data: Course;
  message: string;
}

export interface CourseDeleteResponse {
  message: string;
}

// حارس الانجراف: أي إضافة/حذف/إعادة تسمية حقل في CourseResource بالباك
// يُفشل البناء هنا، فتظهر الفجوة فور إعادة توليد الأنواع (npm run generate:types).
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;
type Expect<T extends true> = T;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CourseFieldsMatchSchema = Expect<
  Equal<keyof Omit<SchemaCourse, "children">, keyof Course>
>;
