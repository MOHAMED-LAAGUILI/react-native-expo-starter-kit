import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/api/endpoints";
import { QUERY_KEYS } from "@/config/constants";

export function usePublicPosts(search?: string) {
  return useQuery({
    queryFn: () => publicApi.posts(search),
    queryKey: [...QUERY_KEYS.PUBLIC_POSTS, search ?? ""],
  });
}

export function usePublicPost(id: number) {
  return useQuery({
    enabled: id > 0,
    queryFn: () => publicApi.post(id),
    queryKey: [...QUERY_KEYS.PUBLIC_POSTS, id],
  });
}
