import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, register as apiRegister, me as apiMe } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: apiMe, staleTime: 5 * 60_000 });
}

export function useLogin() {
  const qc = useQueryClient();
  const { setUser, setToken } = useAuthStore.getState();
  return useMutation({
    mutationFn: apiLogin,
    onSuccess: ({ user, token }) => {
      setToken(token);
      setUser(user);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const { setUser, setToken } = useAuthStore.getState();
  return useMutation({
    mutationFn: apiRegister,
    onSuccess: ({ user, token }) => {
      setToken(token);
      setUser(user);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
