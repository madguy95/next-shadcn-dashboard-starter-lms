'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { classesByCourse, type ClassOption, type ParentCourse } from '@/features/parent/data';

export function ClassPickerDialog({
  course,
  selectedId,
  open,
  onOpenChange,
  onPick
}: {
  course: ParentCourse | null;
  selectedId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (cls: ClassOption) => void;
}) {
  const [tab, setTab] = useState<'upcoming' | 'all'>('upcoming');
  const [pendingId, setPendingId] = useState<string | undefined>(selectedId);

  const list = course ? (classesByCourse[course.id] ?? []) : [];
  const pending = list.find((c) => c.id === pendingId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl'>
        <DialogHeader className='border-b px-6 pt-5 pr-14 pb-4'>
          <DialogTitle className='text-lg tracking-tight'>
            Chọn lớp cho {course?.name ?? '—'}
          </DialogTitle>
          {course && (
            <DialogDescription className='text-sm'>
              {course.code} · {course.ageRange} · {course.sessions} buổi · {course.duration}
              ′/buổi
            </DialogDescription>
          )}
        </DialogHeader>

        <div className='border-b px-6 pt-4'>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'upcoming' | 'all')}>
            <TabsList className='h-9'>
              <TabsTrigger value='upcoming' className='h-7 px-3 text-xs'>
                Sắp khai giảng
                <span className='ml-1.5 font-mono opacity-70'>
                  ({list.filter((c) => c.status !== 'full').length})
                </span>
              </TabsTrigger>
              <TabsTrigger value='all' className='h-7 px-3 text-xs'>
                Tất cả lớp
                <span className='ml-1.5 font-mono opacity-70'>({list.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className='flex flex-wrap items-center gap-2 py-3'>
            <Badge variant='default' className='cursor-pointer'>
              Còn chỗ ×
            </Badge>
            <FilterButton label='Cơ sở' />
            <FilterButton label='Hình thức' />
            <FilterButton label='Ngày' />
            <FilterButton label='Giờ' />
          </div>
        </div>

        <div className='flex-1 overflow-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/40 sticky top-0 z-10'>
              <tr className='border-b'>
                <Th className='w-[70px]'>Lớp</Th>
                <Th>Hình thức · Cơ sở</Th>
                <Th>Lịch học</Th>
                <Th>Giáo viên</Th>
                <Th>Sĩ số</Th>
                <Th>Khai giảng</Th>
                <Th className='pr-6 text-right' />
              </tr>
            </thead>
            <tbody>
              {list.map((cl) => {
                const pct = (cl.enrolled / cl.capacity) * 100;
                const full = cl.status === 'full';
                const isSelected = pendingId === cl.id;
                return (
                  <tr
                    key={cl.id}
                    className={cn(
                      'border-b transition-colors',
                      !full && 'hover:bg-muted/40 cursor-pointer',
                      isSelected && 'bg-accent',
                      full && 'opacity-60'
                    )}
                    onClick={() => !full && setPendingId(cl.id)}
                  >
                    <Td>
                      <span className='font-mono font-medium'>{cl.id}</span>
                    </Td>
                    <Td>
                      <div className='flex items-center gap-2'>
                        {cl.mode === 'Online' ? (
                          <Icons.video className='text-muted-foreground size-3.5' />
                        ) : (
                          <Icons.workspace className='text-muted-foreground size-3.5' />
                        )}
                        <span className='font-medium'>{cl.mode}</span>
                      </div>
                      <div className='text-muted-foreground mt-0.5 ml-6 text-xs'>{cl.branch}</div>
                    </Td>
                    <Td>
                      <span className='font-mono text-xs'>{cl.schedule}</span>
                    </Td>
                    <Td>
                      <div className='flex items-center gap-2'>
                        <span className='bg-secondary grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold'>
                          {cl.teacherInitials}
                        </span>
                        <span>{cl.teacher}</span>
                      </div>
                    </Td>
                    <Td>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-xs tabular-nums'>
                          {cl.enrolled}/{cl.capacity}
                        </span>
                        <div className='bg-muted h-1.5 w-12 overflow-hidden rounded-full'>
                          <div
                            className={cn(
                              'h-full rounded-full',
                              full
                                ? 'bg-destructive'
                                : pct >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className='font-mono text-xs'>{cl.start}</span>
                    </Td>
                    <Td className='pr-6 text-right'>
                      {full ? (
                        <Badge variant='outline' className='text-destructive border-destructive/40'>
                          Hết chỗ · ĐK chờ
                        </Badge>
                      ) : (
                        <Button
                          size='sm'
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingId(cl.id);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Icons.check className='size-3' />
                              Đã chọn
                            </>
                          ) : (
                            'Chọn'
                          )}
                        </Button>
                      )}
                    </Td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className='text-muted-foreground py-10 text-center text-sm'>
                    Khóa học này chưa có lớp sắp mở.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='bg-muted/20 flex items-center justify-between gap-3 border-t p-4'>
          <div className='text-sm'>
            {pending ? (
              <>
                Đang chọn: <span className='font-medium'>{pending.id}</span>{' '}
                <span className='text-muted-foreground font-mono'>· {pending.schedule}</span>
              </>
            ) : (
              <span className='text-muted-foreground'>Chưa chọn lớp nào</span>
            )}
          </div>
          <div className='flex gap-2'>
            <DialogClose asChild>
              <Button variant='outline'>
                <Icons.chevronLeft className='size-3.5' />
                Quay lại
              </Button>
            </DialogClose>
            <Button
              disabled={!pending}
              onClick={() => {
                if (pending) onPick(pending);
              }}
            >
              Xác nhận lớp
              <Icons.arrowRight className='size-3.5' />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <Button variant='outline' size='sm' className='h-7 text-xs'>
      {label}
      <Icons.chevronDown className='size-3' />
    </Button>
  );
}

function Th({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <th
      className={cn(
        'text-muted-foreground px-4 py-2.5 text-left text-[11px] font-medium tracking-wider uppercase',
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>;
}
