'use client';

import { useStore } from '@tanstack/react-form';
import type { useTranslations } from 'next-intl';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { SessionValue } from './schema';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface OutlineStepProps {
  tDialog: ReturnType<typeof useTranslations>;
  form: any;
  totalSessionsValue: number | '';
}

export function OutlineStep({ tDialog, form, totalSessionsValue }: OutlineStepProps) {
  const sessions = useStore(form.store, (s: any) => s.values.sessions as SessionValue[]);
  const expected = Math.max(0, Number(totalSessionsValue) || 0);

  // Wipe existing titles/descriptions and rebuild a blank outline of the right
  // length. Lengths are already kept in sync on basics → outline transition, so
  // a preserve-data variant here would be a no-op. Also clear any error state
  // left over from a previous failed submit so the freshly blank fields don't
  // surface stale "required" errors.
  const regenerate = () => {
    form.setFieldValue(
      'sessions',
      Array.from({ length: expected }, () => ({ title: '', description: '' }))
    );
    for (let i = 0; i < expected; i++) {
      for (const sub of ['title', 'description'] as const) {
        form.setFieldMeta(`sessions[${i}].${sub}`, (prev: any) => ({
          ...prev,
          isTouched: false,
          errors: [],
          errorMap: {}
        }));
      }
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='text-[14px] font-semibold tracking-tight'>{tDialog('outline.heading')}</h3>
          <p className='text-muted-foreground text-[12px]'>{tDialog('outline.description')}</p>
          <p className='text-muted-foreground mt-1 font-mono text-[11px]'>
            {tDialog('outline.totalCount', { count: sessions.length })}
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8'
            onClick={regenerate}
            disabled={expected === 0}
          >
            <Icons.refresh className='size-3.5' />
            {tDialog('outline.regenerate')}
          </Button>
        </div>
      </div>

      <form.AppField name='sessions' mode='array'>
        {(field: any) => {
          const values = (field.state.value ?? []) as SessionValue[];
          if (values.length === 0) {
            return (
              <div className='text-muted-foreground rounded-md border border-dashed py-8 text-center text-[12px]'>
                {tDialog('outline.empty')}
              </div>
            );
          }
          return (
            <ul className='space-y-2'>
              {values.map((value, i) => (
                <SessionCard
                  key={i}
                  index={i}
                  initiallyExpanded={!value.title && !value.description}
                  form={form}
                  tDialog={tDialog}
                />
              ))}
            </ul>
          );
        }}
      </form.AppField>
    </div>
  );
}

function SessionCard({
  index,
  initiallyExpanded,
  form,
  tDialog
}: {
  index: number;
  initiallyExpanded: boolean;
  form: any;
  tDialog: ReturnType<typeof useTranslations>;
}) {
  const [expanded, setExpanded] = React.useState(initiallyExpanded);
  const titlePath = `sessions[${index}].title`;
  const descriptionPath = `sessions[${index}].description`;

  const title = useStore(form.store, (s: any) => s.values.sessions?.[index]?.title as string);
  const description = useStore(
    form.store,
    (s: any) => s.values.sessions?.[index]?.description as string
  );
  const hasError = useStore(form.store, (s: any) => {
    const titleErrs = s.fieldMeta?.[titlePath]?.errors?.length ?? 0;
    const descErrs = s.fieldMeta?.[descriptionPath]?.errors?.length ?? 0;
    return titleErrs + descErrs > 0;
  });

  // Auto-expand when validation surfaces an error on a collapsed card.
  React.useEffect(() => {
    if (hasError && !expanded) setExpanded(true);
  }, [hasError, expanded]);

  return (
    <li
      className={cn(
        'bg-card overflow-hidden rounded-md border transition-colors',
        hasError && 'border-destructive ring-destructive/20 border-2 ring-2'
      )}
    >
      <div
        role='button'
        tabIndex={0}
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        className='hover:bg-muted/30 flex cursor-pointer items-center gap-2 px-3 py-2'
      >
        <Icons.chevronRight
          className={cn(
            'text-muted-foreground size-3.5 shrink-0 transition',
            expanded && 'rotate-90'
          )}
        />
        <span className='text-muted-foreground shrink-0 font-mono text-[11px]'>
          {tDialog('outline.sessionNumber', { n: index + 1 })}
        </span>
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-[13px]',
            !title && 'text-muted-foreground italic'
          )}
        >
          {title || tDialog('outline.sessionTitlePlaceholder')}
        </span>
        {description && !expanded && (
          <span className='text-muted-foreground/70 shrink-0 font-mono text-[10px]'>
            {description.length}c
          </span>
        )}
      </div>
      {expanded && (
        <div className='space-y-2 border-t p-3'>
          <form.AppField name={titlePath}>
            {(field: any) => (
              <field.FieldSet>
                <field.Field>
                  <Input
                    value={field.state.value ?? ''}
                    placeholder={tDialog('outline.sessionTitlePlaceholder')}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    className='h-8 text-[13px]'
                  />
                </field.Field>
                <field.FieldError />
              </field.FieldSet>
            )}
          </form.AppField>
          <form.AppField name={descriptionPath}>
            {(field: any) => (
              <field.FieldSet>
                <field.Field>
                  <Textarea
                    rows={3}
                    value={field.state.value ?? ''}
                    placeholder={tDialog('outline.sessionDescriptionPlaceholder')}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className='resize-none text-[12px]'
                  />
                </field.Field>
              </field.FieldSet>
            )}
          </form.AppField>
        </div>
      )}
    </li>
  );
}
