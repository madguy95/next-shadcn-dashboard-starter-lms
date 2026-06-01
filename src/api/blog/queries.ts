import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostBySlug,
  getBlogPosts,
  getPublicHomeFeed,
  updateBlogPost
} from './service';
import type { BlogListParams, CreateBlogPostInput, UpdateBlogPostInput } from './types';

export const blogKeys = {
  all: ['blog'] as const,
  list: (params: BlogListParams) => [...blogKeys.all, 'list', params] as const,
  detail: (slug: string) => [...blogKeys.all, 'detail', slug] as const
};

export function blogListOptions(params: BlogListParams) {
  return queryOptions({
    queryKey: blogKeys.list(params),
    queryFn: () => getBlogPosts(params),
    placeholderData: keepPreviousData
  });
}

export function blogDetailOptions(slug: string) {
  return queryOptions({
    queryKey: blogKeys.detail(slug),
    queryFn: () => getBlogPostBySlug(slug),
    enabled: !!slug
  });
}

export function homeFeedOptions(limit = 4) {
  return queryOptions({
    queryKey: ['public', 'blog', 'home-feed', { limit }] as const,
    queryFn: () => getPublicHomeFeed(limit),
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBlogPostInput) => createBlogPost(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    }
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBlogPostInput }) =>
      updateBlogPost(id, input),
    onSuccess: (post) => {
      queryClient.setQueryData(blogKeys.detail(post.slug), post);
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    }
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    }
  });
}
