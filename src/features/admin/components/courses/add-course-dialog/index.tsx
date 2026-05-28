'use client';

import { useStore } from '@tanstack/react-form';
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
import { scrollToFirstError, useAppForm } from '@/components/ui/tanstack-form';
import { COURSE_CATEGORIES, COURSE_LEVELS, useCreateCourse } from '@/api/courses';
import { cn } from '@/lib/utils';
import { BasicsStep } from './basics-step';
import { OutlineStep } from './outline-step';
import { PricingStep } from './pricing-step';
import {
  buildBaseSchema,
  buildSchema,
  defaultValues,
  stepFieldNames,
  stepKeys,
  toDiscountRuleInput,
  zodPathToFieldName,
  type CourseFormValues,
  type DiscountValue,
  type SessionValue,
  type StepKey
} from './schema';
import { Stepper } from './stepper';

const FORM_ID = 'add-course-form';

export function AddCourseDialog({ trigger }: { trigger?: React.ReactNode } = {}) {
  const t = useTranslations('courses');
  const tDialog = useTranslations('courses.addDialog');
  const tValidation = useTranslations('courses.addDialog.validation');
  const tCommon = useTranslations('common');

  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<StepKey>('basics');
  const [tagInput, setTagInput] = React.useState('');
  const createCourse = useCreateCourse();

  const categoryOptions = React.useMemo(
    () => COURSE_CATEGORIES.map((value) => ({ value, label: t(`categories.${value}`) })),
    [t]
  );
  const levelOptions = React.useMemo(
    () => COURSE_LEVELS.map((value) => ({ value, label: tDialog(`level.${value}`) })),
    [tDialog]
  );

  const baseSchema = React.useMemo(() => buildBaseSchema(tValidation), [tValidation]);
  const schema = React.useMemo(
    () => buildSchema(baseSchema, tValidation),
    [baseSchema, tValidation]
  );

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        const course = await createCourse.mutateAsync({
          title: value.title.trim(),
          code: value.code.trim(),
          description: value.description.trim(),
          category: value.category,
          level: value.level,
          minAge: Number(value.minAge),
          maxAge: Number(value.maxAge),
          totalSessions: Number(value.totalSessions),
          sessionDurationMinutes: Number(value.sessionDurationMinutes),
          perClassCapacity: Number(value.perClassCapacity),
          tags: value.tags,
          cover: value.cover[0],
          introVideo: value.introVideo[0],
          sessions: value.sessions.map((s) => ({
            title: s.title.trim(),
            description: s.description.trim()
          })),
          tuitionAmount: Number(value.tuitionAmount),
          discounts: value.discounts.map(toDiscountRuleInput),
          pricingNotes: value.pricingNotes.trim() || undefined
        });
        toast.success(tDialog('successToast', { title: course.title }));
        form.reset();
        setStep('basics');
        setOpen(false);
      } catch {
        toast.error(tDialog('errorToast'));
      }
    }
  });

  const isPending = createCourse.isPending;
  const titleValue = useStore(form.store, (s) => s.values.title);
  const codeValue = useStore(form.store, (s) => s.values.code);
  const descriptionValue = useStore(form.store, (s) => s.values.description);
  const categoryValue = useStore(form.store, (s) => s.values.category);
  const levelValue = useStore(form.store, (s) => s.values.level);
  const minAgeValue = useStore(form.store, (s) => s.values.minAge);
  const maxAgeValue = useStore(form.store, (s) => s.values.maxAge);
  const totalSessionsValue = useStore(form.store, (s) => s.values.totalSessions);
  const sessionDurationValue = useStore(form.store, (s) => s.values.sessionDurationMinutes);
  const capacityValue = useStore(form.store, (s) => s.values.perClassCapacity);
  const coverFile = useStore(form.store, (s) => s.values.cover[0]);

  const coverPreviewUrl = React.useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile]
  );
  React.useEffect(() => {
    if (!coverPreviewUrl) return;
    return () => URL.revokeObjectURL(coverPreviewUrl);
  }, [coverPreviewUrl]);

  const validateStep = (stepKey: StepKey): boolean => {
    const fields = stepFieldNames[stepKey];

    // Build a sub-schema covering only this step's fields
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const f of fields) {
      shape[f as string] = (baseSchema.shape as Record<string, z.ZodTypeAny>)[f as string];
    }
    let stepSchema: z.ZodTypeAny = z.object(shape);
    if (stepKey === 'basics') {
      stepSchema = (stepSchema as z.ZodObject<z.ZodRawShape>).refine(
        (v) =>
          Number((v as { maxAge: unknown }).maxAge) >= Number((v as { minAge: unknown }).minAge),
        { path: ['maxAge'], message: tValidation('ageOrder') }
      );
    }

    const slice: Record<string, unknown> = {};
    for (const f of fields) {
      slice[f as string] = form.getFieldValue(f as never);
    }
    const result = stepSchema.safeParse(slice);

    // Collect target field paths (top-level + known nested array sub-paths) so
    // we can reset stale errors before applying fresh ones.
    const targetPaths = new Set<string>(fields.map((f) => f as string));
    if (fields.includes('sessions' as keyof CourseFormValues)) {
      const sessionsArr = (form.getFieldValue('sessions') as SessionValue[] | undefined) ?? [];
      sessionsArr.forEach((_, i) => {
        targetPaths.add(`sessions[${i}].title`);
        targetPaths.add(`sessions[${i}].description`);
      });
    }
    if (fields.includes('discounts' as keyof CourseFormValues)) {
      const discountsArr = (form.getFieldValue('discounts') as DiscountValue[] | undefined) ?? [];
      discountsArr.forEach((_, i) => {
        ['name', 'type', 'value', 'condition', 'conditionDate'].forEach((sub) => {
          targetPaths.add(`discounts[${i}].${sub}`);
        });
      });
    }

    // Group new issues by field path — keep only the first message per path so each
    // field surfaces a single error at a time even when multiple rules fail.
    const grouped = new Map<string, { message: string }[]>();
    if (!result.success) {
      for (const issue of result.error.issues) {
        const name = zodPathToFieldName(issue.path);
        if (!name || grouped.has(name)) continue;
        grouped.set(name, [{ message: issue.message }]);
      }
    }

    // Touch + assign errors via errorMap.onSubmit (TanStack derives state.meta.errors
    // from errorMap, so writing to `errors` directly has no visible effect).
    targetPaths.forEach((name) => {
      const errors = grouped.get(name);
      // `prev` is undefined for fields that haven't mounted yet (e.g. newly
      // grown session entries before their inputs render).
      form.setFieldMeta(name as never, (prev) => ({
        ...(prev ?? {}),
        isTouched: true,
        errorMap: {
          ...(prev?.errorMap ?? {}),
          onSubmit: errors && errors.length ? errors : undefined
        }
      }));
    });

    if (result.success) return true;

    toast.error(result.error.issues[0]?.message ?? tDialog('errorToast'));
    scrollToFirstError();
    return false;
  };

  // Keep outline length in sync with totalSessions: preserve what the user
  // already typed (slice tail when shrinking, append blanks when growing).
  const syncSessionsToTotal = () => {
    const current = form.getFieldValue('sessions') as SessionValue[];
    const total = Number(form.getFieldValue('totalSessions')) || 0;
    if (current.length === total) return;
    const next =
      total > current.length
        ? [
            ...current,
            ...Array.from({ length: total - current.length }, () => ({
              title: '',
              description: ''
            }))
          ]
        : current.slice(0, total);
    form.setFieldValue('sessions', next);
  };

  const goToStep = (direction: 'next' | 'prev') => {
    const idx = stepKeys.indexOf(step);
    const nextIdx = direction === 'next' ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= stepKeys.length) return;
    const nextStep = stepKeys[nextIdx];
    if (direction === 'next') {
      if (!validateStep(step)) return;
      if (nextStep === 'outline') syncSessionsToTotal();
    }
    setStep(nextStep);
  };

  const jumpToStep = (target: StepKey, targetIndex: number, currentIndex: number) => {
    // Going back is always allowed; jumping forward must pass intermediate validation.
    if (targetIndex <= currentIndex) {
      if (target === 'outline') syncSessionsToTotal();
      setStep(target);
      return;
    }
    for (let k = currentIndex; k < targetIndex; k += 1) {
      if (!validateStep(stepKeys[k])) return;
    }
    if (target === 'outline') syncSessionsToTotal();
    setStep(target);
  };

  const handleOpenChange = (next: boolean) => {
    if (isPending) return;
    if (!next) {
      form.reset();
      setStep('basics');
      setTagInput('');
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size='sm' className='h-9'>
            <Icons.add className='size-3.5' />
            {t('newCourse')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='grid max-h-[92vh] grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-[860px]'>
        <DialogHeader className='space-y-0.5 px-6 pt-5 pr-14 pb-4'>
          <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
            {tDialog('section')}
          </div>
          <DialogTitle className='text-base tracking-tight'>{tDialog('title')}</DialogTitle>
          <DialogDescription className='text-[12px]'>{tDialog('description')}</DialogDescription>
        </DialogHeader>

        <Stepper step={step} tDialog={tDialog} onJumpTo={jumpToStep} />

        <form.AppForm>
          <form.Form id={FORM_ID} className='contents p-0 md:p-0'>
            <fieldset
              disabled={isPending}
              className='grid min-h-0 grid-cols-12 gap-5 overflow-auto border-0 p-6 disabled:opacity-60'
            >
              <BasicsStep
                form={form}
                baseSchema={baseSchema}
                tCourses={t}
                tDialog={tDialog}
                tagInput={tagInput}
                setTagInput={setTagInput}
                categoryOptions={categoryOptions}
                levelOptions={levelOptions}
                preview={{
                  title: titleValue,
                  code: codeValue,
                  description: descriptionValue,
                  category: categoryValue,
                  level: levelValue,
                  minAge: minAgeValue,
                  maxAge: maxAgeValue,
                  totalSessions: totalSessionsValue,
                  sessionDurationMinutes: sessionDurationValue,
                  perClassCapacity: capacityValue,
                  coverPreviewUrl
                }}
                hidden={step !== 'basics'}
              />

              {step === 'outline' && (
                <div className='col-span-12 space-y-4 text-sm'>
                  <OutlineStep
                    tDialog={tDialog}
                    form={form}
                    totalSessionsValue={totalSessionsValue}
                  />
                </div>
              )}

              {step === 'pricing' && (
                <div className='col-span-12 space-y-4 text-sm'>
                  <PricingStep tDialog={tDialog} form={form} baseSchema={baseSchema} />
                </div>
              )}
            </fieldset>
            <DialogFooter className='bg-muted/30 flex shrink-0 flex-row items-center justify-end gap-2 border-t px-6 py-3'>
              <div className='flex items-center gap-2'>
                <DialogClose asChild>
                  <Button variant='outline' size='sm' className='h-9' disabled={isPending}>
                    {tCommon('cancel')}
                  </Button>
                </DialogClose>
                {step !== 'basics' && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className={cn('h-9')}
                    disabled={isPending}
                    onClick={() => goToStep('prev')}
                  >
                    <Icons.chevronLeft className='size-3.5' />
                    {tDialog('footer.back')}
                  </Button>
                )}
                {step !== 'pricing' ? (
                  <Button
                    type='button'
                    size='sm'
                    className='h-9'
                    disabled={isPending}
                    onClick={() => goToStep('next')}
                  >
                    {tDialog('footer.continue')}
                    <Icons.chevronRight className='size-3.5' />
                  </Button>
                ) : (
                  <form.SubmitButton size='sm' className='h-9' form={FORM_ID}>
                    {tDialog('footer.submit')}
                  </form.SubmitButton>
                )}
              </div>
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
