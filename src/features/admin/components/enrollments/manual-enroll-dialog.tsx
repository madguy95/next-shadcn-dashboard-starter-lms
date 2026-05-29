'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
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
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { courseListOptions } from '@/api/courses';
import {
  ENROLLMENT_CHANNELS,
  useCreateEnrollment,
  type CreateEnrollmentInput,
  type EnrollmentChannel
} from '@/api/enrollments';
import { formatApiError } from '@/lib/api-client';

// String-shaped form values so the number inputs can stay empty without
// fighting controlled-input semantics; the schema parses to numbers (or
// undefined for optional fields) at validate/submit time.
type ManualEnrollFormValues = {
  studentName: string;
  studentAge: string;
  studentGrade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  requestedCourseId: string;
  channel: EnrollmentChannel;
  note: string;
};

const defaultValues: ManualEnrollFormValues = {
  studentName: '',
  studentAge: '',
  studentGrade: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  requestedCourseId: '',
  channel: 'parent_app',
  note: ''
};

// "0" / "0–30" / "0–20" — kept here so the optional-int helper can be reused
// without re-declaring identical literals at every call site.
const PHONE_RE = /^[0-9+\-\s().]{8,}$/;

function optionalIntInRange(min: number, max: number, message: string) {
  return z.string().refine(
    (value) => {
      if (value.trim().length === 0) return true;
      const num = Number(value);
      return Number.isInteger(num) && num >= min && num <= max;
    },
    { message }
  );
}

export function ManualEnrollDialog() {
  const t = useTranslations('enrollments.manualDialog');
  const tValidation = useTranslations('enrollments.manualDialog.validation');
  const tChannel = useTranslations('enrollments.manualDialog.channelOptions');
  const tEnrollments = useTranslations('enrollments');
  const tToast = useTranslations('enrollments.toast');
  const [open, setOpen] = React.useState(false);

  const createEnrollment = useCreateEnrollment();
  const { data: coursesResult, isPending: coursesPending } = useQuery(
    courseListOptions({ status: 'published' })
  );
  const courses = React.useMemo(() => coursesResult?.data ?? [], [coursesResult]);

  const schema = React.useMemo(
    () =>
      z.object({
        studentName: z.string().trim().min(1, tValidation('studentNameRequired')),
        studentAge: optionalIntInRange(0, 30, tValidation('studentAgeInvalid')),
        studentGrade: optionalIntInRange(0, 20, tValidation('studentGradeInvalid')),
        parentName: z.string().trim().min(1, tValidation('parentNameRequired')),
        // Phone + email are optional, but if the admin types something it must
        // be syntactically valid — otherwise we'd silently send garbage to the BE.
        parentPhone: z
          .string()
          .refine((value) => value.trim().length === 0 || PHONE_RE.test(value.trim()), {
            message: tValidation('parentPhoneInvalid')
          }),
        parentEmail: z
          .string()
          .refine(
            (value) => value.trim().length === 0 || z.string().email().safeParse(value).success,
            { message: tValidation('parentEmailInvalid') }
          ),
        requestedCourseId: z.string().min(1, tValidation('requestedCourseRequired')),
        channel: z.enum(ENROLLMENT_CHANNELS),
        note: z.string().max(1000, tValidation('noteTooLong'))
      }),
    [tValidation]
  );

  const channelOptions = React.useMemo(
    () => ENROLLMENT_CHANNELS.map((value) => ({ value, label: tChannel(value) })),
    [tChannel]
  );
  const courseOptions = React.useMemo(
    () => courses.map((c) => ({ value: c.id, label: `${c.title} · ${c.code}` })),
    [courses]
  );

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const payload: CreateEnrollmentInput = {
        studentName: value.studentName,
        studentAge: value.studentAge ? Number(value.studentAge) : undefined,
        studentGrade: value.studentGrade ? Number(value.studentGrade) : undefined,
        parentName: value.parentName,
        parentPhone: value.parentPhone || undefined,
        parentEmail: value.parentEmail || undefined,
        requestedCourseId: value.requestedCourseId,
        channel: value.channel,
        note: value.note || undefined
      };

      try {
        const result = await createEnrollment.mutateAsync(payload);
        toast.success(tToast('createSuccess', { name: result.studentName }));
        setOpen(false);
        form.reset();
      } catch (e) {
        const { title, description } = formatApiError(e, tToast('createError'));
        toast.error(title, description ? { description } : undefined);
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField } =
    useFormFields<ManualEnrollFormValues>();

  const handleOpenChange = (next: boolean) => {
    if (createEnrollment.isPending) return;
    setOpen(next);
    if (!next) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm' className='h-9'>
          <Icons.add className='size-3.5' />
          {tEnrollments('enrollManually')}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[92vh] overflow-y-auto sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form id='manual-enroll-form' className='md:p-0' aria-label={t('title')}>
            <fieldset
              disabled={createEnrollment.isPending}
              className='grid min-w-0 grid-cols-1 gap-4 border-0 p-0 py-2 md:grid-cols-2 disabled:opacity-60'
            >
              <div className='md:col-span-2'>
                <FormTextField
                  name='studentName'
                  label={t('studentName')}
                  required
                  placeholder={t('studentNamePlaceholder')}
                  validators={{ onBlur: schema.shape.studentName }}
                />
              </div>

              <FormTextField
                name='studentAge'
                label={t('studentAge')}
                type='number'
                validators={{ onBlur: schema.shape.studentAge }}
              />
              <FormTextField
                name='studentGrade'
                label={t('studentGrade')}
                type='number'
                validators={{ onBlur: schema.shape.studentGrade }}
              />

              <div className='md:col-span-2'>
                <FormTextField
                  name='parentName'
                  label={t('parentName')}
                  required
                  validators={{ onBlur: schema.shape.parentName }}
                />
              </div>

              <FormTextField
                name='parentPhone'
                label={t('parentPhone')}
                type='tel'
                placeholder={t('parentPhonePlaceholder')}
                validators={{ onBlur: schema.shape.parentPhone }}
              />
              <FormTextField
                name='parentEmail'
                label={t('parentEmail')}
                type='email'
                validators={{ onBlur: schema.shape.parentEmail }}
              />

              <div className='md:col-span-2'>
                <FormSelectField
                  name='requestedCourseId'
                  label={t('requestedCourse')}
                  required
                  placeholder={
                    coursesPending ? t('requestedCourseLoading') : t('requestedCoursePlaceholder')
                  }
                  options={courseOptions}
                  disabled={coursesPending || courseOptions.length === 0}
                  validators={{ onBlur: schema.shape.requestedCourseId }}
                />
              </div>

              <div className='md:col-span-2'>
                <FormSelectField
                  name='channel'
                  label={t('channel')}
                  options={channelOptions}
                  validators={{ onBlur: schema.shape.channel }}
                />
              </div>

              <div className='md:col-span-2'>
                <FormTextareaField
                  name='note'
                  label={t('note')}
                  placeholder={t('notePlaceholder')}
                  rows={3}
                  maxLength={1000}
                  validators={{ onBlur: schema.shape.note }}
                />
              </div>
            </fieldset>
          </form.Form>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-9'
                disabled={createEnrollment.isPending}
              >
                {t('cancel')}
              </Button>
            </DialogClose>
            <form.SubmitButton size='sm' className='h-9' form='manual-enroll-form'>
              {createEnrollment.isPending ? t('submitting') : t('submit')}
            </form.SubmitButton>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
