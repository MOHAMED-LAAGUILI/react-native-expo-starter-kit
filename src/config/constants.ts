export const STORAGE_KEYS = {
  AUTH_REFRESH_TOKEN: "auth.refresh_token",
  AUTH_TOKEN: "auth.token",
  LANGUAGE: "i18n.language",
  THEME_MODE: "theme.mode",
} as const;

export const PUBLIC_API_BASE = "https://jsonplaceholder.typicode.com";

export const QUERY_KEYS = {
  AUTH: ["auth"],
  POSTS: ["posts"],
  PUBLIC_POSTS: ["public-posts"],
  USER: ["user"],
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
  },
  POSTS: {
    CREATE: "/posts",
    DELETE: (id: string) => `/posts/${id}`,
    DETAIL: (id: string) => `/posts/${id}`,
    LIST: "/posts",
    UPDATE: (id: string) => `/posts/${id}`,
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE: "/users/update",
  },
} as const;
