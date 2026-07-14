import type { PublicPost } from '@/api/types';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';
import { API_ENDPOINTS, PUBLIC_API_BASE } from '@/config/constants';
import { apiClient } from './client';

export const authApi = {
  getMe: () => apiClient.get<User>(API_ENDPOINTS.AUTH.ME).then(r => r.data),
  login: (data: LoginRequest) => apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data).then(r => r.data),

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

function withImageUrl(post: Omit<PublicPost, 'imageUrl'>): PublicPost {
  return { ...post, imageUrl: `https://picsum.photos/seed/${post.id}/800/400` };
}

export const publicApi = {
  post: (id: number) =>
    apiClient.get<Omit<PublicPost, 'imageUrl'>>(`${PUBLIC_API_BASE}/posts/${id}`).then(r => withImageUrl(r.data)),
  posts: (search?: string) => {
    const url = `${PUBLIC_API_BASE}/posts`;
    return apiClient.get<Omit<PublicPost, 'imageUrl'>[]>(url).then((r) => {
      const posts = r.data.map(withImageUrl);
      if (!search)
        return posts;
      const q = search.toLowerCase();
      return posts.filter(p => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));
    });
  },
};
