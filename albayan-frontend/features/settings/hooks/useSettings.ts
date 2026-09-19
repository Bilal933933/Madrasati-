import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useResourceMutation } from "@/lib/useCrudResource";
import { settingsApi } from "../services/settingsApi";
import type { PlatformSettingsUpdatePayload } from "../types/settings.types";

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => settingsApi.get(),
  });
}

const INVALIDATE_KEYS: QueryKey[] = [["admin-settings"]];

export function useUpdatePlatformSettings() {
  return useResourceMutation({
    mutationFn: (payload: PlatformSettingsUpdatePayload) =>
      settingsApi.update(payload),
    invalidateKeys: INVALIDATE_KEYS,
    successMessage: "تم حفظ الإعدادات بنجاح.",
  });
}