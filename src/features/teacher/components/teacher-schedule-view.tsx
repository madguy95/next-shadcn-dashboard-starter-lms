'use client';

import { useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryStates } from 'nuqs';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  teacherScheduleWeekOptions,
  type TeacherScheduleClassChip,
  type TeacherScheduleDay,
  type TeacherScheduleEvent,
  type TeacherScheduleWeek
} from '@/api/teacher/schedule';
import { classColorTokens } from '@/features/teacher/data';
import { cn } from '@/lib/utils';

const HOUR_HEIGHT = 56;
const PX_PER_MIN = HOUR_HEIGHT / 60;
const START_HOUR = 8;
const END_HOUR = 20;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => `${String(START_HOUR + i).padStart(2, '0')}:00`
);
const GRID_HEIGHT = (HOURS.length - 1) * HOUR_HEIGHT;

export type TeacherScheduleViewMode = 'week' | 'day' | 'list';

function resolveView(value: string | null | undefined): TeacherScheduleViewMode {
  return value === 'day' || value === 'list' ? value : 'week';
}

// Shared URL state between the page-header nav and the calendar body.
const filterParsers = {
  view: parseAsString,
  anchor: parseAsString,
  classId: parseAsString
};

const toIso = (date: Date) => format(date, 'yyyy-MM-dd');
const fmtDM = (iso: string) => format(parseISO(iso), 'dd/MM');

function safeParseAnchor(value: string | null): Date {
  if (!value) return new Date();
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

const minutesToLabel = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const timeRange = (e: TeacherScheduleEvent) =>
  `${minutesToLabel(e.startMin)}–${minutesToLabel(e.startMin + e.durationMin)}`;

// Resolve which day column the day-view should focus: the anchored date when
// set, otherwise today (when inside the week), otherwise the first day.
function focusedDayIndex(data: TeacherScheduleWeek, anchor: string | null): number {
  const target = anchor ?? data.summary.todayIso ?? data.days[0]?.isoDate;
  const idx = data.days.findIndex((d) => d.isoDate === target);
  return idx >= 0 ? idx : 0;
}

// ----- stats -----

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

// Stats follow the visible scope: week/list count the whole week, day counts
// only the focused day — derived from the (already scoped) events array so the
// numbers always match what the body is showing.
function ScheduleStats({
  events,
  scope
}: {
  events: TeacherScheduleEvent[];
  scope: 'week' | 'day';
}) {
  const t = useTranslations('teacherSchedule.stats');
  const sessions = events.length;
  const hours = Math.round(events.reduce((sum, e) => sum + e.durationMin, 0) / 60);
  const online = events.filter((e) => e.isOnline).length;
  const makeup = events.filter((e) => e.isMakeup).length;
  return (
    <div className='flex flex-wrap gap-3'>
      <StatCard
        label={scope === 'day' ? t('sessions.labelDay') : t('sessions.label')}
        value={String(sessions)}
        helper={t('sessions.helper', { hours })}
      />
      <StatCard
        label={t('online.label')}
        value={String(online)}
        helper={t('online.helper', { total: sessions })}
      />
      <StatCard
        label={t('makeup.label')}
        value={String(makeup)}
        helper={t('makeup.helper')}
        tone='amber'
      />
    </div>
  );
}

// ----- grid (week + day) -----

function EventBlock({ event }: { event: TeacherScheduleEvent }) {
  const t = useTranslations('teacherSchedule');
  const top = (event.startMin - START_HOUR * 60) * PX_PER_MIN;
  const height = event.durationMin * PX_PER_MIN;
  const token = classColorTokens[event.color];

  return (
    <button
      type='button'
      className={cn(
        'absolute right-1 left-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1.5 text-left text-[11px] transition-shadow hover:z-10 hover:shadow-md',
        token.bg,
        token.bar,
        event.isMakeup ? 'border-y border-r border-dashed' : 'border-y border-r'
      )}
      style={{ top, height }}
    >
      <div className='font-mono leading-tight font-medium tabular-nums'>{timeRange(event)}</div>
      <div className='mt-0.5 leading-tight font-semibold'>
        <span className='mr-1 font-mono opacity-75'>{event.courseCode}</span>
        {event.title}
      </div>
      <div className='text-foreground/70 mt-1 flex items-center gap-1 text-[10px]'>
        {event.isOnline ? (
          <Icons.video className='size-2.5' />
        ) : (
          <Icons.workspace className='size-2.5' />
        )}
        {event.location}
        {event.studentCount > 0 && ` · ${t('studentCount', { count: event.studentCount })}`}
      </div>
      {event.isMakeup && (
        <span className='absolute top-1 right-1 rounded-sm bg-amber-200 px-1 py-0.5 text-[9px] font-medium tracking-wider text-amber-900 uppercase'>
          {t('makeupBadge')}
        </span>
      )}
    </button>
  );
}

function NowLine({ nowMin }: { nowMin: number }) {
  const top = (nowMin - START_HOUR * 60) * PX_PER_MIN;
  return (
    <div className='pointer-events-none absolute right-0 left-0 z-10' style={{ top }}>
      <div className='bg-destructive h-px' />
      <div className='bg-destructive ring-background absolute -top-1 -left-1 h-2 w-2 rounded-full ring-2' />
    </div>
  );
}

function useNowMinutes() {
  // Client-only "now" position to avoid an SSR/CSR hydration mismatch.
  const [nowMin, setNowMin] = React.useState<number | null>(null);
  React.useEffect(() => {
    const update = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    update();
    const timer = setInterval(update, 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  return nowMin != null && nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60 ? nowMin : null;
}

// Renders both week (7 columns) and day (1 column) — the only differences are
// the column set + the time-column width / min width for horizontal scroll.
function ScheduleGrid({
  data,
  columns
}: {
  data: TeacherScheduleWeek;
  columns: { day: TeacherScheduleDay; idx: number }[];
}) {
  const t = useTranslations('teacherSchedule');
  const weekdays = t.raw('weekdaysShort') as string[];
  const showNow = useNowMinutes();

  const isDay = columns.length === 1;
  const colTemplate = isDay ? 'grid-cols-[56px_1fr]' : 'grid-cols-[56px_repeat(7,1fr)]';
  const minWidth = isDay ? 'min-w-0' : 'min-w-[680px]';

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='overflow-x-auto'>
        <div className={minWidth}>
          <div className={cn('bg-background grid shrink-0 border-b', colTemplate)}>
            <div className='border-r' />
            {columns.map(({ day, idx }) => (
              <div
                key={day.isoDate}
                className={cn(
                  'border-r px-2 py-2 text-center last:border-r-0',
                  day.isToday && 'bg-accent/40'
                )}
              >
                <div className='text-muted-foreground text-[10.5px] font-medium tracking-wider uppercase'>
                  {weekdays[idx]}
                </div>
                {day.isToday ? (
                  <div className='bg-foreground text-background mx-auto mt-0.5 inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold tabular-nums'>
                    {day.dayOfMonth}
                  </div>
                ) : (
                  <div className='mt-0.5 font-mono text-sm tabular-nums'>{day.dayOfMonth}</div>
                )}
              </div>
            ))}
          </div>

          <div className={cn('grid min-h-0', colTemplate)}>
            <div className='relative border-r'>
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className='text-muted-foreground absolute right-2 font-mono text-[10.5px] tabular-nums'
                  style={{ top: i * HOUR_HEIGHT - 6 }}
                >
                  {h}
                </div>
              ))}
              <div style={{ height: GRID_HEIGHT }} />
            </div>

            {columns.map(({ day, idx }) => {
              const dayEvents = data.events.filter((e) => e.dayIndex === idx);
              return (
                <div
                  key={day.isoDate}
                  className={cn('relative border-r last:border-r-0', day.isToday && 'bg-accent/20')}
                  style={{
                    height: GRID_HEIGHT,
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, transparent 0 55px, hsl(var(--border)) 55px 56px)'
                  }}
                >
                  {day.isToday && showNow != null && <NowLine nowMin={showNow} />}
                  {dayEvents.map((e) => (
                    <EventBlock key={e.id} event={e} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- list (agenda) -----

function ListEventRow({ event }: { event: TeacherScheduleEvent }) {
  const t = useTranslations('teacherSchedule');
  const token = classColorTokens[event.color];
  return (
    <div className='hover:bg-muted/30 flex gap-3 px-4 py-3'>
      <div className='w-24 shrink-0 font-mono text-xs leading-tight tabular-nums'>
        {timeRange(event)}
      </div>
      <div className={cn('w-1 self-stretch rounded-full', token.swatch)} />
      <div className='min-w-0 flex-1'>
        <div className='text-sm leading-tight font-semibold'>
          <span className='mr-1 font-mono text-xs opacity-75'>{event.courseCode}</span>
          {event.title}
          <span className='text-muted-foreground'> · {event.classLabel}</span>
        </div>
        <div className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
          {event.isOnline ? (
            <Icons.video className='size-3' />
          ) : (
            <Icons.workspace className='size-3' />
          )}
          {event.location}
          {event.studentCount > 0 && ` · ${t('studentCount', { count: event.studentCount })}`}
        </div>
      </div>
      {event.isMakeup && (
        <span className='h-fit rounded-sm bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-amber-900 uppercase'>
          {t('makeupBadge')}
        </span>
      )}
    </div>
  );
}

function ScheduleList({ data }: { data: TeacherScheduleWeek }) {
  const t = useTranslations('teacherSchedule');
  const weekdaysLong = t.raw('weekdaysLong') as string[];

  const groups = data.days
    .map((day, idx) => ({
      day,
      idx,
      events: data.events
        .filter((e) => e.dayIndex === idx)
        .toSorted((a, b) => a.startMin - b.startMin)
    }))
    .filter((g) => g.events.length > 0);

  if (groups.length === 0) {
    return (
      <div className='bg-card text-muted-foreground rounded-lg border py-12 text-center text-sm shadow-sm'>
        {t('empty')}
      </div>
    );
  }

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      {groups.map(({ day, idx, events }) => (
        <div key={day.isoDate} className='border-b last:border-b-0'>
          <div className='bg-muted/40 flex items-baseline gap-2 px-4 py-2'>
            <span className='text-sm font-semibold'>{weekdaysLong[idx]}</span>
            <span className='text-muted-foreground font-mono text-xs'>{fmtDM(day.isoDate)}</span>
            {day.isToday && (
              <span className='bg-foreground text-background rounded-full px-1.5 py-0.5 text-[10px] font-medium'>
                {t('nav.today')}
              </span>
            )}
            <span className='text-muted-foreground ml-auto font-mono text-[11px]'>
              {t('sessionCount', { count: events.length })}
            </span>
          </div>
          <div className='divide-y'>
            {events.map((e) => (
              <ListEventRow key={e.id} event={e} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ----- summary card (week label + class chips) -----

function SummaryCard({
  data,
  view,
  focusedDay,
  focusedIdx,
  activeClassId,
  onPickClass
}: {
  data: TeacherScheduleWeek;
  view: TeacherScheduleViewMode;
  focusedDay?: TeacherScheduleDay;
  focusedIdx: number;
  activeClassId: string | null;
  onPickClass: (id: string | null) => void;
}) {
  const t = useTranslations('teacherSchedule');
  const weekdaysLong = t.raw('weekdaysLong') as string[];
  const { summary, classChips } = data;

  // Day view names the focused day; week / list show the week range. Keeping the
  // header in step with the body avoids the "week label on a single day" confusion.
  let mainLabel: string;
  let subLabel: string;
  if (view === 'day' && focusedDay) {
    const focusedDate = parseISO(focusedDay.isoDate);
    mainLabel = `${weekdaysLong[focusedIdx]}, ${fmtDM(focusedDay.isoDate)}`;
    subLabel = t('monthYear', {
      month: focusedDate.getMonth() + 1,
      year: focusedDate.getFullYear()
    });
    if (focusedDay.isToday) subLabel += ` · ${t('nav.today')}`;
  } else {
    const weekStartDate = parseISO(summary.weekStart);
    mainLabel = `${t('weekPrefix')} ${fmtDM(summary.weekStart)} — ${fmtDM(summary.weekEnd)}`;
    subLabel = t('monthYear', {
      month: weekStartDate.getMonth() + 1,
      year: weekStartDate.getFullYear()
    });
    if (summary.todayIso) {
      const todayDate = parseISO(summary.todayIso);
      const monIdx = (todayDate.getDay() + 6) % 7;
      subLabel += ` · ${weekdaysLong[monIdx]}, ${fmtDM(summary.todayIso)}`;
    }
  }

  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
        <div className='flex flex-wrap items-baseline gap-2 text-base font-semibold tracking-tight'>
          <span>{mainLabel}</span>
          <span className='text-muted-foreground font-mono text-xs'>{subLabel}</span>
        </div>

        {classChips.length > 0 && (
          <div className='ml-auto flex flex-wrap items-center gap-1.5'>
            <span className='text-muted-foreground mr-1 text-[11px] tracking-wider uppercase'>
              {t('classesLabel')}
            </span>
            <button
              type='button'
              onClick={() => onPickClass(null)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs hover:bg-accent',
                activeClassId == null && 'bg-accent font-medium'
              )}
            >
              {t('allClasses')}
            </button>
            {classChips.map((c: TeacherScheduleClassChip) => {
              const token = classColorTokens[c.color];
              const active = activeClassId === c.id;
              return (
                <button
                  key={c.id}
                  type='button'
                  onClick={() => onPickClass(active ? null : c.id)}
                  className={cn(
                    'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs hover:bg-accent',
                    active && 'bg-accent font-medium ring-1 ring-foreground/20'
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-sm', token.swatch)} />
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ----- exported pieces -----

export function TeacherScheduleHeaderAction() {
  const t = useTranslations('teacherSchedule');
  const [filters, setFilters] = useQueryStates(filterParsers);
  const view = resolveView(filters.view);
  const anchorDate = safeParseAnchor(filters.anchor);

  // Day view steps a single day; week / list step a whole week.
  const step = (dir: 1 | -1) => {
    const next =
      view === 'day'
        ? addDays(anchorDate, dir)
        : addDays(startOfWeek(anchorDate, { weekStartsOn: 1 }), dir * 7);
    void setFilters({ anchor: toIso(next) });
  };

  const prevAria = view === 'day' ? t('nav.prevDay') : t('nav.prevWeek');
  const nextAria = view === 'day' ? t('nav.nextDay') : t('nav.nextWeek');

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='bg-background inline-flex h-9 items-center overflow-hidden rounded-md border'>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 rounded-none border-r'
          onClick={() => step(-1)}
          aria-label={prevAria}
        >
          <Icons.chevronLeft className='size-3.5' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className='h-9 rounded-none px-3 text-xs'
          onClick={() => void setFilters({ anchor: null })}
        >
          {t('nav.today')}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 rounded-none border-l'
          onClick={() => step(1)}
          aria-label={nextAria}
        >
          <Icons.chevronRight className='size-3.5' />
        </Button>
      </div>

      <Tabs
        value={view}
        onValueChange={(next) => void setFilters({ view: next === 'week' ? null : next })}
      >
        <TabsList className='h-9'>
          <TabsTrigger value='week' className='h-7 px-3 text-xs'>
            {t('view.week')}
          </TabsTrigger>
          <TabsTrigger value='day' className='h-7 px-3 text-xs'>
            {t('view.day')}
          </TabsTrigger>
          <TabsTrigger value='list' className='h-7 px-3 text-xs'>
            {t('view.list')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export function TeacherScheduleView() {
  const t = useTranslations('teacherSchedule');
  const [filters, setFilters] = useQueryStates(filterParsers);
  const view = resolveView(filters.view);
  // useQuery (not useSuspenseQuery) so navigating week/day/class keeps the
  // previous data on screen (keepPreviousData) and surfaces a LoadingOverlay via
  // isFetching — instead of re-suspending to the page-level skeleton. The
  // skeleton only shows on the very first load, before any data exists.
  const { data, isFetching } = useQuery(
    teacherScheduleWeekOptions({
      anchor: filters.anchor ?? undefined,
      classId: filters.classId ?? undefined
    })
  );

  if (!data) return <TeacherScheduleViewSkeleton view={view} />;

  // In day view everything (stats + header + grid) is scoped to one day.
  const isDay = view === 'day';
  const focusedIdx = isDay ? focusedDayIndex(data, filters.anchor) : -1;
  const focusedDay = isDay ? data.days[focusedIdx] : undefined;
  const scopedEvents =
    isDay && focusedDay ? data.events.filter((e) => e.dayIndex === focusedIdx) : data.events;

  let body: React.ReactNode;
  if (view === 'list') {
    body = <ScheduleList data={data} />;
  } else if (isDay && focusedDay) {
    body = <ScheduleGrid data={data} columns={[{ day: focusedDay, idx: focusedIdx }]} />;
  } else {
    body = <ScheduleGrid data={data} columns={data.days.map((day, idx) => ({ day, idx }))} />;
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <ScheduleStats events={scopedEvents} scope={isDay ? 'day' : 'week'} />
      <SummaryCard
        data={data}
        view={view}
        focusedDay={focusedDay}
        focusedIdx={focusedIdx}
        activeClassId={filters.classId}
        onPickClass={(id) => void setFilters({ classId: id })}
      />
      <LoadingOverlay visible={isFetching} message={t('updating')}>
        {body}
      </LoadingOverlay>
    </div>
  );
}

// ----- skeleton (Suspense fallback) -----

function StatsSkeleton() {
  return (
    <div className='flex flex-wrap gap-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='bg-muted h-[58px] min-w-[140px] flex-1 animate-pulse rounded-md sm:flex-none'
        />
      ))}
    </div>
  );
}

function GridSkeleton({ dayColumns }: { dayColumns: number }) {
  const colTemplate = dayColumns === 1 ? 'grid-cols-[56px_1fr]' : 'grid-cols-[56px_repeat(7,1fr)]';
  const minWidth = dayColumns === 1 ? 'min-w-0' : 'min-w-[680px]';
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='overflow-x-auto'>
        <div className={minWidth}>
          <div className={cn('grid border-b', colTemplate)}>
            <div className='border-r' />
            {Array.from({ length: dayColumns }).map((_, i) => (
              <div key={i} className='border-r px-2 py-2 text-center last:border-r-0'>
                <div className='bg-muted mx-auto h-3 w-8 animate-pulse rounded' />
                <div className='bg-muted mx-auto mt-1 h-5 w-5 animate-pulse rounded-full' />
              </div>
            ))}
          </div>
          <div className={cn('grid', colTemplate)} style={{ height: GRID_HEIGHT }}>
            <div className='border-r' />
            {Array.from({ length: dayColumns }).map((_, dayIdx) => (
              <div
                key={dayIdx}
                className='relative border-r last:border-r-0'
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent 0 55px, hsl(var(--border)) 55px 56px)'
                }}
              >
                <div
                  className='bg-muted absolute right-1 left-1 h-12 animate-pulse rounded-md'
                  style={{ top: (dayIdx % 3) * 70 + 30 }}
                />
                {dayIdx % 2 === 0 && (
                  <div
                    className='bg-muted absolute right-1 left-1 h-16 animate-pulse rounded-md'
                    style={{ top: 220 + (dayIdx % 4) * 40 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className='border-b last:border-b-0'>
          <div className='bg-muted/40 px-4 py-2'>
            <div className='bg-muted h-4 w-32 animate-pulse rounded' />
          </div>
          <div className='divide-y'>
            {Array.from({ length: 2 }).map((_, r) => (
              <div key={r} className='flex gap-3 px-4 py-3'>
                <div className='bg-muted h-3 w-20 animate-pulse rounded' />
                <div className='flex-1 space-y-2'>
                  <div className='bg-muted h-3 w-1/2 animate-pulse rounded' />
                  <div className='bg-muted h-3 w-1/3 animate-pulse rounded' />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeacherScheduleViewSkeleton({ view = 'week' }: { view?: TeacherScheduleViewMode }) {
  return (
    <div className='flex flex-col gap-4'>
      <StatsSkeleton />
      <div className='bg-muted h-14 animate-pulse rounded-lg' />
      {view === 'list' ? <ListSkeleton /> : <GridSkeleton dayColumns={view === 'day' ? 1 : 7} />}
    </div>
  );
}
