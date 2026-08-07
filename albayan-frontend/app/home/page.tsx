import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudentHomePage } from "@/features/student/pages/StudentHomePage";
import { StudentSetup } from "@/features/student/components/StudentSetup";
import { studentHomeApi } from "@/features/student/services/studentHomeApi";
import { isApiError } from "@/lib/apiErrors";
import { getSsrRequestContext } from "@/lib/ssrRequest";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "بيتي التعليمي",
    description: "صفحة الطالب — مواد صفك وفصلك الدراسي الحالي في مكان واحد.",
  };
}

export default async function HomeRoute() {
  const ssr = await getSsrRequestContext();

  let data;
  try {
    data = await studentHomeApi.home(ssr);
  } catch (error) {
    if (isApiError(error)) {
      if (error.status === 401) {
        redirect("/login");
      }
      if (error.status === 404) {
        return <StudentSetup />;
      }
    }
    throw error;
  }

  return <StudentHomePage data={data.data} />;
}
