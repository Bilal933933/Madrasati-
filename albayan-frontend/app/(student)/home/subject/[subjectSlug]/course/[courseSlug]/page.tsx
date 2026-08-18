import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudentCoursePage } from "@/features/student/pages/StudentCoursePage";
import { studentHomeApi } from "@/features/student/services/studentHomeApi";
import { isApiError } from "@/lib/apiErrors";
import { getSsrRequestContext } from "@/lib/ssrRequest";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subjectSlug: string; courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  return { title: `مقرر ${courseSlug}`, description: "دروس المقرر وتقدمك فيها." };
}

export default async function CourseRoute({
  params,
}: {
  params: Promise<{ subjectSlug: string; courseSlug: string }>;
}) {
  const { subjectSlug, courseSlug } = await params;
  const ssr = await getSsrRequestContext();

  let data;
  try {
    data = await studentHomeApi.course(courseSlug, ssr);
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  return <StudentCoursePage course={data.data} subjectSlug={subjectSlug} />;
}