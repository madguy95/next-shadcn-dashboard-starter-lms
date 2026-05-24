'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { parentChildren, type ParentChild, type ParentChildEnrolled } from '@/features/parent/data';
import { AddChildSheet } from './add-child-sheet';

function ChildAvatar({ child, size = 36 }: { child: ParentChild; size?: number }) {
  return (
    <span
      className='relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border font-semibold text-white'
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${child.hue} 65% 65%), hsl(${child.hue} 60% 45%))`,
        borderColor: `hsl(${child.hue} 30% 75% / .6)`,
        fontSize: size * 0.36
      }}
    >
      {child.initials}
    </span>
  );
}

function StatCard({
  label,
  value,
  helper,
  Icon,
  accent
}: {
  label: string;
  value: string | number;
  helper: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className='bg-card rounded-lg border p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
            {label}
          </div>
          <div className='mt-1 text-2xl font-semibold tracking-tight tabular-nums'>{value}</div>
          <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>{helper}</div>
        </div>
        <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-md border', accent)}>
          <Icon className='size-4' />
        </span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone
}: {
  label: string;
  value: string | number;
  sub: string;
  tone: 'emerald' | 'sky' | 'violet' | 'amber';
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    sky: 'bg-sky-50 text-sky-800 border-sky-100',
    violet: 'bg-violet-50 text-violet-800 border-violet-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100'
  } as const;
  return (
    <div className={cn('rounded-lg border p-3', tones[tone])}>
      <div className='text-[10.5px] font-medium tracking-wider opacity-75 uppercase'>{label}</div>
      <div className='mt-1 text-xl font-semibold tracking-tight tabular-nums'>{value}</div>
      <div className='font-mono text-[10.5px] opacity-70'>{sub}</div>
    </div>
  );
}

function ChildList({
  selectedId,
  onSelect,
  onAdd,
  query,
  setQuery
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  query: string;
  setQuery: (q: string) => void;
}) {
  const filtered = parentChildren.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.school.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className='bg-card flex h-full flex-col rounded-lg border shadow-sm'>
      <div className='border-b p-4 pb-3'>
        <div className='mb-3 flex items-center justify-between gap-2'>
          <div className='flex items-baseline gap-2'>
            <h3 className='text-base font-semibold tracking-tight'>Danh sách con</h3>
            <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
              {parentChildren.length}
            </Badge>
          </div>
          <Button size='sm' onClick={onAdd}>
            <Icons.add className='size-3.5' />
            Thêm con
          </Button>
        </div>
        <div className='relative'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
          <Input
            placeholder='Tìm theo tên, trường…'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='h-8 pl-8 text-xs'
          />
        </div>
      </div>
      <ul className='flex-1 space-y-1 overflow-auto p-2'>
        {filtered.map((c) => {
          const isSel = c.id === selectedId;
          return (
            <li key={c.id}>
              <button
                type='button'
                onClick={() => onSelect(c.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors',
                  isSel
                    ? 'bg-accent border-foreground/15 shadow-sm'
                    : 'hover:bg-muted/60 border-transparent'
                )}
              >
                <ChildAvatar child={c} size={40} />
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate text-sm font-medium'>{c.name}</span>
                    {c.status === 'new' && (
                      <Badge className='px-1.5 py-0 text-[10px] border-transparent bg-emerald-100 text-emerald-800'>
                        Mới
                      </Badge>
                    )}
                  </div>
                  <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
                    {c.age} tuổi · {c.gender} · {c.level}
                  </div>
                  <div className='mt-1.5 flex items-center gap-2'>
                    <span className='text-muted-foreground inline-flex items-center gap-1 text-[11px]'>
                      <Icons.book className='size-2.5' /> {c.enrolled.length} khóa
                    </span>
                    {c.pending.length > 0 && (
                      <span className='inline-flex items-center gap-1 text-[11px] text-amber-700'>
                        <Icons.clock className='size-2.5' /> {c.pending.length} chờ
                      </span>
                    )}
                  </div>
                </div>
                <Icons.chevronRight
                  className={cn(
                    'text-muted-foreground mt-2 size-3.5 transition-transform',
                    isSel && 'text-foreground translate-x-0.5'
                  )}
                />
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className='text-muted-foreground p-6 text-center text-sm'>Không có con phù hợp</li>
        )}
      </ul>
      <div className='border-t p-3'>
        <button
          type='button'
          onClick={onAdd}
          className='text-muted-foreground hover:text-foreground hover:bg-muted/40 flex w-full items-center justify-center gap-2 rounded-md border border-dashed py-2.5 text-xs transition-colors'
        >
          <Icons.add className='size-3' />
          Thêm hồ sơ con mới
        </button>
      </div>
    </div>
  );
}

function DetailHeader({
  child,
  onEdit,
  onPause,
  onRemove
}: {
  child: ParentChild;
  onEdit: () => void;
  onPause: () => void;
  onRemove: () => void;
}) {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div
        className='relative h-14'
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, hsl(0 0% 100% / .15) 0 12px, transparent 12px 24px), linear-gradient(135deg, hsl(${child.hue} 70% 88%), hsl(${child.hue} 55% 70%))`
        }}
      />
      <div className='flex flex-wrap items-start gap-4 px-5 pt-3 pb-5'>
        <div
          className='-mt-9 shrink-0 rounded-full'
          style={{ padding: 4, background: 'hsl(var(--background))' }}
        >
          <ChildAvatar child={child} size={68} />
        </div>
        <div className='min-w-0 flex-1 pt-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-xl font-semibold tracking-tight'>{child.name}</h2>
            {child.status === 'active' && (
              <Badge className='border-transparent bg-emerald-100 text-emerald-800 text-[10.5px]'>
                ● Đang học
              </Badge>
            )}
            {child.status === 'new' && (
              <Badge className='border-transparent bg-amber-100 text-amber-900 text-[10.5px]'>
                ✨ Hồ sơ mới
              </Badge>
            )}
            <Badge variant='outline' className='font-mono text-[10.5px] font-normal'>
              ID: {child.id.toUpperCase()}
            </Badge>
            <Badge variant='secondary' className='font-mono text-[10.5px] font-normal'>
              Tham gia {child.joinedAt}
            </Badge>
          </div>
          <div className='text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
            <span className='inline-flex items-center gap-1'>
              <Icons.calendar className='size-3' /> {child.dob} · {child.age} tuổi
            </span>
            <span className='inline-flex items-center gap-1'>
              <Icons.user className='size-3' /> {child.gender}
            </span>
            <span className='inline-flex items-center gap-1'>
              <Icons.book className='size-3' /> {child.school}
            </span>
            <span>· {child.address}</span>
          </div>
        </div>
        <div className='flex shrink-0 items-center gap-1.5 pt-1'>
          <Button variant='outline' size='sm' className='h-8' onClick={onEdit}>
            <Icons.edit className='size-3' />
            Sửa hồ sơ
          </Button>
          <Button variant='outline' size='icon' className='h-8 w-8' onClick={onPause}>
            <Icons.eyeOff className='size-3' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 h-8 w-8'
            onClick={onRemove}
          >
            <Icons.trash className='size-3' />
          </Button>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ child }: { child: ParentChild }) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      <div className='space-y-4 md:col-span-2'>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <StatTile label='Khóa đang học' value={child.enrolled.length} sub='khóa' tone='emerald' />
          <StatTile
            label='Buổi đã học'
            value={child.attendance.attended}
            sub={`/${child.attendance.total} buổi`}
            tone='sky'
          />
          <StatTile
            label='Đi học'
            value={`${child.attendance.percent}%`}
            sub='đi đầy đủ'
            tone='violet'
          />
          <StatTile
            label='Thành tích'
            value={child.achievements.length}
            sub='trong tháng'
            tone='amber'
          />
        </div>

        <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
          <div className='flex items-baseline justify-between border-b p-5 pb-3'>
            <div>
              <h3 className='font-semibold tracking-tight'>Năng lực hiện tại</h3>
              <p className='text-muted-foreground mt-0.5 text-xs'>
                Tổng hợp từ đánh giá giáo viên & bài tập trong khóa.
              </p>
            </div>
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground text-xs underline underline-offset-2'
            >
              Xem chi tiết
            </button>
          </div>
          <div className='grid grid-cols-1 gap-x-6 gap-y-3.5 p-5 sm:grid-cols-2'>
            {child.skills.map((s) => (
              <div key={s.k}>
                <div className='mb-1.5 flex items-baseline justify-between'>
                  <span className='text-sm'>{s.k}</span>
                  <span className='text-muted-foreground font-mono text-xs tabular-nums'>
                    {s.v}/100
                  </span>
                </div>
                <div className='bg-muted h-2 overflow-hidden rounded-full'>
                  <div
                    className='h-full rounded-full transition-all'
                    style={{
                      width: `${s.v}%`,
                      background: `linear-gradient(90deg, hsl(${child.hue} 55% 55%), hsl(${child.hue} 60% 40%))`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
          <div className='flex items-baseline justify-between border-b p-5 pb-3'>
            <h3 className='inline-flex items-center gap-2 font-semibold tracking-tight'>
              <Icons.star className='size-4' /> Thành tích gần đây
            </h3>
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground text-xs underline underline-offset-2'
            >
              Tất cả
            </button>
          </div>
          {child.achievements.length === 0 ? (
            <div className='text-muted-foreground p-8 text-center text-sm'>
              Chưa có thành tích nào. Cùng cổ vũ con bắt đầu nhé!
            </div>
          ) : (
            <ul className='divide-y'>
              {child.achievements.map((a) => {
                const KindIcon =
                  a.kind === 'project'
                    ? Icons.sparkles
                    : a.kind === 'grade'
                      ? Icons.check
                      : Icons.badgeCheck;
                return (
                  <li key={a.title} className='flex items-start gap-3 p-4'>
                    <span
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-md',
                        a.kind === 'project' && 'bg-violet-100 text-violet-700',
                        a.kind === 'grade' && 'bg-emerald-100 text-emerald-700',
                        a.kind === 'badge' && 'bg-amber-100 text-amber-700'
                      )}
                    >
                      <KindIcon className='size-4' />
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='text-sm font-medium'>{a.title}</div>
                      <div className='text-muted-foreground mt-0.5 font-mono text-xs'>
                        {a.course} · {a.date}
                      </div>
                    </div>
                    <Button size='sm' variant='ghost' className='h-7 text-xs'>
                      Xem
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className='space-y-4'>
        <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
          <div className='border-b p-5 pb-3'>
            <h3 className='font-semibold tracking-tight'>Sức khỏe & lưu ý</h3>
          </div>
          <dl className='space-y-2.5 p-5 text-sm'>
            <div className='flex justify-between gap-3'>
              <dt className='text-muted-foreground pt-0.5 text-xs'>Dị ứng</dt>
              <dd className='text-right'>
                <Badge
                  variant={child.health.allergies === 'Không' ? 'outline' : 'secondary'}
                  className={cn(
                    child.health.allergies !== 'Không' &&
                      'border-transparent bg-amber-100 text-amber-900'
                  )}
                >
                  {child.health.allergies}
                </Badge>
              </dd>
            </div>
            <Separator />
            <div>
              <dt className='text-muted-foreground mb-1 text-xs'>Ghi chú</dt>
              <dd className='text-foreground/85 leading-relaxed'>{child.health.notes}</dd>
            </div>
          </dl>
        </div>

        <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
          <div className='border-b p-5 pb-3'>
            <h3 className='font-semibold tracking-tight'>Sở thích của con</h3>
          </div>
          <div className='flex flex-wrap gap-1.5 p-5'>
            {child.interests.map((it) => (
              <span
                key={it}
                className='bg-muted/40 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs'
              >
                <Icons.star className='size-2.5 text-rose-500' /> {it}
              </span>
            ))}
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground hover:bg-muted/40 inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-xs'
            >
              <Icons.add className='size-2.5' /> Thêm
            </button>
          </div>
        </div>

        <div className='bg-muted/30 rounded-lg border'>
          <div className='flex gap-3 p-5'>
            <Icons.sparkles className='text-foreground/70 mt-0.5 size-4 shrink-0' />
            <div className='text-muted-foreground text-xs leading-relaxed'>
              <div className='text-foreground mb-0.5 font-medium'>Gợi ý cho {child.name}</div>
              Dựa trên tiến độ hiện tại, con có thể thử khóa{' '}
              <b className='text-foreground'>Scratch Game (SC-201)</b> sau khi hoàn thành Scratch Cơ
              bản.
              <button
                type='button'
                className='text-foreground mt-2 block font-medium underline underline-offset-2 hover:no-underline'
              >
                Xem lộ trình →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoursesTab({ child }: { child: ParentChild }) {
  return (
    <div className='space-y-4'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-baseline justify-between border-b p-5 pb-3'>
          <div>
            <h3 className='font-semibold tracking-tight'>Đang học ({child.enrolled.length})</h3>
            <p className='text-muted-foreground mt-0.5 text-xs'>
              Khóa học đang diễn ra của {child.name}.
            </p>
          </div>
          <Button size='sm' variant='outline'>
            <Icons.add className='size-3' />
            Đăng ký khóa mới
          </Button>
        </div>
        {child.enrolled.length === 0 ? (
          <div className='text-muted-foreground p-10 text-center text-sm'>
            <Icons.book className='mx-auto mb-3 size-6 opacity-30' />
            Chưa có khóa học nào.{' '}
            <button
              type='button'
              className='text-foreground ml-1 underline underline-offset-2 hover:no-underline'
            >
              Đăng ký ngay
            </button>
          </div>
        ) : (
          <ul className='divide-y'>
            {child.enrolled.map((c) => (
              <EnrolledCourseRow key={c.code + c.classId} child={child} course={c} />
            ))}
          </ul>
        )}
      </div>

      {child.pending.length > 0 && (
        <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
          <div className='flex items-baseline justify-between border-b p-5 pb-3'>
            <h3 className='inline-flex items-center gap-2 font-semibold tracking-tight'>
              <Icons.clock className='size-4' /> Đăng ký đang chờ ({child.pending.length})
            </h3>
            <span className='text-muted-foreground font-mono text-xs'>
              Trung tâm sẽ xác nhận trong 24h
            </span>
          </div>
          <ul className='divide-y'>
            {child.pending.map((p) => (
              <li key={p.code + p.className} className='flex items-center gap-3 px-5 py-4'>
                <span className='bg-warning/15 text-warning-foreground grid h-8 w-8 place-items-center rounded-md'>
                  <Icons.clock className='size-3.5' />
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='text-sm font-medium'>
                    {p.name}{' '}
                    <Badge variant='outline' className='ml-1 font-mono text-[10px]'>
                      {p.code}
                    </Badge>
                  </div>
                  <div className='text-muted-foreground font-mono text-xs'>
                    {p.className} · {p.note}
                  </div>
                </div>
                <Button size='sm' variant='outline' className='h-7 text-xs'>
                  Hủy yêu cầu
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EnrolledCourseRow({ child, course }: { child: ParentChild; course: ParentChildEnrolled }) {
  const pct = Math.round((course.done / course.total) * 100);
  return (
    <li className='grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_auto]'>
      <div className='flex min-w-0 gap-4'>
        <div
          className='flex h-14 w-14 shrink-0 items-center justify-center rounded-md border text-sm font-semibold text-white'
          style={{
            background: `linear-gradient(135deg, hsl(${child.hue} 60% 60%), hsl(${child.hue} 55% 42%))`
          }}
        >
          {course.code.split('-')[0]}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h4 className='font-semibold tracking-tight'>{course.name}</h4>
            <Badge variant='outline' className='font-mono text-[10.5px] font-normal'>
              {course.code}
            </Badge>
            <Badge variant='secondary' className='font-mono text-[10.5px] font-normal'>
              {course.classId}
            </Badge>
            <Badge
              variant='secondary'
              className='inline-flex items-center gap-1 font-mono text-[10.5px] font-normal'
            >
              {course.mode === 'Online' ? (
                <Icons.video className='size-2.5' />
              ) : (
                <Icons.workspace className='size-2.5' />
              )}
              {course.mode}
            </Badge>
          </div>
          <div className='text-muted-foreground mt-1 font-mono text-xs'>
            {course.schedule} · {course.branch}
          </div>
          <div className='mt-2 flex items-center gap-2 text-xs'>
            <span className='bg-secondary grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold'>
              {course.teacherInitials}
            </span>
            <span className='text-muted-foreground'>{course.teacher}</span>
            <span className='text-muted-foreground'>·</span>
            <span className='text-foreground inline-flex items-center gap-1'>
              <Icons.calendar className='size-2.5' /> Tiếp theo:{' '}
              <span className='font-medium'>{course.nextOn}</span>
            </span>
          </div>
        </div>
      </div>
      <div className='md:w-[220px]'>
        <div className='mb-1.5 flex items-baseline justify-between'>
          <span className='text-muted-foreground text-xs'>Tiến độ</span>
          <span className='font-mono text-xs tabular-nums'>
            {course.done}/{course.total} · {pct}%
          </span>
        </div>
        <div className='bg-muted h-2 overflow-hidden rounded-full'>
          <div className='bg-foreground h-full rounded-full' style={{ width: `${pct}%` }} />
        </div>
        <div className='mt-3 flex gap-1.5'>
          <Button size='sm' variant='outline' className='h-8 flex-1 text-xs'>
            Mở lớp
          </Button>
          <Button variant='ghost' size='icon' className='h-8 w-8'>
            <Icons.ellipsis className='size-3.5' />
          </Button>
        </div>
      </div>
    </li>
  );
}

function ScheduleTab({ child }: { child: ParentChild }) {
  const totalSlots = child.weekly.reduce((s, d) => s + d.items.length, 0);
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-wrap items-baseline justify-between gap-3 border-b p-5 pb-3'>
        <div>
          <h3 className='inline-flex items-center gap-2 font-semibold tracking-tight'>
            <Icons.calendar className='size-4' /> Lịch học tuần này
          </h3>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            19/05 — 25/05 · {totalSlots} buổi học
          </p>
        </div>
        <div className='flex items-center gap-1.5'>
          <Button variant='outline' size='sm' className='h-7 text-xs'>
            ‹ Tuần trước
          </Button>
          <Button variant='outline' size='sm' className='h-7 text-xs'>
            Tuần này
          </Button>
          <Button variant='outline' size='sm' className='h-7 text-xs'>
            Tuần sau ›
          </Button>
          <Separator className='h-5 w-px' />
          <Button variant='ghost' size='sm' className='h-7 text-xs'>
            <Icons.upload className='size-3 rotate-180' />
            .ics
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-7 border-b'>
        {child.weekly.map((d, i) => (
          <div
            key={d.day}
            className={cn('border-r p-2.5 text-center last:border-r-0', i === 0 && 'bg-accent/40')}
          >
            <div className='text-muted-foreground text-[10.5px] font-medium tracking-wider uppercase'>
              {d.day}
            </div>
            <div className='mt-0.5 font-mono text-sm'>{d.date}</div>
          </div>
        ))}
      </div>
      <div className='grid min-h-[220px] grid-cols-7'>
        {child.weekly.map((d, i) => (
          <div
            key={d.day}
            className={cn('space-y-1.5 border-r p-2 last:border-r-0', i === 0 && 'bg-accent/20')}
          >
            {d.items.length === 0 ? (
              <div className='text-muted-foreground py-3 text-center text-[11px]'>—</div>
            ) : (
              d.items.map((it) => (
                <div
                  key={it.time}
                  className='cursor-pointer rounded-md border p-2 text-[11px] transition-shadow hover:shadow-sm'
                  style={{
                    background: `hsl(${child.hue} 60% 96%)`,
                    borderColor: `hsl(${child.hue} 50% 80%)`
                  }}
                >
                  <div
                    className='font-mono font-medium'
                    style={{ color: `hsl(${child.hue} 40% 30%)` }}
                  >
                    {it.time}
                  </div>
                  <div className='text-foreground/80 mt-0.5 leading-snug'>{it.course}</div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
      <div className='bg-muted/30 text-muted-foreground flex items-center gap-3 border-t p-3 text-xs'>
        <Icons.sparkles className='size-3' />
        <span>
          Thông báo nhắc nhở sẽ gửi đến SMS{' '}
          <span className='text-foreground font-mono'>{child.parent.phone}</span> trước 30 phút.
        </span>
        <button
          type='button'
          className='text-foreground ml-auto underline underline-offset-2 hover:no-underline'
        >
          Tùy chỉnh
        </button>
      </div>
    </div>
  );
}

function ParentsTab({ child }: { child: ParentChild }) {
  const parents = [child.parent, child.parent2].filter(
    (p): p is NonNullable<typeof p> => p !== null
  );
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {parents.map((p) => (
          <div key={p.name} className='bg-card rounded-lg border p-5 shadow-sm'>
            <div className='flex items-start gap-3'>
              <span className='bg-accent grid h-12 w-12 place-items-center rounded-full text-sm font-semibold'>
                {p.name.split(' ').slice(-1)[0][0]}
              </span>
              <div className='min-w-0 flex-1'>
                <div className='font-semibold'>{p.name}</div>
                <div className='text-muted-foreground mt-0.5 text-xs'>{p.relation}</div>
              </div>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <Icons.ellipsis className='size-3.5' />
              </Button>
            </div>
            <Separator className='my-4' />
            <div className='space-y-2 text-sm'>
              <div className='text-foreground/85 flex items-center gap-2'>
                <Icons.phone className='text-muted-foreground size-3.5' />
                <span className='font-mono'>{p.phone}</span>
                <button
                  type='button'
                  className='text-muted-foreground hover:text-foreground ml-auto text-xs underline underline-offset-2'
                >
                  Gọi
                </button>
              </div>
              <div className='text-foreground/85 flex items-center gap-2'>
                <Icons.send className='text-muted-foreground size-3.5' />
                <span className='truncate'>{p.email}</span>
                <button
                  type='button'
                  className='text-muted-foreground hover:text-foreground ml-auto text-xs underline underline-offset-2'
                >
                  Mail
                </button>
              </div>
            </div>
          </div>
        ))}
        {parents.length === 1 && (
          <button
            type='button'
            className='bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-sm transition-colors'
          >
            <Icons.add className='size-5' />
            <span>Thêm phụ huynh / người giám hộ</span>
          </button>
        )}
      </div>

      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='border-b p-5 pb-3'>
          <h3 className='font-semibold tracking-tight'>Quyền & thông báo</h3>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            Ai có quyền nhận thông báo và quản lý hồ sơ của {child.name}.
          </p>
        </div>
        <ul className='p-2'>
          {[
            {
              who: child.parent.name,
              scopes: ['Quản lý đăng ký', 'Thanh toán', 'Nhận thông báo SMS', 'Email báo cáo']
            },
            ...(child.parent2
              ? [{ who: child.parent2.name, scopes: ['Nhận thông báo SMS', 'Email báo cáo'] }]
              : [])
          ].map((row) => (
            <li
              key={row.who}
              className='hover:bg-muted/40 flex items-center gap-3 rounded-md px-3 py-2.5'
            >
              <span className='bg-secondary grid h-7 w-7 place-items-center rounded-full text-[10.5px] font-semibold'>
                {row.who.split(' ').slice(-1)[0][0]}
              </span>
              <div className='min-w-0 text-sm font-medium'>{row.who}</div>
              <div className='ml-auto flex flex-wrap gap-1'>
                {row.scopes.map((s) => (
                  <Badge key={s} variant='outline' className='text-[10.5px] font-normal'>
                    {s}
                  </Badge>
                ))}
              </div>
              <Button variant='ghost' size='sm' className='ml-2 h-7 text-xs'>
                Sửa
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProfileTab({ child, onSave }: { child: ParentChild; onSave: () => void }) {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex items-baseline justify-between border-b p-5 pb-3'>
        <div>
          <h3 className='font-semibold tracking-tight'>Hồ sơ học sinh</h3>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            Cập nhật thông tin cá nhân và liên hệ trong trường hợp khẩn cấp.
          </p>
        </div>
        <span className='text-muted-foreground font-mono text-xs'>
          Cập nhật gần nhất: 10/05/2026
        </span>
      </div>
      <div className='grid grid-cols-1 gap-x-6 gap-y-4 p-5 md:grid-cols-2'>
        <ProfileField label='Họ và tên' defaultValue={child.name} />
        <ProfileField label='Tên gọi ở nhà' placeholder='VD: Bin, Cún…' />
        <ProfileField label='Ngày sinh' defaultValue={child.dob} />
        <ProfileField label='Giới tính' defaultValue={child.gender} />
        <ProfileField
          label='Trường đang học'
          defaultValue={child.school}
          className='md:col-span-2'
        />
        <ProfileField label='Địa chỉ' defaultValue={child.address} className='md:col-span-2' />
        <div>
          <Label className='text-muted-foreground mb-1.5 block text-xs font-normal'>
            Cấp độ hiện tại
          </Label>
          <Select defaultValue={child.level}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Beginner'>Beginner</SelectItem>
              <SelectItem value='Intermediate'>Intermediate</SelectItem>
              <SelectItem value='Advanced'>Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ProfileField label='Dị ứng / Sức khỏe' defaultValue={child.health.allergies} />
        <div className='md:col-span-2'>
          <Label className='text-muted-foreground mb-1.5 block text-xs font-normal'>
            Ghi chú đặc biệt
          </Label>
          <Textarea defaultValue={child.health.notes} />
        </div>
      </div>
      <Separator />
      <div className='flex items-center justify-end gap-2 p-5'>
        <Button variant='ghost'>Hủy</Button>
        <Button onClick={onSave}>
          <Icons.check className='size-3.5' />
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  defaultValue,
  placeholder,
  className
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className='text-muted-foreground mb-1.5 block text-xs font-normal'>{label}</Label>
      <Input defaultValue={defaultValue} placeholder={placeholder} />
    </div>
  );
}

export function MyChildrenView() {
  const [selectedId, setSelectedId] = useState(parentChildren[0].id);
  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const child = parentChildren.find((c) => c.id === selectedId) ?? parentChildren[0];

  const stats = useMemo(() => {
    const totalCourses = parentChildren.reduce((s, c) => s + c.enrolled.length, 0);
    const totalLessons = parentChildren.reduce(
      (s, c) => s + c.weekly.reduce((a, d) => a + d.items.length, 0),
      0
    );
    const totalPending = parentChildren.reduce((s, c) => s + c.pending.length, 0);
    return { totalCourses, totalLessons, totalPending };
  }, []);

  return (
    <>
      <div className='mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatCard
          label='Tổng số con'
          value={parentChildren.length}
          helper='hồ sơ trong gia đình'
          Icon={Icons.teams}
          accent='bg-emerald-50 text-emerald-700 border-emerald-100'
        />
        <StatCard
          label='Khóa đang học'
          value={stats.totalCourses}
          helper='trên toàn gia đình'
          Icon={Icons.book}
          accent='bg-sky-50 text-sky-700 border-sky-100'
        />
        <StatCard
          label='Buổi học tuần này'
          value={stats.totalLessons}
          helper='19/05 — 25/05'
          Icon={Icons.calendar}
          accent='bg-violet-50 text-violet-700 border-violet-100'
        />
        <StatCard
          label='Đang chờ duyệt'
          value={stats.totalPending}
          helper='đăng ký mới'
          Icon={Icons.clock}
          accent='bg-amber-50 text-amber-700 border-amber-100'
        />
      </div>

      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[340px_1fr]'>
        <div className='lg:sticky lg:top-[72px]' style={{ maxHeight: 'calc(100vh - 88px)' }}>
          <ChildList
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={() => setShowAdd(true)}
            query={query}
            setQuery={setQuery}
          />
        </div>

        <div className='min-w-0 space-y-4'>
          <DetailHeader
            child={child}
            onEdit={() => setTab('profile')}
            onPause={() => toast(`Đã tạm dừng hồ sơ ${child.name}`)}
            onRemove={() => toast(`Yêu cầu xóa hồ sơ ${child.name} đã gửi tới admin`)}
          />

          <Tabs value={tab} onValueChange={setTab}>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <TabsList className='h-9'>
                <TabsTrigger value='overview' className='h-7 px-3 text-xs'>
                  <Icons.dashboard className='size-3' />
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value='courses' className='h-7 px-3 text-xs'>
                  <Icons.book className='size-3' />
                  Khóa học
                  <span className='ml-1 font-mono opacity-70'>({child.enrolled.length})</span>
                </TabsTrigger>
                <TabsTrigger value='schedule' className='h-7 px-3 text-xs'>
                  <Icons.calendar className='size-3' />
                  Lịch học
                </TabsTrigger>
                <TabsTrigger value='parents' className='h-7 px-3 text-xs'>
                  <Icons.teams className='size-3' />
                  Phụ huynh
                </TabsTrigger>
                <TabsTrigger value='profile' className='h-7 px-3 text-xs'>
                  <Icons.user className='size-3' />
                  Hồ sơ
                </TabsTrigger>
              </TabsList>
              <div className='flex items-center gap-1.5'>
                <Button variant='outline' size='sm' className='h-8 text-xs'>
                  <Icons.upload className='size-3 rotate-180' />
                  Báo cáo định kỳ
                </Button>
                <Button variant='outline' size='icon' className='h-8 w-8'>
                  <Icons.ellipsis className='size-3.5' />
                </Button>
              </div>
            </div>

            <TabsContent value='overview' className='mt-6'>
              <OverviewTab child={child} />
            </TabsContent>
            <TabsContent value='courses' className='mt-6'>
              <CoursesTab child={child} />
            </TabsContent>
            <TabsContent value='schedule' className='mt-6'>
              <ScheduleTab child={child} />
            </TabsContent>
            <TabsContent value='parents' className='mt-6'>
              <ParentsTab child={child} />
            </TabsContent>
            <TabsContent value='profile' className='mt-6'>
              <ProfileTab child={child} onSave={() => toast.success('Đã lưu thay đổi hồ sơ.')} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AddChildSheet
        open={showAdd}
        onOpenChange={setShowAdd}
        onAdd={(d) => {
          setShowAdd(false);
          toast.success(`Đã tạo hồ sơ ${d.name || 'con mới'}.`);
        }}
      />
    </>
  );
}

export function MyChildrenHeaderAction() {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.upload className='size-3.5 rotate-180' />
        Xuất hồ sơ
      </Button>
      <Button size='sm' className='h-9'>
        <Icons.add className='size-3.5' />
        Thêm con
      </Button>
    </div>
  );
}
