import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    },
  });
}
