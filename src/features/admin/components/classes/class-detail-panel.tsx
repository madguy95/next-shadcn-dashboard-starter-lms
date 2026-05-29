'use client';

import { useQuery } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { classStudentsOptions, type ClassRow } from '@/api/classes';
import { avatarToneClass, studentStatusClass } from '@/features/admin/data';
import { cn } from '@/lib/utils';
import { ClassLifecycleActions } from './class-lifecycle-actions';
import { ClassStatusBadge } from './class-status-badge';
import { EditClassDialog } from './edit-class-dialog';

const STUDENTS_PREVIEW_LIMIT = 7;

export function ClassDetailPanel({ cls }: { cls: ClassRow }) {
  const t = useTranslations('classes.detail');
  const format = useFormatter();
  const { data: students, isLoading } = useQuery(classStudentsOptions(cls.id));

  const roster = students ?? [];
  const visible = roster.slice(0, STUDENTS_PREVIEW_LIMIT);
  const remaining = Math.max(0, roster.length - visible.length);

  // Dates come back from BE as ISO strings (yyyy-MM-dd). Render via the active
  // locale so VI renders "23 thg 5, 2026" and EN renders "May 23, 2026".
  const formatDay = (iso?: string) =>
    iso ? format.dateTime(new Date(iso), { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const startLabel = formatDay(cls.startDate);
  const endLabel = formatDay(cls.endDate);
  const durationLabel =
    startLabel && endLabel
      ? t('durationRange', { start: startLabel, end: endLabel })
      : startLabel
        ? t('durationStartOnly', { start: startLabel })
        : endLabel
          ? t('durationEndOnly', { end: endLabel })
          : t('durationUnknown');

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='border-b px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4'>
        <div className='text-muted-foreground flex items-center gap-2 font-mono text-[12px]'>
          <span className='uppercase'>{cls.courseTitle}</span>
          <span>·</span>
          <span>{cls.courseCode}</span>
        </div>
        <div className='mt-1 flex flex-wrap items-end justify-between gap-2'>
          <h2 className='text-[18px] font-semibold tracking-tight sm:text-[20px]'>{cls.name}</h2>
          <ClassStatusBadge status={cls.status} />
        </div>
        {cls.lifecycleStatus === 'cancelled' && cls.cancellationReason && (
          <div className='bg-destructive/5 text-destructive mt-3 rounded-md border border-rose-200 px-2.5 py-1.5 text-[12px]'>
            <span className='font-medium'>{t('cancellationReason')}: </span>
            {cls.cancellationReason}
          </div>
        )}
        <div className='mt-3 flex flex-wrap items-center gap-1.5'>
          {cls.lifecycleStatus !== 'cancelled' && (
            <EditClassDialog
              cls={cls}
              trigger={
                <Button variant='outline' size='sm' className='h-7 px-2 text-[12px]'>
                  <Icons.edit className='size-3.5' />
                  {t('edit')}
                </Button>
              }
            />
          )}
          <ClassLifecycleActions cls={cls} />
        </div>
        <div className='mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4'>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('teacher')}
            </div>
            <div className='mt-0.5 flex items-center gap-1.5 font-medium'>
              <span
                className={cn(
                  'grid h-4 w-4 place-items-center rounded-full text-[8px] font-semibold',
                  avatarToneClass[cls.teacherTone]
                )}
              >
                {cls.teacherInitials}
              </span>
              <span className='truncate'>{cls.teacherShort}</span>
            </div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('capacity')}
            </div>
            <div className='mt-0.5 font-mono font-medium'>
              {cls.enrolled} / {cls.capacity}
            </div>
          </div>
          <div className='col-span-2 rounded-md border p-2.5 sm:col-span-1'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('duration')}
            </div>
            <div className='mt-0.5 font-mono text-[11.5px] font-medium'>{durationLabel}</div>
          </div>
          <div className='col-span-2 rounded-md border p-2.5 sm:col-span-1'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('schedule')}
            </div>
            <div className='mt-0.5 font-mono text-[11.5px] font-medium'>{cls.schedule}</div>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between border-b px-4 py-3 sm:px-5'>
        <div className='text-[13px] font-medium'>
          {t('students')}
          <span className='text-muted-foreground ml-1 font-mono'>{cls.enrolled}</span>
        </div>
      </div>

      <ul className='max-h-[520px] divide-y overflow-auto'>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className='flex items-center gap-3 px-4 py-2.5 sm:px-5'>
              <Skeleton className='h-7 w-7 shrink-0 rounded-full' />
              <div className='flex-1 space-y-1.5'>
                <Skeleton className='h-3 w-32' />
                <Skeleton className='h-2.5 w-24' />
              </div>
              <Skeleton className='hidden h-3 w-16 sm:block' />
              <Skeleton className='h-4 w-14 rounded' />
            </li>
          ))
        ) : roster.length === 0 ? (
          <li className='text-muted-foreground px-4 py-6 text-center text-sm sm:px-5'>
            {t('noStudents')}
          </li>
        ) : (
          <>
            {visible.map((s) => (
              <StudentRow key={s.id} student={s} />
            ))}
            {remaining > 0 && (
              <li className='hover:bg-muted/30 flex items-center gap-3 px-4 py-2.5 sm:px-5'>
                <span className='bg-foreground text-background grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold'>
                  +{remaining}
                </span>
                <div className='min-w-0 flex-1 leading-tight'>
                  <div className='text-muted-foreground text-sm'>
                    {t('moreStudents', { count: remaining })}
                  </div>
                </div>
              </li>
            )}
          </>
        )}
      </ul>
    </div>
  );
}

function StudentRow({ student }: { student: import('@/api/classes').ClassStudent }) {
  const t = useTranslations('classes');
  const tDetail = useTranslations('classes.detail');
  return (
    <li className='hover:bg-muted/30 flex items-center gap-3 px-4 py-2.5 sm:px-5'>
      <span
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold',
          avatarToneClass[student.tone]
        )}
      >
        {student.initials}
      </span>
      <div className='min-w-0 flex-1 leading-tight'>
        <div className='truncate text-sm font-medium'>{student.name}</div>
        <div className='text-muted-foreground flex flex-wrap items-center gap-x-2 font-mono text-[11px]'>
          <span>{tDetail('studentMeta', { grade: student.grade, age: student.age })}</span>
          {/* Attendance folds into the meta line on < sm so the avatar+name
              don't get squeezed by a separate column. */}
          <span className='sm:hidden'>
            · {tDetail('attendancePct', { value: student.attendance })}
          </span>
        </div>
      </div>
      <div className='text-muted-foreground hidden font-mono text-[11px] sm:block'>
        {tDetail('attendancePct', { value: student.attendance })}
      </div>
      <span
        className={cn(
          'inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 font-mono text-[10px]',
          studentStatusClass[student.status]
        )}
      >
        {t(`studentStatus.${student.status}`)}
      </span>
    </li>
  );
}

export function ClassDetailPanelSkeleton() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='border-b px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4'>
        <Skeleton className='h-3 w-40' />
        <Skeleton className='mt-2 h-6 w-2/3' />
        <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3'>
          <Skeleton className='h-14 rounded-md' />
          <Skeleton className='h-14 rounded-md' />
          <Skeleton className='col-span-2 h-14 rounded-md sm:col-span-1' />
        </div>
      </div>
      <div className='flex items-center justify-between border-b px-4 py-3 sm:px-5'>
        <Skeleton className='h-4 w-24' />
        <div className='flex gap-1.5'>
          <Skeleton className='h-7 w-28' />
          <Skeleton className='h-7 w-24' />
        </div>
      </div>
      <ul className='divide-y'>
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className='flex items-center gap-3 px-4 py-2.5 sm:px-5'>
            <Skeleton className='h-7 w-7 shrink-0 rounded-full' />
            <div className='flex-1 space-y-1.5'>
              <Skeleton className='h-3 w-32' />
              <Skeleton className='h-2.5 w-24' />
            </div>
            <Skeleton className='hidden h-3 w-16 sm:block' />
            <Skeleton className='h-4 w-14 rounded' />
          </li>
        ))}
      </ul>
    </div>
  );
}
