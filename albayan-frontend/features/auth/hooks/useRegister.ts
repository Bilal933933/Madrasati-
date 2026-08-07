import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/apiErrors";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast.success(data.message ?? "تم إنشاء الحساب بنجاح.");
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
      router.push("/home");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.")
      );
    },
  });
}
