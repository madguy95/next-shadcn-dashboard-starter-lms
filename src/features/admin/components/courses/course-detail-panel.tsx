'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeleteCourse,
  useSetCourseStatus,
  type Course,
  type CourseStatus,
  type DiscountRule
} from '@/api/courses';
import { formatApiError } from '@/lib/api-client';
import { formatTuition } from '@/lib/format-vnd';
import { cn } from '@/lib/utils';
import { StatusBadge } from './course-card';
import { EditCourseDialog } from './edit-course-dialog';
import { thumbStripeStyle } from './shared';

function formatDiscountValue(rule: DiscountRule): string {
  if (rule.type === 'percentage') return `-${rule.value}%`;
  if (rule.type === 'fixed') return `-${formatTuition(rule.value)}`;
  return rule.value;
}

export function CourseDetailPanel({ course }: { course: Course }) {
  const t = useTranslations('courses.detail');
  const tTools = useTranslations('courses.tools');
  const setStatus = useSetCourseStatus();
  const deleteCourse = useDeleteCourse();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // State machine: draft → published, published → unpublished, unpublished → published (re-launch).
  const togglePending = setStatus.isPending;
  const nextStatus: CourseStatus = course.status === 'published' ? 'unpublished' : 'published';
  // 'unpublish' label only appears on currently-published courses; both draft
  // and unpublished show "Open course" since the action is the same (publish).
  const toggleLabelKey = course.status === 'published' ? 'unpublish' : 'openCourse';
  const toggleSuccessKey = course.status === 'published' ? 'unpublishSuccess' : 'openCourseSuccess';
  const toggleErrorKey = course.status === 'published' ? 'unpublishError' : 'openCourseError';

  const handleToggleStatus = () => {
    setStatus.mutate(
      { id: course.id, status: nextStatus },
      {
        onSuccess: () => toast.success(t(toggleSuccessKey, { title: course.title })),
        onError: (e) => {
          const { title, description } = formatApiError(e, t(toggleErrorKey));
          toast.error(title, description ? { description } : undefined);
        }
      }
    );
  };

  const handleDelete = () => {
    deleteCourse.mutate(course.id, {
      onSuccess: () => {
        toast.success(t('deleteSuccess', { title: course.title }));
        setConfirmOpen(false);
      },
      onError: (e) => {
        const { title, description } = formatApiError(e, t('deleteError'));
        toast.error(title, description ? { description } : undefined);
      }
    });
  };

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div
        className={cn('relative h-28 border-b', !course.coverUrl && 'grid place-items-center')}
        style={course.coverUrl ? undefined : thumbStripeStyle}
      >
        {course.coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={course.coverUrl}
            alt={course.title}
            className='absolute inset-0 h-full w-full object-cover'
          />
        ) : (
          <div className='text-muted-foreground font-mono text-[11px]'>
            {course.cover} · 1200×400
          </div>
        )}
        {course.introVideoUrl && (
          <a
            href={course.introVideoUrl}
            target='_blank'
            rel='noreferrer'
            className='bg-background/90 hover:bg-background absolute bottom-3 left-3 inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] shadow-sm transition'
          >
            <Icons.video className='size-3' />
            {t('watchIntro')}
          </a>
        )}
        <EditCourseDialog
          course={course}
          trigger={
            <Button
              variant='outline'
              size='sm'
              className='absolute top-3 right-3 h-7 px-2 text-[11px] shadow-sm'
            >
              <Icons.edit className='size-3' />
              {t('edit')}
            </Button>
          }
        />
      </div>
      <div className='p-5'>
        <div className='flex items-center gap-2'>
          <span className='bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]'>
            {course.code}
          </span>
          <StatusBadge status={course.status} />
          <span className='border-foreground/15 text-foreground/80 rounded-full border px-2 py-0.5 text-[10.5px] font-medium'>
            {tTools(course.tool)}
          </span>
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
              {t('totalSessions')}
            </div>
            <div className='font-medium'>{t('sessionsUnit', { count: course.totalSessions })}</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('sessionDuration')}
            </div>
            <div className='font-medium'>
              {t('minutesUnit', { count: course.sessionDurationMinutes })}
            </div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('ages')}
            </div>
            <div className='font-medium'>
              {course.minAge}–{course.maxAge}
            </div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('capacityPerClass')}
            </div>
            <div className='font-medium'>
              {t('studentsUnit', { count: course.perClassCapacity })}
            </div>
          </div>
          <div className='col-span-2 rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('tuition')}
            </div>
            <div className='flex items-baseline gap-1.5 font-mono font-medium'>
              {formatTuition(course.tuitionAmount)}
              {course.originalTuitionAmount !== undefined && (
                <span className='text-muted-foreground text-[10px] line-through'>
                  {formatTuition(course.originalTuitionAmount)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='mt-5'>
          <div className='mb-2 text-[12px] font-medium'>
            {t('curriculumUnits', { count: course.totalSessions })}
          </div>
          <ul className='divide-y rounded-md border text-[12.5px]'>
            {course.curriculum.map((unit, i) => {
              const isLast = i === course.curriculum.length - 1;
              return (
                <li
                  key={i}
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

        {course.discounts && course.discounts.length > 0 && (
          <div className='mt-5'>
            <div className='mb-2 flex items-center gap-1.5 text-[12px] font-medium'>
              <Icons.badgeCheck className='text-muted-foreground size-3.5' />
              {t('discountsHeading')}
            </div>
            <ul className='divide-y rounded-md border text-[12.5px]'>
              {course.discounts.map((rule, i) => (
                <li key={`${rule.name}-${i}`} className='flex items-center gap-2 px-3 py-2'>
                  <div className='flex min-w-0 flex-1 flex-col leading-tight'>
                    <span className='truncate font-medium'>{rule.name}</span>
                    {rule.condition !== 'none' && (
                      <span className='text-muted-foreground truncate text-[10.5px]'>
                        {t(`discountConditions.${rule.condition}`)}
                        {rule.conditionDate ? ` · ${rule.conditionDate}` : ''}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px]',
                      rule.type === 'special'
                        ? 'border border-amber-200 bg-amber-50 text-amber-800'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {formatDiscountValue(rule)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {course.pricingNotes && (
          <p className='text-muted-foreground mt-3 text-[11.5px] leading-relaxed italic'>
            {course.pricingNotes}
          </p>
        )}

        <div className='mt-5 flex gap-2'>
          <Button
            className='h-9 flex-1'
            disabled={togglePending}
            variant={course.status === 'published' ? 'outline' : 'default'}
            onClick={handleToggleStatus}
          >
            {t(toggleLabelKey)}
          </Button>
          <Button variant='outline' className='h-9'>
            {t('duplicate')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon' className='h-9 w-9' aria-label={t('more')}>
                <Icons.ellipsis className='size-3.5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44'>
              <DropdownMenuSeparator />
              {/* Only drafts can be removed — published/unpublished are kept
                  for history and enrolment integrity. */}
              <DropdownMenuItem
                variant='destructive'
                disabled={course.status !== 'draft'}
                onSelect={() => {
                  if (course.status === 'draft') setConfirmOpen(true);
                }}
              >
                <Icons.trash className='size-3.5' />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDescription', { title: course.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourse.isPending}>
              {t('deleteCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteCourse.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className='bg-destructive text-white hover:bg-destructive/90'
            >
              {t('deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
