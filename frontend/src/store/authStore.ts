import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import type {User, ApiResponse} from '../types';

/**
 * Authentication store state
 */
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

/**
 * Zustand store for authentication
 * Persists user and token to localStorage
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setToken: (token) => {
                if (token) {
                    localStorage.setItem('token', token);
                } else {
                    localStorage.removeItem('token');
                }
                set({ token });
            },

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
                        email,
                        password,
                    });

                    const { user, token } = response.data.data!;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    localStorage.setItem('token', token);
                } catch (error: any) {
                    set({ isLoading: false });
                    throw new Error(error.response?.data?.error || 'Login failed');
                }
            },

            register: async (name, email, password) => {
                set({ isLoading: true });
                try {
                    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
                        name,
                        email,
                        password,
                    });

                    const { user, token } = response.data.data!;

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    localStorage.setItem('token', token);
                } catch (error: any) {
                    set({ isLoading: false });
                    throw new Error(error.response?.data?.error || 'Registration failed');
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            checkAuth: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }

                try {
                    const response = await api.get<ApiResponse<User>>('/auth/me');
                    set({
                        user: response.data.data!,
                        token,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    localStorage.removeItem('token');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);