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

const subjects = ['Scratch', 'Python', 'Web Design', 'Robotics', 'Game Dev', 'AI Explorers'];
const locations = ['Hanoi · HQ', 'HCMC · D1', 'Da Nang', 'Online only'];

export function AddTeacherDialog() {
  const [tags, setTags] = useState<string[]>(['Scratch', 'Beginner']);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='sm' className='h-9'>
          <Icons.add className='size-3.5' />
          Add teacher
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>Add teacher</DialogTitle>
          <DialogDescription>
            Send an invite. They&apos;ll set their own password.
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='firstName' className='text-muted-foreground text-[12px]'>
              First name
            </Label>
            <Input id='firstName' defaultValue='Tuyết' />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='lastName' className='text-muted-foreground text-[12px]'>
              Last name
            </Label>
            <Input id='lastName' defaultValue='Mai' />
          </div>
          <div className='col-span-2 space-y-1.5'>
            <Label htmlFor='email' className='text-muted-foreground text-[12px]'>
              Work email
            </Label>
            <Input id='email' type='email' defaultValue='tuyet.m@lumen.edu' />
          </div>
          <div className='space-y-1.5'>
            <Label className='text-muted-foreground text-[12px]'>Primary subject</Label>
            <Select defaultValue='Scratch'>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1.5'>
            <Label className='text-muted-foreground text-[12px]'>Location</Label>
            <Select defaultValue='Hanoi · HQ'>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='col-span-2 space-y-1.5'>
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

          <div className='col-span-2 mt-1 flex items-start gap-2 text-[12px]'>
            <Checkbox id='onboardingEmail' defaultChecked className='mt-0.5' />
            <Label htmlFor='onboardingEmail' className='leading-snug font-normal'>
              Send onboarding email with class assignment &amp; schedule.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' size='sm' className='h-9'>
              Cancel
            </Button>
          </DialogClose>
          <Button size='sm' className='h-9'>
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
