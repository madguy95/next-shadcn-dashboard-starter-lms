'use client';

import { useMemo, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  courseCategoryCounts,
  courses,
  type Course,
  type CourseCategory
} from '@/features/admin/data';
import { AddCourseDialog } from './add-course-dialog';

const thumbStripeStyle: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, color-mix(in srgb, currentColor 4%, transparent) 0 8px, transparent 8px 16px)'
};

function StatusBadge({ status }: { status: Course['status'] }) {
  if (status === 'published') {
    return (
      <span className='inline-flex items-center rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700'>
        published
      </span>
    );
  }
  return (
    <span className='inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] text-amber-800'>
      draft
    </span>
  );
}

function CourseCard({
  course,
  selected,
  onSelect
}: {
  course: Course;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'bg-card overflow-hidden rounded-lg border text-left shadow-sm transition',
        selected ? 'border-foreground border-2' : 'hover:border-foreground/40'
      )}
    >
      <div className='relative grid h-24 place-items-center border-b' style={thumbStripeStyle}>
        <div className='text-muted-foreground font-mono text-[10px]'>{course.cover}</div>
        {selected && (
          <span className='bg-foreground text-background absolute top-2 left-2 inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px]'>
            SELECTED
          </span>
        )}
      </div>
      <div className='p-4'>
        <div className='flex items-center justify-between'>
          <span className='bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]'>
            {course.code}
          </span>
          <StatusBadge status={course.status} />
        </div>
        <div className='mt-2 text-[15px] font-semibold tracking-tight'>{course.title}</div>
        <div className='text-muted-foreground mt-0.5 text-[12px]'>
          {course.ageRange} · {course.tagline}
        </div>
        <div className='mt-3 grid grid-cols-3 gap-1 text-center font-mono text-[11px]'>
          <div className='bg-muted/50 rounded py-1'>
            <div className='text-foreground font-semibold'>{course.weeks}</div>
            <div className='opacity-60'>weeks</div>
          </div>
          <div className='bg-muted/50 rounded py-1'>
            <div className='text-foreground font-semibold'>{course.classes}</div>
            <div className='opacity-60'>classes</div>
          </div>
          <div className='bg-muted/50 rounded py-1'>
            <div className='text-foreground font-semibold'>{course.enrolled}</div>
            <div className='opacity-60'>enrolled</div>
          </div>
        </div>
      </div>
    </button>
  );
}

function CourseDetailPanel({ course }: { course: Course }) {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='relative grid h-28 place-items-center border-b' style={thumbStripeStyle}>
        <div className='text-muted-foreground font-mono text-[11px]'>{course.cover} · 1200×400</div>
        <Button
          variant='outline'
          size='sm'
          className='absolute top-3 right-3 h-7 px-2 text-[11px] shadow-sm'
        >
          <Icons.edit className='size-3' />
          Edit
        </Button>
      </div>
      <div className='p-5'>
        <div className='flex items-center gap-2'>
          <span className='bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]'>
            {course.code}
          </span>
          <StatusBadge status={course.status} />
          <span className='text-muted-foreground ml-auto font-mono text-[11px]'>
            {course.version}
          </span>
        </div>
        <h2 className='mt-2 text-[19px] font-semibold tracking-tight'>{course.title}</h2>
        <p className='text-muted-foreground mt-1 text-[13px] leading-relaxed'>
          {course.description}
        </p>

        <div className='mt-4 grid grid-cols-2 gap-2 text-[12px]'>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              Duration
            </div>
            <div className='font-medium'>{course.weeks} weeks</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>Ages</div>
            <div className='font-medium'>{course.ageRange.replace('Ages ', '')}</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              Tuition
            </div>
            <div className='font-mono font-medium'>{course.tuition}</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              Capacity / class
            </div>
            <div className='font-medium'>{course.perClassCapacity} students</div>
          </div>
        </div>

        <div className='mt-5'>
          <div className='mb-2 flex items-center justify-between text-[12px] font-medium'>
            <span>Curriculum · {course.weeks} units</span>
            <button className='text-muted-foreground hover:text-foreground font-mono text-[11px]'>
              Edit outline
            </button>
          </div>
          <ul className='divide-y rounded-md border text-[12.5px]'>
            {course.curriculum.map((unit, i) => {
              const isLast = i === course.curriculum.length - 1;
              return (
                <li
                  key={unit}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2',
                    isLast && 'text-muted-foreground'
                  )}
                >
                  <span className='text-muted-foreground w-7 font-mono text-[11px]'>
                    {isLast ? '…' : String(i + 1).padStart(2, '0')}
                  </span>
                  {unit}
                </li>
              );
            })}
          </ul>
        </div>

        <div className='mt-5 flex gap-2'>
          <Button className='h-9 flex-1'>Open course</Button>
          <Button variant='outline' className='h-9'>
            Duplicate
          </Button>
          <Button variant='outline' size='icon' className='h-9 w-9'>
            <Icons.ellipsis className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CoursesView() {
  const [selectedId, setSelectedId] = useState(courses[0].id);
  const [category, setCategory] = useState<CourseCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (category !== 'all' && c.category !== category) return false;
      if (term && !c.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [category, search]);

  const selected = courses.find((c) => c.id === selectedId) ?? courses[0];

  return (
    <div className='grid grid-cols-12 gap-4'>
      <div className='col-span-12 space-y-4 xl:col-span-8'>
        <div className='flex flex-wrap items-center gap-2'>
          {courseCategoryCounts.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type='button'
                onClick={() => setCategory(c.key)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px]',
                  active ? 'bg-foreground text-background border-foreground' : 'hover:bg-accent'
                )}
              >
                {c.label}
                <span className='font-mono opacity-60'>{c.count}</span>
              </button>
            );
          })}
          <div className='relative ml-auto w-64'>
            <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search courses…'
              className='h-8 pl-8 text-[13px]'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {visible.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              selected={c.id === selectedId}
              onSelect={() => setSelectedId(c.id)}
            />
          ))}
          {visible.length === 0 && (
            <div className='text-muted-foreground col-span-full rounded-lg border border-dashed py-10 text-center text-sm'>
              No courses match your filters.
            </div>
          )}
        </div>
      </div>

      <div className='col-span-12 xl:col-span-4'>
        <CourseDetailPanel course={selected} />
      </div>
    </div>
  );
}

export function CoursesHeaderAction() {
  return (
    <div className='flex items-center gap-2'>
      <Tabs defaultValue='cards'>
        <TabsList className='h-9'>
          <TabsTrigger value='cards' className='h-7 px-3 text-sm'>
            <Icons.layoutGrid className='size-3.5' />
            Cards
          </TabsTrigger>
          <TabsTrigger value='table' className='h-7 px-3 text-sm'>
            <Icons.kanban className='size-3.5' />
            Table
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <AddCourseDialog />
    </div>
  );
}
