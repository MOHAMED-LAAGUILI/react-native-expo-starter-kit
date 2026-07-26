import type { AuthTokens, User } from '@/types/auth';
import { create } from 'zustand';
import { STORAGE_KEYS } from '@/config/constants';
import { StorageService } from '@/storage';

type AuthState = {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  hydrate: () => void;
};

function loadTokens(): AuthTokens | null {
  try {
    const accessToken = StorageService.auth.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = StorageService.auth.getItem<string>(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    if (accessToken && refreshToken)
      return { accessToken, refreshToken };
  }
  catch {}
  return null;
}

function loadUser(): User | null {
  try {
    return StorageService.auth.getItem<User>(STORAGE_KEYS.AUTH_USER) ?? null;
  }
  catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>(set => ({
  hydrate: () => {
    const tokens = loadTokens();
    const user = loadUser();
    set({ isAuthenticated: !!tokens, tokens, user });
  },
  isAuthenticated: false,
  tokens: null,
  user: null,

  login: (user, tokens) => {
    StorageService.auth.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
    StorageService.auth.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, tokens.refreshToken);
    StorageService.auth.setItem(STORAGE_KEYS.AUTH_USER, user);
    set({ isAuthenticated: true, tokens, user });
  },

  logout: () => {
    StorageService.auth.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    StorageService.auth.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    StorageService.auth.removeItem(STORAGE_KEYS.AUTH_USER);
    set({ isAuthenticated: false, tokens: null, user: null });
  },

  setTokens: (tokens) => {
    if (tokens) {
      StorageService.auth.setItem(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
      StorageService.auth.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, tokens.refreshToken);
    }
    else {
      StorageService.auth.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      StorageService.auth.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    }
    set({ isAuthenticated: tokens !== null, tokens });
  },

  setUser: user => set({ user }),

  updateProfile: (updates) => {
    set((state) => {
      if (!state.user)
        return state;
      const updatedUser = { ...state.user, ...updates };
      StorageService.auth.setItem(STORAGE_KEYS.AUTH_USER, updatedUser);
      return { user: updatedUser };
    });
  },
}));
