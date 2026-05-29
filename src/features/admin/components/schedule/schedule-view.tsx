'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { addDays, addMonths, format, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  isScheduleView,
  scheduleFiltersOptions,
  scheduleMonthOptions,
  scheduleWeekOptions,
  type ScheduleEvent,
  type ScheduleMonth,
  type ScheduleOption,
  type ScheduleView as ScheduleViewMode,
  type ScheduleWeek
} from '@/api/schedule';
import { scheduleCategoryClass, scheduleCategoryDot } from '@/features/admin/data';
import { cn } from '@/lib/utils';

const HOUR_HEIGHT = 56;
const PX_PER_MIN = HOUR_HEIGHT / 60;
// 13:30 anchored to the 08:00 grid baseline; the now-line is a visual aid for
// "today" — the API doesn't drive its position yet.
const NOW_MINUTES = 330;

const scheduleHours = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];

// Legend tokens — category key + matching tailwind dot. The user-visible label
// comes from i18n at render time so the renderer needs only this list to stay
// in sync with the backend categories.
const legendItems = [
  { key: 'scratch', dot: scheduleCategoryDot.scratch },
  { key: 'python', dot: scheduleCategoryDot.python },
  { key: 'web', dot: scheduleCategoryDot.web },
  { key: 'robotics', dot: scheduleCategoryDot.robotics },
  { key: 'gameAi', dot: scheduleCategoryDot.game_ai }
] as const;

const ALL = '__all__';

// Shared by ScheduleView + ScheduleHeaderAction so the prev/next/today buttons,
// view tabs and date picker in the page header stay in sync with the calendar
// body via URL state.
const filterParsers = {
  view: parseAsString,
  anchor: parseAsString,
  teacherId: parseAsString,
  classId: parseAsString,
  location: parseAsString
};

const toIso = (date: Date) => format(date, 'yyyy-MM-dd');

function safeParseAnchor(value: string | null): Date {
  if (!value) return new Date();
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function resolveView(value: string | null): ScheduleViewMode {
  return isScheduleView(value) ? value : 'week';
}

type FilterChipProps = {
  label: string;
  allLabel: string;
  options: ScheduleOption[] | undefined;
  value: string | null;
  onChange: (id: string | null) => void;
};

function FilterChip({ label, allLabel, options, value, onChange }: FilterChipProps) {
  const selected = options?.find((opt) => opt.id === value);
  const displayValue = selected
    ? selected.label
    : options
      ? `${allLabel} (${options.length})`
      : allLabel;
  return (
    <div className='inline-flex items-center gap-1.5'>
      <span className='text-muted-foreground text-[11px] tracking-wider uppercase'>{label}:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-7 px-2.5 text-xs'>
            {displayValue}
            <Icons.chevronDown className='size-3' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='max-h-72 w-56 overflow-y-auto'>
          <DropdownMenuRadioGroup
            value={value ?? ALL}
            onValueChange={(next) => onChange(next === ALL ? null : next)}
          >
            <DropdownMenuRadioItem value={ALL}>{allLabel}</DropdownMenuRadioItem>
            {options?.map((opt) => (
              <DropdownMenuRadioItem key={opt.id} value={opt.id}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function NowLine() {
  const top = NOW_MINUTES * PX_PER_MIN;
  return (
    <div className='pointer-events-none absolute right-0 left-0 z-10' style={{ top }}>
      <div className='bg-destructive h-px' />
      <div className='bg-destructive ring-background absolute -top-1 -left-1 h-2 w-2 rounded-full ring-2' />
    </div>
  );
}

type GridViewProps = { data: ScheduleWeek; view: ScheduleViewMode };

// Renders both week (7 cols) and day (1 col) — the only differences are the
// column count derived from data.days.length and the time-column width.
function ScheduleGridView({ data, view }: GridViewProps) {
  const { days, events } = data;
  const colTemplate = view === 'day' ? 'grid-cols-[64px_1fr]' : 'grid-cols-[64px_repeat(7,1fr)]';

  return (
    <div className='bg-card flex min-h-0 flex-col overflow-hidden rounded-lg border shadow-sm'>
      <div className={cn('bg-background grid shrink-0 border-b', colTemplate)}>
        <div className='border-r' />
        {days.map((d) => (
          <div
            key={d.isoDate}
            className={cn(
              'border-r px-2 py-2 text-center last:border-r-0',
              d.isToday && 'bg-accent/40'
            )}
          >
            <div className='text-muted-foreground text-[10.5px] font-medium tracking-wider uppercase'>
              {d.short}
            </div>
            {d.isToday ? (
              <div className='bg-foreground text-background mx-auto mt-0.5 inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold tabular-nums'>
                {d.date}
              </div>
            ) : (
              <div className='mt-0.5 font-mono text-sm tabular-nums'>{d.date}</div>
            )}
          </div>
        ))}
      </div>

      <div className={cn('grid min-h-0', colTemplate)}>
        <div className='relative border-r'>
          {scheduleHours.map((h, i) => (
            <div
              key={h}
              className='text-muted-foreground absolute right-2 font-mono text-[10.5px] tabular-nums'
              style={{ top: i * HOUR_HEIGHT - 6 }}
            >
              {h}
            </div>
          ))}
          <div style={{ height: scheduleHours.length * HOUR_HEIGHT }} />
        </div>

        {days.map((d, dayIdx) => {
          const dayEvents = events.filter((e) => e.dayIndex === dayIdx);
          return (
            <div
              key={d.isoDate}
              className={cn('relative border-r last:border-r-0', d.isToday && 'bg-accent/20')}
              style={{
                height: scheduleHours.length * HOUR_HEIGHT,
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0 55px, hsl(var(--border)) 55px 56px)'
              }}
            >
              {d.isToday && <NowLine />}
              {dayEvents.map((e) => (
                <GridEvent key={e.id} event={e} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GridEvent({ event }: { event: ScheduleEvent }) {
  const top = event.startOffsetMin * PX_PER_MIN;
  const height = Math.max(event.durationMin * PX_PER_MIN - 4, 30);
  return (
    <div
      className={cn(
        'absolute right-1 left-1 overflow-hidden rounded-md border border-l-[3px] px-2 py-1.5',
        scheduleCategoryClass[event.category]
      )}
      style={{ top, height }}
    >
      {event.timeLabel && (
        <div className='font-mono text-[10px] leading-tight font-medium opacity-80'>
          {event.timeLabel}
        </div>
      )}
      <div className='mt-0.5 text-[11px] leading-tight font-semibold'>{event.title}</div>
      <div className='mt-0.5 font-mono text-[10px] leading-tight opacity-75'>{event.detail}</div>
    </div>
  );
}

function MonthGrid({
  data,
  onPickDate
}: {
  data: ScheduleMonth;
  onPickDate: (iso: string) => void;
}) {
  const t = useTranslations('schedule');
  const { weekdayHeaders, weeks } = data;
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='bg-background grid shrink-0 border-b grid-cols-7'>
        {weekdayHeaders.map((h) => (
          <div
            key={h}
            className='text-muted-foreground border-r px-2 py-2 text-center text-[10.5px] font-medium tracking-wider uppercase last:border-r-0'
          >
            {h}
          </div>
        ))}
      </div>
      <div className='grid auto-rows-[minmax(110px,_auto)] grid-cols-7'>
        {weeks.flatMap((week, wIdx) =>
          week.cells.map((cell, cIdx) => {
            const isLastCol = cIdx === 6;
            const isLastRow = wIdx === weeks.length - 1;
            return (
              <button
                key={cell.isoDate}
                type='button'
                onClick={() => onPickDate(cell.isoDate)}
                className={cn(
                  'group relative flex flex-col gap-1 border-r border-b p-2 text-left transition-colors',
                  isLastCol && 'border-r-0',
                  isLastRow && 'border-b-0',
                  !cell.inMonth && 'bg-muted/30 text-muted-foreground',
                  cell.isToday && 'bg-accent/20',
                  'hover:bg-accent/40'
                )}
              >
                <div className='flex items-center justify-between'>
                  {cell.isToday ? (
                    <span className='bg-foreground text-background inline-grid h-6 w-6 place-items-center rounded-full font-mono text-[11px] font-semibold tabular-nums'>
                      {cell.date}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'font-mono text-[11px] font-semibold tabular-nums',
                        !cell.inMonth && 'opacity-50'
                      )}
                    >
                      {cell.date}
                    </span>
                  )}
                  {cell.eventCount > 0 && (
                    <span className='text-muted-foreground font-mono text-[10px]'>
                      {cell.eventCount}
                    </span>
                  )}
                </div>
                <div className='flex flex-col gap-0.5'>
                  {cell.events.map((e) => (
                    <div
                      key={e.id}
                      className={cn(
                        'truncate rounded border border-l-[3px] px-1.5 py-0.5 text-[10px] font-medium',
                        scheduleCategoryClass[e.category]
                      )}
                      title={`${e.timeLabel ?? ''} ${e.title}`.trim()}
                    >
                      {e.timeLabel ? `${e.timeLabel.split(' — ')[0]} · ` : ''}
                      {e.title}
                    </div>
                  ))}
                  {cell.eventCount > cell.events.length && (
                    <div className='text-muted-foreground text-[10px]'>
                      {t('monthCell.more', { count: cell.eventCount - cell.events.length })}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function SummaryHeader({
  weekLabel,
  monthLabel,
  todayLabel,
  filterOptions,
  filters,
  onFilterChange
}: {
  weekLabel: string;
  monthLabel: string;
  todayLabel?: string;
  filterOptions:
    | { teachers: ScheduleOption[]; classes: ScheduleOption[]; locations: ScheduleOption[] }
    | undefined;
  filters: { teacherId: string | null; classId: string | null; location: string | null };
  onFilterChange: (
    patch: Partial<{ teacherId: string | null; classId: string | null; location: string | null }>
  ) => void;
}) {
  const t = useTranslations('schedule');
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
        <div className='flex items-baseline gap-2 text-base font-semibold tracking-tight'>
          <span>{weekLabel}</span>
          <span className='text-muted-foreground font-mono text-xs'>
            {monthLabel}
            {todayLabel ? ` · ${todayLabel}` : ''}
          </span>
        </div>
        <div className='ml-auto flex flex-wrap items-center gap-2'>
          <FilterChip
            label={t('filters.teacher')}
            allLabel={t('filters.allTeachers')}
            options={filterOptions?.teachers}
            value={filters.teacherId}
            onChange={(id) => onFilterChange({ teacherId: id })}
          />
          <FilterChip
            label={t('filters.class')}
            allLabel={t('filters.allClasses')}
            options={filterOptions?.classes}
            value={filters.classId}
            onChange={(id) => onFilterChange({ classId: id })}
          />
          <FilterChip
            label={t('filters.location')}
            allLabel={t('filters.all')}
            options={filterOptions?.locations}
            value={filters.location}
            onChange={(id) => onFilterChange({ location: id })}
          />
        </div>
      </div>
      <div className='bg-muted/30 flex flex-wrap items-center gap-4 px-4 py-2 text-xs'>
        <span className='text-muted-foreground text-[11px] tracking-wider uppercase'>
          {t('legend.label')}:
        </span>
        {legendItems.map((item) => (
          <span
            key={item.key}
            className='text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[11px]'
          >
            <span className={cn('h-2 w-2 rounded-sm', item.dot)} />
            {t(`legend.${item.key}` as const)}
          </span>
        ))}
      </div>
    </div>
  );
}

function FooterStats({
  totalSessions,
  totalTeachers,
  totalStudentHours,
  scopeLabel
}: {
  totalSessions: number;
  totalTeachers: number;
  totalStudentHours: number;
  scopeLabel: string;
}) {
  const t = useTranslations('schedule');
  return (
    <div className='bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-5 py-3 text-xs'>
      <div className='text-muted-foreground'>
        {scopeLabel} ·{' '}
        <span className='text-foreground font-mono'>
          {t('summary.sessions', { count: totalSessions })}
        </span>{' '}
        ·{' '}
        <span className='text-foreground font-mono'>
          {t('summary.teachers', { count: totalTeachers })}
        </span>{' '}
        ·{' '}
        <span className='text-foreground font-mono'>
          {t('summary.studentHours', { count: totalStudentHours })}
        </span>
      </div>
      <button
        type='button'
        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
      >
        {t('exportICal')}
        <Icons.arrowRight className='size-3' />
      </button>
    </div>
  );
}

export function ScheduleView() {
  const [filters, setFilters] = useQueryStates(filterParsers);
  const { data: filterOptions } = useQuery(scheduleFiltersOptions());
  const view = resolveView(filters.view);

  return view === 'month' ? (
    <MonthBody filters={filters} filterOptions={filterOptions} setFilters={setFilters} />
  ) : (
    <WeekOrDayBody
      filters={filters}
      filterOptions={filterOptions}
      setFilters={setFilters}
      view={view}
    />
  );
}

type Filters = ReturnType<typeof useQueryStates<typeof filterParsers>>[0];
type SetFilters = ReturnType<typeof useQueryStates<typeof filterParsers>>[1];
type FilterOptionsValue =
  | { teachers: ScheduleOption[]; classes: ScheduleOption[]; locations: ScheduleOption[] }
  | undefined;

function WeekOrDayBody({
  filters,
  filterOptions,
  setFilters,
  view
}: {
  filters: Filters;
  filterOptions: FilterOptionsValue;
  setFilters: SetFilters;
  view: ScheduleViewMode;
}) {
  const t = useTranslations('schedule');
  const { data: week, isFetching } = useSuspenseQuery(
    scheduleWeekOptions({
      view,
      anchor: filters.anchor ?? undefined,
      teacherId: filters.teacherId ?? undefined,
      classId: filters.classId ?? undefined,
      location: filters.location ?? undefined
    })
  );
  const scopeLabel = t(view === 'day' ? 'summary.scope.day' : 'summary.scope.week');

  return (
    <div className='space-y-4'>
      <SummaryHeader
        weekLabel={week.summary.weekLabel}
        monthLabel={week.summary.monthLabel}
        todayLabel={week.summary.todayLabel}
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={(patch) => void setFilters(patch)}
      />
      <LoadingOverlay visible={isFetching} message={t('updatingList')}>
        <ScheduleGridView data={week} view={view} />
      </LoadingOverlay>
      <FooterStats
        totalSessions={week.summary.totalSessions}
        totalTeachers={week.summary.totalTeachers}
        totalStudentHours={week.summary.totalStudentHours}
        scopeLabel={scopeLabel}
      />
    </div>
  );
}

function MonthBody({
  filters,
  filterOptions,
  setFilters
}: {
  filters: Filters;
  filterOptions: FilterOptionsValue;
  setFilters: SetFilters;
}) {
  const t = useTranslations('schedule');
  const { data: month, isFetching } = useSuspenseQuery(
    scheduleMonthOptions({
      anchor: filters.anchor ?? undefined,
      teacherId: filters.teacherId ?? undefined,
      classId: filters.classId ?? undefined,
      location: filters.location ?? undefined
    })
  );

  const drillIntoDay = (iso: string) => void setFilters({ view: 'day', anchor: iso });

  return (
    <div className='space-y-4'>
      <SummaryHeader
        weekLabel={month.summary.weekLabel}
        monthLabel={month.summary.monthLabel}
        todayLabel={month.summary.todayLabel}
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={(patch) => void setFilters(patch)}
      />
      <LoadingOverlay visible={isFetching} message={t('updatingList')}>
        <MonthGrid data={month} onPickDate={drillIntoDay} />
      </LoadingOverlay>
      <FooterStats
        totalSessions={month.summary.totalSessions}
        totalTeachers={month.summary.totalTeachers}
        totalStudentHours={month.summary.totalStudentHours}
        scopeLabel={t('summary.scope.month')}
      />
    </div>
  );
}

export function ScheduleHeaderAction() {
  const t = useTranslations('schedule');
  const [filters, setFilters] = useQueryStates(filterParsers);
  const view = resolveView(filters.view);
  const anchorDate = safeParseAnchor(filters.anchor);

  // Step semantics depend on view: ± 1 day for day, ± 7 days for week, ± 1 month for month.
  const step = (dir: 1 | -1) => {
    let next: Date;
    if (view === 'day') next = addDays(anchorDate, dir);
    else if (view === 'month') next = addMonths(anchorDate, dir);
    else next = addDays(startOfWeek(anchorDate, { weekStartsOn: 1 }), dir * 7);
    void setFilters({ anchor: toIso(next) });
  };

  const goToday = () => void setFilters({ anchor: null });
  const pickDate = (date: Date | undefined) => {
    if (!date) return;
    // Snap the anchor based on view so future navigation steps are clean.
    let snapped: Date;
    if (view === 'week') snapped = startOfWeek(date, { weekStartsOn: 1 });
    else if (view === 'month') snapped = startOfMonth(date);
    else snapped = date;
    void setFilters({ anchor: toIso(snapped) });
  };

  const datePickerLabel = format(
    view === 'month' ? startOfMonth(anchorDate) : anchorDate,
    view === 'month' ? 'LLLL yyyy' : 'd LLL yyyy'
  );

  const prevAria =
    view === 'month' ? t('nav.prevMonth') : view === 'day' ? t('nav.prevDay') : t('nav.prevWeek');
  const nextAria =
    view === 'month' ? t('nav.nextMonth') : view === 'day' ? t('nav.nextDay') : t('nav.nextWeek');

  return (
    // flex-wrap so 3 groups (tabs / nav / date picker) drop to extra rows on
    // <md instead of being clipped off-viewport. The PageContainer header row
    // already stacks title and actions vertically on mobile, so taking 2-3
    // rows here is fine — the visible alternative was losing prev/next entirely.
    <div className='flex flex-wrap items-center gap-2'>
      <Tabs
        value={view}
        onValueChange={(next) => void setFilters({ view: isScheduleView(next) ? next : null })}
      >
        <TabsList className='h-9'>
          <TabsTrigger value='day' className='h-7 px-3 text-sm'>
            {t('view.day')}
          </TabsTrigger>
          <TabsTrigger value='week' className='h-7 px-3 text-sm'>
            {t('view.week')}
          </TabsTrigger>
          <TabsTrigger value='month' className='h-7 px-3 text-sm'>
            {t('view.month')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
        <Button variant='ghost' size='sm' className='h-9 rounded-none px-3' onClick={goToday}>
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='h-9 gap-2'>
            {datePickerLabel}
            <Icons.chevronDown className='size-3' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='end'>
          <Calendar
            mode='single'
            selected={anchorDate}
            defaultMonth={anchorDate}
            onSelect={pickDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
