'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course } from '@/features/admin/api/types';
import { cn } from '@/lib/utils';
import { thumbStripeStyle } from './shared';

export function StatusBadge({ status }: { status: Course['status'] }) {
  const t = useTranslations('courses.status');
  if (status === 'published') {
    return (
      <span className='inline-flex items-center rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700'>
        {t('published')}
      </span>
    );
  }
  return (
    <span className='inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] text-amber-800'>
      {t('draft')}
    </span>
  );
}

export function CourseCard({
  course,
  selected,
  onSelect
}: {
  course: Course;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations('courses');
  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'bg-card overflow-hidden rounded-lg border text-left shadow-sm transition',
        selected ? 'border-foreground border-2' : 'hover:border-foreground/40'
      )}
    >
      <div className='relative grid h-24 place-items-center border-b' style={thumbStripeStyle}>
        <div className='text-muted-foreground font-mono text-[10px]'>{course.cover}</div>
        {selected && (
          <span className='bg-foreground text-background absolute top-2 left-2 inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px]'>
            {t('selectedBadge')}
          </span>
        )}
      </div>
      <div className='p-4'>
        <div className='flex items-center justify-between'>
          <span className='bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]'>
            {course.code}
          </span>
          <StatusBadge status={course.status} />
        </div>
        <div className='mt-2 text-[15px] font-semibold tracking-tight'>{course.title}</div>
        <div className='text-muted-foreground mt-0.5 text-[12px]'>
          {course.ageRange} · {course.tagline}
        </div>
        <div className='mt-3 grid grid-cols-3 gap-1 text-center font-mono text-[11px]'>
          <div className='bg-muted/50 rounded py-1'>
            <div className='text-foreground font-semibold'>{course.weeks}</div>
            <div className='opacity-60'>{t('card.weeks')}</div>
          </div>
          <div className='bg-muted/50 rounded py-1'>
            <div className='text-foreground font-semibold'>{course.classes}</div>
            <div className='opacity-60'>{t('card.classes')}</div>
          </div>
          <div className='bg-muted/50 rounded py-1'>
            <div className='text-foreground font-semibold'>{course.enrolled}</div>
            <div className='opacity-60'>{t('card.enrolled')}</div>
          </div>
        </div>
      </div>
    </button>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='h-24 border-b' style={thumbStripeStyle} />
      <div className='p-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-14' />
          <Skeleton className='h-4 w-16' />
        </div>
        <Skeleton className='mt-3 h-5 w-3/4' />
        <Skeleton className='mt-2 h-3 w-1/2' />
        <div className='mt-3 grid grid-cols-3 gap-1'>
          <Skeleton className='h-10 rounded' />
          <Skeleton className='h-10 rounded' />
          <Skeleton className='h-10 rounded' />
        </div>
      </div>
    </div>
  );
}
