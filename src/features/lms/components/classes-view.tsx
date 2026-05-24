'use client';

import { useMemo, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  classRows,
  classStudents,
  studentStatusClass,
  studentStatusLabel,
  type ClassRow,
  type ClassStatus
} from '@/features/lms/data';
import { AddClassDialog } from './add-class-dialog';

function CapacityCell({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const pct = Math.round((enrolled / capacity) * 100);
  const isLow = pct < 70;
  return (
    <div>
      <div className='font-mono text-[12px]'>
        {enrolled} / {capacity}
      </div>
      <div className='bg-muted mt-1 h-1 w-20 overflow-hidden rounded-full'>
        <div
          className={cn('h-full', isLow ? 'bg-amber-500' : 'bg-foreground')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ClassesTable({
  rows,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  totalAll
}: {
  rows: ClassRow[];
  selectedId: string;
  onSelect: (id: string) => void;
  filter: ClassStatus | 'all';
  onFilterChange: (v: ClassStatus | 'all') => void;
  totalAll: number;
}) {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex items-center gap-3 border-b p-3'>
        <Tabs value={filter} onValueChange={(v) => onFilterChange(v as ClassStatus | 'all')}>
          <TabsList className='h-8'>
            <TabsTrigger value='all' className='h-6 px-2.5 text-[12px]'>
              All <span className='ml-1 font-mono opacity-60'>{totalAll}</span>
            </TabsTrigger>
            <TabsTrigger value='running' className='h-6 px-2.5 text-[12px]'>
              Running
            </TabsTrigger>
            <TabsTrigger value='upcoming' className='h-6 px-2.5 text-[12px]'>
              Upcoming
            </TabsTrigger>
            <TabsTrigger value='ended' className='h-6 px-2.5 text-[12px]'>
              Ended
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className='text-muted-foreground ml-auto font-mono text-[12px]'>
          {rows.length} of {totalAll}
        </div>
      </div>
      <Table>
        <TableHeader className='bg-muted/40'>
          <TableRow>
            <TableHead className='text-[11px] tracking-wider uppercase'>Class</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Teacher</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Schedule</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Capacity</TableHead>
            <TableHead className='px-4 text-right' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <TableRow
                key={c.id}
                className={cn('cursor-pointer', isSelected && 'bg-muted/40')}
                onClick={() => onSelect(c.id)}
              >
                <TableCell className='px-4 py-3'>
                  <div className='font-medium'>{c.name}</div>
                  <div className='text-muted-foreground font-mono text-[11px]'>
                    {c.courseTitle} · {c.location}
                  </div>
                </TableCell>
                <TableCell className='py-3'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold',
                        avatarToneClass[c.teacherTone]
                      )}
                    >
                      {c.teacherInitials}
                    </span>
                    <span className='text-[13px]'>{c.teacherShort}</span>
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
                  {c.schedule}
                </TableCell>
                <TableCell className='py-3'>
                  <CapacityCell enrolled={c.enrolled} capacity={c.capacity} />
                </TableCell>
                <TableCell className='px-4 py-3 text-right'>
                  {isSelected ? (
                    <span className='text-muted-foreground font-mono text-[12px]'>selected →</span>
                  ) : (
                    <button className='text-muted-foreground hover:text-foreground text-[12px]'>
                      Open
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ClassDetailPanel({ cls }: { cls: ClassRow }) {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='border-b px-5 pt-5 pb-4'>
        <div className='text-muted-foreground flex items-center gap-2 font-mono text-[12px]'>
          <span className='uppercase'>{cls.courseTitle}</span>
          <span>·</span>
          <span>CODE-101</span>
        </div>
        <div className='mt-1 flex flex-wrap items-end justify-between gap-2'>
          <h2 className='text-[20px] font-semibold tracking-tight'>{cls.name}</h2>
          <span className='inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800'>
            Running · Week 4 of 12
          </span>
        </div>
        <div className='mt-3 grid grid-cols-3 gap-2 text-[12px]'>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              Teacher
            </div>
            <div className='mt-0.5 flex items-center gap-1.5 font-medium'>
              <span
                className={cn(
                  'grid h-4 w-4 place-items-center rounded-full text-[8px] font-semibold',
                  avatarToneClass[cls.teacherTone]
                )}
              >
                {cls.teacherInitials}
              </span>
              {cls.teacherShort}
            </div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              Schedule
            </div>
            <div className='mt-0.5 font-mono text-[11.5px] font-medium'>{cls.schedule}</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              Capacity
            </div>
            <div className='mt-0.5 font-mono font-medium'>
              {cls.enrolled} / {cls.capacity}
            </div>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between border-b px-5 py-3'>
        <div className='text-[13px] font-medium'>
          Students
          <span className='text-muted-foreground ml-1 font-mono'>{cls.enrolled}</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <Button variant='outline' size='sm' className='h-7 px-2 text-[12px]'>
            Mark attendance
          </Button>
          <Button variant='outline' size='sm' className='h-7 px-2 text-[12px]'>
            Add student
          </Button>
        </div>
      </div>

      <ul className='max-h-[520px] divide-y overflow-auto'>
        {classStudents.map((s) => (
          <li key={s.id} className='hover:bg-muted/30 flex items-center gap-3 px-5 py-2.5'>
            <span
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold',
                avatarToneClass[s.tone]
              )}
            >
              {s.initials}
            </span>
            <div className='min-w-0 flex-1 leading-tight'>
              <div className='truncate text-sm font-medium'>{s.name}</div>
              <div className='text-muted-foreground font-mono text-[11px]'>
                grade {s.grade} · age {s.age}
              </div>
            </div>
            <div className='text-muted-foreground font-mono text-[11px]'>
              {s.attendance}% attendance
            </div>
            <span
              className={cn(
                'inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px]',
                studentStatusClass[s.status]
              )}
            >
              {studentStatusLabel[s.status]}
            </span>
          </li>
        ))}
        <li className='hover:bg-muted/30 flex items-center gap-3 px-5 py-2.5'>
          <span className='bg-foreground text-background grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold'>
            +5
          </span>
          <div className='min-w-0 flex-1 leading-tight'>
            <div className='text-muted-foreground text-sm'>5 more students…</div>
          </div>
        </li>
      </ul>
    </div>
  );
}

export function ClassesView() {
  const [filter, setFilter] = useState<ClassStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState(
    classRows.find((c) => c.selected)?.id ?? classRows[0].id
  );

  const visible = useMemo(
    () => (filter === 'all' ? classRows : classRows.filter((c) => c.status === filter)),
    [filter]
  );

  const selected = classRows.find((c) => c.id === selectedId) ?? classRows[0];

  return (
    <div className='grid grid-cols-12 gap-4'>
      <div className='col-span-12 xl:col-span-7'>
        <ClassesTable
          rows={visible}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={filter}
          onFilterChange={setFilter}
          totalAll={42}
        />
      </div>
      <div className='col-span-12 xl:col-span-5'>
        <ClassDetailPanel cls={selected} />
      </div>
    </div>
  );
}

export function ClassesHeaderAction() {
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.adjustments className='size-3.5' />
        Filters
      </Button>
      <AddClassDialog />
    </div>
  );
}
