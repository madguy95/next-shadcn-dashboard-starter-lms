export const BLOG_TYPES = ['article', 'workshop'] as const;
export type BlogType = (typeof BLOG_TYPES)[number];

export const BLOG_STATUSES = ['draft', 'published'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const BLOG_FILTERS = ['all', 'article', 'workshop', 'draft'] as const;
export type BlogFilter = (typeof BLOG_FILTERS)[number];

export type BlogCategory = 'parent_tips' | 'center_news' | 'student_story' | 'event';

export type BlogAuthor = {
  id?: string;
  name: string;
  initials: string;
  role: 'admin' | 'teacher';
};

/**
 * Joined snapshot of the Class entity a workshop post points at. Populated by
 * the BE on workshop responses; null for articles. Editing the class once in
 * /admin/classes updates every blog post that references it.
 */
export type AttachedClass = {
  id: string;
  courseId?: string;
  courseCode?: string;
  courseTitle: string;
  // ISO start date e.g. "2026-06-14"; UI composes display strings client-side.
  startDate?: string;
  endDate?: string;
  schedule: string; // composed e.g. "T2/T4 · 18:00"
  location: string;
  room?: string;
  minAge?: number;
  maxAge?: number;
  capacity: number;
  enrolled: number;
  tuitionAmount?: number;
  // Display status mapped by BE from lifecycleStatus + dates + capacity.
  status: 'draft' | 'open' | 'full' | 'ongoing' | 'completed' | 'unpublished' | 'cancelled';
  // ISO instant of the next session — used by the home-feed sort.
  startsAt?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  type: BlogType;
  status: BlogStatus;
  category: BlogCategory;
  title: string;
  excerpt: string;
  body: string;
  coverUrl?: string;
  hue: number;
  tags: string[];
  featured?: boolean;
  author: BlogAuthor;
  // Display label shown under the cover ("22 Th5 2026"). Computed BE-side.
  publishedAt: string;
  // Optional reading-time minutes — articles only.
  readingMinutes?: number;
  // Composed display meta line shown on cards ("22 Th5 2026 · 6 phút đọc"
  // for articles; "14 Th6 2026 · Quận 7" for workshops).
  meta: string;
  classId?: string;
  attachedClass?: AttachedClass;
};

export type BlogListParams = {
  filter?: BlogFilter;
  search?: string;
  // Forwarded as `includeDrafts` to BE — server enforces admin-only when true.
  includeDrafts?: boolean;
};

export type BlogListResult = {
  data: BlogPost[];
  featured: BlogPost[];
  total: number;
  visibleTotal: number;
};

export type CreateBlogPostInput = {
  type: BlogType;
  status: BlogStatus;
  category: BlogCategory;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  featured?: boolean;
  coverUrl?: string;
  classId?: string;
  readingMinutes?: number;
};

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

/**
 * Item shape returned by GET /api/public/blog/home-feed. Workshop items carry
 * a populated {@link AttachedClass}; articles do not.
 */
export type HomeFeedItem =
  | { kind: 'workshop'; post: BlogPost; workshop: AttachedClass }
  | { kind: 'article'; post: BlogPost };
