'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/api/blog';

const TYPE_BADGE_STYLE: Record<'article' | 'workshop' | 'draft', { text: string; dot: string }> = {
  article: {
    text: 'text-indigo-600 dark:text-indigo-300',
    dot: 'bg-indigo-500'
  },
  workshop: {
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500'
  },
  draft: {
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500'
  }
};

export function BlogTypeBadge({ post, className }: { post: BlogPost; className?: string }) {
  const t = useTranslations('blog.badge');
  // Draft status overrides the article/workshop visual so admins can spot
  // unpublished cards at a glance even when the type would normally win.
  const key = post.status === 'draft' ? 'draft' : post.type;
  const cfg = TYPE_BADGE_STYLE[key];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase shadow-sm backdrop-blur',
        cfg.text,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', cfg.dot)} />
      {t(key)}
    </span>
  );
}
