import type { LoginRequest } from '@/types/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints';
import { showToast } from '@/components/ui/toast';
import { QUERY_KEYS } from '@/config/constants';
import { useAuthStore } from '@/store';

export function useLogin() {
  const login = useAuthStore(s => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onError: () => {
      showToast({ message: 'Invalid email or password.', title: 'Login failed', variant: 'error' });
    },
    onSuccess: (response) => {
      login(response.user, response.tokens);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER });
      showToast({
        message: `Signed in as ${response.user.email}`,
        title: 'Welcome back!',
        variant: 'success',
      });
    },
  });
}

export function useRegister() {
  const login = useAuthStore(s => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) => authApi.register(data),
    onError: () => {
      showToast({ message: 'Please try again.', title: 'Registration failed', variant: 'error' });
    },
    onSuccess: (response) => {
      login(response.user, response.tokens);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER });
      showToast({ message: 'Welcome aboard.', title: 'Account created!', variant: 'success' });
    },
  });
}
