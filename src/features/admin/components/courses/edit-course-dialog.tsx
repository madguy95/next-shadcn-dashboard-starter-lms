'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
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
import { scrollToFirstError, useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { useUpdateCourse, type Course, type CourseTool, type DiscountRule } from '@/api/courses';
import { masterDataOptions } from '@/api/master-data';
import { CompactDropzone } from './add-course-dialog/compact-dropzone';
import { OutlineStep } from './add-course-dialog/outline-step';
import { PricingStep } from './add-course-dialog/pricing-step';
import {
  buildBaseSchema,
  MAX_COVER_SIZE,
  MAX_VIDEO_SIZE,
  toDiscountRuleInput,
  zodPathToFieldName,
  type BaseSchema,
  type DiscountValue,
  type SessionValue
} from './add-course-dialog/schema';

const FORM_ID = 'edit-course-form';

type EditCourseFormValues = {
  title: string;
  code: string;
  description: string;
  tool: CourseTool;
  minAge: number | '';
  maxAge: number | '';
  totalSessions: number | '';
  sessionDurationMinutes: number | '';
  perClassCapacity: number | '';
  cover: File[];
  introVideo: File[];
  sessions: SessionValue[];
  tuitionAmount: number | '';
  discounts: DiscountValue[];
  pricingNotes: string;
};

// Convert a course's display-only `curriculum` strings into editable sessions.
// Skips the trailing "… N more sessions" / "Outline pending" sentinels that
// buildCurriculum emits — they aren't real session titles.
function deriveSessionsFromCurriculum(curriculum: string[]): SessionValue[] {
  return curriculum
    .filter((c) => !c.startsWith('…') && c !== 'Outline pending')
    .map((title) => ({ title, description: '' }));
}

// Keep the outline (sessions) length in sync with totalSessions: preserve any
// titles/descriptions the user has typed by slicing the tail on shrink and
// appending blanks on grow.
function syncSessionsToTotal(form: any, total: number): void {
  const current = (form.getFieldValue('sessions') as SessionValue[]) ?? [];
  const target = Math.max(0, Math.floor(total));
  if (current.length === target) return;
  const next =
    target > current.length
      ? [
          ...current,
          ...Array.from({ length: target - current.length }, () => ({
            title: '',
            description: ''
          }))
        ]
      : current.slice(0, target);
  form.setFieldValue('sessions', next);
}

function discountToFormValue(rule: DiscountRule): DiscountValue {
  return {
    name: rule.name,
    type: rule.type,
    value: rule.type === 'special' ? rule.value : String(rule.value),
    condition: rule.condition,
    conditionDate: rule.conditionDate ?? ''
  };
}

function buildDefaults(course: Course): EditCourseFormValues {
  return {
    title: course.title,
    code: course.code,
    description: course.description,
    tool: course.tool,
    minAge: course.minAge,
    maxAge: course.maxAge,
    totalSessions: course.totalSessions,
    sessionDurationMinutes: course.sessionDurationMinutes,
    perClassCapacity: course.perClassCapacity,
    cover: [],
    introVideo: [],
    // Use stored sessions when available, otherwise derive from curriculum so
    // first-time edits on legacy courses start with something to refine.
    sessions: course.sessions
      ? course.sessions.map((s) => ({ title: s.title, description: s.description }))
      : deriveSessionsFromCurriculum(course.curriculum),
    // Prefer the pre-discount tuition so editing discounts recomputes from the
    // same base the course was created with.
    tuitionAmount: course.originalTuitionAmount ?? course.tuitionAmount,
    discounts: (course.discounts ?? []).map(discountToFormValue),
    pricingNotes: course.pricingNotes ?? ''
  };
}

export function EditCourseDialog({
  course,
  trigger
}: {
  course: Course;
  trigger?: React.ReactNode;
}) {
  const t = useTranslations('courses');
  const tDialog = useTranslations('courses.editDialog');
  const tAddDialog = useTranslations('courses.addDialog');
  const tValidation = useTranslations('courses.addDialog.validation');
  const tCommon = useTranslations('common');

  const [open, setOpen] = React.useState(false);
  const updateCourse = useUpdateCourse();

  // Published courses lock fields that would affect existing classes/enrollments.
  // Editing those after publish would silently break running operations.
  const isLocked = course.status === 'published';

  const toolsQuery = useQuery(masterDataOptions('tool'));
  const toolOptions = React.useMemo(
    () => (toolsQuery.data ?? []).map((item) => ({ value: item.code, label: item.name })),
    [toolsQuery.data]
  );

  // Reuse the full base schema (shared validation rules), then pick the subset
  // we expose in the edit form and re-apply the ageOrder cross-field refine.
  const baseSchema = React.useMemo(() => buildBaseSchema(tValidation), [tValidation]);
  const schema = React.useMemo(
    () =>
      baseSchema
        .pick({
          title: true,
          code: true,
          description: true,
          tool: true,
          minAge: true,
          maxAge: true,
          totalSessions: true,
          sessionDurationMinutes: true,
          perClassCapacity: true,
          cover: true,
          introVideo: true,
          sessions: true,
          tuitionAmount: true,
          discounts: true,
          pricingNotes: true
        })
        .refine((v) => Number(v.maxAge) >= Number(v.minAge), {
          path: ['maxAge'],
          message: tValidation('ageOrder')
        }),
    [baseSchema, tValidation]
  );

  const defaults = React.useMemo(() => buildDefaults(course), [course]);

  const form = useAppForm({
    defaultValues: defaults,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        const updated = await updateCourse.mutateAsync({
          id: course.id,
          input: {
            title: value.title.trim(),
            // Locked fields still send their current value — the API treats
            // them as no-ops since they equal the stored value.
            code: value.code.trim(),
            description: value.description.trim(),
            tool: value.tool,
            minAge: Number(value.minAge),
            maxAge: Number(value.maxAge),
            totalSessions: Number(value.totalSessions),
            sessionDurationMinutes: Number(value.sessionDurationMinutes),
            perClassCapacity: Number(value.perClassCapacity),
            cover: value.cover[0],
            introVideo: value.introVideo[0],
            sessions: value.sessions.map((s) => ({
              title: s.title.trim(),
              description: s.description.trim()
            })),
            tuitionAmount: Number(value.tuitionAmount),
            discounts: value.discounts.map(toDiscountRuleInput),
            pricingNotes: value.pricingNotes.trim() || undefined
          }
        });
        toast.success(tDialog('successToast', { title: updated.title }));
        setOpen(false);
      } catch {
        toast.error(tDialog('errorToast'));
      }
    }
  });

  const isPending = updateCourse.isPending;

  const handleOpenChange = (next: boolean) => {
    if (isPending) return;
    if (next) form.reset(defaults);
    setOpen(next);
  };

  // Pre-flight validation: touch every field with an error so it renders the
  // message (TanStack form doesn't auto-touch on submit), then scroll to the
  // first invalid field. Only delegates to the TanStack submit pipeline when
  // values pass the full schema.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const result = schema.safeParse(form.state.values);
    if (!result.success) {
      // Collect every path that should display an error after submit.
      const targetPaths = new Set<string>([
        'title',
        'code',
        'description',
        'tool',
        'minAge',
        'maxAge',
        'totalSessions',
        'sessionDurationMinutes',
        'perClassCapacity',
        'cover',
        'introVideo',
        'tuitionAmount',
        'pricingNotes'
      ]);
      const sessions = form.state.values.sessions as SessionValue[];
      sessions.forEach((_, i) => {
        targetPaths.add(`sessions[${i}].title`);
        targetPaths.add(`sessions[${i}].description`);
      });
      const discounts = form.state.values.discounts as DiscountValue[];
      discounts.forEach((_, i) => {
        ['name', 'type', 'value', 'condition', 'conditionDate'].forEach((sub) => {
          targetPaths.add(`discounts[${i}].${sub}`);
        });
      });

      // Group new issues by field path — first message per path wins so each
      // field shows a single error at a time.
      const grouped = new Map<string, { message: string }[]>();
      for (const issue of result.error.issues) {
        const name = zodPathToFieldName(issue.path);
        if (!name || grouped.has(name)) continue;
        grouped.set(name, [{ message: issue.message }]);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f = form as any;
      targetPaths.forEach((name) => {
        const errors = grouped.get(name);
        // `prev` is undefined for fields that haven't mounted yet (e.g. newly
        // grown session entries before their inputs render).
        f.setFieldMeta(name, (prev: { errorMap?: Record<string, unknown> } | undefined) => ({
          ...(prev ?? {}),
          isTouched: true,
          errorMap: {
            ...(prev?.errorMap ?? {}),
            onSubmit: errors && errors.length ? errors : undefined
          }
        }));
      });

      toast.error(result.error.issues[0]?.message ?? tDialog('errorToast'));
      scrollToFirstError();
      return;
    }

    void form.handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant='outline' size='sm' className='h-9'>
            <Icons.edit className='size-3.5' />
            {t('detail.edit')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='grid max-h-[92vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-[860px]'>
        <DialogHeader className='space-y-0.5 px-6 pt-5 pr-14 pb-4'>
          <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
            {tDialog('section')} · {course.code}
          </div>
          <DialogTitle className='text-base tracking-tight'>{tDialog('title')}</DialogTitle>
          <DialogDescription className='text-[12px]'>{tDialog('description')}</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form id={FORM_ID} onSubmit={handleFormSubmit} noValidate className='contents'>
            <fieldset
              disabled={isPending}
              className='grid min-h-0 grid-cols-12 gap-5 overflow-auto border-0 p-6 disabled:opacity-60'
            >
              {isLocked && (
                <div className='col-span-12'>
                  <div className='flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900'>
                    <Icons.lock className='mt-0.5 size-3.5 shrink-0' />
                    <span className='leading-relaxed'>{tDialog('publishedNotice')}</span>
                  </div>
                </div>
              )}

              <BasicsFields
                form={form}
                baseSchema={baseSchema}
                tAddDialog={tAddDialog}
                tDialog={tDialog}
                toolOptions={toolOptions}
                isLocked={isLocked}
              />

              <div className='col-span-12'>
                <div className='border-t' />
              </div>

              <MediaFields form={form} tAddDialog={tAddDialog} tDialog={tDialog} course={course} />

              <div className='col-span-12'>
                <div className='border-t' />
              </div>

              <div className='col-span-12'>
                <OutlineSection form={form} tAddDialog={tAddDialog} />
              </div>

              <div className='col-span-12'>
                <div className='border-t' />
              </div>

              <div className='col-span-12'>
                <PricingStep tDialog={tAddDialog} form={form} baseSchema={baseSchema} />
              </div>
            </fieldset>

            <DialogFooter className='bg-muted/30 flex shrink-0 flex-row items-center justify-end gap-2 border-t px-6 py-3'>
              <DialogClose asChild>
                <Button variant='outline' size='sm' className='h-9' disabled={isPending}>
                  {tCommon('cancel')}
                </Button>
              </DialogClose>
              <form.SubmitButton size='sm' className='h-9' form={FORM_ID}>
                {tDialog('submit')}
              </form.SubmitButton>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}

function BasicsFields({
  form,
  baseSchema,
  tAddDialog,
  tDialog,
  toolOptions,
  isLocked
}: {
  form: any;
  baseSchema: BaseSchema;
  tAddDialog: ReturnType<typeof useTranslations>;
  tDialog: ReturnType<typeof useTranslations>;
  toolOptions: { value: string; label: string }[];
  isLocked: boolean;
}) {
  const { FormTextField, FormTextareaField, FormSelectField } =
    useFormFields<EditCourseFormValues>();
  const shape = baseSchema.shape;

  return (
    <div className='col-span-12 space-y-4 text-sm'>
      <div>
        <h3 className='text-[14px] font-semibold tracking-tight'>{tDialog('basicsHeading')}</h3>
        <p className='text-muted-foreground text-[12px]'>{tDialog('basicsDescription')}</p>
      </div>

      <div className='grid grid-cols-3 gap-3'>
        <div className='col-span-2'>
          <FormTextField
            name='title'
            label={tAddDialog('fields.title')}
            required
            validators={{ onBlur: shape.title }}
          />
        </div>
        <FormTextField
          name='code'
          label={tAddDialog('fields.code')}
          required
          className='font-mono'
          disabled={isLocked}
          validators={{ onBlur: shape.code }}
        />
      </div>

      <FormTextareaField
        name='description'
        label={tAddDialog('fields.description')}
        required
        rows={3}
        showCount
        maxLength={240}
        className='resize-none'
        validators={{ onBlur: shape.description }}
      />

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <FormSelectField
          name='tool'
          label={tAddDialog('fields.tool')}
          required
          options={toolOptions}
          disabled={isLocked}
        />
        <FormTextField
          name='minAge'
          type='number'
          label={tAddDialog('fields.minAge')}
          required
          inputMode='numeric'
          className='font-mono'
          disabled={isLocked}
          validators={{ onBlur: shape.minAge }}
        />
        <FormTextField
          name='maxAge'
          type='number'
          label={tAddDialog('fields.maxAge')}
          required
          inputMode='numeric'
          className='font-mono'
          disabled={isLocked}
          validators={{ onBlur: shape.maxAge }}
        />
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <FormTextField
          name='totalSessions'
          type='number'
          label={tAddDialog('fields.totalSessions')}
          required
          inputMode='numeric'
          className='font-mono'
          disabled={isLocked}
          validators={{ onBlur: shape.totalSessions }}
          // Sync sessions list (below) to this total on blur or Enter, mirroring
          // the wizard. Preserves existing entries: slice tail when shrinking,
          // append blanks when growing.
          listeners={{
            onBlur: ({ value }) => syncSessionsToTotal(form, Number(value) || 0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Blur triggers the listener above and the onBlur validator.
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
        />
        <FormTextField
          name='sessionDurationMinutes'
          type='number'
          label={tAddDialog('fields.sessionDuration')}
          required
          inputMode='numeric'
          className='font-mono'
          disabled={isLocked}
          validators={{ onBlur: shape.sessionDurationMinutes }}
        />
        <FormTextField
          name='perClassCapacity'
          type='number'
          label={tAddDialog('fields.capacity')}
          required
          inputMode='numeric'
          className='font-mono'
          disabled={isLocked}
          validators={{ onBlur: shape.perClassCapacity }}
        />
      </div>
    </div>
  );
}

function OutlineSection({
  form,
  tAddDialog
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  tAddDialog: ReturnType<typeof useTranslations>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalSessionsValue = useStore(
    form.store,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => s.values.totalSessions as number | ''
  );

  return <OutlineStep tDialog={tAddDialog} form={form} totalSessionsValue={totalSessionsValue} />;
}

function MediaFields({
  form,
  tAddDialog,
  tDialog,
  course
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  tAddDialog: ReturnType<typeof useTranslations>;
  tDialog: ReturnType<typeof useTranslations>;
  course: Course;
}) {
  return (
    <div className='col-span-12 space-y-4 text-sm'>
      <div>
        <h3 className='text-[14px] font-semibold tracking-tight'>{tDialog('mediaHeading')}</h3>
        <p className='text-muted-foreground text-[12px]'>{tDialog('mediaDescription')}</p>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div className='space-y-2'>
          {course.coverUrl && (
            <div className='border-foreground/15 relative h-24 overflow-hidden rounded-md border'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.coverUrl}
                alt={course.title}
                className='h-full w-full object-cover'
              />
              <span className='bg-background/85 absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 font-mono text-[10px]'>
                {tAddDialog('fields.cover')}
              </span>
            </div>
          )}
          <form.AppField name='cover'>
            {(field: any) => (
              <CompactDropzone
                label={tAddDialog('fields.cover')}
                hint={tAddDialog('fields.coverHint')}
                description={tAddDialog('fields.coverDescription')}
                accept={{ 'image/png': [], 'image/jpeg': [] }}
                maxSize={MAX_COVER_SIZE}
                icon={<Icons.media className='size-4' />}
                value={(field.state.value as File[]) ?? []}
                onChange={(files: File[]) => field.handleChange(files)}
                replaceLabel={tAddDialog('fields.dropToReplace')}
                removeLabel={tAddDialog('fields.removeFile')}
              />
            )}
          </form.AppField>
        </div>

        <div className='space-y-2'>
          {course.introVideoUrl && (
            <a
              href={course.introVideoUrl}
              target='_blank'
              rel='noreferrer'
              className='border-foreground/15 hover:bg-muted/40 flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] transition'
            >
              <Icons.video className='text-muted-foreground size-3.5' />
              <span className='truncate'>{course.title}</span>
              <span className='text-muted-foreground ml-auto font-mono text-[10px]'>↗</span>
            </a>
          )}
          <form.AppField name='introVideo'>
            {(field: any) => (
              <CompactDropzone
                label={tAddDialog('fields.introVideo')}
                hint={tAddDialog('fields.introVideoHint')}
                description={tAddDialog('fields.introVideoDescription')}
                accept={{
                  'video/mp4': [],
                  'video/webm': [],
                  'video/quicktime': []
                }}
                maxSize={MAX_VIDEO_SIZE}
                icon={<Icons.video className='size-4' />}
                value={(field.state.value as File[]) ?? []}
                onChange={(files: File[]) => field.handleChange(files)}
                replaceLabel={tAddDialog('fields.dropToReplace')}
                removeLabel={tAddDialog('fields.removeFile')}
              />
            )}
          </form.AppField>
        </div>
      </div>
    </div>
  );
}
