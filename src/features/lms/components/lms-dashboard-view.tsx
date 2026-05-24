'use client';

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
  courseFill,
  enrollmentStatusClass,
  enrollmentStatusLabel,
  recentEnrollments,
  upcomingClasses
} from '@/features/lms/data';

function StatChip({ delta, tone = 'positive' }: { delta: string; tone?: 'positive' | 'warning' }) {
  if (tone === 'warning') {
    return (
      <span className='inline-flex items-center gap-1 rounded border border-amber-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-amber-800'>
        {delta}
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700'>
      <Icons.chevronUp className='size-2.5' />
      {delta}
    </span>
  );
}

function CoursesKpi() {
  return (
    <div className='bg-card rounded-lg border p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          Courses
        </div>
        <StatChip delta='+2' />
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <div className='text-[34px] leading-none font-semibold tracking-tight'>18</div>
        <div className='text-muted-foreground text-xs'>active</div>
      </div>
      <div className='mt-4 flex h-8 items-center gap-1'>
        <div className='bg-muted h-full flex-1 rounded-sm' />
        <div className='bg-muted h-2/3 flex-1 self-end rounded-sm' />
        <div className='bg-muted h-1/2 flex-1 self-end rounded-sm' />
        <div className='bg-muted h-3/4 flex-1 self-end rounded-sm' />
        <div className='bg-muted h-5/6 flex-1 self-end rounded-sm' />
        <div className='bg-muted h-2/5 flex-1 self-end rounded-sm' />
        <div className='bg-foreground h-full flex-1 rounded-sm' />
      </div>
      <div className='text-muted-foreground mt-2 flex justify-between font-mono text-[11px]'>
        <span>Mon</span>
        <span>Sun</span>
      </div>
    </div>
  );
}

function ClassesKpi() {
  return (
    <div className='bg-card rounded-lg border p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          Classes
        </div>
        <StatChip delta='+5' />
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <div className='text-[34px] leading-none font-semibold tracking-tight'>42</div>
        <div className='text-muted-foreground text-xs'>running</div>
      </div>
      <div className='mt-4 grid grid-cols-2 gap-2 font-mono text-[11px]'>
        <div className='flex items-center gap-1.5'>
          <span className='bg-foreground h-2 w-2 rounded-full' />
          Offline · 26
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='bg-muted-foreground/40 h-2 w-2 rounded-full' />
          Online · 16
        </div>
      </div>
      <div className='bg-muted mt-3 flex h-1.5 overflow-hidden rounded-full'>
        <div className='bg-foreground h-full' style={{ width: '62%' }} />
        <div className='bg-foreground/30 h-full' style={{ width: '38%' }} />
      </div>
    </div>
  );
}

function StudentsKpi() {
  const stack = [
    { initials: 'MN', cls: 'bg-foreground text-background' },
    { initials: 'TL', cls: 'bg-amber-200 text-amber-900' },
    { initials: 'QH', cls: 'bg-sky-200 text-sky-900' },
    { initials: 'DA', cls: 'bg-rose-200 text-rose-900' },
    { initials: 'VK', cls: 'bg-emerald-200 text-emerald-900' }
  ];
  return (
    <div className='bg-card rounded-lg border p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          Students
        </div>
        <StatChip delta='+38' />
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <div className='text-[34px] leading-none font-semibold tracking-tight'>624</div>
        <div className='text-muted-foreground text-xs'>enrolled</div>
      </div>
      <div className='mt-4 flex -space-x-2'>
        {stack.map((s) => (
          <span
            key={s.initials}
            className={cn(
              'border-card grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-semibold',
              s.cls
            )}
          >
            {s.initials}
          </span>
        ))}
        <span className='bg-muted text-muted-foreground border-card grid h-7 w-7 place-items-center rounded-full border-2 font-mono text-[10px]'>
          +619
        </span>
      </div>
    </div>
  );
}

function PendingKpi() {
  return (
    <div className='relative rounded-lg border border-amber-200/60 bg-amber-50/40 p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div className='text-xs font-medium tracking-wider text-amber-800 uppercase'>
          Pending enrollments
        </div>
        <StatChip delta='needs review' tone='warning' />
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <div className='text-[34px] leading-none font-semibold tracking-tight text-amber-900'>
          12
        </div>
        <div className='text-xs text-amber-800/80'>awaiting approval</div>
      </div>
      <div className='mt-4 flex items-center gap-2'>
        <Button size='sm' className='h-8 bg-amber-900 text-white hover:bg-amber-900/90'>
          Review queue
          <Icons.arrowRight className='size-3' />
        </Button>
        <span className='font-mono text-[11px] text-amber-900/70'>avg wait · 1d 4h</span>
      </div>
    </div>
  );
}

function RecentEnrollmentsCard() {
  return (
    <div className='bg-card col-span-12 overflow-hidden rounded-lg border shadow-sm xl:col-span-8'>
      <div className='flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5'>
        <div>
          <div className='text-[15px] font-semibold tracking-tight'>Recent enrollments</div>
          <div className='text-muted-foreground text-[12px]'>
            Latest 6 sign-ups across all courses
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Tabs defaultValue='all'>
            <TabsList className='h-8'>
              <TabsTrigger value='all' className='h-6 px-2.5 text-[12px]'>
                All
              </TabsTrigger>
              <TabsTrigger value='pending' className='h-6 px-2.5 text-[12px]'>
                Pending
              </TabsTrigger>
              <TabsTrigger value='active' className='h-6 px-2.5 text-[12px]'>
                Active
              </TabsTrigger>
              <TabsTrigger value='waitlist' className='h-6 px-2.5 text-[12px]'>
                Waitlist
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <button className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[12px]'>
            View all
            <Icons.arrowRight className='size-3' />
          </button>
        </div>
      </div>
      <Table>
        <TableHeader className='bg-muted/40'>
          <TableRow>
            <TableHead className='px-5 text-[11px] tracking-wider uppercase'>Student</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Course</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Channel</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Submitted</TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>Status</TableHead>
            <TableHead className='px-5 text-right' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentEnrollments.map((e) => (
            <TableRow key={e.id}>
              <TableCell className='px-5 py-3'>
                <div className='flex items-center gap-2.5'>
                  <span
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold',
                      avatarToneClass[e.tone]
                    )}
                  >
                    {e.initials}
                  </span>
                  <div className='leading-tight'>
                    <div className='font-medium'>{e.studentName}</div>
                    <div className='text-muted-foreground font-mono text-[11px]'>
                      grade {e.grade} · age {e.age}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className='py-3'>{e.course}</TableCell>
              <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
                {e.channel}
              </TableCell>
              <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
                {e.submittedAt}
              </TableCell>
              <TableCell className='py-3'>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                    enrollmentStatusClass[e.status]
                  )}
                >
                  {enrollmentStatusLabel[e.status]}
                </span>
              </TableCell>
              <TableCell className='px-5 py-3 text-right'>
                <button className='text-muted-foreground hover:text-foreground text-[12px]'>
                  Open
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UpcomingClassesCard() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex items-center justify-between border-b px-5 py-3.5'>
        <div>
          <div className='text-[15px] font-semibold tracking-tight'>Upcoming classes</div>
          <div className='text-muted-foreground text-[12px]'>Today · Mon, May 23</div>
        </div>
        <button className='text-muted-foreground hover:text-foreground text-[12px]'>
          Schedule →
        </button>
      </div>
      <ul className='divide-y'>
        {upcomingClasses.map((c) => (
          <li key={c.id} className='hover:bg-muted/30 flex gap-3 px-5 py-3.5'>
            <div className='w-14 shrink-0 text-right'>
              <div className='text-sm font-semibold tabular-nums'>{c.startTime}</div>
              <div className='text-muted-foreground font-mono text-[11px]'>{c.durationMin} min</div>
            </div>
            <div className={cn('w-1 self-stretch rounded-full', c.accent)} />
            <div className='min-w-0 flex-1'>
              <div className='truncate text-sm font-medium'>{c.title}</div>
              <div className='text-muted-foreground truncate text-[12px]'>{c.detail}</div>
            </div>
            {c.badge && (
              <span
                className={cn(
                  'mt-0.5 self-start rounded border px-1.5 py-0.5 font-mono text-[10px]',
                  c.badge.className
                )}
              >
                {c.badge.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CourseFillCard() {
  return (
    <div className='bg-card rounded-lg border p-5 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <div className='text-[15px] font-semibold tracking-tight'>Course fill rate</div>
          <div className='text-muted-foreground text-[12px]'>Top 4 courses · current term</div>
        </div>
      </div>
      <div className='space-y-3'>
        {courseFill.map((c) => {
          const pct = Math.round((c.enrolled / c.capacity) * 100);
          const low = pct < 50;
          return (
            <div key={c.id}>
              <div className='mb-1 flex justify-between text-[12px]'>
                <span>{c.name}</span>
                <span className='text-muted-foreground font-mono'>
                  {pct}% · {c.enrolled}/{c.capacity}
                </span>
              </div>
              <div className='bg-muted h-1.5 overflow-hidden rounded-full'>
                <div
                  className={cn('h-full', low ? 'bg-foreground/40' : 'bg-foreground')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LmsDashboardView() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-[26px] leading-tight font-semibold tracking-tight'>
            Good morning, Anh
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Here's what's happening at Lumen — Summer Term 2026 · Week 4 of 12.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Tabs defaultValue='week'>
            <TabsList>
              <TabsTrigger value='week'>This week</TabsTrigger>
              <TabsTrigger value='month'>Month</TabsTrigger>
              <TabsTrigger value='term'>Term</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant='outline' size='sm' className='h-9'>
            <Icons.upload className='size-3.5 rotate-180' />
            Export
          </Button>
          <Button size='sm' className='h-9'>
            <Icons.add className='size-3.5' />
            New course
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <CoursesKpi />
        <ClassesKpi />
        <StudentsKpi />
        <PendingKpi />
      </div>

      <div className='grid grid-cols-12 gap-4'>
        <RecentEnrollmentsCard />
        <div className='col-span-12 space-y-4 xl:col-span-4'>
          <UpcomingClassesCard />
          <CourseFillCard />
        </div>
      </div>
    </div>
  );
}
