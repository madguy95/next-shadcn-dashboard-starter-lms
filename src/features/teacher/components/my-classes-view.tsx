'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  classColorTokens,
  classStatusLabel,
  studentToneClass,
  teacherClasses,
  type ClassStatus,
  type TeacherClass
} from '@/features/teacher/data';

const FILTERS: { value: ClassStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'running', label: 'Đang dạy' },
  { value: 'upcoming', label: 'Sắp khai giảng' },
  { value: 'ended', label: 'Đã kết thúc' }
];

function StatusDot({ status }: { status: ClassStatus }) {
  const cls =
    status === 'running'
      ? 'bg-emerald-500'
      : status === 'upcoming'
        ? 'bg-violet-500'
        : 'bg-muted-foreground';
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full', cls)} />;
}

function CoverStrip({
  color,
  status,
  code
}: {
  color: TeacherClass['color'];
  status: ClassStatus;
  code: string;
}) {
  const token = classColorTokens[color];
  return (
    <div
      className={cn(
        'relative h-20 border-b',
        token.bg,
        'bg-[repeating-linear-gradient(45deg,color-mix(in_srgb,currentColor_4%,transparent)_0_8px,transparent_8px_16px)]'
      )}
    >
      <span className='bg-background absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase'>
        <StatusDot status={status} />
        {classStatusLabel[status]}
      </span>
      <span className='bg-background/80 absolute top-3 right-3 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px]'>
        {code}
      </span>
    </div>
  );
}

function StudentStack({ cls }: { cls: TeacherClass }) {
  const extra = Math.max(cls.studentCount - cls.studentsPreview.length, 0);
  return (
    <div className='flex -space-x-2'>
      {cls.studentsPreview.map((s) => (
        <span
          key={s.initials}
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
  const isClickable = cls.status !== 'ended';
  const inner = (
    <>
      <CoverStrip color={cls.color} status={cls.status} code={cls.code} />
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
                  ? `${cls.studentCount} / ${cls.capacity ?? cls.studentCount} hs`
                  : `${cls.studentCount} hs`}
              </span>
            </div>
            <div className='mt-3 flex items-center justify-between border-t pt-3 text-[11px]'>
              <span className='text-muted-foreground'>
                Buổi{' '}
                <span className='text-foreground font-mono'>
                  {cls.sessionCurrent} / {cls.sessionTotal}
                </span>
              </span>
              {cls.status === 'upcoming' ? (
                <span className='text-muted-foreground'>Còn {cls.daysRemaining} ngày</span>
              ) : cls.needsReviewCount && cls.needsReviewCount > 0 ? (
                <span className='inline-flex items-center gap-1 text-amber-700'>
                  <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
                  Cần nhận xét: {cls.needsReviewCount}
                </span>
              ) : (
                <span className='inline-flex items-center gap-1 text-emerald-700'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  Đã cập nhật
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className='text-muted-foreground mt-3 text-xs'>
              Kết thúc {cls.endedAt} · {cls.studentCount} hs hoàn thành
            </div>
            <div className='mt-3 flex items-center justify-between border-t pt-3 text-[11px]'>
              <span className='text-muted-foreground'>
                Buổi{' '}
                <span className='text-foreground font-mono'>
                  {cls.sessionCurrent} / {cls.sessionTotal}
                </span>
              </span>
              <span className='hover:text-foreground underline-offset-2 hover:underline'>
                Xem báo cáo
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

export function MyClassesStats() {
  return (
    <div className='flex flex-wrap gap-3'>
      <StatCard label='Lớp đang dạy' value='5' helper='3 offline · 2 online' />
      <StatCard label='Tổng học sinh' value='62' helper='tuần này: 58 đi học' />
      <StatCard label='Cần nhận xét' value='7' helper='buổi học chưa nhận xét' tone='amber' />
    </div>
  );
}

export function MyClassesView() {
  const [filter, setFilter] = useState<ClassStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return teacherClasses.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false;
      if (
        term &&
        !`${c.title} ${c.classLabel} ${c.code} ${c.courseCode}`.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [filter, search]);

  return (
    <div className='space-y-6'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex flex-wrap items-center gap-3 p-3'>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ClassStatus | 'all')}>
            <TabsList className='h-8'>
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className='h-6 px-2.5 text-xs'>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className='inline-flex items-center gap-1.5'>
            <span className='text-muted-foreground text-[11px] tracking-wider uppercase'>
              Khóa:
            </span>
            <Button variant='outline' size='sm' className='h-7 px-2 font-mono text-xs'>
              Tất cả
              <Icons.chevronDown className='size-3' />
            </Button>
          </div>

          <div className='ml-auto flex items-center gap-2'>
            <div className='relative w-64'>
              <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3 -translate-y-1/2' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Tìm tên lớp, mã lớp…'
                className='h-8 pl-8 text-xs'
              />
            </div>
            <Button variant='outline' size='sm' className='h-8 px-3 text-xs'>
              <Icons.upload className='size-3 rotate-180' />
              Xuất CSV
            </Button>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {visible.map((c) => (
          <ClassCard key={c.id} cls={c} />
        ))}
        {visible.length === 0 && (
          <div className='text-muted-foreground col-span-full rounded-lg border border-dashed py-10 text-center text-sm'>
            Không tìm thấy lớp phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
}
