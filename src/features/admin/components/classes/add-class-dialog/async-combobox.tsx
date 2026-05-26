'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AsyncComboboxProps<T> {
  value: string;
  onChange: (id: string) => void;
  search: string;
  onSearchChange: (q: string) => void;
  items: T[];
  loading: boolean;
  selected: T | undefined;
  invalid: boolean;
  getKey: (item: T) => string;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  renderSelected: (item: T) => React.ReactNode;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
}

/**
 * Generic combobox driven by an upstream server-search query. Filtering is the
 * caller's responsibility (via the `items` prop) — `cmdk`'s built-in client
 * filter is disabled so the visible list always matches what the query returned.
 */
export function AsyncCombobox<T>({
  value,
  onChange,
  search,
  onSearchChange,
  items,
  loading,
  selected,
  invalid,
  getKey,
  placeholder,
  searchPlaceholder,
  emptyText,
  renderSelected,
  renderItem
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const listboxId = React.useId();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-controls={listboxId}
          aria-invalid={invalid}
          className='h-10 w-full justify-between font-normal'
        >
          {selected ? (
            renderSelected(selected)
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
          <Icons.chevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={onSearchChange}
          />
          <CommandList id={listboxId}>
            {loading ? (
              <div className='text-muted-foreground flex items-center gap-2 p-3 text-[12px]'>
                <Icons.spinner className='size-3.5 animate-spin' />
                {searchPlaceholder}
              </div>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            <CommandGroup>
              {items.map((item) => {
                const key = getKey(item);
                const isSelected = value === key;
                return (
                  <CommandItem
                    key={key}
                    value={key}
                    onSelect={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <Icons.check
                      className={cn('mr-2 size-3.5', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                    {renderItem(item, isSelected)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
