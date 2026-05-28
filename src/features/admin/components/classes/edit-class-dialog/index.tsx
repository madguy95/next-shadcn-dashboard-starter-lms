'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { LoadingState } from '@/components/ui/loading-state';
import { type ClassRow } from '@/api/classes';
import { courseListOptions } from '@/api/courses';
import { teacherOptionsQuery } from '@/api/teachers';
import { EditClassForm } from './edit-class-form';

interface EditClassDialogProps {
  cls: ClassRow;
  /** Render-prop trigger — parent renders the open button. */
  trigger: React.ReactNode;
}

/**
 * Outer shell for editing an existing class. Mirrors AddClassDialog: prefetch
 * the unfiltered published-courses / active-teachers lists so the inner form
 * can populate the comboboxes (and find the currently-selected option even if
 * the user later types into the search).
 */
export function EditClassDialog({ cls, trigger }: EditClassDialogProps) {
  const tDialog = useTranslations('classes.editDialog');

  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  // Only fire the queries while the dialog is open so we don't double-fetch
  // for every class row that renders an edit button.
  const {
    data: coursesResult,
    isPending: coursesPending,
    isError: coursesError
  } = useQuery({ ...courseListOptions({ status: 'published' }), enabled: open });
  const {
    data: teachersData,
    isPending: teachersPending,
    isError: teachersError
  } = useQuery({ ...teacherOptionsQuery({ status: 'active' }), enabled: open });

  const isLoading = open && (coursesPending || teachersPending);
  const hasError = coursesError || teachersError;
  const initialCourses = coursesResult?.data ?? [];
  const initialTeachers = teachersData ?? [];

  const handleOpenChange = (next: boolean) => {
    if (pending) return;
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='grid max-h-[92vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-[820px]'>
        <DialogHeader className='space-y-0.5 border-b px-6 pt-5 pr-14 pb-4'>
          <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
            {tDialog('section')}
          </div>
          <DialogTitle className='text-base tracking-tight'>
            {tDialog('title', { name: cls.name })}
          </DialogTitle>
          <DialogDescription className='text-[12px]'>{tDialog('description')}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <LoadingState minHeight='280px' message={tDialog('description')} />
        ) : hasError ? (
          <div className='text-muted-foreground grid min-h-[280px] place-items-center px-6 text-center text-sm'>
            {tDialog('loadError')}
          </div>
        ) : (
          <EditClassForm
            cls={cls}
            initialCourses={initialCourses}
            initialTeachers={initialTeachers}
            onClose={() => setOpen(false)}
            onPendingChange={setPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
