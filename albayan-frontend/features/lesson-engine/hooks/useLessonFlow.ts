import { useQuery } from "@tanstack/react-query";
import { lessonApi } from "../services/lessonApi";

export function useLessonFlow(lessonSlug: string) {
  return useQuery({
    queryKey: ["lesson-flow", lessonSlug],
    queryFn: () => lessonApi.getBySlug(lessonSlug),
    enabled: Boolean(lessonSlug),
  });
}
