'use client';

import { useQuery } from '@tanstack/react-query';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  adminDashboardSummaryOptions,
  isDashboardPeriod,
  type DashboardClassesKpi,
  type DashboardCourseFill,
  type DashboardCoursesKpi,
  type DashboardHeader,
  type DashboardPendingKpi,
  type DashboardPeriod,
  type DashboardRecentEnrollment,
  type DashboardStudentsKpi,
  type DashboardUpcomingClass,
  type UpcomingClassBadgeKind
} from '@/api/admin-dashboard';
import type { EnrollmentChannel, EnrollmentStatus } from '@/api/enrollments';
import type { ScheduleEventCategory } from '@/api/schedule';
import { avatarToneClass } from '@/constants/avatar';
import { cn } from '@/lib/utils';
import { enrollmentStatusClass } from '@/features/admin/data';

type EnrollmentStatusTab = EnrollmentStatus | 'all';

const upcomingAccentClass: Record<ScheduleEventCategory, string> = {
  scratch: 'bg-foreground',
  python: 'bg-sky-400',
  web: 'bg-violet-400',
  robotics: 'bg-amber-400',
  game_ai: 'bg-emerald-400'
};

const upcomingBadgeClass: Record<UpcomingClassBadgeKind, string> = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  online: 'bg-sky-50 text-sky-700 border-sky-100',
  low_cap: 'bg-amber-50 text-amber-800 border-amber-200'
};

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return String(delta);
  return '0';
}

function StatChip({ delta, tone = 'positive' }: { delta: string; tone?: 'positive' | 'warning' }) {
  if (tone === 'warning') {
    return (
      <span className='inline-flex items-center gap-1 rounded border border-amber-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-amber-800'>
        {delta}
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700'>
      <Icons.chevronUp className='size-2.5' />
      {delta}
    </span>
  );
}

function CoursesKpi({ data }: { data: DashboardCoursesKpi }) {
  const t = useTranslations('adminDashboard.kpi.courses');
  const bars = data.weeklyTrend.length > 0 ? data.weeklyTrend : Array(7).fill(0);
  return (
    <div className='bg-card rounded-lg border p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          {t('title')}
        </div>
        <StatChip delta={formatDelta(data.delta)} />
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <div className='text-[34px] leading-none font-semibold tracking-tight'>{data.active}</div>
        <div className='text-muted-foreground text-xs'>{t('unit')}</div>
      </div>
      <div className='mt-4 flex h-8 items-end gap-1'>
        {bars.map((value, idx) => {
          const pct = Math.max(0.1, Math.min(1, value));
          const today = idx === bars.length - 1;
          return (
            <div
              key={idx}
              className={cn('flex-1 rounded-sm', today ? 'bg-foreground' : 'bg-muted')}
              style={{ height: `${pct * 100}%` }}
            />
          );
        })}
      </div>
      <div className='text-muted-foreground mt-2 flex justify-between font-mono text-[11px]'>
        <span>{t('trendStart')}</span>
        <span>{t('trendEnd')}</span>
      </div>
    </div>
  );
}

function ClassesKpi({ data }: { data: DashboardClassesKpi }) {
  const t = useTranslations('adminDashboard.kpi.classes');
  const total = data.offline + data.online || 1;
  const offlinePct = (data.offline / total) * 100;
  const onlinePct = (data.online / total) * 100;
  return (
    <div className='bg-card rounded-lg border p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          {t('title')}
        </div>
        <StatChip delta={formatDelta(data.delta)} />
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <div className='text-[34px] leading-none font-semibold tracking-tight'>{data.running}</div>
        <div className='text-muted-foreground text-xs'>{t('unit')}</div>
      </div>
      <div className='mt-4 grid grid-cols-2 gap-2 font-mono text-[11px]'>
        <div className='flex items-center gap-1.5'>
          <span className='bg-foreground h-2 w-2 rounded-full' />
          {t('offline', { count: data.offline })}
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='bg-muted-foreground/40 h-2 w-2 rounded-full' />
          {t('online', { count: data.online })}
        </div>
      </div>
      <div className='bg-muted mt-3 flex h-1.5 overflow-hidden rounded-full'>
        <div className='bg-foreground h-full' style={{ width: `${offlinePct}%` }} />
        <div className='bg-foreground/30 h-full' style={{ width: `${onlinePct}%` }} />
      </div>
    </div>
  );
}

function StudentsKpi({ data }: { data: DashboardStudentsKpi }) {
  const t = useTranslations('adminDashboard.kpi.students');
  return (
    <div className='bg-card rounded-lg border p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          {t('title')}
        </div>
        <StatChip delta={formatDelta(data.delta)} />
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <div className='text-[34px] leading-none font-semibold tracking-tight'>{data.enrolled}</div>
        <div className='text-muted-foreground text-xs'>{t('unit')}</div>
      </div>
      <div className='mt-4 flex -space-x-2'>
        {data.sample.map((s, idx) => (
          <span
            key={`${s.initials}-${idx}`}
            className={cn(
              'border-card grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-semibold',
              avatarToneClass[s.tone]
            )}
          >
            {s.initials}
          </span>
        ))}
        {data.remaining > 0 && (
          <span className='bg-muted text-muted-foreground border-card grid h-7 w-7 place-items-center rounded-full border-2 font-mono text-[10px]'>
            +{data.remaining}
          </span>
        )}
      </div>
    </div>
  );
}

function PendingKpi({ data }: { data: DashboardPendingKpi }) {
  const t = useTranslations('adminDashboard.kpi.pending');
  return (
    <div className='relative rounded-lg border border-amber-200/60 bg-amber-50/40 p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div className='text-xs font-medium tracking-wider text-amber-800 uppercase'>
          {t('title')}
        </div>
        <StatChip delta={t('chip')} tone='warning' />
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <div className='text-[34px] leading-none font-semibold tracking-tight text-amber-900'>
          {data.count}
        </div>
        <div className='text-xs text-amber-800/80'>{t('unit')}</div>
      </div>
      <div className='mt-4 flex items-center gap-2'>
        <Button asChild size='sm' className='h-8 bg-amber-900 text-white hover:bg-amber-900/90'>
          <Link href='/admin/enrollments?status=pending'>
            {t('review')}
            <Icons.arrowRight className='size-3' />
          </Link>
        </Button>
        {data.avgWaitLabel && (
          <span className='font-mono text-[11px] text-amber-900/70'>
            {t('avgWait', { label: data.avgWaitLabel })}
          </span>
        )}
      </div>
    </div>
  );
}

function RecentEnrollmentsCard({ rows }: { rows: DashboardRecentEnrollment[] }) {
  const t = useTranslations('adminDashboard.recent');
  const tChannel = useTranslations('adminDashboard.recent.channelLabel');
  const tStatus = useTranslations('adminDashboard.recent.statusLabel');
  const format = useFormatter();
  const now = useNow({ updateInterval: 60 * 1000 });
  const [tab, setTab] = React.useState<EnrollmentStatusTab>('all');
  // Client-side filter — we only fetched a small window (top 6), so when the
  // user picks a tab with no matches in this window we tell them to drill in.
  const filtered = tab === 'all' ? rows : rows.filter((r) => r.status === tab);
  const viewAllHref = tab === 'all' ? '/admin/enrollments' : `/admin/enrollments?status=${tab}`;

  const channelText = (ch: EnrollmentChannel) => {
    switch (ch) {
      case 'parent_app':
        return tChannel('parent_app');
      case 'website':
        return tChannel('website');
      case 'referral':
        return tChannel('referral');
      default:
        return ch;
    }
  };

  const gradeAgeText = (e: DashboardRecentEnrollment) => {
    if (e.grade != null && e.age != null) return t('gradeAge', { grade: e.grade, age: e.age });
    if (e.grade != null) return t('gradeOnly', { grade: e.grade });
    if (e.age != null) return t('ageOnly', { age: e.age });
    return '';
  };

  return (
    <div className='bg-card col-span-12 overflow-hidden rounded-lg border shadow-sm xl:col-span-8'>
      <div className='flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5'>
        <div>
          <div className='text-[15px] font-semibold tracking-tight'>{t('title')}</div>
          <div className='text-muted-foreground text-[12px]'>
            {t('subtitle', { count: rows.length })}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Tabs value={tab} onValueChange={(v) => setTab(v as EnrollmentStatusTab)}>
            <TabsList className='h-8'>
              <TabsTrigger value='all' className='h-6 px-2.5 text-[12px]'>
                {t('tabs.all')}
              </TabsTrigger>
              <TabsTrigger value='pending' className='h-6 px-2.5 text-[12px]'>
                {t('tabs.pending')}
              </TabsTrigger>
              <TabsTrigger value='active' className='h-6 px-2.5 text-[12px]'>
                {t('tabs.active')}
              </TabsTrigger>
              <TabsTrigger value='waitlist' className='h-6 px-2.5 text-[12px]'>
                {t('tabs.waitlist')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Link
            href={viewAllHref}
            className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[12px]'
          >
            {t('viewAll')}
            <Icons.arrowRight className='size-3' />
          </Link>
        </div>
      </div>
      <Table>
        <TableHeader className='bg-muted/40'>
          <TableRow>
            <TableHead className='px-5 text-[11px] tracking-wider uppercase'>
              {t('columns.student')}
            </TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>
              {t('columns.course')}
            </TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>
              {t('columns.channel')}
            </TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>
              {t('columns.submitted')}
            </TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>
              {t('columns.status')}
            </TableHead>
            <TableHead className='px-5 text-right' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='text-muted-foreground px-5 py-10 text-center text-sm'
              >
                {rows.length === 0 ? (
                  t('empty')
                ) : (
                  <>
                    {t('emptyForTab', { count: rows.length })}{' '}
                    <Link href={viewAllHref} className='underline decoration-dotted'>
                      {t('emptyOpenQueue')}
                    </Link>
                    .
                  </>
                )}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell className='px-5 py-3'>
                  <div className='flex items-center gap-2.5'>
                    <span
                      className={cn(
                        'grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold',
                        avatarToneClass[e.tone]
                      )}
                    >
                      {e.initials}
                    </span>
                    <div className='leading-tight'>
                      <div className='font-medium'>{e.studentName}</div>
                      <div className='text-muted-foreground font-mono text-[11px]'>
                        {gradeAgeText(e)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='py-3'>{e.course}</TableCell>
                <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
                  {channelText(e.channel)}
                </TableCell>
                <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
                  {format.relativeTime(new Date(e.submittedAt), now)}
                </TableCell>
                <TableCell className='py-3'>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      enrollmentStatusClass[e.status]
                    )}
                  >
                    {tStatus(e.status)}
                  </span>
                </TableCell>
                <TableCell className='px-5 py-3 text-right'>
                  <Link
                    href={`/admin/enrollments?status=${e.status}&selected=${e.id}`}
                    className='text-muted-foreground hover:text-foreground text-[12px]'
                  >
                    {t('open')}
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function UpcomingClassesCard({
  rows,
  todayLabel
}: {
  rows: DashboardUpcomingClass[];
  todayLabel: string;
}) {
  const t = useTranslations('adminDashboard.upcoming');
  const tBadge = useTranslations('adminDashboard.upcoming.badge');
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex items-center justify-between border-b px-5 py-3.5'>
        <div>
          <div className='text-[15px] font-semibold tracking-tight'>{t('title')}</div>
          <div className='text-muted-foreground text-[12px]'>{todayLabel}</div>
        </div>
        <Link
          href='/admin/schedule'
          className='text-muted-foreground hover:text-foreground text-[12px]'
        >
          {t('schedule')}
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className='text-muted-foreground px-5 py-10 text-center text-sm'>{t('empty')}</div>
      ) : (
        <ul className='divide-y'>
          {rows.map((c) => (
            <li key={c.id} className='hover:bg-muted/30 flex gap-3 px-5 py-3.5'>
              <div className='w-14 shrink-0 text-right'>
                <div className='text-sm font-semibold tabular-nums'>{c.startTime}</div>
                <div className='text-muted-foreground font-mono text-[11px]'>
                  {t('duration', { count: c.durationMin })}
                </div>
              </div>
              <div
                className={cn('w-1 self-stretch rounded-full', upcomingAccentClass[c.category])}
              />
              <div className='min-w-0 flex-1'>
                <div className='truncate text-sm font-medium'>{c.title}</div>
                <div className='text-muted-foreground truncate text-[12px]'>{c.detail}</div>
              </div>
              {c.badge && (
                <span
                  className={cn(
                    'mt-0.5 self-start rounded border px-1.5 py-0.5 font-mono text-[10px]',
                    upcomingBadgeClass[c.badge.kind]
                  )}
                >
                  {tBadge(c.badge.kind)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CourseFillCard({ rows }: { rows: DashboardCourseFill[] }) {
  const t = useTranslations('adminDashboard.fill');
  return (
    <div className='bg-card rounded-lg border p-5 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <div className='text-[15px] font-semibold tracking-tight'>{t('title')}</div>
          <div className='text-muted-foreground text-[12px]'>
            {t('subtitle', { count: rows.length })}
          </div>
        </div>
      </div>
      <div className='space-y-3'>
        {rows.map((c) => {
          const pct = c.capacity > 0 ? Math.round((c.enrolled / c.capacity) * 100) : 0;
          const low = pct < 50;
          return (
            <div key={c.id}>
              <div className='mb-1 flex justify-between text-[12px]'>
                <span>{c.name}</span>
                <span className='text-muted-foreground font-mono'>
                  {pct}% · {c.enrolled}/{c.capacity}
                </span>
              </div>
              <div className='bg-muted h-1.5 overflow-hidden rounded-full'>
                <div
                  className={cn('h-full', low ? 'bg-foreground/40' : 'bg-foreground')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardHeaderBar({
  header,
  period,
  onPeriodChange
}: {
  header: DashboardHeader;
  period: DashboardPeriod;
  onPeriodChange: (next: DashboardPeriod) => void;
}) {
  const t = useTranslations('adminDashboard.header');
  const tPeriod = useTranslations('adminDashboard.period');
  const greeting = header.greetingName
    ? t('greeting', { name: header.greetingName })
    : t('greetingFallback');
  const description = header.termLabel
    ? t('subtitleWithTerm', { term: header.termLabel })
    : t('subtitle');
  return (
    <div className='flex flex-wrap items-end justify-between gap-4'>
      <div>
        <h1 className='text-[26px] leading-tight font-semibold tracking-tight'>{greeting}</h1>
        <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
      </div>
      <div className='flex items-center gap-2'>
        <Tabs value={period} onValueChange={(v) => onPeriodChange(v as DashboardPeriod)}>
          <TabsList>
            <TabsTrigger value='week'>{tPeriod('week')}</TabsTrigger>
            <TabsTrigger value='month'>{tPeriod('month')}</TabsTrigger>
            <TabsTrigger value='term'>{tPeriod('term')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button asChild size='sm' className='h-9'>
          <Link href='/admin/courses'>
            <Icons.add className='size-3.5' />
            {t('newCourse')}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function AdminDashboardView() {
  const t = useTranslations('adminDashboard');
  const [periodParam, setPeriodParam] = useQueryState('period', parseAsString.withDefault('week'));
  const period: DashboardPeriod = isDashboardPeriod(periodParam) ? periodParam : 'week';
  const { data, isFetching } = useQuery(adminDashboardSummaryOptions({ period }));

  if (!data) return <AdminDashboardSkeleton />;

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-6'>
      <DashboardHeaderBar
        header={data.header}
        period={period}
        onPeriodChange={(next) => void setPeriodParam(next)}
      />

      <LoadingOverlay visible={isFetching} message={t('updating')}>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <CoursesKpi data={data.kpis.courses} />
            <ClassesKpi data={data.kpis.classes} />
            <StudentsKpi data={data.kpis.students} />
            <PendingKpi data={data.kpis.pending} />
          </div>

          <div className='grid grid-cols-12 gap-4'>
            <RecentEnrollmentsCard rows={data.recentEnrollments} />
            <div className='col-span-12 space-y-4 xl:col-span-4'>
              <UpcomingClassesCard
                rows={data.upcomingClasses}
                todayLabel={data.header.todayLabel}
              />
              <CourseFillCard rows={data.courseFill} />
            </div>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div className='space-y-2'>
          <div className='bg-muted h-7 w-64 animate-pulse rounded' />
          <div className='bg-muted h-4 w-96 animate-pulse rounded' />
        </div>
        <div className='bg-muted h-9 w-72 animate-pulse rounded' />
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='bg-muted h-[140px] animate-pulse rounded-lg' />
        ))}
      </div>
      <div className='grid grid-cols-12 gap-4'>
        <div className='bg-muted col-span-12 h-[420px] animate-pulse rounded-lg xl:col-span-8' />
        <div className='col-span-12 space-y-4 xl:col-span-4'>
          <div className='bg-muted h-[240px] animate-pulse rounded-lg' />
          <div className='bg-muted h-[180px] animate-pulse rounded-lg' />
        </div>
      </div>
    </div>
  );
}
