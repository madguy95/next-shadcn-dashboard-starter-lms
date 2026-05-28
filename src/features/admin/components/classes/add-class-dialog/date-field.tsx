'use client';

import { format } from 'date-fns';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

// `YYYY-MM-DD` (local) — keeps the calendar's intent unambiguous across
// timezones. The BE expects LocalDate so this is what the wire wants anyway.
export function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse a stored value into a Date in the user's local TZ.
 * Accepts both bare `YYYY-MM-DD` (preferred, what `toYmd` emits) and full ISO
 * strings (what older saved values may contain).
 */
export function parseYmdLocal(value: string): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

interface DateFieldProps {
  form: any;
  name: 'startDate' | 'endDate';
  label: string;
  placeholder: string;
  disabled?: boolean;
  description?: string;
  /**
   * Forwarded to the underlying AppField. Use this for per-field validators
   * (e.g. "must be after today" on create) — schema-level refines only run
   * on submit, so we attach an onBlur validator here for immediate feedback.
   */
  validators?: any;
}

/**
 * Date popover backed by a TanStack form field. When `disabled` is set, the
 * Popover wrapper is omitted entirely so the calendar can't open — the trigger
 * still renders to show the auto-computed value.
 */
export function DateField({
  form,
  name,
  label,
  placeholder,
  disabled = false,
  description,
  validators
}: DateFieldProps) {
  return (
    <form.AppField name={name} validators={validators}>
      {(field: any) => {
        const selected = parseYmdLocal(field.state.value) ?? undefined;
        const trigger = (
          <Button
            variant='outline'
            disabled={disabled}
            className={cn(
              'h-9 w-full justify-between font-mono text-[13px] font-normal',
              !selected && 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-70'
            )}
            aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
          >
            {selected ? format(selected, 'PPP') : placeholder}
            <Icons.calendar className='text-muted-foreground size-3.5' />
          </Button>
        );
        return (
          <field.FieldSet>
            <field.Field>
              <field.FieldLabel className='text-muted-foreground text-[12px]'>
                {label}
              </field.FieldLabel>
              {disabled ? (
                trigger
              ) : (
                <Popover>
                  <PopoverTrigger asChild>{trigger}</PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={selected}
                      defaultMonth={selected ?? new Date()}
                      onSelect={(date) => {
                        field.handleChange(date ? toYmd(date) : '');
                        field.handleBlur();
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
              {description && <p className='text-muted-foreground text-[11px]'>{description}</p>}
            </field.Field>
            <field.FieldError />
          </field.FieldSet>
        );
      }}
    </form.AppField>
  );
}
