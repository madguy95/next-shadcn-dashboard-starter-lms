'use client';

import { format } from 'date-fns';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DateFieldProps {
  form: any;
  name: 'startDate' | 'endDate';
  label: string;
  placeholder: string;
  disabled?: boolean;
  description?: string;
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
  description
}: DateFieldProps) {
  return (
    <form.AppField name={name}>
      {(field: any) => {
        const selected = field.state.value ? new Date(field.state.value) : undefined;
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
                        field.handleChange(date ? date.toISOString() : '');
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
