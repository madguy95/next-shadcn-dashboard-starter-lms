'use client';

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { useUpdateTeacher, type Gender, type Teacher } from '@/api/teachers';
import { avatarToneClass, teacherStatusClass } from '@/features/admin/data';
import { formatApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { TeacherForm, type TeacherFormValues } from './teacher-form';

type Props = {
  teacher: Teacher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EDIT_FORM_ID = 'edit-teacher-form';

function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return { first: name, last: '' };
  return {
    first: parts.slice(0, -1).join(' '),
    last: parts[parts.length - 1]
  };
}

function teacherToFormValues(teacher: Teacher): TeacherFormValues {
  const fallback = splitName(teacher.name);
  return {
    firstName: teacher.firstName ?? fallback.first,
    lastName: teacher.lastName ?? fallback.last,
    email: teacher.email,
    phone: teacher.phone,
    dateOfBirth: teacher.dateOfBirth ?? '',
    gender: teacher.gender ?? '',
    avatar: [],
    primarySubject: teacher.subjects[0] ?? '',
    location: teacher.location ?? '',
    bio: teacher.bio ?? '',
    tags: teacher.subjects.slice(1),
    sendOnboardingEmail: false
  };
}

export function TeacherProfileSheet({ teacher, open, onOpenChange }: Props) {
  const t = useTranslations('teachers');
  const tProfile = useTranslations('teachers.profile');
  const tCommon = useTranslations('common');
  const tGender = useTranslations('teachers.gender');
  const [isEditing, setIsEditing] = React.useState(false);
  const updateTeacher = useUpdateTeacher();

  const handleOpenChange = (next: boolean) => {
    if (updateTeacher.isPending) return;
    onOpenChange(next);
    if (!next) setIsEditing(false);
  };

  const dobLabel = teacher.dateOfBirth
    ? format(new Date(teacher.dateOfBirth), 'PPP')
    : tProfile('notProvided');
  const genderLabel = teacher.gender ? tGender(teacher.gender) : tProfile('notProvided');

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='w-full gap-0 p-0 sm:max-w-md'>
        <SheetHeader className='px-6 pt-6 pb-4'>
          <SheetTitle className='sr-only'>
            {isEditing ? tProfile('editTitle') : tProfile('title')}
          </SheetTitle>
          <SheetDescription className='sr-only'>
            {isEditing
              ? tProfile('editDescription', { name: teacher.name })
              : tProfile('description', { name: teacher.name })}
          </SheetDescription>
          <div className='flex items-start gap-4'>
            {teacher.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={teacher.avatarUrl}
                alt={teacher.name}
                className='size-16 rounded-full object-cover'
              />
            ) : (
              <span
                className={cn(
                  'grid size-16 place-items-center rounded-full text-lg font-semibold',
                  avatarToneClass[teacher.tone]
                )}
              >
                {teacher.initials}
              </span>
            )}
            <div className='min-w-0 flex-1'>
              <div className='truncate text-base font-semibold'>{teacher.name}</div>
              <div className='text-muted-foreground truncate font-mono text-[12px]'>
                {teacher.email}
              </div>
              <span
                className={cn(
                  'mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                  teacherStatusClass[teacher.status]
                )}
              >
                {t(`status.${teacher.status}`)}
              </span>
            </div>
            {!isEditing && (
              <Button
                variant='outline'
                size='sm'
                className='h-8'
                onClick={() => setIsEditing(true)}
              >
                <Icons.edit className='size-3.5' />
                {tProfile('edit')}
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-6 pb-6'>
          {isEditing ? (
            <TeacherForm
              formId={EDIT_FORM_ID}
              defaultValues={teacherToFormValues(teacher)}
              isPending={updateTeacher.isPending}
              submitLabel={tProfile('save')}
              showOnboardingEmail={false}
              disabledFields={['email', 'phone']}
              onSubmit={async (value) => {
                try {
                  const updated = await updateTeacher.mutateAsync({
                    id: teacher.id,
                    input: {
                      firstName: value.firstName,
                      lastName: value.lastName,
                      email: value.email,
                      phone: value.phone,
                      dateOfBirth: value.dateOfBirth,
                      gender: value.gender as Gender,
                      primarySubject: value.primarySubject,
                      location: value.location,
                      bio: value.bio,
                      tags: value.tags,
                      avatar: value.avatar[0]
                    }
                  });
                  toast.success(tProfile('saveSuccess', { name: updated.name }));
                  setIsEditing(false);
                } catch (e) {
                  const { title, description } = formatApiError(e, tProfile('saveError'));
                  toast.error(title, description ? { description } : undefined);
                }
              }}
              renderFooter={(submitButton) => (
                <div className='flex justify-end gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-9'
                    disabled={updateTeacher.isPending}
                    onClick={() => setIsEditing(false)}
                  >
                    {tCommon('cancel')}
                  </Button>
                  {submitButton}
                </div>
              )}
            />
          ) : (
            <div className='space-y-6'>
              <Section title={tProfile('sections.personal')}>
                <Row label={t('columns.phone')} value={teacher.phone} />
                <Row label={t('addDialog.dateOfBirth')} value={dobLabel} />
                <Row label={t('addDialog.gender')} value={genderLabel} />
                <Row
                  label={t('addDialog.location')}
                  value={teacher.location ?? tProfile('notProvided')}
                />
                {teacher.bio && (
                  <div className='px-3 py-2 text-[12px]'>
                    <dt className='text-muted-foreground mb-1'>{t('addDialog.bio')}</dt>
                    <dd className='text-foreground leading-relaxed whitespace-pre-wrap'>
                      {teacher.bio}
                    </dd>
                  </div>
                )}
              </Section>

              <Separator />

              <Section title={tProfile('sections.teaching')}>
                <Row
                  label={t('addDialog.primarySubject')}
                  value={teacher.subjects[0] ?? tProfile('notProvided')}
                />
                <Row
                  label={t('columns.subjects')}
                  value={
                    teacher.subjects.length > 0 ? (
                      <div className='flex flex-wrap justify-end gap-1'>
                        {teacher.subjects.map((s) => (
                          <span key={s} className='bg-muted rounded px-1.5 py-0.5 text-[11px]'>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      tProfile('notProvided')
                    )
                  }
                />
                <Row label={t('columns.classes')} value={teacher.classCount} mono />
                <Row label={t('columns.students')} value={teacher.studentCount} mono />
                <Row
                  label={t('columns.rating')}
                  value={
                    <span className='inline-flex items-center gap-1 font-mono text-[12px]'>
                      <Icons.star className='size-3.5 fill-amber-500 text-amber-500' />
                      {teacher.rating.toFixed(1)}
                    </span>
                  }
                />
              </Section>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='space-y-2'>
      <h3 className='text-muted-foreground text-[11px] font-medium tracking-wide uppercase'>
        {title}
      </h3>
      <dl className='divide-border bg-muted/30 divide-y rounded-md border'>{children}</dl>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className='flex items-start justify-between gap-4 px-3 py-2 text-[12px]'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className={cn('text-right', mono && 'font-mono')}>{value}</dd>
    </div>
  );
}
