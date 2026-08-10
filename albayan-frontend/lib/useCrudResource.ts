import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";

export interface ResourceMutationConfig<TData, TVariables> {
  /** دالة التنفيذ — تأخذ شكلاً من: paylooad / { id, payload } / id. */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** مفاتيح التفريغ بعد النجاح — تُفرَّغ بالبادئة (تشمل الفلاتر والـ next-order والتفاصيل). */
  invalidateKeys: QueryKey[];
  /** رسالة النجاح الافتراضية — تُفضَّل رسالة الباك (data.message) إن وُجدت. */
  successMessage: string;
}

interface ApiMessageCarrier {
  message?: string;
}

/**
 * مصنّع طفرة CRUD موحّد — يجمّع نمط الـ useMutation المتكرر في كل الموارد:
 * - على النجاح: toast من رسالة الباك (إن وُجدت) ثم تفريغ كل مفاتيح الإبطال.
 * - على الخطأ: toast موحّد عبر getErrorMessage.
 *
 * يحافظ على واجهة useMutation كاملة (mutate / mutateAsync / isPending / …)
 * كي تبقى التمائم مطابقة لتوقيعات الـ hooks القديمة دون مساس بالمستهلكين.
 */
export function useResourceMutation<TData, TVariables>(
  config: ResourceMutationConfig<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: config.mutationFn,
    onSuccess: (data) => {
      const backendMessage = (data as ApiMessageCarrier | null)?.message;
      toast.success(backendMessage ?? config.successMessage);
      for (const key of config.invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}