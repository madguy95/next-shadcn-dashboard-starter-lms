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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const categories = ['Coding', 'Design', 'Robotics', 'STEM', 'Language', 'Game Dev'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

const thumbStripeStyle: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, color-mix(in srgb, currentColor 4%, transparent) 0 8px, transparent 8px 16px)'
};

const steps = [
  { key: 'basics', label: '1 · Basics' },
  { key: 'outline', label: '2 · Outline' },
  { key: 'pricing', label: '3 · Pricing' }
] as const;

const MAX_DESC = 240;

export function AddCourseDialog({
  trigger
}: {
  trigger?: React.ReactNode;
} = {}) {
  const [title, setTitle] = useState('AI Explorers · Level 2');
  const [code, setCode] = useState('AI-250');
  const [description, setDescription] = useState(
    'A no-code introduction to building AI-powered apps. Students learn prompt design, model selection, and ship a small project by end of term.'
  );
  const [category, setCategory] = useState('STEM');
  const [level, setLevel] = useState('Intermediate');
  const [minAge, setMinAge] = useState('12');
  const [maxAge, setMaxAge] = useState('15');
  const [weeks, setWeeks] = useState('10');
  const [sessions, setSessions] = useState('2');
  const [capacity, setCapacity] = useState('12');
  const [tags, setTags] = useState<string[]>(['AI', 'No-code', 'Intermediate']);
  const [step, setStep] = useState<(typeof steps)[number]['key']>('basics');

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size='sm' className='h-9'>
            <Icons.add className='size-3.5' />
            New course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[860px]'>
        <DialogHeader className='flex flex-row items-start justify-between gap-4 border-b px-6 pt-5 pr-14 pb-4'>
          <div className='space-y-0.5'>
            <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
              Curriculum library
            </div>
            <DialogTitle className='text-base tracking-tight'>Create a new course</DialogTitle>
            <DialogDescription className='text-[12px]'>
              Define the curriculum once — spin up classes from it later.
            </DialogDescription>
          </div>
          <div className='bg-muted inline-flex h-7 shrink-0 items-center rounded-md p-0.5 font-mono text-[11px]'>
            {steps.map((s) => (
              <button
                key={s.key}
                type='button'
                onClick={() => setStep(s.key)}
                className={cn(
                  'grid h-6 place-items-center rounded px-2 transition',
                  step === s.key
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className='grid grid-cols-12 gap-5 overflow-auto p-6'>
          <div className='col-span-12 space-y-4 text-sm lg:col-span-7'>
            <div className='grid grid-cols-3 gap-3'>
              <div className='col-span-2 space-y-1.5'>
                <Label htmlFor='course-title' className='text-muted-foreground text-[12px]'>
                  Course title
                </Label>
                <Input id='course-title' value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='course-code' className='text-muted-foreground text-[12px]'>
                  Code
                </Label>
                <Input
                  id='course-code'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className='font-mono'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='course-description' className='text-muted-foreground text-[12px]'>
                Short description
              </Label>
              <Textarea
                id='course-description'
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
                className='resize-none'
              />
              <div className='text-muted-foreground text-right font-mono text-[11px]'>
                {description.length} / {MAX_DESC}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground text-[12px]'>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground text-[12px]'>Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='min-age' className='text-muted-foreground text-[12px]'>
                  Min age
                </Label>
                <Input
                  id='min-age'
                  inputMode='numeric'
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className='font-mono'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='max-age' className='text-muted-foreground text-[12px]'>
                  Max age
                </Label>
                <Input
                  id='max-age'
                  inputMode='numeric'
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className='font-mono'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              <NumberWithUnit label='Duration' value={weeks} onChange={setWeeks} unit='weeks' />
              <NumberWithUnit
                label='Sessions / week'
                value={sessions}
                onChange={setSessions}
                unit='× 75 min'
              />
              <NumberWithUnit
                label='Default capacity'
                value={capacity}
                onChange={setCapacity}
                unit='students'
              />
            </div>

            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-[12px]'>Cover image</Label>
              <div
                style={thumbStripeStyle}
                className='grid h-28 place-items-center rounded-md border-2 border-dashed text-center'
              >
                <div>
                  <div className='text-[12px] font-medium'>Drop a 1200×400 cover here</div>
                  <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
                    PNG or JPG ·{' '}
                    <button
                      type='button'
                      className='hover:text-foreground underline decoration-dotted underline-offset-2'
                    >
                      browse files
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-muted-foreground text-[12px]'>Tags</Label>
              <div className='bg-background flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border px-2 py-1'>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]'
                  >
                    {tag}
                    <button
                      type='button'
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className='text-muted-foreground hover:text-foreground'
                      aria-label={`Remove ${tag}`}
                    >
                      <Icons.close className='size-2.5' />
                    </button>
                  </span>
                ))}
                <input
                  aria-label='Add tag'
                  className='flex-1 border-0 bg-transparent py-1 text-[12px] outline-none'
                  placeholder='Add tag…'
                />
              </div>
            </div>
          </div>

          <div className='col-span-12 lg:col-span-5'>
            <div className='text-muted-foreground mb-2 text-[11px] font-medium tracking-wider uppercase'>
              Preview
            </div>
            <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
              <div style={thumbStripeStyle} className='grid h-24 place-items-center border-b'>
                <div className='text-muted-foreground font-mono text-[10px]'>
                  {(category || 'COURSE').toUpperCase()} · COVER
                </div>
              </div>
              <div className='p-4'>
                <div className='flex items-center justify-between'>
                  <span className='bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]'>
                    {code || '—'}
                  </span>
                  <span className='inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] text-amber-800'>
                    draft
                  </span>
                </div>
                <div className='mt-2 text-[15px] font-semibold tracking-tight'>
                  {title || 'Untitled course'}
                </div>
                <div className='text-muted-foreground mt-0.5 text-[12px]'>
                  Ages {minAge || '—'}–{maxAge || '—'} · {level}
                </div>
                <div className='mt-3 grid grid-cols-3 gap-1 text-center font-mono text-[11px]'>
                  <PreviewStat value={weeks || '—'} label='weeks' />
                  <PreviewStat value={`${sessions || '—'}/wk`} label='sessions' />
                  <PreviewStat value={capacity || '—'} label='capacity' />
                </div>
              </div>
            </div>

            <div className='bg-muted/30 mt-4 rounded-md border p-3'>
              <div className='flex items-center gap-2 text-[12px] font-medium'>
                <Icons.info className='text-muted-foreground size-3.5' />
                What happens next
              </div>
              <ul className='text-muted-foreground mt-2 space-y-1.5 text-[12px]'>
                <li className='flex gap-2'>
                  <span className='text-foreground font-mono'>01</span>
                  <span>Course is saved as a draft in the curriculum library.</span>
                </li>
                <li className='flex gap-2'>
                  <span className='text-foreground font-mono'>02</span>
                  <span>Add weekly units &amp; assignments on the next step.</span>
                </li>
                <li className='flex gap-2'>
                  <span className='text-foreground font-mono'>03</span>
                  <span>Publish, then create one or more classes from it.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className='bg-muted/30 flex flex-row items-center justify-between gap-2 border-t px-6 py-3'>
          <Label
            htmlFor='dup-outline'
            className='text-muted-foreground flex items-center gap-2 text-[12px] font-normal'
          >
            <Checkbox id='dup-outline' />
            Duplicate outline from an existing course
          </Label>
          <div className='flex items-center gap-2'>
            <DialogClose asChild>
              <Button variant='outline' size='sm' className='h-9'>
                Cancel
              </Button>
            </DialogClose>
            <Button variant='outline' size='sm' className='h-9'>
              Save as draft
            </Button>
            <Button size='sm' className='h-9'>
              Continue
              <Icons.arrowRight className='size-3.5' />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NumberWithUnit({
  label,
  value,
  onChange,
  unit
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-muted-foreground text-[12px]'>{label}</Label>
      <div className='bg-background flex h-9 items-center rounded-md border'>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='flex-1 border-0 bg-transparent px-3 font-mono text-sm outline-none'
          aria-label={label}
        />
        <span className='text-muted-foreground border-l px-3 text-[12px]'>{unit}</span>
      </div>
    </div>
  );
}

function PreviewStat({ value, label }: { value: string; label: string }) {
  return (
    <div className='bg-muted/50 rounded py-1'>
      <div className='text-foreground font-semibold'>{value}</div>
      <div className='opacity-60'>{label}</div>
    </div>
  );
}
