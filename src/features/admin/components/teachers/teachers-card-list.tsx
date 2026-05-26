'use client';

import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import type { Teacher } from '@/api/teachers';
import { avatarToneClass, teacherStatusClass } from '@/features/admin/data';
import { cn } from '@/lib/utils';
import { TeacherRowActions } from './teacher-row-actions';

/**
 * Compact card view shown on <md viewports as an alternative to the DataTable.
 * Drives off the same paginated rows so pagination state stays in sync.
 */
export function TeachersCardList({ rows }: { rows: Teacher[] }) {
  const t = useTranslations('teachers');
  const tTable = useTranslations('table');

  if (rows.length === 0) {
    return (
      <div className='text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm'>
        {tTable('noResults')}
      </div>
    );
  }

  return (
    <ul className='divide-y rounded-lg border bg-card shadow-sm'>
      {rows.map((teacher) => {
        const extraSubjects = Math.max(0, teacher.subjects.length - 2);
        return (
          <li key={teacher.id} className='flex items-start gap-3 p-4'>
            <span
              className={cn(
                'mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-semibold',
                avatarToneClass[teacher.tone]
              )}
            >
              {teacher.initials}
            </span>
            <div className='min-w-0 flex-1 space-y-1.5'>
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <div className='truncate text-[14px] font-medium'>{teacher.name}</div>
                  <div className='text-muted-foreground truncate font-mono text-[11px]'>
                    {teacher.email}
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                    teacherStatusClass[teacher.status]
                  )}
                >
                  {t(`status.${teacher.status}`)}
                </span>
              </div>

              <div className='flex flex-wrap items-center gap-1'>
                {teacher.subjects.slice(0, 2).map((s) => (
                  <span key={s} className='bg-muted rounded px-1.5 py-0.5 text-[11px]'>
                    {s}
                  </span>
                ))}
                {extraSubjects > 0 && (
                  <span className='text-muted-foreground text-[11px]'>+{extraSubjects}</span>
                )}
              </div>

              <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]'>
                <span>
                  {teacher.classCount} {t('columns.classes').toLowerCase()}
                </span>
                <span>
                  {teacher.studentCount} {t('columns.students').toLowerCase()}
                </span>
                <span className='inline-flex items-center gap-1'>
                  <Icons.star className='size-3 fill-amber-500 text-amber-500' />
                  {teacher.rating.toFixed(1)}
                </span>
              </div>

              <div className='-mr-2 flex justify-end'>
                <TeacherRowActions teacher={teacher} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function TeachersCardListSkeleton({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <ul className='divide-y rounded-lg border bg-card shadow-sm'>
      {Array.from({ length: rowCount }).map((_, i) => (
        <li key={i} className='flex items-start gap-3 p-4'>
          <Skeleton className='h-10 w-10 shrink-0 rounded-full' />
          <div className='flex-1 space-y-2'>
            <div className='flex items-start justify-between gap-2'>
              <div className='space-y-1'>
                <Skeleton className='h-3.5 w-32' />
                <Skeleton className='h-3 w-40' />
              </div>
              <Skeleton className='h-4 w-14 rounded-full' />
            </div>
            <Skeleton className='h-4 w-44' />
            <Skeleton className='h-3 w-36' />
            <div className='flex justify-end'>
              <Skeleton className='h-7 w-24' />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
