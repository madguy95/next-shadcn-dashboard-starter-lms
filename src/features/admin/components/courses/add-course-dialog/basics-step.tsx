'use client';

import type { useTranslations } from 'next-intl';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { useFormFields } from '@/components/ui/tanstack-form';
import { thumbStripeStyle } from '../shared';
import { CompactDropzone } from './compact-dropzone';
import {
  MAX_COVER_SIZE,
  MAX_DESC,
  MAX_VIDEO_SIZE,
  type BaseSchema,
  type CourseFormValues
} from './schema';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface BasicsStepProps {
  form: any;
  baseSchema: BaseSchema;
  tCourses: ReturnType<typeof useTranslations>;
  tDialog: ReturnType<typeof useTranslations>;
  tagInput: string;
  setTagInput: (v: string) => void;
  categoryOptions: { value: string; label: string }[];
  levelOptions: { value: string; label: string }[];
  preview: {
    title: string;
    code: string;
    description: string;
    category: string;
    level: string;
    minAge: number | '';
    maxAge: number | '';
    weeks: number | '';
    sessionsPerWeek: number | '';
    perClassCapacity: number | '';
    coverPreviewUrl: string | null;
  };
  hidden: boolean;
}

export function BasicsStep({
  form,
  baseSchema,
  tCourses,
  tDialog,
  tagInput,
  setTagInput,
  categoryOptions,
  levelOptions,
  preview,
  hidden
}: BasicsStepProps) {
  const { FormTextField, FormTextareaField, FormSelectField } = useFormFields<CourseFormValues>();

  return (
    <>
      <div className={hidden ? 'hidden' : 'col-span-12 space-y-4 text-sm lg:col-span-7'}>
        <div className='grid grid-cols-3 gap-3'>
          <div className='col-span-2'>
            <FormTextField
              name='title'
              label={tDialog('fields.title')}
              required
              validators={{ onBlur: baseSchema.shape.title }}
            />
          </div>
          <FormTextField
            name='code'
            label={tDialog('fields.code')}
            required
            className='font-mono'
            validators={{ onBlur: baseSchema.shape.code }}
          />
        </div>

        <FormTextareaField
          name='description'
          label={tDialog('fields.description')}
          required
          rows={3}
          maxLength={MAX_DESC}
          showCount
          className='resize-none'
          validators={{ onBlur: baseSchema.shape.description }}
        />

        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <FormSelectField
            name='category'
            label={tDialog('fields.category')}
            required
            options={categoryOptions}
          />
          <FormSelectField
            name='level'
            label={tDialog('fields.level')}
            required
            options={levelOptions}
          />
          <FormTextField
            name='minAge'
            type='number'
            label={tDialog('fields.minAge')}
            required
            inputMode='numeric'
            className='font-mono'
            validators={{ onBlur: baseSchema.shape.minAge }}
          />
          <FormTextField
            name='maxAge'
            type='number'
            label={tDialog('fields.maxAge')}
            required
            inputMode='numeric'
            className='font-mono'
            validators={{ onBlur: baseSchema.shape.maxAge }}
          />
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <FormTextField
            name='weeks'
            type='number'
            label={tDialog('fields.duration')}
            required
            inputMode='numeric'
            className='font-mono'
            validators={{ onBlur: baseSchema.shape.weeks }}
          />
          <FormTextField
            name='sessionsPerWeek'
            type='number'
            label={tDialog('fields.sessions')}
            required
            inputMode='numeric'
            className='font-mono'
            validators={{ onBlur: baseSchema.shape.sessionsPerWeek }}
          />
          <FormTextField
            name='perClassCapacity'
            type='number'
            label={tDialog('fields.capacity')}
            required
            inputMode='numeric'
            className='font-mono'
            validators={{ onBlur: baseSchema.shape.perClassCapacity }}
          />
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <form.AppField name='cover'>
            {(field: any) => (
              <CompactDropzone
                label={tDialog('fields.cover')}
                hint={tDialog('fields.coverHint')}
                description={tDialog('fields.coverDescription')}
                accept={{ 'image/png': [], 'image/jpeg': [] }}
                maxSize={MAX_COVER_SIZE}
                icon={<Icons.media className='size-4' />}
                value={(field.state.value as File[]) ?? []}
                onChange={(files: File[]) => field.handleChange(files)}
                replaceLabel={tDialog('dropToReplace')}
                removeLabel={tDialog('removeFile')}
              />
            )}
          </form.AppField>
          <form.AppField name='introVideo'>
            {(field: any) => (
              <CompactDropzone
                label={tDialog('fields.introVideo')}
                hint={tDialog('fields.introVideoHint')}
                description={tDialog('fields.introVideoDescription')}
                accept={{
                  'video/mp4': [],
                  'video/webm': [],
                  'video/quicktime': []
                }}
                maxSize={MAX_VIDEO_SIZE}
                icon={<Icons.video className='size-4' />}
                value={(field.state.value as File[]) ?? []}
                onChange={(files: File[]) => field.handleChange(files)}
                replaceLabel={tDialog('dropToReplace')}
                removeLabel={tDialog('removeFile')}
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name='tags' mode='array'>
          {(field: any) => {
            const values = (field.state.value ?? []) as string[];
            const addTag = () => {
              const tag = tagInput.trim();
              if (tag && !values.includes(tag)) {
                field.pushValue(tag);
                setTagInput('');
              }
            };
            return (
              <field.FieldSet>
                <field.Field>
                  <field.FieldLabel className='text-muted-foreground text-[12px]'>
                    {tDialog('fields.tags')}
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
                          aria-label={tDialog('fields.removeTag', { tag })}
                        >
                          <Icons.close className='size-2.5' />
                        </button>
                      </span>
                    ))}
                    <Input
                      aria-label={tDialog('fields.addTag')}
                      className='h-auto flex-1 border-0 bg-transparent p-0 py-1 text-[12px] shadow-none focus-visible:ring-0'
                      placeholder={tDialog('fields.addTag')}
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
      </div>

      <div className={hidden ? 'hidden' : 'col-span-12 lg:col-span-5'}>
        <BasicsPreview tCourses={tCourses} tDialog={tDialog} preview={preview} />
      </div>
    </>
  );
}

function BasicsPreview({
  tCourses,
  tDialog,
  preview
}: {
  tCourses: ReturnType<typeof useTranslations>;
  tDialog: ReturnType<typeof useTranslations>;
  preview: BasicsStepProps['preview'];
}) {
  return (
    <>
      <div className='text-muted-foreground mb-2 text-[11px] font-medium tracking-wider uppercase'>
        {tDialog('preview.label')}
      </div>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div
          style={preview.coverPreviewUrl ? undefined : thumbStripeStyle}
          className='relative grid h-24 place-items-center border-b'
        >
          {preview.coverPreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.coverPreviewUrl}
              alt='Cover preview'
              className='absolute inset-0 h-full w-full object-cover'
            />
          ) : (
            <div className='text-muted-foreground font-mono text-[10px]'>
              {tDialog('preview.coverPlaceholder', {
                category: tCourses(`categories.${preview.category}`).toUpperCase()
              })}
            </div>
          )}
        </div>
        <div className='p-4'>
          <div className='flex items-center justify-between'>
            <span className='bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]'>
              {preview.code || '—'}
            </span>
            <span className='inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] text-amber-800'>
              {tCourses('status.draft')}
            </span>
          </div>
          <div className='mt-2 text-[15px] font-semibold tracking-tight'>
            {preview.title || tDialog('preview.untitledCourse')}
          </div>
          <div className='text-muted-foreground mt-0.5 text-[12px]'>
            {tDialog('preview.ages', {
              min: preview.minAge === '' ? '—' : String(preview.minAge),
              max: preview.maxAge === '' ? '—' : String(preview.maxAge),
              level: tDialog(`level.${preview.level}`)
            })}
          </div>
          <div className='mt-3 grid grid-cols-3 gap-1 text-center font-mono text-[11px]'>
            <PreviewStat
              value={preview.weeks === '' ? '—' : String(preview.weeks)}
              label={tDialog('preview.weeks')}
            />
            <PreviewStat
              value={`${preview.sessionsPerWeek === '' ? '—' : preview.sessionsPerWeek}/wk`}
              label={tDialog('preview.sessions')}
            />
            <PreviewStat
              value={preview.perClassCapacity === '' ? '—' : String(preview.perClassCapacity)}
              label={tDialog('preview.capacity')}
            />
          </div>
          {preview.description && (
            <p className='text-muted-foreground mt-3 line-clamp-3 text-[12px] leading-relaxed'>
              {preview.description}
            </p>
          )}
        </div>
      </div>

      <div className='bg-muted/30 mt-4 rounded-md border p-3'>
        <div className='flex items-center gap-2 text-[12px] font-medium'>
          <Icons.info className='text-muted-foreground size-3.5' />
          {tDialog('next.label')}
        </div>
        <ul className='text-muted-foreground mt-2 space-y-1.5 text-[12px]'>
          <li className='flex gap-2'>
            <span className='text-foreground font-mono'>01</span>
            <span>{tDialog('next.step1')}</span>
          </li>
          <li className='flex gap-2'>
            <span className='text-foreground font-mono'>02</span>
            <span>{tDialog('next.step2')}</span>
          </li>
          <li className='flex gap-2'>
            <span className='text-foreground font-mono'>03</span>
            <span>{tDialog('next.step3')}</span>
          </li>
        </ul>
      </div>
    </>
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
