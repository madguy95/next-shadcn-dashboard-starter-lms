'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  formatScheduleTime,
  parentChildren,
  parentEventTypeLabel,
  parentScheduleDays,
  type ParentScheduleEvent
} from '@/features/parent/data';

export function EventDetailSheet({
  event,
  open,
  onOpenChange
}: {
  event: ParentScheduleEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!event) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side='right' className='sm:max-w-md'>
          <SheetTitle className='sr-only'>Chi tiết buổi học</SheetTitle>
        </SheetContent>
      </Sheet>
    );
  }
  const child =
    event.childId === 'family' ? null : parentChildren.find((c) => c.id === event.childId);
  const hue = child ? child.hue : 210;
  const day = parentScheduleDays.find((d) => d.idx === event.dayIndex);
  const cancelled = event.type === 'cancelled';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full max-w-full flex-col gap-0 p-0 sm:max-w-[440px]'
      >
        <SheetTitle className='sr-only'>{event.name}</SheetTitle>
        <SheetDescription className='sr-only'>
          {day?.day} {day?.date} · {formatScheduleTime(event.startHour)}
        </SheetDescription>

        <div
          className='relative h-24 shrink-0'
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, hsl(0 0% 100% / .15) 0 10px, transparent 10px 20px), linear-gradient(135deg, hsl(${hue} 60% 88%), hsl(${hue} 55% 70%))`
          }}
        />
        <div className='-mt-7 flex-1 overflow-auto px-5 pb-5'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className='font-mono text-[11px]'>
              {event.code}
            </Badge>
            {event.type !== 'regular' && (
              <Badge variant='outline' className='text-[10.5px]'>
                {parentEventTypeLabel[event.type]}
              </Badge>
            )}
          </div>
          <h2
            className={cn('mt-2 text-xl font-semibold tracking-tight', cancelled && 'line-through')}
          >
            {event.name}
          </h2>
          <p className='text-muted-foreground mt-1 font-mono text-sm'>
            {day?.day} · {day?.date}/2026 · {formatScheduleTime(event.startHour)}–
            {formatScheduleTime(event.endHour)}
          </p>

          <dl className='mt-5 space-y-3 text-sm'>
            {child && (
              <Row label='Học sinh'>
                <div className='flex items-center gap-2'>
                  <span
                    className='grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-white'
                    style={{
                      background: `linear-gradient(135deg, hsl(${child.hue} 65% 65%), hsl(${child.hue} 60% 45%))`
                    }}
                  >
                    {child.initials}
                  </span>
                  <span className='font-medium'>{child.name}</span>
                </div>
              </Row>
            )}
            <Row label='Lớp'>
              <span className='font-mono text-xs'>{event.classId}</span>
            </Row>
            <Row label='Giáo viên'>
              <div className='flex items-center gap-2'>
                <span className='bg-secondary grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold'>
                  {event.teacherInitials}
                </span>
                {event.teacher}
              </div>
            </Row>
            <Row label='Hình thức'>
              <span className='inline-flex items-center gap-1.5'>
                {event.mode === 'Online' ? (
                  <Icons.video className='size-3.5' />
                ) : (
                  <Icons.workspace className='size-3.5' />
                )}
                {event.mode} · {event.branch}
              </span>
            </Row>
          </dl>

          <div className='mt-5 grid grid-cols-2 gap-2'>
            {event.mode === 'Online' ? (
              <Button className='col-span-2'>
                <Icons.video className='size-3.5' />
                Vào lớp Zoom
              </Button>
            ) : (
              <Button className='col-span-2'>
                <Icons.workspace className='size-3.5' />
                Xem chỉ đường
              </Button>
            )}
            <Button variant='outline'>
              <Icons.calendar className='size-3' />
              Đổi lịch
            </Button>
            <Button variant='outline'>
              <Icons.notification className='size-3' />
              Tắt nhắc
            </Button>
            <Button
              variant='ghost'
              className='text-destructive hover:text-destructive hover:bg-destructive/10 col-span-2'
            >
              <Icons.close className='size-3' />
              Báo nghỉ buổi này
            </Button>
          </div>

          <Separator className='my-5' />

          <div>
            <h3 className='mb-2 text-sm font-semibold tracking-tight'>Nhắc nhở</h3>
            <ul className='space-y-1.5 text-xs'>
              <li className='text-foreground/85 flex items-center gap-2'>
                <Icons.notification className='text-muted-foreground size-3' />
                <span>
                  SMS đến <span className='font-mono'>0912 ••• 678</span> trước 30 phút
                </span>
              </li>
              <li className='text-foreground/85 flex items-center gap-2'>
                <Icons.send className='text-muted-foreground size-3' />
                <span>Email đến phụ huynh trước 24 giờ</span>
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex justify-between gap-3'>
      <dt className='text-muted-foreground pt-0.5 text-xs'>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
