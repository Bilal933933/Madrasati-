import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { studentExamsApi } from "../services/studentExamsApi";

export function useStudentExams() {
  return useQuery({
    queryKey: ["student-exams"],
    queryFn: () => studentExamsApi.listExams(),
  });
}

export function useStudentExam(id: number) {
  return useQuery({
    queryKey: ["student-exam", id],
    queryFn: () => studentExamsApi.getExam(id),
  });
}

export function useExamMyAttempts(id: number) {
  return useQuery({
    queryKey: ["exam-my-attempts", id],
    queryFn: () => studentExamsApi.myAttempts(id),
  });
}

export function useExamAttempt(attemptId: number) {
  return useQuery({
    queryKey: ["exam-attempt", attemptId],
    queryFn: () => studentExamsApi.getAttempt(attemptId),
  });
}

/**
 * بدء محاولة جديدة ثم الانتقال فورًا إلى صفحة الأداء.
 */
export function useStartAttempt() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentExamsApi.startAttempt(id),
    onSuccess: (data) => {
      toast.success(data?.message ?? "بدأت المحاولة. بالتوفيق!");
      const attemptId = data?.data?.id;
      if (attemptId != null) {
        queryClient.setQueryData(["exam-attempt", attemptId], data);
        router.push(`/exams/attempt/${attemptId}`);
      }
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "تعذّر بدء المحاولة. أعد المحاولة لاحقًا.")
      );
    },
  });
}