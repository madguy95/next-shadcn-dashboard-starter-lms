'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatScheduleTime,
  parentChildren,
  parentEventTypeLabel,
  parentScheduleDays,
  parentScheduleEvents,
  type ParentChild,
  type ParentScheduleEvent
} from '@/features/parent/data';
import { EventDetailSheet } from './event-detail-sheet';

const BASE_HOUR = 8;
const END_HOUR = 21.5;
const HOUR_HEIGHT = 56;

const HOURS: number[] = (() => {
  const arr: number[] = [];
  for (let h = BASE_HOUR; h < END_HOUR; h++) arr.push(h);
  return arr;
})();

const NOW_HOUR = 11 + 25 / 60;

function ChildChip({
  child,
  on,
  onClick
}: {
  child: ParentChild;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border pr-2.5 pl-1 text-xs transition-colors',
        on ? 'border-foreground/15 bg-background' : 'bg-muted/30 border-dashed opacity-40'
      )}
      style={{
        boxShadow: on ? `inset 0 0 0 2px hsl(${child.hue} 55% 80%)` : 'none'
      }}
    >
      <span
        className='grid place-items-center rounded-full border text-[9px] font-semibold text-white'
        style={{
          width: 18,
          height: 18,
          background: `linear-gradient(135deg, hsl(${child.hue} 65% 65%), hsl(${child.hue} 60% 45%))`,
          borderColor: `hsl(${child.hue} 30% 75% / .6)`
        }}
      >
        {child.initials}
      </span>
      <span className='font-medium'>{child.name.split(' ').slice(-1)[0]}</span>
    </button>
  );
}

function EventBlock({ event, onClick }: { event: ParentScheduleEvent; onClick: () => void }) {
  const top = (event.startHour - BASE_HOUR) * HOUR_HEIGHT;
  const height = Math.max((event.endHour - event.startHour) * HOUR_HEIGHT - 4, 30);
  const child =
    event.childId === 'family' ? null : parentChildren.find((c) => c.id === event.childId);
  const hue = child ? child.hue : 210;
  const cancelled = event.type === 'cancelled';
  const dashed = event.type === 'trial' || event.type === 'makeup';

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'focus-visible:ring-ring absolute right-1 left-1 block overflow-hidden rounded-md border-y border-r px-2 py-1.5 text-left text-[11px] transition-shadow hover:z-10 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
        cancelled && 'line-through opacity-65'
      )}
      style={{
        top,
        height,
        background: cancelled
          ? 'hsl(0 0% 96%)'
          : `linear-gradient(180deg, hsl(${hue} 60% 96%), hsl(${hue} 55% 92%))`,
        borderLeft: `3px solid ${cancelled ? 'hsl(0 0% 70%)' : `hsl(${hue} 55% 45%)`}`,
        borderRightStyle: dashed ? 'dashed' : 'solid',
        borderTopStyle: dashed ? 'dashed' : 'solid',
        borderBottomStyle: dashed ? 'dashed' : 'solid',
        borderColor: `hsl(${hue} 30% 80% / .8)`
      }}
    >
      <div
        className='font-mono leading-tight font-medium tabular-nums'
        style={{ color: cancelled ? 'hsl(0 0% 50%)' : `hsl(${hue} 55% 45%)` }}
      >
        {formatScheduleTime(event.startHour)}–{formatScheduleTime(event.endHour)}
      </div>
      <div className='mt-0.5 leading-tight font-semibold' style={{ color: `hsl(${hue} 40% 25%)` }}>
        <span className='mr-1 font-mono opacity-75'>{event.code}</span>
        <span className='line-clamp-2'>{event.name}</span>
      </div>
      <div className='text-foreground/70 mt-1 flex items-center gap-1 text-[10px]'>
        {event.mode === 'Online' ? (
          <Icons.video className='size-2.5' />
        ) : (
          <Icons.workspace className='size-2.5' />
        )}
        <span className='truncate'>
          {event.classId} · {event.teacher}
        </span>
      </div>
      {event.type !== 'regular' && event.type !== 'cancelled' && (
        <span
          className='absolute top-1 right-1 rounded-sm border px-1 py-0.5 text-[9px] font-medium tracking-wider uppercase'
          style={{
            background:
              event.type === 'trial'
                ? 'hsl(142 64% 90%)'
                : event.type === 'makeup'
                  ? 'hsl(38 92% 90%)'
                  : event.type === 'workshop'
                    ? 'hsl(266 64% 92%)'
                    : 'hsl(210 64% 92%)',
            color:
              event.type === 'trial'
                ? 'hsl(142 60% 25%)'
                : event.type === 'makeup'
                  ? 'hsl(26 80% 30%)'
                  : event.type === 'workshop'
                    ? 'hsl(266 50% 32%)'
                    : 'hsl(210 60% 28%)',
            borderColor: 'transparent'
          }}
        >
          {parentEventTypeLabel[event.type]}
        </span>
      )}
    </button>
  );
}

function NowLine() {
  if (NOW_HOUR < BASE_HOUR || NOW_HOUR >= END_HOUR) return null;
  return (
    <div
      className='pointer-events-none absolute right-0 left-0 z-10'
      style={{ top: (NOW_HOUR - BASE_HOUR) * HOUR_HEIGHT }}
    >
      <div className='bg-destructive h-px' />
      <div className='bg-destructive ring-background absolute -top-1 -left-1 h-2 w-2 rounded-full ring-2' />
    </div>
  );
}

function NextEventInner({ ev }: { ev: ParentScheduleEvent }) {
  const child = ev.childId === 'family' ? null : parentChildren.find((c) => c.id === ev.childId);
  const hue = child ? child.hue : 210;
  return (
    <div className='flex items-start gap-3'>
      <div
        className='grid shrink-0 place-items-center rounded-md'
        style={{
          background: `hsl(${hue} 55% 92%)`,
          color: `hsl(${hue} 45% 30%)`,
          width: 48,
          height: 48
        }}
      >
        <Icons.clock className='size-5' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
          Lớp gần nhất
        </div>
        <div className='font-semibold tracking-tight'>{ev.name}</div>
        <div className='text-muted-foreground mt-0.5 font-mono text-xs'>
          {formatScheduleTime(ev.startHour)} · {ev.classId} · {ev.teacher}
        </div>
        <div className='mt-2 flex items-center gap-2'>
          {child && (
            <span className='inline-flex items-center gap-1 text-xs'>
              <span
                className='grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold text-white'
                style={{
                  background: `linear-gradient(135deg, hsl(${child.hue} 65% 65%), hsl(${child.hue} 60% 45%))`
                }}
              >
                {child.initials}
              </span>
              {child.name}
            </span>
          )}
          <span className='text-foreground ml-auto inline-flex items-center gap-1 text-xs font-medium'>
            {ev.mode === 'Online' ? (
              <Icons.video className='size-3' />
            ) : (
              <Icons.workspace className='size-3' />
            )}
            {ev.mode === 'Online' ? 'Vào Zoom' : 'Chỉ đường'}
          </span>
        </div>
      </div>
    </div>
  );
}

function SidePanel({
  events,
  onEventClick
}: {
  events: ParentScheduleEvent[];
  onEventClick: (e: ParentScheduleEvent) => void;
}) {
  const todayEvents = events
    .filter((e) => e.dayIndex === 0)
    .toSorted((a, b) => a.startHour - b.startHour);
  const nextEvent =
    events.find((e) => e.dayIndex === 0 && e.startHour > NOW_HOUR) ??
    events.find((e) => e.dayIndex > 0);

  return (
    <aside className='space-y-4 xl:sticky xl:top-[72px]'>
      {nextEvent && (
        <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
          <div className='flex items-baseline justify-between border-b px-4 py-3'>
            <h3 className='text-sm font-semibold tracking-tight'>Tiếp theo</h3>
            <span className='text-muted-foreground font-mono text-[11px]'>trong hôm nay</span>
          </div>
          <button
            type='button'
            onClick={() => onEventClick(nextEvent)}
            className='hover:bg-muted/40 w-full p-4 text-left transition-colors'
          >
            <NextEventInner ev={nextEvent} />
          </button>
        </div>
      )}

      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-baseline justify-between border-b px-4 py-3'>
          <h3 className='inline-flex items-center gap-2 text-sm font-semibold tracking-tight'>
            <Icons.calendar className='size-3.5' /> Hôm nay · T2 19/05
          </h3>
          <span className='bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 font-mono text-[11px]'>
            {todayEvents.length} buổi
          </span>
        </div>
        {todayEvents.length === 0 ? (
          <div className='text-muted-foreground p-6 text-center text-sm'>
            Hôm nay không có lịch học 🎉
          </div>
        ) : (
          <ol className='divide-y'>
            {todayEvents.map((ev) => {
              const child =
                ev.childId === 'family' ? null : parentChildren.find((c) => c.id === ev.childId);
              const hue = child ? child.hue : 210;
              return (
                <li key={ev.id}>
                  <button
                    type='button'
                    onClick={() => onEventClick(ev)}
                    className={cn(
                      'hover:bg-muted/40 flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                      ev.type === 'cancelled' && 'opacity-60'
                    )}
                  >
                    <div
                      className='w-12 shrink-0 pt-0.5 font-mono text-xs tabular-nums'
                      style={{ color: `hsl(${hue} 45% 35%)` }}
                    >
                      {formatScheduleTime(ev.startHour)}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div
                        className={cn(
                          'text-sm font-medium',
                          ev.type === 'cancelled' && 'line-through'
                        )}
                      >
                        {ev.name}
                      </div>
                      <div className='text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs'>
                        {child && (
                          <span
                            className='grid h-3.5 w-3.5 place-items-center rounded-full text-[8px] font-semibold text-white'
                            style={{
                              background: `linear-gradient(135deg, hsl(${child.hue} 65% 65%), hsl(${child.hue} 60% 45%))`
                            }}
                          >
                            {child.initials}
                          </span>
                        )}
                        <span className='font-mono'>{ev.classId}</span>
                        <span>·</span>
                        <span className='inline-flex items-center gap-1'>
                          {ev.mode === 'Online' ? (
                            <Icons.video className='size-2.5' />
                          ) : (
                            <Icons.workspace className='size-2.5' />
                          )}
                          {ev.mode}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
}

function StatPill({
  label,
  value,
  sub,
  tone = 'neutral'
}: {
  label: string;
  value: string | number;
  sub: string;
  tone?: 'neutral' | 'amber' | 'red' | 'muted';
}) {
  const tones = {
    neutral: 'bg-muted/40 border-border',
    amber: 'bg-amber-50 border-amber-100 text-amber-900',
    red: 'bg-rose-50 border-rose-100 text-rose-900',
    muted: 'bg-muted/30 border-border text-muted-foreground'
  } as const;
  return (
    <div className={cn('min-w-[110px] rounded-md border px-3 py-2', tones[tone])}>
      <div className='text-[10px] font-medium tracking-wider opacity-70 uppercase'>{label}</div>
      <div className='text-lg leading-tight font-semibold tabular-nums'>{value}</div>
      <div className='font-mono text-[10.5px] opacity-70'>{sub}</div>
    </div>
  );
}

export function ParentScheduleStats() {
  const total = parentScheduleEvents.filter((e) => e.type !== 'cancelled').length;
  const online = parentScheduleEvents.filter(
    (e) => e.mode === 'Online' && e.type !== 'cancelled'
  ).length;
  const makeup = parentScheduleEvents.filter(
    (e) => e.type === 'makeup' || e.type === 'trial'
  ).length;
  const cancelled = parentScheduleEvents.filter((e) => e.type === 'cancelled').length;

  return (
    <div className='flex flex-wrap gap-3'>
      <StatPill label='Buổi tuần này' value={total} sub='đang diễn ra' />
      <StatPill label='Online' value={online} sub={`/${total} buổi`} />
      <StatPill label='Học bù / thử' value={makeup} sub='ngoài định kỳ' tone='amber' />
      <StatPill
        label='Đã hủy'
        value={cancelled}
        sub='trong tuần'
        tone={cancelled ? 'red' : 'muted'}
      />
    </div>
  );
}

export function ParentScheduleHeaderAction() {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='bg-background inline-flex h-9 items-center overflow-hidden rounded-md border'>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 rounded-none border-r'
          aria-label='Tuần trước'
        >
          <Icons.chevronLeft className='size-3.5' />
        </Button>
        <Button variant='ghost' size='sm' className='h-9 rounded-none px-3'>
          Hôm nay
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 rounded-none border-l'
          aria-label='Tuần sau'
        >
          <Icons.chevronRight className='size-3.5' />
        </Button>
      </div>
      <Button variant='outline' size='sm' className='h-9 px-3 text-xs'>
        <Icons.upload className='size-3 rotate-180' />
        .ics
      </Button>
      <Button size='sm' className='h-9'>
        <Icons.add className='size-3.5' />
        Thêm sự kiện
      </Button>
    </div>
  );
}

export function ParentScheduleView() {
  const [visibleChildren, setVisibleChildren] = useState<Set<string>>(
    () => new Set(parentChildren.map((c) => c.id))
  );
  const [selectedEvent, setSelectedEvent] = useState<ParentScheduleEvent | null>(null);

  const toggleChild = (id: string) =>
    setVisibleChildren((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const filteredEvents = parentScheduleEvents.filter(
    (e) => e.childId === 'family' || visibleChildren.has(e.childId)
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
          <div className='flex items-baseline gap-2 text-base font-semibold tracking-tight'>
            <span>Tuần 19/05 — 25/05</span>
            <span className='text-muted-foreground font-mono text-xs'>
              Tháng 5, 2026 · Thứ Hai, 19/05/2026
            </span>
          </div>

          <div className='ml-auto flex flex-wrap items-center gap-1.5'>
            <span className='text-muted-foreground mr-1 text-[11px] tracking-wider uppercase'>
              Con:
            </span>
            {parentChildren.map((c) => (
              <ChildChip
                key={c.id}
                child={c}
                on={visibleChildren.has(c.id)}
                onClick={() => toggleChild(c.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_340px]'>
        <div className='bg-card flex min-w-0 flex-col overflow-hidden rounded-lg border shadow-sm'>
          <div className='bg-background grid shrink-0 border-b grid-cols-[64px_repeat(7,1fr)]'>
            <div className='border-r' />
            {parentScheduleDays.map((d) => (
              <div
                key={d.idx}
                className={cn(
                  'border-r px-2 py-2 text-center last:border-r-0',
                  d.isToday && 'bg-accent/40'
                )}
              >
                <div className='text-muted-foreground text-[10.5px] font-medium tracking-wider uppercase'>
                  {d.day}
                </div>
                {d.isToday ? (
                  <div className='bg-foreground text-background mx-auto mt-0.5 inline-grid h-6 w-6 place-items-center rounded-full text-xs font-semibold tabular-nums'>
                    {d.date.split('/')[0]}
                  </div>
                ) : (
                  <div className='mt-0.5 font-mono text-sm tabular-nums'>{d.date}</div>
                )}
              </div>
            ))}
          </div>

          <div className='grid min-h-0 grid-cols-[64px_repeat(7,1fr)]'>
            <div className='relative border-r'>
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className='text-muted-foreground absolute right-2 font-mono text-[10.5px] tabular-nums'
                  style={{ top: i * HOUR_HEIGHT - 6 }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
              <div style={{ height: HOURS.length * HOUR_HEIGHT }} />
            </div>

            {parentScheduleDays.map((d) => {
              const dayEvents = filteredEvents.filter((e) => e.dayIndex === d.idx);
              return (
                <div
                  key={d.idx}
                  className={cn('relative border-r last:border-r-0', d.isToday && 'bg-accent/20')}
                  style={{
                    height: HOURS.length * HOUR_HEIGHT,
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, transparent 0 55px, hsl(var(--border)) 55px 56px)'
                  }}
                >
                  {d.isToday && <NowLine />}
                  {dayEvents.map((ev) => (
                    <EventBlock key={ev.id} event={ev} onClick={() => setSelectedEvent(ev)} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <SidePanel events={filteredEvents} onEventClick={setSelectedEvent} />
      </div>

      <EventDetailSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(o) => !o && setSelectedEvent(null)}
      />
    </div>
  );
}
