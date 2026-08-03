import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../services/authApi";

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إرسال رابط إعادة التعيين بنجاح.");
    },
    onError: (error) => {
      const message = (error as { message?: string })?.message;
      toast.error(message ?? "تعذر إرسال الرابط. يرجى المحاولة مرة أخرى.");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      toast.success(data.message ?? "تم تغيير كلمة السر بنجاح.");
    },
    onError: (error) => {
      const message = (error as { message?: string })?.message;
      toast.error(message ?? "تعذر تغيير كلمة السر. يرجى المحاولة مرة أخرى.");
    },
  });
}
