'use client';

import type { useTranslations } from 'next-intl';
import type * as React from 'react';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import type { Teacher } from '@/api/teachers';
import { cn } from '@/lib/utils';
import { DAYS_OF_WEEK, type DayOfWeek, type DaySchedule } from './schema';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ScheduleFieldProps {
  form: any;
  tDialog: ReturnType<typeof useTranslations>;
  sortedSchedules: DaySchedule[];
  conflict: boolean;
  conflictTeacher: Teacher | undefined;
  disabled?: boolean;
}

/**
 * Day chips on top to toggle inclusion; below them, an inline editable row per
 * selected day (sorted Sun→Sat) with start/end inputs and a remove button.
 * Inline `toggleDay` / `setTime` helpers close over the current array so they
 * can produce a new immutable value before handing it back to the form.
 */
export function ScheduleField({
  form,
  tDialog,
  sortedSchedules,
  conflict,
  conflictTeacher,
  disabled = false
}: ScheduleFieldProps) {
  return (
    <form.AppField name='daySchedules'>
      {(field: any) => {
        // Disabled wrap — keeps the entire field non-interactive (day chips,
        // time inputs, remove buttons) when the policy locks daySchedules.
        const wrap = (node: React.ReactNode) =>
          disabled ? (
            <fieldset disabled className='contents disabled:opacity-60'>
              {node}
            </fieldset>
          ) : (
            node
          );
        const current: DaySchedule[] = field.state.value ?? [];
        const toggleDay = (day: DayOfWeek) => {
          if (current.some((s) => s.day === day)) {
            field.handleChange(current.filter((s) => s.day !== day));
            return;
          }
          // Seed the new row from the last existing one so adding multiple
          // days doesn't require retyping the same time.
          const last = sortedSchedules[sortedSchedules.length - 1];
          field.handleChange([
            ...current,
            { day, startTime: last?.startTime ?? '09:00', endTime: last?.endTime ?? '10:00' }
          ]);
        };
        const setTime = (day: DayOfWeek, key: 'startTime' | 'endTime', value: string) => {
          field.handleChange(current.map((s) => (s.day === day ? { ...s, [key]: value } : s)));
        };

        return (
          <field.FieldSet>
            <field.Field>
              <div className='mb-2 flex items-center justify-between'>
                <field.FieldLabel className='text-muted-foreground text-[12px]'>
                  {tDialog('fields.schedule')}
                </field.FieldLabel>
                <div className='text-muted-foreground font-mono text-[11px]'>
                  {tDialog('fields.scheduleSummary', { count: current.length })}
                </div>
              </div>

              {wrap(
                <div className='mb-3 flex flex-wrap items-center gap-1'>
                  {DAYS_OF_WEEK.map((d) => {
                    const active = current.some((s) => s.day === d);
                    return (
                      <button
                        key={d}
                        type='button'
                        onClick={() => toggleDay(d)}
                        disabled={disabled}
                        className={cn(
                          'h-9 rounded-md border px-3 text-[12.5px] transition',
                          active
                            ? 'bg-foreground text-background border-foreground'
                            : 'hover:bg-accent',
                          disabled && 'cursor-not-allowed opacity-70'
                        )}
                      >
                        {tDialog(`days.${d}`)}
                      </button>
                    );
                  })}
                </div>
              )}

              {sortedSchedules.length === 0 ? (
                <div className='text-muted-foreground rounded-md border border-dashed py-4 text-center text-[12px]'>
                  {tDialog('fields.scheduleEmpty')}
                </div>
              ) : (
                wrap(
                  <ul className='divide-y rounded-md border'>
                    {sortedSchedules.map((s) => (
                      <ScheduleRow
                        key={s.day}
                        schedule={s}
                        tDialog={tDialog}
                        onTimeChange={setTime}
                        onRemove={() => toggleDay(s.day)}
                        disabled={disabled}
                      />
                    ))}
                  </ul>
                )
              )}

              {conflict && conflictTeacher && (
                <div className='mt-3 flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50/60 p-3 text-[12.5px] text-amber-900'>
                  <Icons.warning className='mt-0.5 size-3.5 shrink-0' />
                  <div>
                    <div className='font-medium'>
                      {tDialog('conflict.title', {
                        teacher: conflictTeacher.name,
                        className: 'Scratch · A1'
                      })}
                    </div>
                    <div className='opacity-80'>{tDialog('conflict.body')}</div>
                  </div>
                </div>
              )}
            </field.Field>
            <field.FieldError />
          </field.FieldSet>
        );
      }}
    </form.AppField>
  );
}

function ScheduleRow({
  schedule,
  tDialog,
  onTimeChange,
  onRemove,
  disabled = false
}: {
  schedule: DaySchedule;
  tDialog: ReturnType<typeof useTranslations>;
  onTimeChange: (day: DayOfWeek, key: 'startTime' | 'endTime', value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <li className='flex flex-wrap items-center gap-3 px-3 py-2'>
      <span className='bg-muted inline-flex h-7 min-w-12 items-center justify-center rounded-full px-2 font-mono text-[11px] font-medium'>
        {tDialog(`days.${schedule.day}`)}
      </span>
      <span className='text-muted-foreground text-[11px]'>{tDialog('fields.startTime')}</span>
      <Input
        value={schedule.startTime}
        onChange={(e) => onTimeChange(schedule.day, 'startTime', e.target.value)}
        disabled={disabled}
        aria-label={`${tDialog('fields.startTime')} · ${schedule.day}`}
        className='h-8 w-20 px-2 text-center font-mono text-sm'
      />
      <span className='text-muted-foreground'>—</span>
      <span className='text-muted-foreground text-[11px]'>{tDialog('fields.endTime')}</span>
      <Input
        value={schedule.endTime}
        onChange={(e) => onTimeChange(schedule.day, 'endTime', e.target.value)}
        disabled={disabled}
        aria-label={`${tDialog('fields.endTime')} · ${schedule.day}`}
        className='h-8 w-20 px-2 text-center font-mono text-sm'
      />
      <button
        type='button'
        onClick={onRemove}
        disabled={disabled}
        className='text-muted-foreground hover:text-destructive ml-auto disabled:cursor-not-allowed disabled:opacity-60'
        aria-label={`${tDialog('fields.schedule')} · ${schedule.day}`}
      >
        <Icons.trash className='size-3.5' />
      </button>
    </li>
  );
}
