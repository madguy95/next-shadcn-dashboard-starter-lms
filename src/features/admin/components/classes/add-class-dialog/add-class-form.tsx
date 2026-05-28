'use client';

import { useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAppForm } from '@/components/ui/tanstack-form';
import { useCreateClass } from '@/api/classes';
import { courseListOptions, type Course } from '@/api/courses';
import { masterDataOptions } from '@/api/master-data';
import { teacherOptionsQuery, type Teacher } from '@/api/teachers';
import { thumbStripeStyle } from '@/features/admin/components/courses/shared';
import { avatarToneClass } from '@/features/admin/data';
import { cn } from '@/lib/utils';
import { AsyncCombobox } from './async-combobox';
import { DateField, parseYmdLocal, toYmd } from './date-field';
import {
  buildBaseSchema,
  buildCreateSchema,
  buildStartDateCreateValidator,
  defaultValues,
  sortDaySchedules,
  VISIBILITIES,
  type ClassFormValues,
  type ClassVisibility
} from './schema';
import { ScheduleField } from './schedule-field';

/* eslint-disable @typescript-eslint/no-explicit-any */

const FORM_ID = 'add-class-form';

interface AddClassFormProps {
  /** Unfiltered course list — used to seed defaults and as a fallback when
   *  the search-filtered list excludes the currently-picked course. */
  initialCourses: Course[];
  initialTeachers: Teacher[];
  onClose: () => void;
  onPendingChange: (pending: boolean) => void;
}

export function AddClassForm({
  initialCourses,
  initialTeachers,
  onClose,
  onPendingChange
}: AddClassFormProps) {
  const tDialog = useTranslations('classes.addDialog');
  const tValidation = useTranslations('classes.addDialog.validation');
  const tCommon = useTranslations('common');

  const [courseSearch, setCourseSearch] = React.useState('');
  const [teacherSearch, setTeacherSearch] = React.useState('');

  const createClass = useCreateClass();

  // Filtered queries — fire on every search keystroke. The unfiltered lists
  // (passed in as props) act as a stable fallback so the trigger still shows
  // the selected label even if the current search excludes it.
  const { data: coursesResult, isFetching: coursesFetching } = useQuery(
    courseListOptions({ status: 'published', search: courseSearch || undefined })
  );
  const { data: teachersData, isFetching: teachersFetching } = useQuery(
    teacherOptionsQuery({ status: 'active', search: teacherSearch || undefined })
  );

  // Lazy-load location + room options from master_data so the admin can extend
  // the lookup table without an FE deploy.
  const { data: locationsData } = useQuery(masterDataOptions('location'));
  const locationOptions = React.useMemo(
    () => (locationsData ?? []).map((item) => ({ value: item.code, label: item.name })),
    [locationsData]
  );
  const { data: roomsData } = useQuery(masterDataOptions('room'));
  const roomOptions = React.useMemo(
    () => (roomsData ?? []).map((item) => ({ value: item.code, label: item.name })),
    [roomsData]
  );

  const baseSchema = React.useMemo(() => buildBaseSchema(tValidation), [tValidation]);
  const schema = React.useMemo(
    () => buildCreateSchema(baseSchema, tValidation),
    [baseSchema, tValidation]
  );
  // Per-field validator so the "must be after today" error appears as soon
  // as the user picks a past date (DateField calls handleBlur on select).
  const startDateValidator = React.useMemo(
    () => buildStartDateCreateValidator(tValidation),
    [tValidation]
  );

  // Defaults are computed once at mount — the parent guarantees both lists
  // are non-empty before mounting this component, so `[0]` is safe.
  const initialValues = React.useMemo<ClassFormValues>(
    () => ({
      ...defaultValues,
      courseId: initialCourses[0]?.id ?? '',
      teacherId: initialTeachers[0]?.id != null ? String(initialTeachers[0].id) : ''
    }),
    [initialCourses, initialTeachers]
  );

  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      try {
        const created = await createClass.mutateAsync({
          courseId: value.courseId,
          label: value.label,
          teacherId: value.teacherId,
          location: value.location,
          room: value.room,
          daySchedules: sortDaySchedules(value.daySchedules),
          startDate: value.startDate,
          endDate: value.endDate,
          capacity: Number(value.capacity),
          visibility: value.visibility
        });
        toast.success(tDialog('successToast', { name: created.name }));
        onClose();
      } catch {
        toast.error(tDialog('errorToast'));
      }
    }
  });

  // Surface mutation pending state to the parent so it can block dialog close.
  const isPending = createClass.isPending;
  React.useEffect(() => {
    onPendingChange(isPending);
  }, [isPending, onPendingChange]);

  // Live values powering preview chips, conflict banner and dependent effects.
  const courseId = useStore(form.store, (s) => s.values.courseId);
  const teacherId = useStore(form.store, (s) => s.values.teacherId);
  const daySchedules = useStore(form.store, (s) => s.values.daySchedules);
  const startDate = useStore(form.store, (s) => s.values.startDate);

  const selectedCourse =
    coursesResult?.data.find((c) => c.id === courseId) ??
    initialCourses.find((c) => c.id === courseId);
  const selectedTeacher =
    teachersData?.find((tt) => String(tt.id) === teacherId) ??
    initialTeachers.find((tt) => String(tt.id) === teacherId);

  const sortedSchedules = React.useMemo(() => sortDaySchedules(daySchedules), [daySchedules]);
  const courseTotalSessions = selectedCourse?.totalSessions ?? 0;
  const sessionsPerWeek = daySchedules.length;
  // End date is derived from total sessions + sessions/week. Round up so the
  // last (partial) week is included. Falls back to 0 weeks when the schedule
  // isn't picked yet, in which case the effect below simply won't run.
  const computedWeeks = sessionsPerWeek > 0 ? Math.ceil(courseTotalSessions / sessionsPerWeek) : 0;
  const sessionsTotal = courseTotalSessions;

  // End date is derived from start date + the course's duration. The field is
  // read-only in the UI — this effect keeps submit values in sync. Both ends
  // use local YYYY-MM-DD so the same calendar week math holds regardless of TZ.
  React.useEffect(() => {
    if (!startDate || !computedWeeks) return;
    const start = parseYmdLocal(startDate);
    if (!start) return;
    const end = new Date(start);
    end.setDate(end.getDate() + computedWeeks * 7);
    const nextYmd = toYmd(end);
    if (form.getFieldValue('endDate') !== nextYmd) {
      form.setFieldValue('endDate', nextYmd);
    }
  }, [startDate, computedWeeks, form]);

  const hasConflict = detectMockConflict(
    selectedTeacher?.id != null ? String(selectedTeacher.id) : undefined,
    daySchedules
  );

  return (
    <form.AppForm>
      <form.Form id={FORM_ID} className='contents p-0 md:p-0'>
        <fieldset
          disabled={isPending}
          className='min-h-0 space-y-5 overflow-auto border-0 p-6 text-sm disabled:opacity-60'
        >
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <form.AppField name='courseId' validators={{ onBlur: baseSchema.shape.courseId }}>
              {(field: any) => (
                <field.FieldSet className='sm:col-span-2'>
                  <field.Field>
                    <field.FieldLabel className='text-muted-foreground text-[12px]'>
                      {tDialog('fields.course')} *
                    </field.FieldLabel>
                    <AsyncCombobox
                      value={field.state.value}
                      onChange={(id) => {
                        field.handleChange(id);
                        field.handleBlur();
                      }}
                      search={courseSearch}
                      onSearchChange={setCourseSearch}
                      items={coursesResult?.data ?? []}
                      loading={coursesFetching}
                      selected={selectedCourse}
                      invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                      getKey={(c) => c.id}
                      placeholder={tDialog('fields.coursePlaceholder')}
                      searchPlaceholder={tDialog('fields.courseSearchPlaceholder')}
                      emptyText={tDialog('fields.courseEmpty')}
                      renderSelected={(c) => (
                        <span className='flex items-center gap-2'>
                          <span
                            style={thumbStripeStyle}
                            className='h-6 w-6 shrink-0 rounded-md border'
                          />
                          <span className='flex flex-col items-start leading-tight sm:flex-row sm:items-center sm:gap-1'>
                            <span className='font-medium'>{c.title}</span>
                            <span className='text-muted-foreground font-mono text-[11px]'>
                              {c.code} · {c.totalSessions} sessions
                            </span>
                          </span>
                        </span>
                      )}
                      renderItem={(c) => (
                        <>
                          <span className='font-medium'>{c.title}</span>
                          <span className='text-muted-foreground ml-2 font-mono text-[11px]'>
                            {c.code}
                          </span>
                        </>
                      )}
                    />
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>

            <form.AppField name='label' validators={{ onBlur: baseSchema.shape.label }}>
              {(field: any) => (
                <field.FieldSet>
                  <field.Field>
                    <field.FieldLabel className='text-muted-foreground text-[12px]'>
                      {tDialog('fields.classLabel')} *
                    </field.FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className='h-10 font-mono'
                      aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    />
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <form.AppField name='teacherId' validators={{ onBlur: baseSchema.shape.teacherId }}>
              {(field: any) => (
                <field.FieldSet>
                  <field.Field>
                    <field.FieldLabel className='text-muted-foreground text-[12px]'>
                      {tDialog('fields.teacher')} *
                    </field.FieldLabel>
                    <AsyncCombobox
                      value={field.state.value}
                      onChange={(id) => {
                        field.handleChange(id);
                        field.handleBlur();
                      }}
                      search={teacherSearch}
                      onSearchChange={setTeacherSearch}
                      items={teachersData ?? []}
                      loading={teachersFetching}
                      selected={selectedTeacher}
                      invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                      getKey={(tt) => String(tt.id)}
                      placeholder={tDialog('fields.teacherPlaceholder')}
                      searchPlaceholder={tDialog('fields.teacherSearchPlaceholder')}
                      emptyText={tDialog('fields.teacherEmpty')}
                      renderSelected={(tt) => (
                        <span className='flex items-center gap-2'>
                          <span
                            className={cn(
                              'grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold',
                              avatarToneClass[tt.tone]
                            )}
                          >
                            {tt.initials}
                          </span>
                          <span className='font-medium'>{tt.name}</span>
                          <span className='text-muted-foreground font-mono text-[11px]'>
                            ·{' '}
                            {tDialog('fields.teacherActiveClasses', {
                              count: tt.classCount
                            })}
                          </span>
                        </span>
                      )}
                      renderItem={(tt) => (
                        <>
                          <span
                            className={cn(
                              'mr-2 grid h-5 w-5 place-items-center rounded-full text-[9px] font-semibold',
                              avatarToneClass[tt.tone]
                            )}
                          >
                            {tt.initials}
                          </span>
                          <span className='font-medium'>{tt.name}</span>
                          <span className='text-muted-foreground ml-2 font-mono text-[11px]'>
                            {tt.subjects[0]}
                          </span>
                        </>
                      )}
                    />
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>

            <form.AppField name='location' validators={{ onBlur: baseSchema.shape.location }}>
              {(field: any) => (
                <field.FieldSet>
                  <field.Field>
                    <field.FieldLabel className='text-muted-foreground text-[12px]'>
                      {tDialog('fields.location')} *
                    </field.FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => {
                        field.handleChange(v);
                        field.handleBlur();
                      }}
                    >
                      <SelectTrigger
                        className='h-10 w-full'
                        aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                      >
                        <SelectValue placeholder={tDialog('fields.locationPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <form.AppField name='room'>
              {(field: any) => (
                <field.FieldSet>
                  <field.Field>
                    <field.FieldLabel className='text-muted-foreground text-[12px]'>
                      {tDialog('fields.room')}
                    </field.FieldLabel>
                    <Select
                      value={field.state.value || undefined}
                      onValueChange={(v) => field.handleChange(v)}
                    >
                      <SelectTrigger className='h-10 w-full'>
                        <SelectValue placeholder={tDialog('fields.roomPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {roomOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>
          </div>

          <ScheduleField
            form={form}
            tDialog={tDialog}
            sortedSchedules={sortedSchedules}
            conflict={hasConflict}
            conflictTeacher={selectedTeacher}
          />

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <DateField
              form={form}
              name='startDate'
              label={tDialog('fields.starts')}
              placeholder={tDialog('fields.datePlaceholder')}
              validators={{ onBlur: startDateValidator, onChange: startDateValidator }}
            />
            <DateField
              form={form}
              name='endDate'
              label={tDialog('fields.ends')}
              placeholder={tDialog('fields.datePlaceholder')}
              disabled
              description={
                computedWeeks
                  ? tDialog('fields.endsHint', { weeks: computedWeeks })
                  : tDialog('fields.endsHintEmpty')
              }
            />
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <form.AppField name='capacity' validators={{ onBlur: baseSchema.shape.capacity }}>
              {(field: any) => (
                <field.FieldSet>
                  <field.Field>
                    <field.FieldLabel className='text-muted-foreground text-[12px]'>
                      {tDialog('fields.capacity')}
                    </field.FieldLabel>
                    <div
                      className={cn(
                        'bg-background flex h-9 w-full items-center rounded-md border',
                        field.state.meta.isTouched &&
                          !field.state.meta.isValid &&
                          'border-destructive ring-destructive/20 ring-2'
                      )}
                    >
                      <input
                        type='number'
                        inputMode='numeric'
                        min={1}
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        onBlur={field.handleBlur}
                        aria-label={tDialog('fields.capacity')}
                        className='min-w-0 flex-1 border-0 bg-transparent px-3 font-mono text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      />
                      <span className='text-muted-foreground shrink-0 border-l px-2.5 text-[11px]'>
                        {tDialog('fields.capacityUnit')}
                      </span>
                    </div>
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>

            <form.AppField name='visibility'>
              {(field: any) => (
                <field.FieldSet>
                  <field.Field>
                    <field.FieldLabel className='text-muted-foreground text-[12px]'>
                      {tDialog('fields.visibility')}
                    </field.FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as ClassVisibility)}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIBILITIES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {tDialog(`visibilities.${v}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>
          </div>
        </fieldset>

        <DialogFooter className='bg-muted/30 flex shrink-0 flex-row items-center justify-between gap-2 border-t px-6 py-3'>
          <div className='text-muted-foreground text-[12px]'>
            {tDialog('summary', { count: sessionsTotal })}
          </div>
          <div className='flex items-center gap-2'>
            <DialogClose asChild>
              <Button variant='outline' size='sm' className='h-9' disabled={isPending}>
                {tCommon('cancel')}
              </Button>
            </DialogClose>
            <Button variant='outline' size='sm' className='h-9' disabled={isPending}>
              {tDialog('footer.saveDraft')}
            </Button>
            <form.SubmitButton size='sm' className='h-9' form={FORM_ID} disabled={hasConflict}>
              <Icons.check className='size-3.5' />
              {tDialog('footer.submit')}
            </form.SubmitButton>
          </div>
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );
}

// Mock-only heuristic: pretend teacher T-001 is already booked Mon+Wed 09:00.
// Real conflict detection would come from a /classes overlap endpoint.
function detectMockConflict(
  teacherId: string | undefined,
  schedules: { day: string; startTime: string }[]
): boolean {
  if (teacherId !== 'T-001') return false;
  return (
    schedules.some((s) => s.day === 'Mon' && s.startTime === '09:00') &&
    schedules.some((s) => s.day === 'Wed' && s.startTime === '09:00')
  );
}
