import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { achievementsApi } from "../services/achievementsApi";
import type { AchievementPayload } from "../types/achievement.types";

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: () => achievementsApi.listAdmin(),
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AchievementPayload) =>
      achievementsApi.create(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الإنجاز بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AchievementPayload }) =>
      achievementsApi.update(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث الإنجاز بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => achievementsApi.delete(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف الإنجاز بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}