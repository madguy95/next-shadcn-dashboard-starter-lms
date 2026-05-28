'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { LoadingState } from '@/components/ui/loading-state';
import { courseListOptions } from '@/api/courses';
import { teacherOptionsQuery } from '@/api/teachers';
import { AddClassForm } from './add-class-form';

/**
 * Outer shell: owns dialog open state and prefetches the unfiltered
 * course/teacher lists so the inner form can mount with valid defaults.
 *
 * The form lives in a sibling component that's only rendered once both
 * lists have resolved — this sidesteps TanStack Form's mount-once
 * `defaultValues` behaviour, so we never end up with a form whose
 * required selects are blank because the data hadn't arrived in time.
 */
export function AddClassDialog({ trigger }: { trigger?: React.ReactNode } = {}) {
  const t = useTranslations('classes');
  const tDialog = useTranslations('classes.addDialog');

  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const {
    data: coursesResult,
    isPending: coursesPending,
    isError: coursesError
  } = useQuery(courseListOptions({ status: 'published' }));
  const {
    data: teachersData,
    isPending: teachersPending,
    isError: teachersError
  } = useQuery(teacherOptionsQuery({ status: 'active' }));

  const isLoading = coursesPending || teachersPending;
  const hasError = coursesError || teachersError;
  const initialCourses = coursesResult?.data ?? [];
  const initialTeachers = teachersData ?? [];
  // Gate dialog on queries having resolved — not on length — so the empty
  // state below can warn the admin instead of spinning forever when there
  // are 0 published courses or 0 active teachers.
  const ready = !isLoading && !hasError && initialCourses.length > 0 && initialTeachers.length > 0;
  const emptyReason: 'courses' | 'teachers' | null =
    !isLoading && !hasError
      ? initialCourses.length === 0
        ? 'courses'
        : initialTeachers.length === 0
          ? 'teachers'
          : null
      : null;

  const handleOpenChange = (next: boolean) => {
    // Block close while the create mutation is in-flight so the user can't
    // dismiss the dialog mid-write.
    if (pending) return;
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size='sm' className='h-9'>
            <Icons.add className='size-3.5' />
            {t('newClass')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='grid max-h-[92vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-[820px]'>
        <DialogHeader className='space-y-0.5 border-b px-6 pt-5 pr-14 pb-4'>
          <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
            {tDialog('section')}
          </div>
          <DialogTitle className='text-base tracking-tight'>{tDialog('title')}</DialogTitle>
          <DialogDescription className='text-[12px]'>{tDialog('description')}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <LoadingState minHeight='280px' message={tDialog('description')} />
        ) : hasError ? (
          <div className='text-muted-foreground grid min-h-[280px] place-items-center px-6 text-center text-sm'>
            {tDialog('loadError')}
          </div>
        ) : emptyReason ? (
          <div className='text-muted-foreground grid min-h-[280px] place-items-center gap-1 px-6 text-center text-sm'>
            <p className='text-foreground font-medium'>{tDialog(`empty.${emptyReason}.title`)}</p>
            <p className='text-[13px]'>{tDialog(`empty.${emptyReason}.body`)}</p>
          </div>
        ) : ready ? (
          <AddClassForm
            initialCourses={initialCourses}
            initialTeachers={initialTeachers}
            onClose={() => setOpen(false)}
            onPendingChange={setPending}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
