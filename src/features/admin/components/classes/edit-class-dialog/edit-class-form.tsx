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
import {
  canEditClassField,
  lockReason,
  useUpdateClass,
  type ClassRow,
  type UpdateClassInput
} from '@/api/classes';
import { courseListOptions, type Course } from '@/api/courses';
import { masterDataOptions } from '@/api/master-data';
import { teacherOptionsQuery, type Teacher } from '@/api/teachers';
import { formatApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { AsyncCombobox } from '../add-class-dialog/async-combobox';
import { DateField } from '../add-class-dialog/date-field';
import {
  buildBaseSchema,
  buildSchema,
  sortDaySchedules,
  VISIBILITIES,
  type ClassFormValues,
  type ClassVisibility,
  type DaySchedule
} from '../add-class-dialog/schema';
import { ScheduleField } from '../add-class-dialog/schedule-field';

/* eslint-disable @typescript-eslint/no-explicit-any */

const FORM_ID = 'edit-class-form';

interface EditClassFormProps {
  cls: ClassRow;
  initialCourses: Course[];
  initialTeachers: Teacher[];
  onClose: () => void;
  onPendingChange: (pending: boolean) => void;
}

// Map ClassRow → form values, falling back to defaults for any fields the BE
// hasn't sent (older classes created before the schema landed).
function hydrate(cls: ClassRow): ClassFormValues {
  return {
    courseId: cls.courseId ?? '',
    label: cls.label ?? '',
    teacherId: cls.teacherId ?? '',
    location: cls.location ?? '',
    room: cls.room ?? '',
    daySchedules: (cls.daySchedules ?? []) as DaySchedule[],
    startDate: cls.startDate ?? '',
    endDate: cls.endDate ?? '',
    capacity: cls.capacity ?? 0,
    visibility: (VISIBILITIES as readonly string[]).includes(cls.visibility ?? '')
      ? (cls.visibility as ClassVisibility)
      : 'public_enrollable'
  };
}

// Build a PUT payload containing only the fields the user actually changed.
// Same-value diffs would clutter the audit log and trip BE editability checks
// even when the value isn't really moving.
function diffPayload(initial: ClassFormValues, current: ClassFormValues): UpdateClassInput {
  const out: UpdateClassInput = {};
  if (current.courseId !== initial.courseId) out.courseId = current.courseId;
  if (current.label !== initial.label) out.label = current.label;
  if (current.teacherId !== initial.teacherId) out.teacherId = current.teacherId;
  if (current.location !== initial.location) out.location = current.location;
  if (current.room !== initial.room) out.room = current.room;
  if (current.startDate !== initial.startDate) out.startDate = current.startDate;
  if (current.endDate !== initial.endDate) out.endDate = current.endDate;
  if (current.visibility !== initial.visibility) out.visibility = current.visibility;
  if (Number(current.capacity) !== Number(initial.capacity)) {
    out.capacity = Number(current.capacity);
  }
  if (JSON.stringify(current.daySchedules) !== JSON.stringify(initial.daySchedules)) {
    out.daySchedules = sortDaySchedules(current.daySchedules);
  }
  return out;
}

export function EditClassForm({
  cls,
  initialCourses,
  initialTeachers,
  onClose,
  onPendingChange
}: EditClassFormProps) {
  const tDialog = useTranslations('classes.editDialog');
  const tValidation = useTranslations('classes.addDialog.validation');
  const tCommon = useTranslations('common');
  const tLock = useTranslations('classes.lockReason');

  const [courseSearch, setCourseSearch] = React.useState('');
  const [teacherSearch, setTeacherSearch] = React.useState('');
  const updateClass = useUpdateClass();

  const { data: coursesResult, isFetching: coursesFetching } = useQuery(
    courseListOptions({ status: 'published', search: courseSearch || undefined })
  );
  const { data: teachersData, isFetching: teachersFetching } = useQuery(
    teacherOptionsQuery({ status: 'active', search: teacherSearch || undefined })
  );
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
  // Edit uses buildSchema (not buildCreateSchema) — past startDate is fine when
  // the class is already in flight; BE enforces the stricter rules per-field.
  const schema = React.useMemo(
    () => buildSchema(baseSchema, tValidation),
    [baseSchema, tValidation]
  );

  const initialValues = React.useMemo(() => hydrate(cls), [cls]);

  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const payload = diffPayload(initialValues, value);
      if (Object.keys(payload).length === 0) {
        toast.message(tDialog('noChanges'));
        return;
      }
      // Client-side guard: refuse if new capacity below current enrolment.
      // BE re-validates via validateCapacityChange — this is just UX.
      if (payload.capacity !== undefined && payload.capacity < cls.enrolled) {
        toast.error(tValidation('capacityBelowEnrolled', { enrolled: cls.enrolled }));
        return;
      }
      try {
        const updated = await updateClass.mutateAsync({ id: cls.id, input: payload });
        toast.success(tDialog('successToast', { name: updated.name }));
        onClose();
      } catch (err) {
        const { title } = formatApiError(err, tDialog('errorToast'));
        toast.error(title);
      }
    }
  });

  const isPending = updateClass.isPending;
  React.useEffect(() => {
    onPendingChange(isPending);
  }, [isPending, onPendingChange]);

  const courseId = useStore(form.store, (s) => s.values.courseId);
  const teacherId = useStore(form.store, (s) => s.values.teacherId);
  const daySchedules = useStore(form.store, (s) => s.values.daySchedules);

  const selectedCourse =
    coursesResult?.data.find((c) => c.id === courseId) ??
    initialCourses.find((c) => c.id === courseId);
  const selectedTeacher =
    teachersData?.find((tt) => String(tt.id) === teacherId) ??
    initialTeachers.find((tt) => String(tt.id) === teacherId);

  const sortedSchedules = React.useMemo(() => sortDaySchedules(daySchedules), [daySchedules]);

  // Pre-compute lock state per field so JSX stays readable. `lockReason` returns
  // null when editable; we surface the reason as a small note under the input.
  const lockedReason = (field: Parameters<typeof canEditClassField>[0]) => lockReason(field, cls);
  const isEditable = (field: Parameters<typeof canEditClassField>[0]) =>
    canEditClassField(field, cls);

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
                      {tDialog('fields.course')}
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
                      disabled={!isEditable('courseId')}
                      getKey={(c) => c.id}
                      placeholder={tDialog('fields.coursePlaceholder')}
                      searchPlaceholder={tDialog('fields.courseSearchPlaceholder')}
                      emptyText={tDialog('fields.courseEmpty')}
                      renderSelected={(c) => (
                        <span className='flex items-center gap-2'>
                          <span className='flex flex-col items-start leading-tight sm:flex-row sm:items-center sm:gap-1'>
                            <span className='font-medium'>{c.title}</span>
                            <span className='text-muted-foreground font-mono text-[11px]'>
                              {c.code}
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
                    <LockNote reason={lockedReason('courseId')} tLock={tLock} />
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
                      {tDialog('fields.classLabel')}
                    </field.FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={!isEditable('label')}
                      className='h-10 font-mono'
                      aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    />
                    <LockNote reason={lockedReason('label')} tLock={tLock} />
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
                      {tDialog('fields.teacher')}
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
                      disabled={!isEditable('teacherId')}
                      getKey={(tt) => String(tt.id)}
                      placeholder={tDialog('fields.teacherPlaceholder')}
                      searchPlaceholder={tDialog('fields.teacherSearchPlaceholder')}
                      emptyText={tDialog('fields.teacherEmpty')}
                      renderSelected={(tt) => <span className='font-medium'>{tt.name}</span>}
                      renderItem={(tt) => <span className='font-medium'>{tt.name}</span>}
                    />
                    <LockNote reason={lockedReason('teacherId')} tLock={tLock} />
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
                      {tDialog('fields.location')}
                    </field.FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => {
                        field.handleChange(v);
                        field.handleBlur();
                      }}
                      disabled={!isEditable('location')}
                    >
                      <SelectTrigger className='h-10 w-full'>
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
                    <LockNote reason={lockedReason('location')} tLock={tLock} />
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
                      disabled={!isEditable('room')}
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
                    <LockNote reason={lockedReason('room')} tLock={tLock} />
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>
          </div>

          <div>
            <ScheduleField
              form={form}
              tDialog={tDialog}
              sortedSchedules={sortedSchedules}
              conflict={false}
              conflictTeacher={undefined}
              disabled={!isEditable('daySchedules')}
            />
            <LockNote reason={lockedReason('daySchedules')} tLock={tLock} className='mt-1' />
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <DateField
                form={form}
                name='startDate'
                label={tDialog('fields.starts')}
                placeholder={tDialog('fields.datePlaceholder')}
                disabled={!isEditable('startDate')}
                validators={{ onBlur: baseSchema.shape.startDate }}
              />
              <LockNote reason={lockedReason('startDate')} tLock={tLock} className='mt-1' />
            </div>
            <div>
              <DateField
                form={form}
                name='endDate'
                label={tDialog('fields.ends')}
                placeholder={tDialog('fields.datePlaceholder')}
                disabled={!isEditable('endDate')}
                validators={{ onBlur: baseSchema.shape.endDate }}
              />
              <LockNote reason={lockedReason('endDate')} tLock={tLock} className='mt-1' />
            </div>
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
                          'border-destructive ring-destructive/20 ring-2',
                        !isEditable('capacity') && 'opacity-70'
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
                        disabled={!isEditable('capacity')}
                        aria-label={tDialog('fields.capacity')}
                        className='min-w-0 flex-1 border-0 bg-transparent px-3 font-mono text-sm outline-none disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      />
                      <span className='text-muted-foreground shrink-0 border-l px-2.5 text-[11px]'>
                        {tDialog('fields.capacityUnit')}
                      </span>
                    </div>
                    <p className='text-muted-foreground text-[11px]'>
                      {tDialog('fields.capacityEnrolledHint', { enrolled: cls.enrolled })}
                    </p>
                    <LockNote reason={lockedReason('capacity')} tLock={tLock} />
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
                      disabled={!isEditable('visibility')}
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
                    <LockNote reason={lockedReason('visibility')} tLock={tLock} />
                  </field.Field>
                  <field.FieldError />
                </field.FieldSet>
              )}
            </form.AppField>
          </div>
        </fieldset>

        <DialogFooter className='bg-muted/30 flex shrink-0 flex-row items-center justify-between gap-2 border-t px-6 py-3'>
          <div className='text-muted-foreground text-[12px]'>
            {tDialog('hint', { name: cls.name })}
          </div>
          <div className='flex items-center gap-2'>
            <DialogClose asChild>
              <Button variant='outline' size='sm' className='h-9' disabled={isPending}>
                {tCommon('cancel')}
              </Button>
            </DialogClose>
            <form.SubmitButton size='sm' className='h-9' form={FORM_ID}>
              <Icons.check className='size-3.5' />
              {tDialog('submit')}
            </form.SubmitButton>
          </div>
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );
}

function LockNote({
  reason,
  tLock,
  className
}: {
  reason: ReturnType<typeof lockReason>;
  tLock: ReturnType<typeof useTranslations>;
  className?: string;
}) {
  if (!reason) return null;
  return (
    <p className={cn('text-muted-foreground flex items-center gap-1 text-[11px]', className)}>
      <Icons.alertCircle className='size-3' />
      {tLock(reason)}
    </p>
  );
}
