'use client';

import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course } from '@/features/admin/api/types';
import { cn } from '@/lib/utils';
import { StatusBadge } from './course-card';
import { thumbStripeStyle } from './shared';

export function CourseDetailPanel({ course }: { course: Course }) {
  const t = useTranslations('courses.detail');
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='relative grid h-28 place-items-center border-b' style={thumbStripeStyle}>
        <div className='text-muted-foreground font-mono text-[11px]'>{course.cover} · 1200×400</div>
        <Button
          variant='outline'
          size='sm'
          className='absolute top-3 right-3 h-7 px-2 text-[11px] shadow-sm'
        >
          <Icons.edit className='size-3' />
          {t('edit')}
        </Button>
      </div>
      <div className='p-5'>
        <div className='flex items-center gap-2'>
          <span className='bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]'>
            {course.code}
          </span>
          <StatusBadge status={course.status} />
          <span className='text-muted-foreground ml-auto font-mono text-[11px]'>
            {course.version}
          </span>
        </div>
        <h2 className='mt-2 text-[19px] font-semibold tracking-tight'>{course.title}</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed'>
          {course.description}
        </p>

        <div className='mt-4 grid grid-cols-2 gap-2 text-[12px]'>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('duration')}
            </div>
            <div className='font-medium'>{t('weeksUnit', { count: course.weeks })}</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('ages')}
            </div>
            <div className='font-medium'>{course.ageRange.replace('Ages ', '')}</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('tuition')}
            </div>
            <div className='font-mono font-medium'>{course.tuition}</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('capacityPerClass')}
            </div>
            <div className='font-medium'>
              {t('studentsUnit', { count: course.perClassCapacity })}
            </div>
          </div>
        </div>

        <div className='mt-5'>
          <div className='mb-2 flex items-center justify-between text-[12px] font-medium'>
            <span>{t('curriculumUnits', { count: course.weeks })}</span>
            <button className='text-muted-foreground hover:text-foreground font-mono text-[11px]'>
              {t('editOutline')}
            </button>
          </div>
          <ul className='divide-y rounded-md border text-[12.5px]'>
            {course.curriculum.map((unit, i) => {
              const isLast = i === course.curriculum.length - 1;
              return (
                <li
                  key={unit}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2',
                    isLast && 'text-muted-foreground'
                  )}
                >
                  <span className='text-muted-foreground w-7 font-mono text-[11px]'>
                    {isLast ? '…' : String(i + 1).padStart(2, '0')}
                  </span>
                  {unit}
                </li>
              );
            })}
          </ul>
        </div>

        <div className='mt-5 flex gap-2'>
          <Button className='h-9 flex-1'>{t('openCourse')}</Button>
          <Button variant='outline' className='h-9'>
            {t('duplicate')}
          </Button>
          <Button variant='outline' size='icon' className='h-9 w-9'>
            <Icons.ellipsis className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CourseDetailPanelSkeleton() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='h-28 border-b' style={thumbStripeStyle} />
      <div className='p-5'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-14' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='ml-auto h-4 w-12' />
        </div>
        <Skeleton className='mt-3 h-6 w-2/3' />
        <Skeleton className='mt-2 h-3 w-full' />
        <Skeleton className='mt-1 h-3 w-5/6' />

        <div className='mt-4 grid grid-cols-2 gap-2'>
          <Skeleton className='h-14 rounded-md' />
          <Skeleton className='h-14 rounded-md' />
          <Skeleton className='h-14 rounded-md' />
          <Skeleton className='h-14 rounded-md' />
        </div>

        <div className='mt-5 space-y-2'>
          <Skeleton className='h-4 w-32' />
          <div className='space-y-px rounded-md border'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-9 rounded-none first:rounded-t-md last:rounded-b-md' />
            ))}
          </div>
        </div>

        <div className='mt-5 flex gap-2'>
          <Skeleton className='h-9 flex-1' />
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-9' />
        </div>
      </div>
    </div>
  );
}
