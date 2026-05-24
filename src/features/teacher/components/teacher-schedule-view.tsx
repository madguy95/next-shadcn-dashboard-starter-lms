'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  classColorTokens,
  teacherClassFilterChips,
  teacherScheduleDays,
  teacherScheduleEvents,
  teacherScheduleHours,
  type ScheduleEvent
} from '@/features/teacher/data';

const HOUR_HEIGHT = 56;
const PX_PER_MIN = HOUR_HEIGHT / 60;
const START_HOUR = 8;

const fmt = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

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
        'min-w-[140px] rounded-md border px-3 py-2',
        tone === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'bg-muted/40'
      )}
    >
      <div className='text-[10px] font-medium tracking-wider opacity-70 uppercase'>{label}</div>
      <div className='text-lg leading-tight font-semibold'>{value}</div>
      <div className='font-mono text-[10.5px] opacity-70'>{helper}</div>
    </div>
  );
}

export function TeacherScheduleStats() {
  return (
    <div className='flex flex-wrap gap-3'>
      <StatCard label='Buổi tuần này' value='9' helper='11 giờ dạy' />
      <StatCard label='Online' value='3' helper='/9 buổi' />
      <StatCard label='Buổi học bù' value='2' helper='ngoài định kỳ' tone='amber' />
    </div>
  );
}

function EventBlock({ event }: { event: ScheduleEvent }) {
  const startOffsetMin = event.startMin - START_HOUR * 60;
  const top = startOffsetMin * PX_PER_MIN;
  const height = event.durationMin * PX_PER_MIN;
  const token = classColorTokens[event.color];

  const startH = Math.floor(event.startMin / 60);
  const startM = event.startMin % 60;
  const endTotal = event.startMin + event.durationMin;
  const endH = Math.floor(endTotal / 60);
  const endM = endTotal % 60;

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
      <div className='font-mono leading-tight font-medium tabular-nums'>
        {fmt(startH, startM)}–{fmt(endH, endM)}
      </div>
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
        {event.studentCount > 0 && ` · ${event.studentCount} hs`}
      </div>
      {event.isMakeup && (
        <span className='absolute top-1 right-1 rounded-sm bg-amber-200 px-1 py-0.5 text-[9px] font-medium tracking-wider text-amber-900 uppercase'>
          Học bù
        </span>
      )}
    </button>
  );
}

function NowLine() {
  // 11:25 — minutes from 08:00
  const minutes = 11 * 60 + 25 - START_HOUR * 60;
  const top = minutes * PX_PER_MIN;
  return (
    <div className='pointer-events-none absolute right-0 left-0 z-10' style={{ top }}>
      <div className='bg-destructive h-px' />
      <div className='bg-destructive ring-background absolute -top-1 -left-1 h-2 w-2 rounded-full ring-2' />
    </div>
  );
}

export function TeacherScheduleHeaderAction() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='inline-flex h-9 items-center rounded-md border bg-background p-0.5'>
        <Button variant='outline' size='sm' className='h-7 px-3 text-xs'>
          Hôm nay
        </Button>
        <div className='ml-1 flex'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-r-none border-r'
            aria-label='Tuần trước'
          >
            <Icons.chevronLeft className='size-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-l-none'
            aria-label='Tuần sau'
          >
            <Icons.chevronRight className='size-3.5' />
          </Button>
        </div>
      </div>
      <Tabs defaultValue='week'>
        <TabsList className='h-9'>
          <TabsTrigger value='week' className='h-7 px-3 text-xs'>
            Tuần
          </TabsTrigger>
          <TabsTrigger value='day' className='h-7 px-3 text-xs'>
            Ngày
          </TabsTrigger>
          <TabsTrigger value='list' className='h-7 px-3 text-xs'>
            Danh sách
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Button variant='outline' size='sm' className='h-9 px-3 text-xs'>
        <Icons.upload className='size-3 rotate-180' />
        .ics
      </Button>
      <Button size='sm' className='h-9 px-3 text-xs'>
        <Icons.calendar className='size-3' />
        Đăng ký dạy thay
      </Button>
    </div>
  );
}

export function TeacherScheduleView() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
          <div className='flex items-baseline gap-2 text-base font-semibold tracking-tight'>
            <span>Tuần 19/05 — 25/05</span>
            <span className='text-muted-foreground font-mono text-xs'>
              Tháng 5, 2026 · Thứ Hai, 19/05
            </span>
          </div>

          <div className='ml-auto flex flex-wrap items-center gap-1.5'>
            <span className='text-muted-foreground mr-1 text-[11px] tracking-wider uppercase'>
              Lớp:
            </span>
            {teacherClassFilterChips.map((c) => {
              const token = classColorTokens[c.color];
              return (
                <button
                  key={c.label}
                  type='button'
                  className='inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs hover:bg-accent'
                >
                  <span className={cn('h-2 w-2 rounded-sm', token.swatch)} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className='bg-card flex min-h-0 flex-col overflow-hidden rounded-lg border shadow-sm'>
        <div className='bg-background grid shrink-0 border-b grid-cols-[64px_repeat(7,1fr)]'>
          <div className='border-r' />
          {teacherScheduleDays.map((d) => (
            <div
              key={d.short}
              className={cn(
                'border-r px-2 py-2 text-center last:border-r-0',
                d.isToday && 'bg-accent/40'
              )}
            >
              <div className='text-muted-foreground text-[10.5px] font-medium tracking-wider uppercase'>
                {d.short}
              </div>
              {d.isToday ? (
                <div className='bg-foreground text-background mx-auto mt-0.5 inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold'>
                  {d.date.split('/')[0]}
                </div>
              ) : (
                <div className='mt-0.5 font-mono text-sm'>{d.date}</div>
              )}
            </div>
          ))}
        </div>

        <div className='grid min-h-0 grid-cols-[64px_repeat(7,1fr)]'>
          <div className='relative border-r'>
            {teacherScheduleHours.map((h, i) => (
              <div
                key={h}
                className='text-muted-foreground absolute right-2 font-mono text-[10.5px] tabular-nums'
                style={{ top: i * HOUR_HEIGHT - 6 }}
              >
                {h}
              </div>
            ))}
            <div style={{ height: teacherScheduleHours.length * HOUR_HEIGHT }} />
          </div>

          {teacherScheduleDays.map((day, dayIdx) => {
            const dayEvents = teacherScheduleEvents.filter((e) => e.dayIndex === dayIdx);
            return (
              <div
                key={day.short}
                className={cn('relative border-r last:border-r-0', day.isToday && 'bg-accent/20')}
                style={{
                  height: teacherScheduleHours.length * HOUR_HEIGHT,
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent 0 55px, hsl(var(--border)) 55px 56px)'
                }}
              >
                {day.isToday && <NowLine />}
                {dayEvents.map((e) => (
                  <EventBlock key={e.id} event={e} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
