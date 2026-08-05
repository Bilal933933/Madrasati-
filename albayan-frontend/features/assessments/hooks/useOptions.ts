import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { optionsApi } from "../services/assessmentsApi";
import type { OptionPayload } from "../types/assessment.types";

export function useCreateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OptionPayload) => optionsApi.createOption(payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الخيار بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: OptionPayload }) =>
      optionsApi.updateOption(id, payload),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تحديث الخيار بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => optionsApi.deleteOption(id),
    onSuccess: (data) => {
      toast.success(data.message ?? "تم حذف الخيار بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
