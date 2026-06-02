'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import * as z from 'zod';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { masterDataOptions } from '@/api/master-data';
import { GENDERS, type Gender } from '@/api/teachers';
import { cn } from '@/lib/utils';

export type TeacherFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender | '';
  avatar: File[];
  primarySubject: string;
  location: string;
  bio?: string;
  tags: string[];
  sendOnboardingEmail: boolean;
};

interface TeacherFormProps {
  formId: string;
  defaultValues: TeacherFormValues;
  onSubmit: (values: TeacherFormValues) => Promise<void> | void;
  isPending: boolean;
  submitLabel: string;
  showOnboardingEmail?: boolean;
  disabledFields?: ReadonlyArray<keyof TeacherFormValues>;
  renderFooter: (submitButton: React.ReactNode) => React.ReactNode;
}

export function TeacherForm({
  formId,
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  showOnboardingEmail = true,
  disabledFields,
  renderFooter
}: TeacherFormProps) {
  const isFieldDisabled = (name: keyof TeacherFormValues) =>
    disabledFields?.includes(name) ?? false;
  const t = useTranslations('teachers');
  const tValidation = useTranslations('teachers.addDialog.validation');
  const tGender = useTranslations('teachers.gender');
  const [tagInput, setTagInput] = React.useState('');

  const schema = React.useMemo(
    () =>
      z.object({
        firstName: z.string().trim().min(1, tValidation('firstNameRequired')),
        lastName: z.string().trim().min(1, tValidation('lastNameRequired')),
        email: z.email(tValidation('emailInvalid')),
        phone: z
          .string()
          .trim()
          .min(1, tValidation('phoneRequired'))
          .regex(/^[0-9+\-\s().]{8,}$/, tValidation('phoneInvalid')),
        dateOfBirth: z
          .string()
          .min(1, tValidation('dateOfBirthRequired'))
          .refine((iso) => new Date(iso) <= new Date(), {
            message: tValidation('dateOfBirthFuture')
          }),
        gender: z.enum(GENDERS, { error: tValidation('genderRequired') }),
        avatar: z.array(z.instanceof(File)).max(1),
        primarySubject: z.string().min(1, tValidation('primarySubjectRequired')),
        location: z.string().min(1, tValidation('locationRequired')),
        bio: z.string().max(500, tValidation('bioTooLong')).optional().default(''),
        tags: z.array(z.string()),
        sendOnboardingEmail: z.boolean()
      }),
    [tValidation]
  );

  const genderOptions = React.useMemo(
    () => GENDERS.map((value) => ({ value, label: tGender(value) })),
    [tGender]
  );

  const subjectsQuery = useQuery(masterDataOptions('subject'));
  const subjectOptions = React.useMemo(
    () => (subjectsQuery.data ?? []).map((item) => ({ value: item.code, label: item.name })),
    [subjectsQuery.data]
  );

  const locationsQuery = useQuery(masterDataOptions('location'));
  const locationOptions = React.useMemo(
    () => (locationsQuery.data ?? []).map((item) => ({ value: item.code, label: item.name })),
    [locationsQuery.data]
  );

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  const { FormTextField, FormSelectField, FormCheckboxField, FormFileUploadField } =
    useFormFields<TeacherFormValues>();

  const submitButton = (
    <form.SubmitButton size='sm' className='h-9' form={formId}>
      {submitLabel}
    </form.SubmitButton>
  );

  return (
    <form.AppForm>
      <form.Form id={formId} className='md:p-0'>
        <fieldset
          disabled={isPending}
          className='grid min-w-0 grid-cols-1 gap-4 border-0 p-0 py-2 md:grid-cols-2 disabled:opacity-60'
        >
          <FormTextField
            name='firstName'
            label={t('addDialog.firstName')}
            required
            validators={{ onBlur: schema.shape.firstName }}
          />
          <FormTextField
            name='lastName'
            label={t('addDialog.lastName')}
            required
            validators={{ onBlur: schema.shape.lastName }}
          />
          <div className='md:col-span-2'>
            <FormTextField
              name='email'
              type='email'
              label={t('addDialog.email')}
              required
              disabled={isFieldDisabled('email')}
              validators={{ onBlur: schema.shape.email }}
            />
          </div>
          <div className='md:col-span-2'>
            <FormTextField
              name='phone'
              type='tel'
              label={t('addDialog.phone')}
              placeholder='0901 234 567'
              required
              disabled={isFieldDisabled('phone')}
              validators={{ onBlur: schema.shape.phone }}
            />
          </div>

          <form.AppField name='dateOfBirth' validators={{ onBlur: schema.shape.dateOfBirth }}>
            {(field) => {
              const selected = field.state.value ? new Date(field.state.value) : undefined;
              return (
                <field.FieldSet>
                  <field.Field>
                    <field.FieldLabel>
                      {t('addDialog.dateOfBirth')}
                      {' *'}
                    </field.FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !selected && 'text-muted-foreground'
                          )}
                          aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                        >
                          <Icons.calendar className='mr-2 h-4 w-4' />
                          {selected
                            ? format(selected, 'PPP')
                            : t('addDialog.dateOfBirthPlaceholder')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          captionLayout='dropdown'
                          startMonth={new Date(1940, 0)}
                          endMonth={new Date()}
                          defaultMonth={selected ?? new Date(2000, 0)}
                          selected={selected}
                          onSelect={(date) => {
                            field.handleChange(date ? date.toISOString() : '');
                            field.handleBlur();
                          }}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              );
            }}
          </form.AppField>

          <FormSelectField
            name='gender'
            label={t('addDialog.gender')}
            required
            placeholder={t('addDialog.genderPlaceholder')}
            options={genderOptions}
            validators={{ onBlur: schema.shape.gender }}
          />

          <FormSelectField
            name='primarySubject'
            label={t('addDialog.primarySubject')}
            required
            options={subjectOptions}
          />
          <FormSelectField
            name='location'
            label={t('addDialog.location')}
            required
            options={locationOptions}
          />

          <div className='md:col-span-2'>
            <FormFileUploadField
              name='avatar'
              label={t('addDialog.avatar')}
              description={t('addDialog.avatarDescription')}
              maxSize={5_000_000}
              maxFiles={1}
            />
          </div>

          <form.AppField name='bio'>
            {(field) => (
              <field.FieldSet className='md:col-span-2'>
                <field.Field>
                  <field.FieldLabel className='text-muted-foreground text-[12px]'>
                    {t('addDialog.bio')}
                  </field.FieldLabel>
                  <Textarea
                    rows={3}
                    maxLength={500}
                    placeholder={t('addDialog.bioPlaceholder')}
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className='resize-none text-sm'
                  />
                  <p className='text-muted-foreground mt-1 text-right text-[11px]'>
                    {(field.state.value ?? '').length}/500
                  </p>
                </field.Field>
                <field.FieldError />
              </field.FieldSet>
            )}
          </form.AppField>

          <form.AppField name='tags' mode='array'>
            {(field) => {
              const values = (field.state.value ?? []) as string[];
              const addTag = () => {
                const tag = tagInput.trim();
                if (tag && !values.includes(tag)) {
                  field.pushValue(tag);
                  setTagInput('');
                }
              };
              return (
                <field.FieldSet className='md:col-span-2'>
                  <field.Field>
                    <field.FieldLabel className='text-muted-foreground text-[12px]'>
                      {t('addDialog.tags')}
                    </field.FieldLabel>
                    <div className='bg-background flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border px-2 py-1'>
                      {values.map((tag, idx) => (
                        <span
                          key={tag}
                          className='bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]'
                        >
                          {tag}
                          <button
                            type='button'
                            onClick={() => field.removeValue(idx)}
                            className='text-muted-foreground hover:text-foreground'
                            aria-label={t('addDialog.removeTag', { tag })}
                          >
                            <Icons.close className='size-2.5' />
                          </button>
                        </span>
                      ))}
                      <Input
                        aria-label={t('addDialog.addTagPlaceholder')}
                        className='h-auto flex-1 border-0 bg-transparent p-0 py-1 text-[12px] shadow-none focus-visible:ring-0'
                        placeholder={t('addDialog.addTagPlaceholder')}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        onBlur={addTag}
                      />
                    </div>
                  </field.Field>
                </field.FieldSet>
              );
            }}
          </form.AppField>

          {showOnboardingEmail && (
            <div className='md:col-span-2'>
              <FormCheckboxField
                name='sendOnboardingEmail'
                label={t('addDialog.sendOnboardingEmail')}
              />
            </div>
          )}
        </fieldset>
      </form.Form>
      {renderFooter(submitButton)}
    </form.AppForm>
  );
}
