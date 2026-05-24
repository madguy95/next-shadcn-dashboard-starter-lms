'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  scheduleCategoryClass,
  scheduleCategoryDot,
  scheduleDays,
  scheduleEvents,
  scheduleHours
} from '@/features/admin/data';

const HOUR_HEIGHT = 56;
const PX_PER_MIN = HOUR_HEIGHT / 60;
const NOW_MINUTES = 330; // 13:30 from 08:00 baseline

const legend = [
  { label: 'Scratch', dot: scheduleCategoryDot.scratch },
  { label: 'Python', dot: scheduleCategoryDot.python },
  { label: 'Web', dot: scheduleCategoryDot.web },
  { label: 'Robotics', dot: scheduleCategoryDot.robotics },
  { label: 'Game / AI', dot: scheduleCategoryDot.game_ai }
];

function FilterChip({ label, value }: { label: string; value: string }) {
  return (
    <div className='inline-flex items-center gap-1.5'>
      <span className='text-muted-foreground text-[11px] tracking-wider uppercase'>{label}:</span>
      <Button variant='outline' size='sm' className='h-7 px-2.5 text-xs'>
        {value}
        <Icons.chevronDown className='size-3' />
      </Button>
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

export function ScheduleView() {
  return (
    <div className='space-y-4'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
          <div className='flex items-baseline gap-2 text-base font-semibold tracking-tight'>
            <span>Week May 18 — 24</span>
            <span className='text-muted-foreground font-mono text-xs'>May 2026 · Sat (today)</span>
          </div>
          <div className='ml-auto flex flex-wrap items-center gap-2'>
            <FilterChip label='Teacher' value='All teachers (24)' />
            <FilterChip label='Class' value='All classes' />
            <FilterChip label='Location' value='All' />
          </div>
        </div>
        <div className='bg-muted/30 flex flex-wrap items-center gap-4 px-4 py-2 text-xs'>
          <span className='text-muted-foreground text-[11px] tracking-wider uppercase'>
            Legend:
          </span>
          {legend.map((l) => (
            <span
              key={l.label}
              className='text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[11px]'
            >
              <span className={cn('h-2 w-2 rounded-sm', l.dot)} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className='bg-card flex min-h-0 flex-col overflow-hidden rounded-lg border shadow-sm'>
        <div className='bg-background grid shrink-0 border-b grid-cols-[64px_repeat(7,1fr)]'>
          <div className='border-r' />
          {scheduleDays.map((d) => (
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
                <div className='bg-foreground text-background mx-auto mt-0.5 inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold tabular-nums'>
                  {d.date}
                </div>
              ) : (
                <div className='mt-0.5 font-mono text-sm tabular-nums'>{d.date}</div>
              )}
            </div>
          ))}
        </div>

        <div className='grid min-h-0 grid-cols-[64px_repeat(7,1fr)]'>
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

          {scheduleDays.map((d, dayIdx) => {
            const dayEvents = scheduleEvents.filter((e) => e.dayIndex === dayIdx);
            return (
              <div
                key={d.short}
                className={cn('relative border-r last:border-r-0', d.isToday && 'bg-accent/20')}
                style={{
                  height: scheduleHours.length * HOUR_HEIGHT,
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent 0 55px, hsl(var(--border)) 55px 56px)'
                }}
              >
                {d.isToday && <NowLine />}
                {dayEvents.map((e) => {
                  const top = e.startOffsetMin * PX_PER_MIN;
                  const height = Math.max(e.durationMin * PX_PER_MIN - 4, 30);
                  return (
                    <div
                      key={e.id}
                      className={cn(
                        'absolute right-1 left-1 overflow-hidden rounded-md border border-l-[3px] px-2 py-1.5',
                        scheduleCategoryClass[e.category]
                      )}
                      style={{ top, height }}
                    >
                      {e.timeLabel && (
                        <div className='font-mono text-[10px] leading-tight font-medium opacity-80'>
                          {e.timeLabel}
                        </div>
                      )}
                      <div className='mt-0.5 text-[11px] leading-tight font-semibold'>
                        {e.title}
                      </div>
                      <div className='mt-0.5 font-mono text-[10px] leading-tight opacity-75'>
                        {e.detail}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className='bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs'>
          <div className='text-muted-foreground'>
            This week ·{' '}
            <span className='text-foreground font-mono'>{scheduleEvents.length} sessions</span> ·{' '}
            <span className='text-foreground font-mono'>8 teachers</span> ·{' '}
            <span className='text-foreground font-mono'>216 student-hours</span>
          </div>
          <button
            type='button'
            className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
          >
            Export iCal
            <Icons.arrowRight className='size-3' />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScheduleHeaderAction() {
  return (
    <div className='flex items-center gap-2'>
      <Tabs defaultValue='week'>
        <TabsList className='h-9'>
          <TabsTrigger value='day' className='h-7 px-3 text-sm'>
            Day
          </TabsTrigger>
          <TabsTrigger value='week' className='h-7 px-3 text-sm'>
            Week
          </TabsTrigger>
          <TabsTrigger value='month' className='h-7 px-3 text-sm'>
            Month
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className='bg-background inline-flex h-9 items-center overflow-hidden rounded-md border'>
        <Button variant='ghost' size='icon' className='h-9 w-9 rounded-none border-r'>
          <Icons.chevronLeft className='size-3.5' />
        </Button>
        <Button variant='ghost' size='sm' className='h-9 rounded-none px-3'>
          Today
        </Button>
        <Button variant='ghost' size='icon' className='h-9 w-9 rounded-none border-l'>
          <Icons.chevronRight className='size-3.5' />
        </Button>
      </div>
      <Button size='sm' className='h-9'>
        <Icons.add className='size-3.5' />
        New session
      </Button>
    </div>
  );
}
