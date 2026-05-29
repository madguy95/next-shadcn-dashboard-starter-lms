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
import { submitWorkshopSignup } from '@/api/enrollments/service';
import type { AttachedClass } from '@/api/blog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop: AttachedClass;
};

// studentAge kept as a string so the empty-initial state is representable
// without sentinel values. Validation refines the numeric range; the submit
// handler is the single place that converts to a number for the BE payload.
type FormValues = {
  parentName: string;
  parentPhone: string;
  studentName: string;
  studentAge: string;
  note: string;
};

// Inline label suffix — e.g. "(8 - 12)", "(≥ 8)", "(≤ 12)". Tighter than the
// full descriptive label; fits beside "Tuổi" without a separate hint line.
// Pure numeric output, so locale-independent.
function formatAgeRangeSuffix(minAge?: number, maxAge?: number): string {
  if (minAge != null && maxAge != null) return ` (${minAge} - ${maxAge})`;
  if (minAge != null) return ` (≥ ${minAge})`;
  if (maxAge != null) return ` (≤ ${maxAge})`;
  return '';
}

const EMPTY: FormValues = {
  parentName: '',
  parentPhone: '',
  studentName: '',
  studentAge: '',
  note: ''
};

export function WorkshopSignupDialog({ open, onOpenChange, workshop }: Props) {
  const t = useTranslations('blog.signup');
  const tValidation = useTranslations('blog.signup.validation');
  const tWorkshop = useTranslations('blog.workshop');
  // Successful submissions swap the dialog body to a thank-you panel. Owned
  // here (not in the form) so the form unmount after success doesn't blow
  // away the success state mid-render.
  const [success, setSuccess] = useState<{ phone: string; childName: string } | null>(null);

  // Static field schemas — built inside the component so they can pull
  // localized error messages from useTranslations.
  const staticFieldSchemas = useMemo(
    () => ({
      parentName: z.string().trim().min(2, tValidation('parentNameRequired')).max(120),
      parentPhone: z
        .string()
        .trim()
        .min(1, tValidation('parentPhoneRequired'))
        .regex(/^[0-9+\-\s]{8,20}$/, tValidation('parentPhoneInvalid')),
      studentName: z.string().trim().min(1, tValidation('studentNameRequired')).max(120),
      // Note is always a string on the form side (empty when blank); we only
      // forward it to the BE if non-empty in the submit handler below.
      note: z.string().trim().max(500, tValidation('noteTooLong'))
    }),
    [tValidation]
  );

  // Localized "5 – 10 tuổi" / "from 5 yrs" descriptive form used in error
  // messages. Pure numeric (8 - 12) suffix is handled separately.
  const formatAgeRangeDescriptive = (minAge?: number, maxAge?: number) => {
    if (minAge != null && maxAge != null) return tWorkshop('ageBoth', { min: minAge, max: maxAge });
    if (minAge != null) return tWorkshop('ageMin', { min: minAge });
    if (maxAge != null) return tWorkshop('ageMax', { max: maxAge });
    return '';
  };

  // Age bounds come from the workshop's linked class/course. Build the schemas
  // once per workshop change so onBlur (field-level) and onSubmit (form-level)
  // share the same source of truth — if min/max ever change the form picks it
  // up next render without a hand-wired refresh.
  const ageSchema = useMemo(() => {
    const min = workshop.minAge ?? 1;
    const max = workshop.maxAge ?? 99;
    const range = formatAgeRangeDescriptive(workshop.minAge, workshop.maxAge);
    // Two distinct messages so the parent gets actionable feedback: "needs to be
    // a number" vs "needs to be inside the workshop's range".
    return z
      .string()
      .min(1, tValidation('ageRequired'))
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1;
      }, tValidation('ageInteger'))
      .refine(
        (v) => {
          const n = Number(v);
          return n >= min && n <= max;
        },
        range ? tValidation('ageRangeMessage', { range }) : tValidation('ageRangeFallback')
      );
    // formatAgeRangeDescriptive depends on tWorkshop which is stable per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshop.minAge, workshop.maxAge, tValidation, tWorkshop]);

  const formSchema = useMemo(
    () => z.object({ ...staticFieldSchemas, studentAge: ageSchema }),
    [ageSchema, staticFieldSchemas]
  );
  const ageLabel = useMemo(
    () => `${t('ageLabel')}${formatAgeRangeSuffix(workshop.minAge, workshop.maxAge)}`,
    [workshop.minAge, workshop.maxAge, t]
  );

  const form = useAppForm({
    defaultValues: EMPTY,
    validators: {
      // Form-level safety net — runs if field-level validators were skipped.
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      try {
        await submitWorkshopSignup({
          classId: workshop.id,
          parentName: value.parentName,
          parentPhone: value.parentPhone,
          studentName: value.studentName,
          studentAge: Number(value.studentAge),
          note: value.note?.trim() || undefined
        });
        setSuccess({ phone: value.parentPhone, childName: value.studentName });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('submitError'));
      }
    }
  });

  // Strongly-typed field shortcuts — name + validator inference is keyed off FormValues.
  const { FormTextField, FormTextareaField } = useFormFields<FormValues>();

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      // Reset after the close animation so the next open is clean.
      setTimeout(() => {
        form.reset();
        setSuccess(null);
      }, 150);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-[440px]'>
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
      <DialogContent className='sm:max-w-[460px]'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            <span className='text-foreground font-medium'>{workshop.courseTitle}</span>
            <span className='text-muted-foreground'> · {workshop.schedule}</span>
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

            <div className='grid grid-cols-[1fr_88px] gap-3'>
              <FormTextField
                name='studentName'
                label={t('studentName')}
                required
                placeholder={t('studentNamePlaceholder')}
                validators={{ onBlur: staticFieldSchemas.studentName }}
              />
              <FormTextField
                // type='number' would make FormTextField cast the value to a
                // JS number, which collides with the z.string() schema below.
                // Plain text + inputMode='numeric' gives the same mobile
                // keyboard UX without the cast.
                name='studentAge'
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
