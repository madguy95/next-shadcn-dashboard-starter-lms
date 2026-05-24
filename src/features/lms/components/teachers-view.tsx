'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
  teacherCounts,
  teacherStatusClass,
  teacherStatusLabel,
  teachers,
  type TeacherStatus
} from '@/features/lms/data';
import { AddTeacherDialog } from './add-teacher-dialog';

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

export function TeachersView() {
  const [tab, setTab] = useState<TeacherStatus | 'all'>('all');

  const filtered = tab === 'all' ? teachers : teachers.filter((t) => t.status === tab);

  return (
    <div className='space-y-4'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex flex-wrap items-center gap-3 border-b p-3'>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className='h-8'>
              <TabsTrigger value='all' className='h-6 px-2.5 text-[12px]'>
                All
                <span className='ml-1 font-mono opacity-60'>{teacherCounts.all}</span>
              </TabsTrigger>
              <TabsTrigger value='active' className='h-6 px-2.5 text-[12px]'>
                Active
                <span className='ml-1 font-mono opacity-60'>{teacherCounts.active}</span>
              </TabsTrigger>
              <TabsTrigger value='on_leave' className='h-6 px-2.5 text-[12px]'>
                On leave
                <span className='ml-1 font-mono opacity-60'>{teacherCounts.on_leave}</span>
              </TabsTrigger>
              <TabsTrigger value='pending' className='h-6 px-2.5 text-[12px]'>
                Pending
                <span className='ml-1 font-mono opacity-60'>{teacherCounts.pending}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='relative w-72'>
            <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
            <Input placeholder='Search by name, subject, email…' className='h-8 pl-8 text-sm' />
          </div>

          <FilterButton label='Subject' />
          <FilterButton label='Location' />

          <div className='text-muted-foreground ml-auto font-mono text-[12px]'>
            {filtered.length} results
          </div>
        </div>

        <Table>
          <TableHeader className='bg-muted/40'>
            <TableRow>
              <TableHead className='w-8 px-5'>
                <Checkbox aria-label='Select all' />
              </TableHead>
              <TableHead className='text-[11px] tracking-wider uppercase'>Teacher</TableHead>
              <TableHead className='text-[11px] tracking-wider uppercase'>Subjects</TableHead>
              <TableHead className='text-[11px] tracking-wider uppercase'>Classes</TableHead>
              <TableHead className='text-[11px] tracking-wider uppercase'>Students</TableHead>
              <TableHead className='text-[11px] tracking-wider uppercase'>Rating</TableHead>
              <TableHead className='text-[11px] tracking-wider uppercase'>Status</TableHead>
              <TableHead className='px-5 text-right' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className='px-5 py-3'>
                  <Checkbox aria-label={`Select ${t.name}`} />
                </TableCell>
                <TableCell className='py-3'>
                  <div className='flex items-center gap-2.5'>
                    <span
                      className={cn(
                        'grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold',
                        avatarToneClass[t.tone]
                      )}
                    >
                      {t.initials}
                    </span>
                    <div className='leading-tight'>
                      <div className='font-medium'>{t.name}</div>
                      <div className='text-muted-foreground font-mono text-[11px]'>{t.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='py-3'>
                  <div className='flex flex-wrap gap-1'>
                    {t.subjects.map((s) => (
                      <span key={s} className='bg-muted rounded px-1.5 py-0.5 text-[11px]'>
                        {s}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className='py-3 font-mono text-[12px]'>{t.classCount}</TableCell>
                <TableCell className='py-3 font-mono text-[12px]'>{t.studentCount}</TableCell>
                <TableCell className='py-3'>
                  <div className='flex items-center gap-1'>
                    <Icons.star className='size-3.5 fill-amber-500 text-amber-500' />
                    <span className='font-mono text-[12px]'>{t.rating.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell className='py-3'>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      teacherStatusClass[t.status]
                    )}
                  >
                    {teacherStatusLabel[t.status]}
                  </span>
                </TableCell>
                <TableCell className='px-5 py-3 text-right'>
                  <div className='inline-flex gap-1'>
                    <Button variant='ghost' size='sm' className='h-7 px-2 text-[12px]'>
                      Assign
                    </Button>
                    <Button variant='ghost' size='icon' className='h-7 w-7'>
                      <Icons.ellipsis className='size-3.5' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-[12px]'>
          <div>
            Showing <span className='text-foreground font-mono'>1–{filtered.length}</span> of{' '}
            <span className='text-foreground font-mono'>{teacherCounts.all}</span>
          </div>
          <div className='inline-flex gap-1'>
            <Button variant='outline' size='sm' className='h-7 px-2 text-[12px]'>
              Previous
            </Button>
            <Button size='sm' className='h-7 w-7 font-mono text-[12px]'>
              1
            </Button>
            <Button variant='outline' size='sm' className='h-7 w-7 font-mono text-[12px]'>
              2
            </Button>
            <Button variant='outline' size='sm' className='h-7 w-7 font-mono text-[12px]'>
              3
            </Button>
            <Button variant='outline' size='sm' className='h-7 w-7 font-mono text-[12px]'>
              4
            </Button>
            <Button variant='outline' size='sm' className='h-7 px-2 text-[12px]'>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeachersHeaderAction() {
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.upload className='size-3.5 rotate-180' />
        Export CSV
      </Button>
      <AddTeacherDialog />
    </div>
  );
}
