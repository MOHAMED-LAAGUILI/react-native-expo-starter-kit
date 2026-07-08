import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/constants";
import { StorageService } from "@/storage";
import type { AuthTokens, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrate: () => {
    const accessToken = StorageService.getString(STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = StorageService.getString(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    const user = StorageService.getObject<User>(STORAGE_KEYS.AUTH_USER);
    if (accessToken && refreshToken) {
      set({
        isAuthenticated: true,
        isLoading: false,
        tokens: { accessToken, refreshToken },
        user: user ?? null,
      });
    } else {
      set({ isLoading: false });
    }
  },
  isAuthenticated: false,
  isLoading: true,

  login: (user, tokens) => {
    StorageService.setString(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
    StorageService.setString(STORAGE_KEYS.AUTH_REFRESH_TOKEN, tokens.refreshToken);
    StorageService.setObject(STORAGE_KEYS.AUTH_USER, user);
    set({ isAuthenticated: true, isLoading: false, tokens, user });
  },

  logout: () => {
    StorageService.delete(STORAGE_KEYS.AUTH_TOKEN);
    StorageService.delete(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    StorageService.delete(STORAGE_KEYS.AUTH_USER);
    set({ isAuthenticated: false, isLoading: false, tokens: null, user: null });
  },

  setLoading: isLoading => set({ isLoading }),

  setTokens: tokens => {
    if (tokens) {
      StorageService.setString(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
      StorageService.setString(STORAGE_KEYS.AUTH_REFRESH_TOKEN, tokens.refreshToken);
    } else {
      StorageService.delete(STORAGE_KEYS.AUTH_TOKEN);
      StorageService.delete(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    }
    set({ isAuthenticated: tokens !== null, tokens });
  },

  setUser: user => set({ user }),
  tokens: null,
  user: null,
}));
