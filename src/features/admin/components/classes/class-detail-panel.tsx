'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { classStudentsOptions, type ClassRow } from '@/api/classes';
import { avatarToneClass, studentStatusClass } from '@/features/admin/data';
import { cn } from '@/lib/utils';
import { ClassStatusBadge } from './class-status-badge';

const STUDENTS_PREVIEW_LIMIT = 7;

export function ClassDetailPanel({ cls }: { cls: ClassRow }) {
  const t = useTranslations('classes.detail');
  const { data: students, isLoading } = useQuery(classStudentsOptions(cls.id));

  const roster = students ?? [];
  const visible = roster.slice(0, STUDENTS_PREVIEW_LIMIT);
  const remaining = Math.max(0, roster.length - visible.length);

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='border-b px-5 pt-5 pb-4'>
        <div className='text-muted-foreground flex items-center gap-2 font-mono text-[12px]'>
          <span className='uppercase'>{cls.courseTitle}</span>
          <span>·</span>
          <span>{cls.courseCode}</span>
        </div>
        <div className='mt-1 flex flex-wrap items-end justify-between gap-2'>
          <h2 className='text-[20px] font-semibold tracking-tight'>{cls.name}</h2>
          <ClassStatusBadge
            status={cls.status}
            weekIndex={cls.weekIndex}
            weeksTotal={cls.weeksTotal}
          />
        </div>
        <div className='mt-3 grid grid-cols-3 gap-2 text-[12px]'>
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
              {cls.teacherShort}
            </div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('schedule')}
            </div>
            <div className='mt-0.5 font-mono text-[11.5px] font-medium'>{cls.schedule}</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('capacity')}
            </div>
            <div className='mt-0.5 font-mono font-medium'>
              {cls.enrolled} / {cls.capacity}
            </div>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between border-b px-5 py-3'>
        <div className='text-[13px] font-medium'>
          {t('students')}
          <span className='text-muted-foreground ml-1 font-mono'>{cls.enrolled}</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <Button variant='outline' size='sm' className='h-7 px-2 text-[12px]'>
            {t('markAttendance')}
          </Button>
          <Button variant='outline' size='sm' className='h-7 px-2 text-[12px]'>
            {t('addStudent')}
          </Button>
        </div>
      </div>

      <ul className='max-h-[520px] divide-y overflow-auto'>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className='flex items-center gap-3 px-5 py-2.5'>
              <Skeleton className='h-7 w-7 rounded-full' />
              <div className='flex-1 space-y-1.5'>
                <Skeleton className='h-3 w-32' />
                <Skeleton className='h-2.5 w-24' />
              </div>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-4 w-14 rounded' />
            </li>
          ))
        ) : roster.length === 0 ? (
          <li className='text-muted-foreground px-5 py-6 text-center text-sm'>{t('noStudents')}</li>
        ) : (
          <>
            {visible.map((s) => (
              <StudentRow key={s.id} student={s} />
            ))}
            {remaining > 0 && (
              <li className='hover:bg-muted/30 flex items-center gap-3 px-5 py-2.5'>
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
    <li className='hover:bg-muted/30 flex items-center gap-3 px-5 py-2.5'>
      <span
        className={cn(
          'grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold',
          avatarToneClass[student.tone]
        )}
      >
        {student.initials}
      </span>
      <div className='min-w-0 flex-1 leading-tight'>
        <div className='truncate text-sm font-medium'>{student.name}</div>
        <div className='text-muted-foreground font-mono text-[11px]'>
          {tDetail('studentMeta', { grade: student.grade, age: student.age })}
        </div>
      </div>
      <div className='text-muted-foreground font-mono text-[11px]'>
        {tDetail('attendancePct', { value: student.attendance })}
      </div>
      <span
        className={cn(
          'inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px]',
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
      <div className='border-b px-5 pt-5 pb-4'>
        <Skeleton className='h-3 w-40' />
        <Skeleton className='mt-2 h-6 w-2/3' />
        <div className='mt-3 grid grid-cols-3 gap-2'>
          <Skeleton className='h-14 rounded-md' />
          <Skeleton className='h-14 rounded-md' />
          <Skeleton className='h-14 rounded-md' />
        </div>
      </div>
      <div className='flex items-center justify-between border-b px-5 py-3'>
        <Skeleton className='h-4 w-24' />
        <div className='flex gap-1.5'>
          <Skeleton className='h-7 w-28' />
          <Skeleton className='h-7 w-24' />
        </div>
      </div>
      <ul className='divide-y'>
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className='flex items-center gap-3 px-5 py-2.5'>
            <Skeleton className='h-7 w-7 rounded-full' />
            <div className='flex-1 space-y-1.5'>
              <Skeleton className='h-3 w-32' />
              <Skeleton className='h-2.5 w-24' />
            </div>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-4 w-14 rounded' />
          </li>
        ))}
      </ul>
    </div>
  );
}
