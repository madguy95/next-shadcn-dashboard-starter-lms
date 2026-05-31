'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  isTeacherClassStatusFilter,
  teacherClassesSummaryOptions,
  type TeacherClass,
  type TeacherClassesStats,
  type TeacherClassStatus,
  type TeacherClassStatusFilter
} from '@/api/teacher-classes';
import { cn } from '@/lib/utils';
import { classColorTokens, studentToneClass } from '@/features/teacher/data';

const FILTERS: TeacherClassStatusFilter[] = ['all', 'running', 'upcoming', 'ended'];
const ALL_COURSES = '__all__';

function useStatusFilter() {
  const [isPending, startTransition] = React.useTransition();
  const [statusParam, setStatusParam] = useQueryState(
    'status',
    parseAsString.withDefault('all').withOptions({ startTransition })
  );
  const status: TeacherClassStatusFilter = isTeacherClassStatusFilter(statusParam)
    ? statusParam
    : 'all';
  return { status, setStatus: setStatusParam, isPending };
}

function StatusDot({ status }: { status: TeacherClassStatus }) {
  const cls =
    status === 'running'
      ? 'bg-emerald-500'
      : status === 'upcoming'
        ? 'bg-violet-500'
        : 'bg-muted-foreground';
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full', cls)} />;
}

function CoverStrip({ cls }: { cls: TeacherClass }) {
  const t = useTranslations('teacherClasses.status');
  const token = classColorTokens[cls.color];
  return (
    <div
      className={cn(
        'relative h-20 border-b',
        token.bg,
        'bg-[repeating-linear-gradient(45deg,color-mix(in_srgb,currentColor_4%,transparent)_0_8px,transparent_8px_16px)]'
      )}
    >
      <span className='bg-background absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase'>
        <StatusDot status={cls.status} />
        {t(cls.status)}
      </span>
      <span className='bg-background/80 absolute top-3 right-3 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px]'>
        {cls.code}
      </span>
    </div>
  );
}

function StudentStack({ cls }: { cls: TeacherClass }) {
  const extra = Math.max(cls.studentCount - cls.studentsPreview.length, 0);
  return (
    <div className='flex -space-x-2'>
      {cls.studentsPreview.map((s, idx) => (
        <span
          key={`${s.initials}-${idx}`}
          className={cn(
            'border-background grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-semibold',
            studentToneClass[s.tone]
          )}
        >
          {s.initials}
        </span>
      ))}
      {extra > 0 && (
        <span className='bg-muted text-foreground border-background grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-semibold'>
          +{extra}
        </span>
      )}
    </div>
  );
}

function ClassCard({ cls }: { cls: TeacherClass }) {
  const t = useTranslations('teacherClasses.card');
  const isClickable = cls.status !== 'ended';
  const inner = (
    <>
      <CoverStrip cls={cls} />
      <div className='p-4'>
        <div className='mb-1 flex items-baseline gap-2'>
          <span className='text-muted-foreground font-mono text-[11px]'>{cls.courseCode}</span>
          <span className='text-muted-foreground text-[11px]'>·</span>
          <span className='text-muted-foreground text-[11px]'>{cls.level}</span>
        </div>
        <h3 className='font-semibold tracking-tight'>
          {cls.title} · {cls.classLabel}
        </h3>
        <div className='text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs'>
          <span className='inline-flex items-center gap-1'>
            {cls.isOnline ? (
              <Icons.video className='size-3' />
            ) : (
              <Icons.workspace className='size-3' />
            )}
            {cls.location}
          </span>
          <span>·</span>
          <span>{cls.schedule}</span>
        </div>

        {cls.status !== 'ended' ? (
          <>
            <div className='mt-3 flex items-center gap-2'>
              <StudentStack cls={cls} />
              <span className='text-muted-foreground ml-auto font-mono text-xs'>
                {cls.status === 'upcoming'
                  ? t('capacityCount', {
                      count: cls.studentCount,
                      capacity: cls.capacity ?? cls.studentCount
                    })
                  : t('studentCount', { count: cls.studentCount })}
              </span>
            </div>
            <div className='mt-3 flex items-center justify-between border-t pt-3 text-[11px]'>
              <span className='text-muted-foreground'>
                {t('session')}{' '}
                <span className='text-foreground font-mono'>
                  {cls.sessionCurrent} / {cls.sessionTotal}
                </span>
              </span>
              {cls.status === 'upcoming' ? (
                <span className='text-muted-foreground'>
                  {t('daysRemaining', { count: cls.daysRemaining ?? 0 })}
                </span>
              ) : cls.needsReviewCount && cls.needsReviewCount > 0 ? (
                <span className='inline-flex items-center gap-1 text-amber-700'>
                  <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
                  {t('needsReview', { count: cls.needsReviewCount })}
                </span>
              ) : (
                <span className='inline-flex items-center gap-1 text-emerald-700'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  {t('updated')}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className='text-muted-foreground mt-3 text-xs'>
              {t('ended', { date: cls.endedAt ?? '', count: cls.studentCount })}
            </div>
            <div className='mt-3 flex items-center justify-between border-t pt-3 text-[11px]'>
              <span className='text-muted-foreground'>
                {t('session')}{' '}
                <span className='text-foreground font-mono'>
                  {cls.sessionCurrent} / {cls.sessionTotal}
                </span>
              </span>
              <span className='hover:text-foreground underline-offset-2 hover:underline'>
                {t('viewReport')}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );

  if (!isClickable) {
    return (
      <div className='bg-card overflow-hidden rounded-lg border opacity-70 shadow-sm'>{inner}</div>
    );
  }

  return (
    <Link
      href={`/teacher/classes/${cls.id}`}
      className='bg-card ring-foreground/5 hover:ring-foreground/20 block overflow-hidden rounded-lg border shadow-sm ring-2 transition-shadow hover:shadow-md'
    >
      {inner}
    </Link>
  );
}

function StatCard({
  label,
  value,
  helper,
  tone
}: {
  label: string;
  value: string;
  helper: string;
  tone?: 'amber';
}) {
  return (
    <div
      className={cn(
        'min-w-[140px] flex-1 rounded-md border px-3 py-2 sm:flex-none',
        tone === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'bg-muted/40'
      )}
    >
      <div className='text-[10px] font-medium tracking-wider opacity-70 uppercase'>{label}</div>
      <div className='text-lg leading-tight font-semibold'>{value}</div>
      <div className='font-mono text-[10.5px] opacity-70'>{helper}</div>
    </div>
  );
}

function StatsContent({ stats }: { stats: TeacherClassesStats }) {
  const t = useTranslations('teacherClasses.stats');
  return (
    <div className='flex flex-wrap gap-3'>
      <StatCard
        label={t('classes.label')}
        value={String(stats.classes.total)}
        helper={t('classes.helper', {
          running: stats.classes.running,
          upcoming: stats.classes.upcoming,
          ended: stats.classes.ended
        })}
      />
      <StatCard
        label={t('students.label')}
        value={String(stats.students.total)}
        helper={t('students.helper', { count: stats.classes.total })}
      />
    </div>
  );
}

export function MyClassesStats() {
  // Stats are global (computed across every class) so this reads a fixed `all`
  // key rather than the status filter. Keeping it off the nuqs query state means
  // MyClassesView is the only `status` subscriber — so switching the filter runs
  // inside that component's transition (dimmed LoadingOverlay) instead of making
  // a second subscriber re-suspend and flash the skeleton.
  const { data } = useSuspenseQuery(teacherClassesSummaryOptions({ status: 'all' }));
  return <StatsContent stats={data.stats} />;
}

export function MyClassesView() {
  const t = useTranslations('teacherClasses');
  const { status, setStatus, isPending } = useStatusFilter();
  const { data, isFetching } = useSuspenseQuery(teacherClassesSummaryOptions({ status }));

  const [search, setSearch] = React.useState('');
  const [course, setCourse] = React.useState<string>(ALL_COURSES);

  const courses = React.useMemo(
    () => Array.from(new Set(data.classes.map((c) => c.courseCode))).sort(),
    [data.classes]
  );

  const visible = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.classes.filter((c) => {
      if (course !== ALL_COURSES && c.courseCode !== course) return false;
      if (
        term &&
        !`${c.title} ${c.classLabel} ${c.code} ${c.courseCode}`.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [data.classes, search, course]);

  const courseLabel = course === ALL_COURSES ? t('course.all') : course;

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-6'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center'>
          <div className='-mx-1 overflow-x-auto px-1'>
            <Tabs value={status} onValueChange={(v) => void setStatus(v)}>
              <TabsList className='h-8'>
                {FILTERS.map((f) => (
                  <TabsTrigger key={f} value={f} className='h-6 px-2.5 text-xs'>
                    {t(`filters.${f}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className='inline-flex items-center gap-1.5'>
            <span className='text-muted-foreground text-[11px] tracking-wider uppercase'>
              {t('course.label')}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-7 px-2 font-mono text-xs'>
                  {courseLabel}
                  <Icons.chevronDown className='size-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='min-w-[10rem]'>
                <DropdownMenuRadioGroup value={course} onValueChange={setCourse}>
                  <DropdownMenuRadioItem value={ALL_COURSES} className='text-xs'>
                    {t('course.all')}
                  </DropdownMenuRadioItem>
                  {courses.map((c) => (
                    <DropdownMenuRadioItem key={c} value={c} className='font-mono text-xs'>
                      {c}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center'>
            <div className='relative w-full sm:w-64'>
              <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3 -translate-y-1/2' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className='h-8 pl-8 text-xs'
              />
            </div>
            <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
              <Icons.upload className='size-3 rotate-180' />
              {t('exportCsv')}
            </Button>
          </div>
        </div>
      </div>

      <LoadingOverlay visible={isPending || isFetching} message={t('updating')}>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {visible.map((c) => (
            <ClassCard key={c.id} cls={c} />
          ))}
          {visible.length === 0 && (
            <div className='text-muted-foreground col-span-full rounded-lg border border-dashed py-10 text-center text-sm'>
              {t('empty')}
            </div>
          )}
        </div>
      </LoadingOverlay>
    </div>
  );
}

export function MyClassesStatsSkeleton() {
  return (
    <div className='flex flex-wrap gap-3'>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className='bg-muted h-[58px] min-w-[140px] flex-1 animate-pulse rounded-md sm:flex-none'
        />
      ))}
    </div>
  );
}

export function MyClassesViewSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='bg-muted h-14 animate-pulse rounded-lg' />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='bg-muted h-[232px] animate-pulse rounded-lg' />
        ))}
      </div>
    </div>
  );
}
