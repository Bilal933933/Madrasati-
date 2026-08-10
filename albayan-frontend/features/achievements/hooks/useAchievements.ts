import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import { achievementsApi } from "../services/achievementsApi";
import type { AchievementPayload } from "../types/achievement.types";

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: () => achievementsApi.listAdmin(),
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["achievements"]];

export function useCreateAchievement() {
  return useResourceMutation({
    mutationFn: achievementsApi.create,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم إنشاء الإنجاز بنجاح.",
  });
}

export function useUpdateAchievement() {
  return useResourceMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AchievementPayload;
    }) => achievementsApi.update(id, payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم تحديث الإنجاز بنجاح.",
  });
}

export function useDeleteAchievement() {
  return useResourceMutation({
    mutationFn: achievementsApi.delete,
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حذف الإنجاز بنجاح.",
  });
}