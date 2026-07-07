import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/endpoints";
import { showToast } from "@/components/ui/Toast";
import { QUERY_KEYS } from "@/config/constants";
import { useAuthStore } from "@/store";
import type { LoginRequest } from "@/types/auth";

export function useLogin() {
  const login = useAuthStore(s => s.login);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onError: () => {
      showToast({ message: "Invalid email or password.", title: "Login failed", variant: "error" });
    },
    onSuccess: response => {
      login(response.user, response.tokens);
      showToast({
        message: `Signed in as ${response.user.email}`,
        title: "Welcome back!",
        variant: "success",
      });
    },
  });
}

export function useRegister() {
  const login = useAuthStore(s => s.login);

  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) => authApi.register(data),
    onError: () => {
      showToast({ message: "Please try again.", title: "Registration failed", variant: "error" });
    },
    onSuccess: response => {
      login(response.user, response.tokens);
      showToast({ message: "Welcome aboard.", title: "Account created!", variant: "success" });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore(s => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      showToast({ message: "You have been logged out.", title: "Signed out", variant: "info" });
    },
  });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  return useQuery({
    enabled: isAuthenticated,
    queryFn: () => authApi.getMe(),
    queryKey: QUERY_KEYS.USER,
  });
}
