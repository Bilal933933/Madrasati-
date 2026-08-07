import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudentSubjectPage } from "@/features/student/pages/StudentSubjectPage";
import { studentHomeApi } from "@/features/student/services/studentHomeApi";
import { isApiError } from "@/lib/apiErrors";
import { getSsrRequestContext } from "@/lib/ssrRequest";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}): Promise<Metadata> {
  const { subjectSlug } = await params;
  return {
    title: `مادة ${subjectSlug}`,
    description: "مقررات المادة وتقدمك فيها.",
  };
}

export default async function SubjectRoute({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}) {
  const { subjectSlug } = await params;
  const ssr = await getSsrRequestContext();

  let data;
  try {
    data = await studentHomeApi.subject(subjectSlug, ssr);
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  return <StudentSubjectPage subject={data.data} />;
}
