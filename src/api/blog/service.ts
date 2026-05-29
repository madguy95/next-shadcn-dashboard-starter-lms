import { apiClient, apiClientPaged } from '@/lib/api-client';
import type {
  AttachedClass,
  BlogListParams,
  BlogListResult,
  BlogPost,
  CreateBlogPostInput,
  HomeFeedItem,
  UpdateBlogPostInput
} from './types';

// ----- BE DTOs (subset of fields we read) -----------------------------------

type AuthorDto = {
  id?: number;
  name?: string;
  initials?: string;
  role?: string;
};

type AttachedClassDto = {
  id: number;
  courseId?: number;
  courseCode?: string;
  courseTitle?: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  location?: string;
  room?: string;
  minAge?: number;
  maxAge?: number;
  capacity?: number;
  enrolled?: number;
  tuitionAmount?: number;
  status?: string;
  startsAt?: string;
};

type BlogPostDto = {
  id: number;
  slug: string;
  type: string;
  status: string;
  category: string;
  title: string;
  excerpt?: string;
  body?: string;
  coverUrl?: string;
  hue?: number;
  tags?: string[];
  featured?: boolean;
  classId?: number;
  attachedClass?: AttachedClassDto;
  author?: AuthorDto;
  publishedAt?: string;
  publishedLabel?: string;
  metaLabel?: string;
  readingMinutes?: number;
};

type PublicFeedItemDto = BlogPostDto & {
  kind: 'workshop' | 'article';
};

// ----- DTO → domain mappers --------------------------------------------------

function mapAttachedClass(dto: AttachedClassDto): AttachedClass {
  return {
    id: String(dto.id),
    courseId: dto.courseId != null ? String(dto.courseId) : undefined,
    courseCode: dto.courseCode,
    courseTitle: dto.courseTitle ?? '',
    startDate: dto.startDate,
    endDate: dto.endDate,
    schedule: dto.schedule ?? '',
    location: dto.location ?? '',
    room: dto.room,
    minAge: dto.minAge,
    maxAge: dto.maxAge,
    capacity: dto.capacity ?? 0,
    enrolled: dto.enrolled ?? 0,
    tuitionAmount: dto.tuitionAmount,
    status: (dto.status as AttachedClass['status']) ?? 'open',
    startsAt: dto.startsAt
  };
}

function mapPost(dto: BlogPostDto): BlogPost {
  return {
    id: String(dto.id),
    slug: dto.slug,
    type: dto.type as BlogPost['type'],
    status: dto.status as BlogPost['status'],
    category: dto.category as BlogPost['category'],
    title: dto.title,
    excerpt: dto.excerpt ?? '',
    body: dto.body ?? '',
    coverUrl: dto.coverUrl,
    hue: dto.hue ?? 200,
    tags: dto.tags ?? [],
    featured: dto.featured ?? false,
    author: {
      id: dto.author?.id != null ? String(dto.author.id) : undefined,
      name: dto.author?.name ?? '',
      initials: dto.author?.initials ?? '?',
      role: (dto.author?.role as BlogPost['author']['role']) ?? 'admin'
    },
    publishedAt: dto.publishedLabel ?? dto.publishedAt ?? '',
    readingMinutes: dto.readingMinutes,
    meta: dto.metaLabel ?? dto.publishedLabel ?? '',
    classId: dto.classId != null ? String(dto.classId) : undefined,
    attachedClass: dto.attachedClass ? mapAttachedClass(dto.attachedClass) : undefined
  };
}

// ----- Helpers --------------------------------------------------------------

function buildListQuery(params: BlogListParams): string {
  const search = new URLSearchParams();
  // Generous page size: the FE filter tabs + carousel both operate on the
  // initial fetch, so over-fetching once is simpler than paginating client-side.
  search.set('page', '1');
  search.set('size', '50');
  if (params.search) search.set('search', params.search);
  if (params.includeDrafts) search.set('includeDrafts', 'true');
  if (params.filter && params.filter !== 'all') {
    // Map the FE "filter" semantic onto the BE's (type, status) pair:
    //   - 'article' / 'workshop' → type filter
    //   - 'draft' → status='draft' (admin-only)
    if (params.filter === 'draft') {
      search.set('status', 'draft');
    } else {
      search.set('type', params.filter);
    }
  }
  return search.toString();
}

function basePath(params: BlogListParams): string {
  // Admin endpoints return drafts when requested; public endpoints don't.
  // The route choice mirrors the includeDrafts intent.
  return params.includeDrafts ? '/api/blog' : '/api/public/blog';
}

// ----- Public API -----------------------------------------------------------

export async function getBlogPosts(params: BlogListParams = {}): Promise<BlogListResult> {
  const query = buildListQuery(params);
  const paged = await apiClientPaged<BlogPostDto>(`${basePath(params)}?${query}`);
  const data = paged.data.map(mapPost);
  // Featured posts surface as a side-channel for the carousel — derive from the
  // page rather than making a second call. The default size (50) is generous
  // enough that any reasonable amount of featured fits in one page.
  const featured = data.filter((p) => p.featured && p.status === 'published');
  return {
    data,
    featured,
    total: paged.data.length,
    visibleTotal: paged.totalElements
  };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const dto = await apiClient<BlogPostDto>(`/api/public/blog/${encodeURIComponent(slug)}`);
    return mapPost(dto);
  } catch (e) {
    // 404 maps to null so the page guard can route to notFound() without
    // throwing a generic 500.
    if (e && typeof e === 'object' && 'status' in e && (e as { status: number }).status === 404) {
      return null;
    }
    throw e;
  }
}

export async function createBlogPost(input: CreateBlogPostInput): Promise<BlogPost> {
  const dto = await apiClient<BlogPostDto>('/api/blog', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return mapPost(dto);
}

export async function updateBlogPost(id: string, input: UpdateBlogPostInput): Promise<BlogPost> {
  const dto = await apiClient<BlogPostDto>(`/api/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input)
  });
  return mapPost(dto);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await apiClient<void>(`/api/blog/${id}`, { method: 'DELETE' });
}

export async function getPublicHomeFeed(limit = 4): Promise<HomeFeedItem[]> {
  const items = await apiClient<PublicFeedItemDto[]>(`/api/public/blog/home-feed?limit=${limit}`);
  return items.map((dto) => {
    const post = mapPost(dto);
    if (dto.kind === 'workshop' && post.attachedClass) {
      return { kind: 'workshop' as const, post, workshop: post.attachedClass };
    }
    return { kind: 'article' as const, post };
  });
}
