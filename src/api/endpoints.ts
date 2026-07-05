import { API_ENDPOINTS, PUBLIC_API_BASE } from "@/config/constants";
import type { LoginRequest, LoginResponse, User } from "@/types/auth";
import type { PublicPost } from "@/api/types";
import { apiClient } from "./client";

export const authApi = {
  getMe: () => apiClient.get<User>(API_ENDPOINTS.AUTH.ME).then(r => r.data),
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data).then(r => r.data),

  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  refreshToken: (refreshToken: string) =>
    apiClient
      .post<{ accessToken: string; refreshToken: string }>(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      })
      .then(r => r.data),

  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, data).then(r => r.data),
};

export const usersApi = {
  getProfile: () => apiClient.get<User>(API_ENDPOINTS.USERS.PROFILE).then(r => r.data),

  updateProfile: (data: Partial<User>) =>
    apiClient.put<User>(API_ENDPOINTS.USERS.UPDATE, data).then(r => r.data),
};

export const postsApi = {
  create: (data: unknown) => apiClient.post(API_ENDPOINTS.POSTS.CREATE, data).then(r => r.data),

  delete: (id: string) => apiClient.delete(API_ENDPOINTS.POSTS.DELETE(id)).then(r => r.data),

  detail: (id: string) => apiClient.get(API_ENDPOINTS.POSTS.DETAIL(id)).then(r => r.data),
  list: (params?: Record<string, unknown>) =>
    apiClient.get(API_ENDPOINTS.POSTS.LIST, { params }).then(r => r.data),

  update: (id: string, data: unknown) =>
    apiClient.put(API_ENDPOINTS.POSTS.UPDATE(id), data).then(r => r.data),
};

export const publicApi = {
  posts: (search?: string) => {
    const url = `${PUBLIC_API_BASE}/posts`;
    return apiClient.get<PublicPost[]>(url).then(r => {
      const posts = r.data;
      if (!search) return posts;
      const q = search.toLowerCase();
      return posts.filter(p => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));
    });
  },
  post: (id: number) =>
    apiClient.get<PublicPost>(`${PUBLIC_API_BASE}/posts/${id}`).then(r => r.data),
};
