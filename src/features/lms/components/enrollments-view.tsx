'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  avatarToneClass,
  classAssignOptions,
  pendingEnrollments,
  type EnrollmentRow
} from '@/features/lms/data';

const statusTabs = [
  { key: 'pending', label: 'Pending', count: 12, active: true },
  { key: 'active', label: 'Active', count: 624 },
  { key: 'waitlist', label: 'Waitlist', count: 7 },
  { key: 'rejected', label: 'Rejected', count: 3 }
] as const;

function FilterButton({ label }: { label: string }) {
  return (
    <Button
      variant='outline'
      size='sm'
      className='text-muted-foreground hover:text-foreground h-8 px-2.5 text-[12px]'
    >
      {label}
      <Icons.chevronDown className='size-3' />
    </Button>
  );
}

function EnrollmentRowItem({
  row,
  active,
  onSelect
}: {
  row: EnrollmentRow;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <TableRow
      onClick={onSelect}
      className={cn('cursor-pointer', active && 'bg-foreground/[0.03] hover:bg-foreground/[0.05]')}
    >
      <TableCell className='px-4 py-3' onClick={(e) => e.stopPropagation()}>
        <Checkbox aria-label={`Select ${row.studentName}`} />
      </TableCell>
      <TableCell className='py-3'>
        <div className='flex items-center gap-2.5'>
          <span
            className={cn(
              'grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold',
              avatarToneClass[row.tone]
            )}
          >
            {row.initials}
          </span>
          <div className='leading-tight'>
            <div className='font-medium'>{row.studentName}</div>
            <div className='text-muted-foreground font-mono text-[11px]'>
              parent · {row.parentName}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className='py-3'>
        <div className='text-[13px] font-medium'>{row.requestedCourse}</div>
        <div className='text-muted-foreground font-mono text-[11px]'>{row.note}</div>
      </TableCell>
      <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
        {row.submittedAt}
      </TableCell>
      <TableCell className='px-4 py-3 text-right' onClick={(e) => e.stopPropagation()}>
        <div className='inline-flex gap-1'>
          <Button
            size='sm'
            variant={active ? 'default' : 'outline'}
            className='h-7 px-2.5 text-[12px]'
          >
            Approve
          </Button>
          <Button variant='outline' size='sm' className='h-7 px-2.5 text-[12px]'>
            Waitlist
          </Button>
          <Button variant='outline' size='icon' className='h-7 w-7'>
            <Icons.close className='size-3' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function EnrollmentDetailPanel({ row }: { row: EnrollmentRow }) {
  const [selectedClass, setSelectedClass] = useState(classAssignOptions[0].id);

  return (
    <aside className='bg-card flex flex-col overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex items-start justify-between gap-3 border-b px-5 pt-4 pb-3'>
        <div className='flex items-center gap-3'>
          <span
            className={cn(
              'grid h-12 w-12 place-items-center rounded-full text-base font-semibold',
              avatarToneClass[row.tone]
            )}
          >
            {row.initials}
          </span>
          <div className='leading-tight'>
            <div className='text-muted-foreground font-mono text-[12px]'>{row.id}</div>
            <div className='text-[17px] font-semibold tracking-tight'>{row.studentName}</div>
            <div className='text-muted-foreground text-[12px]'>
              Grade 4 · Age 9 · Hanoi District 3
            </div>
          </div>
        </div>
        <Button variant='ghost' size='icon' className='h-7 w-7'>
          <Icons.close className='size-3.5' />
        </Button>
      </div>

      <div className='flex flex-col gap-4 overflow-auto px-5 py-4'>
        <section>
          <div className='text-muted-foreground mb-2 text-[11px] font-medium tracking-wider uppercase'>
            Requested course
          </div>
          <div className='flex items-center gap-3 rounded-md border p-3'>
            <div className='bg-muted grid h-10 w-10 place-items-center rounded-md border'>
              <Icons.book className='text-muted-foreground size-4' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-sm font-medium'>{row.requestedCourse}</div>
              <div className='text-muted-foreground font-mono text-[11px]'>
                CODE-101 · 12 weeks · ages 7–10
              </div>
            </div>
            <span className='inline-flex items-center rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700'>
              good fit
            </span>
          </div>
        </section>

        <section>
          <div className='mb-2 flex items-center justify-between'>
            <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
              Assign to class
            </div>
            <button className='text-muted-foreground hover:text-foreground font-mono text-[11px]'>
              {classAssignOptions.length} options
            </button>
          </div>
          <RadioGroup value={selectedClass} onValueChange={setSelectedClass} className='space-y-2'>
            {classAssignOptions.map((opt) => {
              const isSelected = selectedClass === opt.id;
              return (
                <label
                  key={opt.id}
                  htmlFor={opt.id}
                  className={cn(
                    'hover:border-foreground/40 flex cursor-pointer items-center gap-3 rounded-md border p-3',
                    isSelected &&
                      'border-foreground/40 bg-foreground/[0.02] ring-foreground/10 ring-2',
                    opt.disabled && 'pointer-events-none opacity-60'
                  )}
                >
                  <RadioGroupItem value={opt.id} id={opt.id} disabled={opt.disabled} />
                  <div className='min-w-0 flex-1'>
                    <div className='text-sm font-medium'>
                      {opt.label}{' '}
                      <span className='text-muted-foreground font-mono text-[11px]'>
                        · {opt.schedule}
                      </span>
                    </div>
                    <div className='text-muted-foreground font-mono text-[11px]'>{opt.detail}</div>
                  </div>
                  <div className='font-mono text-[11px]'>
                    {opt.enrolled} / {opt.capacity}
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </section>

        <section className='grid grid-cols-2 gap-3'>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>Parent</div>
            <div className='mt-1 text-sm font-medium'>{row.parentName}</div>
            <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
              +84 90 234 1182
            </div>
            <div className='text-muted-foreground font-mono text-[11px]'>parent@email.vn</div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              Payment
            </div>
            <div className='mt-1 text-sm font-medium'>3,600,000₫</div>
            <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
              paid · bank transfer · 21 May
            </div>
          </div>
        </section>

        <section>
          <div className='text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wider uppercase'>
            Parent note
          </div>
          <div className='bg-muted/30 rounded-md border p-3 text-[13px] leading-relaxed'>
            “Minh An đã học qua iPad coding ở trường, rất thích làm game. Mong cô giúp con tham gia
            lớp sáng để buổi chiều con đi học bơi. Cảm ơn cô!”
          </div>
        </section>
      </div>

      <div className='bg-muted/30 flex items-center justify-between gap-2 border-t px-5 py-3'>
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-foreground text-[12px]'
        >
          <Icons.trash className='size-3' />
          Reject
        </Button>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' className='h-9'>
            Move to waitlist
          </Button>
          <Button size='sm' className='h-9'>
            <Icons.check className='size-3.5' />
            Approve &amp; assign
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function EnrollmentsView() {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [selectedId, setSelectedId] = useState(pendingEnrollments[0].id);

  const selectedRow = pendingEnrollments.find((r) => r.id === selectedId) ?? pendingEnrollments[0];

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end justify-between gap-2 border-b'>
        <div className='-mb-px flex items-center'>
          {statusTabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type='button'
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'relative inline-flex h-10 items-center gap-2 px-4 text-sm',
                  active
                    ? 'border-foreground -mb-px border-b-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
                {t.key === 'pending' ? (
                  <span className='bg-foreground text-background inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[10px]'>
                    {t.count}
                  </span>
                ) : (
                  <span className='text-muted-foreground font-mono text-[11px]'>{t.count}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className='flex items-center gap-2 pb-2'>
          <div className='relative w-64'>
            <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
            <Input placeholder='Search name, parent, course…' className='h-8 pl-8 text-[13px]' />
          </div>
          <FilterButton label='Course' />
          <FilterButton label='Submitted' />
        </div>
      </div>

      <div className='grid grid-cols-12 gap-4'>
        <div className='bg-card col-span-12 overflow-hidden rounded-lg border shadow-sm xl:col-span-7'>
          <div className='bg-muted/40 flex items-center justify-between border-b px-4 py-2.5 text-[12px]'>
            <div className='flex items-center gap-2'>
              <Checkbox id='select-all-pending' aria-label='Select all pending' />
              <label htmlFor='select-all-pending' className='text-muted-foreground'>
                Select all
              </label>
            </div>
            <div className='text-muted-foreground font-mono'>
              {pendingEnrollments.length} pending
            </div>
          </div>
          <Table>
            <TableHeader className='bg-muted/30'>
              <TableRow>
                <TableHead className='w-8 px-4' />
                <TableHead className='text-[11px] tracking-wider uppercase'>Student</TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  Requested course
                </TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>Submitted</TableHead>
                <TableHead className='px-4 text-right text-[11px] tracking-wider uppercase'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingEnrollments.map((row) => (
                <EnrollmentRowItem
                  key={row.id}
                  row={row}
                  active={row.id === selectedId}
                  onSelect={() => setSelectedId(row.id)}
                />
              ))}
            </TableBody>
          </Table>
          <div className='text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-[12px]'>
            <div>
              Bulk actions:
              <button className='hover:text-foreground ml-1 underline decoration-dotted'>
                Approve selected
              </button>{' '}
              ·
              <button className='hover:text-foreground underline decoration-dotted'>
                Move to waitlist
              </button>
            </div>
            <div>
              Page <span className='text-foreground font-mono'>1</span> / 2
            </div>
          </div>
        </div>

        <div className='col-span-12 xl:col-span-5'>
          <EnrollmentDetailPanel row={selectedRow} />
        </div>
      </div>
    </div>
  );
}

export function EnrollmentsHeaderAction() {
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.upload className='size-3.5 rotate-180' />
        Export
      </Button>
      <Button size='sm' className='h-9'>
        <Icons.add className='size-3.5' />
        Enroll manually
      </Button>
    </div>
  );
}
