'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  formatVND,
  type ClassOption,
  type ParentChild,
  type ParentCourse
} from '@/features/parent/data';

export function ConfirmEnrollmentDialog({
  open,
  onOpenChange,
  child,
  course,
  klass,
  note,
  trial,
  onBack,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: ParentChild;
  course: ParentCourse;
  klass: ClassOption;
  note: string;
  trial: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [agree, setAgree] = useState(true);
  const sub = trial ? 0 : course.price;
  const discount = !trial && course.popular ? 200_000 : 0;
  const total = Math.max(0, sub - discount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b px-6 pt-5 pr-14 pb-4'>
          <DialogTitle className='text-lg tracking-tight'>Xác nhận đăng ký</DialogTitle>
          <DialogDescription className='text-sm'>
            Kiểm tra lại thông tin trước khi gửi tới trung tâm.
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 overflow-auto md:grid-cols-[1fr_280px]'>
          <div className='space-y-3 p-6 text-sm'>
            <DLRow label='Học sinh'>
              <div className='font-medium'>{child.name}</div>
              <div className='text-muted-foreground font-mono text-xs'>
                {child.age} tuổi · {child.level}
              </div>
            </DLRow>
            <DLRow label='Khóa học'>
              <div className='font-medium'>{course.name}</div>
              <div className='text-muted-foreground font-mono text-xs'>
                {course.code} · {course.ageRange} · {course.sessions} buổi
              </div>
            </DLRow>
            <DLRow label='Lớp'>
              <div className='font-medium'>
                {klass.id} · {klass.mode}
              </div>
              <div className='text-muted-foreground font-mono text-xs'>{klass.schedule}</div>
            </DLRow>
            <DLRow label='Giáo viên'>
              <div className='font-medium'>{klass.teacher}</div>
              <div className='text-muted-foreground text-xs'>{klass.branch}</div>
            </DLRow>
            <DLRow label='Khai giảng'>
              <span className='font-mono text-xs'>{klass.start}</span>
            </DLRow>
            <DLRow label='Hình thức ĐK'>
              {trial ? 'Đăng ký học thử (1 buổi)' : 'Đăng ký chính thức'}
            </DLRow>
            <DLRow label='Ghi chú'>
              <span className={cn(!note && 'text-muted-foreground italic')}>{note || '—'}</span>
            </DLRow>
          </div>

          <div className='bg-muted/30 border-t p-6 md:border-t-0 md:border-l'>
            <div className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
              Học phí
            </div>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Học phí khóa</span>
                <span className='font-mono tabular-nums'>{formatVND(course.price)}</span>
              </div>
              {discount > 0 && (
                <div className='flex justify-between text-emerald-700'>
                  <span>Ưu đãi sớm</span>
                  <span className='font-mono tabular-nums'>− {formatVND(discount)}</span>
                </div>
              )}
              {trial && (
                <div className='flex justify-between text-emerald-700'>
                  <span>Buổi học thử</span>
                  <span className='font-mono'>Miễn phí</span>
                </div>
              )}
            </div>
            <Separator className='my-3' />
            <div className='flex items-baseline justify-between'>
              <span className='text-muted-foreground text-sm'>Tổng tạm tính</span>
              <span className='text-2xl font-semibold tracking-tight tabular-nums'>
                {formatVND(total)}
              </span>
            </div>
            <p className='text-muted-foreground mt-3 text-[11px] leading-relaxed'>
              Học phí thanh toán sau khi trung tâm xác nhận lớp. Hủy miễn phí trước khai giảng 72h.
            </p>
          </div>
        </div>

        <Separator />

        <Label
          htmlFor='agree-policy'
          className='flex items-start gap-2.5 px-6 py-4 text-sm font-normal'
        >
          <Checkbox
            id='agree-policy'
            checked={agree}
            onCheckedChange={(v) => setAgree(v === true)}
            className='mt-0.5'
          />
          <span className='text-muted-foreground'>
            Tôi đồng ý với{' '}
            <button
              type='button'
              className='text-foreground underline underline-offset-4 hover:no-underline'
            >
              chính sách & điều khoản
            </button>{' '}
            đăng ký của trung tâm.
          </span>
        </Label>

        <div className='bg-muted/20 flex items-center justify-between border-t px-6 py-4'>
          <Button variant='ghost' onClick={onBack}>
            <Icons.chevronLeft className='size-3.5' />
            Quay lại chọn lớp
          </Button>
          <div className='flex gap-2'>
            <DialogClose asChild>
              <Button variant='outline'>Đóng</Button>
            </DialogClose>
            <Button disabled={!agree} onClick={onSubmit}>
              Gửi đăng ký
              <Icons.arrowRight className='size-3.5' />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DLRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='grid grid-cols-[120px_1fr] gap-4 py-1.5'>
      <dt className='text-muted-foreground pt-0.5 text-xs'>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
