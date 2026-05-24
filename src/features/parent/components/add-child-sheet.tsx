'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const STEPS = ['Thông tin con', 'Phụ huynh', 'Sở thích & xác nhận'] as const;

type FormData = {
  name: string;
  nickname: string;
  dob: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  school: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  allergies: string;
  notes: string;
  relation: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  interests: string;
};

const EMPTY: FormData = {
  name: '',
  nickname: '',
  dob: '',
  gender: 'Nam',
  school: '',
  level: 'Beginner',
  allergies: '',
  notes: '',
  relation: 'Bố',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  interests: ''
};

export function AddChildSheet({
  open,
  onOpenChange,
  onAdd
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: FormData) => void;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);

  useEffect(() => {
    if (open) {
      setStep(0);
      setData(EMPTY);
    }
  }, [open]);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full max-w-full flex-col gap-0 p-0 sm:max-w-[560px]'
      >
        <div className='flex h-14 shrink-0 items-center justify-between gap-3 border-b px-5 pr-14'>
          <div>
            <SheetTitle className='font-semibold tracking-tight'>Thêm hồ sơ con mới</SheetTitle>
            <SheetDescription className='text-muted-foreground font-mono text-[11px]'>
              Bước {step + 1}/{STEPS.length} · {STEPS[step]}
            </SheetDescription>
          </div>
        </div>

        <div className='px-5 pt-4'>
          <div className='flex items-center gap-2'>
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  i <= step ? 'bg-foreground' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>

        <div className='flex-1 space-y-4 overflow-auto p-5'>
          {step === 0 && (
            <>
              <div className='bg-muted/20 flex items-center gap-3 rounded-lg border p-4'>
                <span className='grid h-12 w-12 place-items-center rounded-full border bg-gradient-to-br from-emerald-300 to-emerald-500 text-sm font-semibold text-white'>
                  {data.name ? data.name.split(' ').slice(-1)[0][0]?.toUpperCase() : '?'}
                </span>
                <div className='text-muted-foreground flex-1 text-sm'>
                  Hồ sơ này dùng để đăng ký lớp, nhận thông báo và theo dõi tiến độ học.
                </div>
                <Button variant='outline' size='sm'>
                  <Icons.upload className='size-3' />
                  Ảnh
                </Button>
              </div>
              <div className='grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2'>
                <Field label='Họ và tên *'>
                  <Input
                    value={data.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder='Nguyễn An'
                  />
                </Field>
                <Field label='Tên gọi ở nhà'>
                  <Input
                    value={data.nickname}
                    onChange={(e) => update('nickname', e.target.value)}
                    placeholder='VD: Bin'
                  />
                </Field>
                <Field label='Ngày sinh *'>
                  <Input
                    value={data.dob}
                    onChange={(e) => update('dob', e.target.value)}
                    placeholder='dd/mm/yyyy'
                  />
                </Field>
                <Field label='Giới tính'>
                  <Select
                    value={data.gender}
                    onValueChange={(v) => update('gender', v as FormData['gender'])}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Nam'>Nam</SelectItem>
                      <SelectItem value='Nữ'>Nữ</SelectItem>
                      <SelectItem value='Khác'>Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label='Trường đang học' className='sm:col-span-2'>
                  <Input
                    value={data.school}
                    onChange={(e) => update('school', e.target.value)}
                    placeholder='TH Nguyễn Trãi · Lớp 3A'
                  />
                </Field>
                <Field label='Cấp độ hiện tại'>
                  <Select
                    value={data.level}
                    onValueChange={(v) => update('level', v as FormData['level'])}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Beginner'>Beginner</SelectItem>
                      <SelectItem value='Intermediate'>Intermediate</SelectItem>
                      <SelectItem value='Advanced'>Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label='Dị ứng / Sức khỏe'>
                  <Input
                    value={data.allergies}
                    onChange={(e) => update('allergies', e.target.value)}
                    placeholder='VD: Đậu phộng (hoặc bỏ trống)'
                  />
                </Field>
                <Field label='Ghi chú cho giáo viên' className='sm:col-span-2'>
                  <Textarea
                    value={data.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    placeholder='Điều cô/thầy nên biết về con…'
                  />
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className='text-muted-foreground text-sm'>
                Người sẽ nhận thông báo và quản lý đăng ký cho con.
              </div>
              <div className='grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2'>
                <Field label='Mối quan hệ'>
                  <Select value={data.relation} onValueChange={(v) => update('relation', v)}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Bố'>Bố</SelectItem>
                      <SelectItem value='Mẹ'>Mẹ</SelectItem>
                      <SelectItem value='Ông/Bà'>Ông/Bà</SelectItem>
                      <SelectItem value='Người giám hộ'>Người giám hộ</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label='Họ và tên *'>
                  <Input
                    value={data.parentName}
                    onChange={(e) => update('parentName', e.target.value)}
                    placeholder='Nguyễn Văn Hùng'
                  />
                </Field>
                <Field label='Số điện thoại *'>
                  <Input
                    value={data.parentPhone}
                    onChange={(e) => update('parentPhone', e.target.value)}
                    placeholder='09xx xxx xxx'
                  />
                </Field>
                <Field label='Email'>
                  <Input
                    value={data.parentEmail}
                    onChange={(e) => update('parentEmail', e.target.value)}
                    placeholder='parent@email.com'
                  />
                </Field>
              </div>
              <Label
                htmlFor='primary-contact'
                className='flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 font-normal'
              >
                <Checkbox id='primary-contact' defaultChecked className='mt-0.5' />
                <div className='text-muted-foreground text-xs'>
                  <div className='text-foreground font-medium'>Đây là liên hệ chính</div>
                  Nhận tất cả thông báo, hóa đơn và đóng vai trò quản lý hồ sơ con.
                </div>
              </Label>
              <Button variant='outline' className='w-full'>
                <Icons.add className='size-3' />
                Thêm phụ huynh thứ 2 (tùy chọn)
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Field label='Sở thích của con (phân cách bằng dấu phẩy)'>
                <Input
                  value={data.interests}
                  onChange={(e) => update('interests', e.target.value)}
                  placeholder='Lego, Vẽ, Game phiêu lưu'
                />
              </Field>
              <div className='bg-muted/30 rounded-lg border p-4'>
                <div className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
                  Tóm tắt hồ sơ
                </div>
                <dl className='space-y-2 text-sm'>
                  <SumRow
                    label='Họ tên'
                    value={
                      data.name || <span className='text-muted-foreground italic'>— Chưa nhập</span>
                    }
                  />
                  <SumRow label='Ngày sinh' value={data.dob || '—'} />
                  <SumRow label='Giới tính' value={data.gender} />
                  <SumRow label='Trường' value={data.school || '—'} />
                  <SumRow label='Cấp độ' value={data.level} />
                  <Separator className='my-2' />
                  <SumRow
                    label='PH chính'
                    value={`${data.relation} · ${data.parentPhone || '—'}`}
                  />
                </dl>
              </div>
              <Label
                htmlFor='confirm-data'
                className='flex items-start gap-2.5 text-sm font-normal'
              >
                <Checkbox id='confirm-data' defaultChecked className='mt-0.5' />
                <span className='text-muted-foreground'>
                  Tôi xác nhận thông tin trên là chính xác và đồng ý với{' '}
                  <button
                    type='button'
                    className='text-foreground underline underline-offset-2 hover:no-underline'
                  >
                    chính sách bảo mật
                  </button>{' '}
                  dữ liệu trẻ em.
                </span>
              </Label>
            </>
          )}
        </div>

        <div className='bg-muted/20 flex items-center justify-between gap-2 border-t p-4'>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <div className='flex gap-2'>
            {step > 0 && (
              <Button variant='outline' onClick={() => setStep(step - 1)}>
                Quay lại
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !data.name}>
                Tiếp tục
                <Icons.arrowRight className='size-3.5' />
              </Button>
            ) : (
              <Button onClick={() => onAdd(data)}>
                <Icons.check className='size-3.5' />
                Tạo hồ sơ
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  className,
  children
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className='text-muted-foreground mb-1.5 block text-xs font-normal'>{label}</Label>
      {children}
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex justify-between gap-3'>
      <dt className='text-muted-foreground text-xs'>{label}</dt>
      <dd className='text-right text-sm font-medium'>{value}</dd>
    </div>
  );
}

export type { FormData as AddChildFormData };
