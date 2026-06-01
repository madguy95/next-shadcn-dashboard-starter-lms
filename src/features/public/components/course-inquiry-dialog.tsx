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
import { submitCourseInquiry } from '@/api/enrollments/service';
import type { PublicCourse } from '@/api/courses/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Pick<PublicCourse, 'id' | 'title' | 'code' | 'minAge' | 'maxAge'>;
};

type FormValues = {
  parentName: string;
  parentPhone: string;
  childName: string;
  childAge: string;
  note: string;
};

function formatAgeRangeSuffix(minAge?: number, maxAge?: number): string {
  if (minAge != null && maxAge != null) return ` (${minAge} - ${maxAge})`;
  if (minAge != null) return ` (≥ ${minAge})`;
  if (maxAge != null) return ` (≤ ${maxAge})`;
  return '';
}

const EMPTY: FormValues = {
  parentName: '',
  parentPhone: '',
  childName: '',
  childAge: '',
  note: ''
};

export function CourseInquiryDialog({ open, onOpenChange, course }: Props) {
  const t = useTranslations('public.courseInquiry');
  const [success, setSuccess] = useState<{ phone: string; childName: string } | null>(null);

  const staticFieldSchemas = useMemo(
    () => ({
      parentName: z.string().trim().min(2, t('validation.parentNameRequired')).max(120),
      parentPhone: z
        .string()
        .trim()
        .min(1, t('validation.parentPhoneRequired'))
        .regex(/^[0-9+\-\s]{8,20}$/, t('validation.parentPhoneInvalid')),
      childName: z.string().trim().min(1, t('validation.childNameRequired')).max(120),
      note: z.string().trim().max(500, t('validation.noteTooLong'))
    }),
    [t]
  );

  const ageSchema = useMemo(() => {
    const min = course.minAge ?? 1;
    const max = course.maxAge ?? 99;
    return z
      .string()
      .min(1, t('validation.ageRequired'))
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1;
      }, t('validation.ageInteger'))
      .refine((v) => {
        const n = Number(v);
        return n >= min && n <= max;
      }, t('validation.ageRange'));
  }, [course.minAge, course.maxAge, t]);

  const formSchema = useMemo(
    () => z.object({ ...staticFieldSchemas, childAge: ageSchema }),
    [ageSchema, staticFieldSchemas]
  );

  const ageLabel = useMemo(
    () => `${t('ageLabel')}${formatAgeRangeSuffix(course.minAge, course.maxAge)}`,
    [course.minAge, course.maxAge, t]
  );

  const form = useAppForm({
    defaultValues: EMPTY,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      try {
        await submitCourseInquiry({
          courseId: course.id,
          parentName: value.parentName,
          parentPhone: value.parentPhone,
          childName: value.childName,
          childAge: Number(value.childAge),
          note: value.note.trim() || undefined
        });
        setSuccess({ phone: value.parentPhone, childName: value.childName });
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
              {t('successBodyMiddle')}{' '}
              <span className='text-foreground font-medium'>{success.childName}</span>.
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
            <span className='text-foreground font-medium'>{course.title}</span>
            <span className='text-muted-foreground'> · {course.code}</span>
            <br />
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
              validators={{ onBlur: staticFieldSchemas.parentName }}
            />

            <FormTextField
              name='parentPhone'
              label={t('parentPhone')}
              required
              placeholder={t('parentPhonePlaceholder')}
              inputMode='tel'
              autoComplete='tel'
              description={t('parentPhoneDesc')}
              validators={{ onBlur: staticFieldSchemas.parentPhone }}
            />

            <div className='grid grid-cols-[2fr_1fr] gap-3'>
              <FormTextField
                name='childName'
                label={t('childName')}
                required
                placeholder={t('childNamePlaceholder')}
                validators={{ onBlur: staticFieldSchemas.childName }}
              />
              <FormTextField
                name='childAge'
                label={ageLabel}
                required
                placeholder={t('agePlaceholder')}
                inputMode='numeric'
                pattern='[0-9]*'
                maxLength={2}
                validators={{ onBlur: ageSchema }}
              />
            </div>

            <FormTextareaField
              name='note'
              label={t('note')}
              description={t('noteDesc')}
              placeholder={t('notePlaceholder')}
              rows={2}
              validators={{ onBlur: staticFieldSchemas.note }}
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
