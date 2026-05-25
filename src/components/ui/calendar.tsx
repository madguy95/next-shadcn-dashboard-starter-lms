'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout,
  ...props
}: ComponentProps<typeof DayPicker>) {
  const isDropdown = captionLayout !== undefined && captionLayout !== 'label';
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: cn(
          'text-sm font-medium',
          isDropdown &&
            'inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 hover:bg-accent [&>svg]:size-3.5 [&>svg]:opacity-60'
        ),
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        dropdowns: 'flex items-center gap-1.5 text-sm font-medium',
        dropdown_root: 'relative inline-flex items-center',
        dropdown: 'absolute inset-0 cursor-pointer opacity-0',
        month_grid: 'w-full border-collapse space-x-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 p-0 font-normal aria-selected:opacity-100'
        ),
        range_start:
          'day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground rounded-l-md',
        range_end:
          'day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground rounded-r-md',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
        today: 'bg-accent text-accent-foreground rounded-md',
        outside: 'text-muted-foreground aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeftIcon className='size-4' />;
          if (orientation === 'right') return <ChevronRightIcon className='size-4' />;
          return <ChevronDownIcon className='size-3.5' />;
        },
        CaptionLabel: ({ children, ...labelProps }) => (
          <span {...labelProps}>
            {children}
            {isDropdown ? <ChevronDownIcon /> : null}
          </span>
        )
      }}
      {...props}
    />
  );
}

export { Calendar };
