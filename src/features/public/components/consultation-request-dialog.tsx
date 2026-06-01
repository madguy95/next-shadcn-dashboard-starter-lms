'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { submitConsultationRequest } from '@/api/enrollments/service';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: { id: number; title: string };
};

type FormValues = {
  parentName: string;
  parentPhone: string;
  childName: string;
  note: string;
};

const EMPTY: FormValues = { parentName: '', parentPhone: '', childName: '', note: '' };

export function ConsultationRequestDialog({ open, onOpenChange, course }: Props) {
  const t = useTranslations('public.consultation');
  const [success, setSuccess] = useState<{ phone: string } | null>(null);

  const fieldSchemas = useMemo(
    () => ({
      parentName: z.string().trim().min(2, t('validation.parentNameRequired')).max(120),
      parentPhone: z
        .string()
        .trim()
        .min(1, t('validation.parentPhoneRequired'))
        .regex(/^[0-9+\-\s]{8,20}$/, t('validation.parentPhoneInvalid')),
      childName: z.string().trim().max(120),
      note: z.string().trim().max(500, t('validation.noteTooLong'))
    }),
    [t]
  );

  const formSchema = useMemo(() => z.object(fieldSchemas), [fieldSchemas]);

  const form = useAppForm({
    defaultValues: EMPTY,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      try {
        await submitConsultationRequest({
          parentName: value.parentName,
          parentPhone: value.parentPhone,
          childName: value.childName.trim() || undefined,
          interestedCourseId: course?.id,
          note: value.note.trim() || undefined
        });
        setSuccess({ phone: value.parentPhone });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('submitError'));
      }
    }
  });

  const { FormTextField, FormTextareaField } = useFormFields<FormValues>();

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setTimeout(() => {
        form.reset();
        setSuccess(null);
      }, 150);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-[520px]'>
          <DialogHeader>
            <div className='bg-success/15 text-success mx-auto mb-2 grid size-12 place-items-center rounded-full'>
              <Icons.check className='size-6' />
            </div>
            <DialogTitle className='text-center'>{t('successTitle')}</DialogTitle>
            <DialogDescription className='text-center'>
              {t('successBodyBefore')}{' '}
              <span className='text-foreground font-medium'>{success.phone}</span>{' '}
              {t('successBody')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className='w-full' onClick={() => handleClose(false)}>
              {t('successClose')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {course && (
              <>
                <span className='text-foreground font-medium'>{course.title}</span>
                <br />
              </>
            )}
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className='grid gap-4'>
            <FormTextField
              name='parentName'
              label={t('parentName')}
              required
              placeholder={t('parentNamePlaceholder')}
              autoComplete='name'
              validators={{ onBlur: fieldSchemas.parentName }}
            />

            <FormTextField
              name='parentPhone'
              label={t('parentPhone')}
              required
              placeholder={t('parentPhonePlaceholder')}
              inputMode='tel'
              autoComplete='tel'
              description={t('parentPhoneDesc')}
              validators={{ onBlur: fieldSchemas.parentPhone }}
            />

            <FormTextField
              name='childName'
              label={t('childName')}
              placeholder={t('childNamePlaceholder')}
              validators={{ onBlur: fieldSchemas.childName }}
            />

            <FormTextareaField
              name='note'
              label={t('note')}
              description={t('noteDesc')}
              placeholder={t('notePlaceholder')}
              rows={3}
              validators={{ onBlur: fieldSchemas.note }}
            />

            <DialogFooter className='mt-2'>
              <Button type='button' variant='outline' onClick={() => handleClose(false)}>
                {t('cancel')}
              </Button>
              <form.SubmitButton>{t('submit')}</form.SubmitButton>
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
