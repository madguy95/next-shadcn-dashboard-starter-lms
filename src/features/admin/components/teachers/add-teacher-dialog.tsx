'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
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
import { useCreateTeacher, type Gender } from '@/api/teachers';
import { formatApiError } from '@/lib/api-client';
import { TeacherForm, type TeacherFormValues } from './teacher-form';

const FORM_ID = 'add-teacher-form';

// Subject + location defaults are intentionally blank — the form lazy-loads
// options from /api/master-data and the user picks one. The schema marks both
// as required so submit blocks until a choice is made.
const defaultValues: TeacherFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  avatar: [],
  primarySubject: '',
  location: '',
  tags: [],
  sendOnboardingEmail: true
};

export function AddTeacherDialog() {
  const t = useTranslations('teachers');
  const tCommon = useTranslations('common');
  const [open, setOpen] = React.useState(false);
  const createTeacher = useCreateTeacher();

  const handleOpenChange = (next: boolean) => {
    if (createTeacher.isPending) return;
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm' className='h-9'>
          <Icons.add className='size-3.5' />
          {t('addTeacher')}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[92vh] overflow-y-auto sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>{t('addDialog.title')}</DialogTitle>
          <DialogDescription>{t('addDialog.description')}</DialogDescription>
        </DialogHeader>

        <TeacherForm
          formId={FORM_ID}
          defaultValues={defaultValues}
          isPending={createTeacher.isPending}
          submitLabel={t('addDialog.sendInvite')}
          onSubmit={async (value) => {
            try {
              const teacher = await createTeacher.mutateAsync({
                ...value,
                gender: value.gender as Gender,
                avatar: value.avatar[0]
              });
              toast.success(t('addDialog.successToast', { name: teacher.name }));
              setOpen(false);
            } catch (e) {
              const { title, description } = formatApiError(e, t('addDialog.errorToast'));
              toast.error(title, description ? { description } : undefined);
            }
          }}
          renderFooter={(submitButton) => (
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-9'
                  disabled={createTeacher.isPending}
                >
                  {tCommon('cancel')}
                </Button>
              </DialogClose>
              {submitButton}
            </DialogFooter>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
