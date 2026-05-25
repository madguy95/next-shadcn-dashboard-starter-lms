'use client';

import { useMemo, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { teachers, type Teacher } from '@/api/teachers';
import { avatarToneClass, courses } from '@/features/admin/data';

const thumbStripeStyle: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, color-mix(in srgb, currentColor 4%, transparent) 0 8px, transparent 8px 16px)'
};

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const locations = ['Room 204', 'Room 101', 'Online'];
const visibilities = ['Public · enrollable', 'Public · view-only', 'Private'];

export function AddClassDialog({
  trigger
}: {
  trigger?: React.ReactNode;
} = {}) {
  const [courseId, setCourseId] = useState(courses[0].id);
  const [label, setLabel] = useState('A4');
  const [teacherId, setTeacherId] = useState<Teacher['id']>(teachers[0].id);
  const [location, setLocation] = useState(locations[0]);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [startDate, setStartDate] = useState('Jun 02, 2026');
  const [endDate, setEndDate] = useState('Aug 24, 2026');
  const [capacity, setCapacity] = useState('12');
  const [visibility, setVisibility] = useState(visibilities[0]);
  const [autofill, setAutofill] = useState(true);

  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const teacher = teachers.find((t) => t.id === teacherId) ?? teachers[0];

  const sessionsTotal = useMemo(() => {
    const weeks = course.weeks ?? 12;
    return selectedDays.length * weeks;
  }, [course.weeks, selectedDays.length]);

  const conflict =
    teacher.id === 'T-001' &&
    selectedDays.includes('Mon') &&
    selectedDays.includes('Wed') &&
    startTime === '09:00';

  const toggleDay = (day: string) =>
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size='sm' className='h-9'>
            <Icons.add className='size-3.5' />
            New class
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[820px]'>
        <DialogHeader className='border-b px-6 pt-5 pr-14 pb-4'>
          <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
            Summer Term 2026
          </div>
          <DialogTitle className='text-base tracking-tight'>Create a new class</DialogTitle>
          <DialogDescription className='text-[12px]'>
            Spin up a class from a course, pick a teacher, and lock the schedule.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 overflow-auto p-6 text-sm'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <div className='space-y-1.5 sm:col-span-2'>
              <Label className='text-muted-foreground text-[12px]'>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className='h-10 w-full'>
                  <SelectValue>
                    <span className='flex items-center gap-2'>
                      <span
                        style={thumbStripeStyle}
                        className='h-6 w-6 shrink-0 rounded-md border'
                      />
                      <span className='flex flex-col items-start leading-tight sm:flex-row sm:items-center sm:gap-1'>
                        <span className='font-medium'>{course.title}</span>
                        <span className='text-muted-foreground font-mono text-[11px]'>
                          {course.code} · {course.weeks} weeks
                        </span>
                      </span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className='flex items-center gap-2'>
                        <span className='font-medium'>{c.title}</span>
                        <span className='text-muted-foreground font-mono text-[11px]'>
                          {c.code}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='class-label' className='text-muted-foreground text-[12px]'>
                Class label
              </Label>
              <Input
                id='class-label'
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className='h-10 font-mono'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-[12px]'>Teacher</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className='h-10 w-full'>
                  <SelectValue>
                    <span className='flex items-center gap-2'>
                      <span
                        className={cn(
                          'grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold',
                          avatarToneClass[teacher.tone]
                        )}
                      >
                        {teacher.initials}
                      </span>
                      <span className='font-medium'>{teacher.name}</span>
                      <span className='text-muted-foreground font-mono text-[11px]'>
                        · {teacher.classCount} active classes
                      </span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className='flex items-center gap-2'>
                        <span
                          className={cn(
                            'grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold',
                            avatarToneClass[t.tone]
                          )}
                        >
                          {t.initials}
                        </span>
                        {t.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-[12px]'>Location</Label>
              <div className='grid grid-cols-3 gap-1.5'>
                {locations.map((loc) => {
                  const active = location === loc;
                  return (
                    <button
                      key={loc}
                      type='button'
                      onClick={() => setLocation(loc)}
                      className={cn(
                        'h-10 rounded-md border text-[12.5px] transition',
                        active
                          ? 'bg-foreground text-background border-foreground'
                          : 'hover:bg-accent'
                      )}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className='mb-2 flex items-center justify-between'>
              <Label className='text-muted-foreground text-[12px]'>Weekly schedule</Label>
              <div className='text-muted-foreground font-mono text-[11px]'>
                {selectedDays.length} session{selectedDays.length === 1 ? '' : 's'} × 60 min
              </div>
            </div>
            <div className='mb-3 flex flex-wrap items-center gap-1'>
              {days.map((d) => {
                const active = selectedDays.includes(d);
                return (
                  <button
                    key={d}
                    type='button'
                    onClick={() => toggleDay(d)}
                    className={cn(
                      'h-9 rounded-md border px-3 text-[12.5px] transition',
                      active ? 'bg-foreground text-background border-foreground' : 'hover:bg-accent'
                    )}
                  >
                    {d}
                  </button>
                );
              })}
              <div className='ml-auto flex items-center gap-2'>
                <span className='text-muted-foreground text-[12px]'>Time</span>
                <Input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  aria-label='Start time'
                  className='h-9 w-20 px-2 text-center font-mono text-sm'
                />
                <span className='text-muted-foreground'>—</span>
                <Input
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  aria-label='End time'
                  className='h-9 w-20 px-2 text-center font-mono text-sm'
                />
              </div>
            </div>
            {conflict && (
              <div className='flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50/60 p-3 text-[12.5px] text-amber-900'>
                <Icons.warning className='mt-0.5 size-3.5 shrink-0' />
                <div>
                  <div className='font-medium'>
                    {teacher.name} already teaches <span className='font-mono'>Scratch · A1</span>{' '}
                    at this time.
                  </div>
                  <div className='opacity-80'>
                    Pick another time slot or reassign the existing class to keep her under the 16
                    hr/week cap.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-[12px]'>Starts</Label>
              <DateField value={startDate} onChange={setStartDate} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-[12px]'>Ends</Label>
              <DateField value={endDate} onChange={setEndDate} />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-[12px]'>Capacity</Label>
              <div className='bg-background flex h-9 items-center rounded-md border'>
                <input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className='flex-1 border-0 bg-transparent px-3 font-mono text-sm outline-none'
                  aria-label='Capacity'
                />
                <span className='text-muted-foreground border-l px-3 text-[12px]'>students</span>
              </div>
            </div>
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-[12px]'>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilities.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex items-center gap-3 rounded-md border p-3'>
            <div className='bg-muted grid h-9 w-9 place-items-center rounded-md'>
              <Icons.teams className='size-3.5' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-sm font-medium'>
                Auto-fill from {course.title.split(' ')[0]} waitlist
              </div>
              <div className='text-muted-foreground text-[12px]'>
                7 students currently waiting · the first {capacity || '—'} matching this schedule
                will be offered seats on save.
              </div>
            </div>
            <Switch
              checked={autofill}
              onCheckedChange={setAutofill}
              aria-label='Auto-fill from waitlist'
            />
          </div>
        </div>

        <DialogFooter className='bg-muted/30 flex flex-row items-center justify-between gap-2 border-t px-6 py-3'>
          <div className='text-muted-foreground text-[12px]'>
            Will create <span className='text-foreground font-mono'>{sessionsTotal} sessions</span>{' '}
            across the term.
          </div>
          <div className='flex items-center gap-2'>
            <DialogClose asChild>
              <Button variant='outline' size='sm' className='h-9'>
                Cancel
              </Button>
            </DialogClose>
            <Button variant='outline' size='sm' className='h-9'>
              Save as draft
            </Button>
            <Button size='sm' className='h-9' disabled={conflict}>
              <Icons.check className='size-3.5' />
              Create class
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className='bg-background flex h-9 items-center justify-between rounded-md border px-3 font-mono text-[13px]'>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='flex-1 border-0 bg-transparent outline-none'
        aria-label='Date'
      />
      <Icons.calendar className='text-muted-foreground size-3.5' />
    </div>
  );
}
