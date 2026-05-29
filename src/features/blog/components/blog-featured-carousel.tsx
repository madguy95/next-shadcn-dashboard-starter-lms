'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/api/blog';
import { BlogFeaturedCard } from './blog-card';

const AUTO_ADVANCE_MS = 6000;

type Props = {
  posts: BlogPost[];
  canEdit: boolean;
  onDelete: (post: BlogPost) => void;
};

export function BlogFeaturedCarousel({ posts, canEdit, onDelete }: Props) {
  const t = useTranslations('blog.carousel');
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset to first slide whenever the source list shrinks (e.g. after a delete).
  useEffect(() => {
    if (index > posts.length - 1) setIndex(0);
  }, [posts.length, index]);

  useEffect(() => {
    if (posts.length < 2) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % posts.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [posts.length]);

  if (posts.length === 0) return null;

  const go = (dir: number) => {
    setIndex((i) => (i + dir + posts.length) % posts.length);
    // Reset timer so manual navigation gets a full window before the next auto-advance.
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % posts.length);
      }, AUTO_ADVANCE_MS);
    }
  };

  return (
    <div className='relative'>
      <div className='overflow-hidden rounded-2xl'>
        <div
          className='flex transition-transform duration-500 ease-out'
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {posts.map((p) => (
            <div key={p.id} className='w-full shrink-0'>
              <BlogFeaturedCard post={p} canEdit={canEdit} onDelete={onDelete} />
            </div>
          ))}
        </div>
      </div>
      {posts.length > 1 && (
        <>
          <button
            type='button'
            onClick={() => go(-1)}
            aria-label={t('prev')}
            className='bg-background hover:bg-accent text-foreground absolute top-1/2 left-4 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border shadow-md'
          >
            <Icons.chevronLeft className='size-4' />
          </button>
          <button
            type='button'
            onClick={() => go(1)}
            aria-label={t('next')}
            className='bg-background hover:bg-accent text-foreground absolute top-1/2 right-4 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border shadow-md'
          >
            <Icons.chevronRight className='size-4' />
          </button>
          <div className='mt-4 flex items-center justify-center gap-2'>
            {posts.map((p, i) => (
              <button
                key={p.id}
                type='button'
                onClick={() => setIndex(i)}
                aria-label={t('goTo', { index: i + 1 })}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === index ? 'bg-foreground w-6' : 'bg-border w-2'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
