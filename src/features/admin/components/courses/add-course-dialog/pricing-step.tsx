'use client';

import { useStore } from '@tanstack/react-form';
import { format } from 'date-fns';
import type { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DISCOUNT_CONDITIONS,
  DISCOUNT_TYPES,
  type DiscountCondition,
  type DiscountType
} from '@/api/courses';
import { cn } from '@/lib/utils';
import { formatVnd } from '@/lib/format-vnd';
import { blankDiscount, type BaseSchema, type DiscountValue } from './schema';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PricingStepProps {
  tDialog: ReturnType<typeof useTranslations>;
  form: any;
  baseSchema: BaseSchema;
}

export function PricingStep({ tDialog, form, baseSchema }: PricingStepProps) {
  const tuitionAmount = useStore(form.store, (s: any) => s.values.tuitionAmount as number | '');
  const discounts = useStore(form.store, (s: any) => s.values.discounts as DiscountValue[]);

  const base = Number(tuitionAmount) || 0;
  const numericTotal = discounts.reduce((acc, d) => {
    if (d.type === 'percentage') {
      const p = Number(d.value);
      return Number.isFinite(p) ? Math.max(0, Math.round(acc * (1 - p / 100))) : acc;
    }
    if (d.type === 'fixed') {
      const n = Number(d.value);
      return Number.isFinite(n) ? Math.max(0, acc - n) : acc;
    }
    return acc;
  }, base);

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-[14px] font-semibold tracking-tight'>{tDialog('pricing.heading')}</h3>
        <p className='text-muted-foreground text-[12px]'>{tDialog('pricing.description')}</p>
      </div>

      <form.AppField name='tuitionAmount'>
        {(field: any) => (
          <field.FieldSet>
            <field.Field>
              <field.FieldLabel>
                {tDialog('pricing.tuition')}
                {' *'}
              </field.FieldLabel>
              <div
                className={cn(
                  'flex h-9 w-full max-w-72 items-center rounded-md border',
                  field.state.meta.isTouched &&
                    !field.state.meta.isValid &&
                    'border-destructive ring-destructive/20 ring-2'
                )}
              >
                <input
                  aria-label={field.name}
                  type='number'
                  inputMode='numeric'
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  onBlur={field.handleBlur}
                  className='min-w-0 flex-1 border-0 bg-transparent px-3 font-mono text-sm outline-none'
                />
                <span className='text-muted-foreground shrink-0 border-l px-3 text-[12px]'>
                  VND
                </span>
              </div>
              <field.FieldDescription>{tDialog('pricing.tuitionHelp')}</field.FieldDescription>
            </field.Field>
            <field.FieldError />
          </field.FieldSet>
        )}
      </form.AppField>

      <DiscountRulesField tDialog={tDialog} form={form} />

      <form.AppField name='pricingNotes' validators={{ onBlur: baseSchema.shape.pricingNotes }}>
        {(field: any) => (
          <field.FieldSet>
            <field.Field>
              <field.FieldLabel>{tDialog('pricing.notes')}</field.FieldLabel>
              <Textarea
                rows={3}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={tDialog('pricing.notesPlaceholder')}
                className='resize-none text-[13px]'
              />
            </field.Field>
            <field.FieldError />
          </field.FieldSet>
        )}
      </form.AppField>

      <PricingSummary tDialog={tDialog} base={base} final={numericTotal} discounts={discounts} />
    </div>
  );
}

function DiscountRulesField({
  tDialog,
  form
}: {
  tDialog: ReturnType<typeof useTranslations>;
  form: any;
}) {
  return (
    <form.AppField name='discounts' mode='array'>
      {(field: any) => {
        const values = (field.state.value ?? []) as DiscountValue[];
        return (
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='min-w-0'>
                <div className='text-[13px] font-semibold tracking-tight'>
                  {tDialog('pricing.discounts.heading')}
                </div>
                <div className='text-muted-foreground text-[12px]'>
                  {tDialog('pricing.discounts.description')}
                </div>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 shrink-0'
                onClick={() => field.pushValue(blankDiscount())}
              >
                <Icons.add className='size-3.5' />
                {tDialog('pricing.discounts.add')}
              </Button>
            </div>

            {values.length === 0 ? (
              <div className='text-muted-foreground rounded-md border border-dashed py-6 text-center text-[12px]'>
                {tDialog('pricing.discounts.empty')}
              </div>
            ) : (
              <ul className='space-y-3'>
                {values.map((discount, i) => (
                  <DiscountCard
                    key={i}
                    index={i}
                    type={discount.type}
                    condition={discount.condition}
                    form={form}
                    tDialog={tDialog}
                    onRemove={() => field.removeValue(i)}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      }}
    </form.AppField>
  );
}

function DiscountCard({
  index,
  type,
  condition,
  form,
  tDialog,
  onRemove
}: {
  index: number;
  type: DiscountType;
  condition: DiscountCondition;
  form: any;
  tDialog: ReturnType<typeof useTranslations>;
  onRemove: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const namePath = `discounts[${index}].name`;
  const typePath = `discounts[${index}].type`;
  const valuePath = `discounts[${index}].value`;
  const conditionPath = `discounts[${index}].condition`;
  const datePath = `discounts[${index}].conditionDate`;

  const hasError = useStore(form.store, (s: any) => {
    const meta = s.fieldMeta ?? {};
    return [namePath, typePath, valuePath, conditionPath, datePath].some(
      (p) => (meta[p]?.errors?.length ?? 0) > 0
    );
  });

  return (
    <li
      className={cn(
        'bg-card space-y-3 rounded-md border p-3 transition-colors',
        hasError && 'border-destructive ring-destructive/20 border-2 ring-2'
      )}
    >
      <div className='flex items-center justify-between'>
        <span className='text-muted-foreground font-mono text-[11px]'>
          {tDialog('pricing.discounts.cardTitle', { n: index + 1 })}
        </span>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7'
          aria-label={tDialog('pricing.discounts.remove')}
          onClick={onRemove}
        >
          <Icons.close className='size-3.5' />
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <form.AppField name={namePath}>
          {(field: any) => (
            <field.FieldSet>
              <field.Field>
                <field.FieldLabel className='text-muted-foreground text-[12px]'>
                  {tDialog('pricing.discounts.name')}
                </field.FieldLabel>
                <Input
                  value={field.state.value ?? ''}
                  placeholder={tDialog('pricing.discounts.namePlaceholder')}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  className='h-9 text-[13px]'
                />
              </field.Field>
              <field.FieldError />
            </field.FieldSet>
          )}
        </form.AppField>

        <form.AppField name={typePath}>
          {(field: any) => (
            <field.FieldSet>
              <field.Field>
                <field.FieldLabel className='text-muted-foreground text-[12px]'>
                  {tDialog('pricing.discounts.type')}
                </field.FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(v: string) => {
                    field.handleChange(v as DiscountType);
                    form.setFieldValue(valuePath, '');
                  }}
                >
                  <SelectTrigger className='h-9 w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((tp) => (
                      <SelectItem key={tp} value={tp}>
                        {tDialog(
                          `pricing.discounts.types.${tp}` as 'pricing.discounts.types.percentage'
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </field.Field>
            </field.FieldSet>
          )}
        </form.AppField>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <form.AppField name={valuePath}>
          {(field: any) => (
            <field.FieldSet>
              <field.Field>
                <field.FieldLabel className='text-muted-foreground text-[12px]'>
                  {tDialog('pricing.discounts.value')}
                </field.FieldLabel>
                {type === 'special' ? (
                  <Input
                    value={field.state.value ?? ''}
                    placeholder={tDialog('pricing.discounts.valuePlaceholder.special')}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    className='h-9 text-[13px]'
                  />
                ) : (
                  <div
                    className={cn(
                      'flex h-9 w-full items-center rounded-md border',
                      field.state.meta.isTouched &&
                        !field.state.meta.isValid &&
                        'border-destructive ring-destructive/20 ring-2'
                    )}
                  >
                    <input
                      aria-label={tDialog('pricing.discounts.value')}
                      type='number'
                      inputMode='numeric'
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className='min-w-0 flex-1 border-0 bg-transparent px-3 font-mono text-sm outline-none'
                    />
                    <span className='text-muted-foreground shrink-0 border-l px-3 text-[12px]'>
                      {tDialog(
                        `pricing.discounts.valueSuffix.${type}` as
                          | 'pricing.discounts.valueSuffix.percentage'
                          | 'pricing.discounts.valueSuffix.fixed'
                      )}
                    </span>
                  </div>
                )}
              </field.Field>
              <field.FieldError />
            </field.FieldSet>
          )}
        </form.AppField>

        <form.AppField name={conditionPath}>
          {(field: any) => (
            <field.FieldSet>
              <field.Field>
                <field.FieldLabel className='text-muted-foreground text-[12px]'>
                  {tDialog('pricing.discounts.condition')}
                </field.FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(v: string) => {
                    field.handleChange(v as DiscountCondition);
                    if (v !== 'before_date') form.setFieldValue(datePath, '');
                  }}
                >
                  <SelectTrigger className='h-9 w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {tDialog(
                          `pricing.discounts.conditions.${c}` as 'pricing.discounts.conditions.none'
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </field.Field>
            </field.FieldSet>
          )}
        </form.AppField>
      </div>

      {condition === 'before_date' && (
        <form.AppField name={datePath}>
          {(field: any) => {
            const selectedDate = field.state.value ? new Date(field.state.value) : undefined;
            return (
              <field.FieldSet>
                <field.Field>
                  <field.FieldLabel className='text-muted-foreground text-[12px]'>
                    {tDialog('pricing.discounts.beforeDateLabel')}
                  </field.FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'h-9 w-full justify-start text-left font-normal sm:max-w-72',
                          !selectedDate && 'text-muted-foreground'
                        )}
                        aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                      >
                        <Icons.calendar className='mr-2 size-4' />
                        {selectedDate
                          ? format(selectedDate, 'PPP')
                          : tDialog('pricing.discounts.datePlaceholder')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={selectedDate}
                        onSelect={(date) => {
                          field.handleChange(date ? date.toISOString() : '');
                          field.handleBlur();
                        }}
                        disabled={(date) => date < today}
                      />
                    </PopoverContent>
                  </Popover>
                </field.Field>
                <field.FieldError />
              </field.FieldSet>
            );
          }}
        </form.AppField>
      )}
    </li>
  );
}

function PricingSummary({
  tDialog,
  base,
  final,
  discounts
}: {
  tDialog: ReturnType<typeof useTranslations>;
  base: number;
  final: number;
  discounts: DiscountValue[];
}) {
  const numericDiscounts = discounts.filter(
    (d) => d.type !== 'special' && d.value !== '' && Number.isFinite(Number(d.value))
  );
  const specialDiscounts = discounts.filter((d) => d.type === 'special' && d.value.trim());

  return (
    <div className='rounded-md border p-3 text-[12px]'>
      <div className='text-muted-foreground mb-2 text-[11px] font-medium tracking-wider uppercase'>
        {tDialog('pricing.summary')}
      </div>
      <dl className='space-y-1'>
        <div className='flex items-center justify-between'>
          <dt className='text-muted-foreground'>{tDialog('pricing.summaryBase')}</dt>
          <dd className='font-mono'>{formatVnd(base)}₫</dd>
        </div>
        {(() => {
          let running = base;
          return numericDiscounts.map((d, i) => {
            const value = Number(d.value);
            const saved =
              d.type === 'percentage'
                ? Math.round(running * (value / 100))
                : Math.min(running, value);
            running = Math.max(0, running - saved);
            const ruleHint = d.type === 'percentage' ? `−${value}%` : `−${formatVnd(value)}₫`;
            const name = d.name || tDialog('pricing.discounts.cardTitle', { n: i + 1 });
            return (
              <div key={i} className='flex items-center justify-between gap-3'>
                <dt className='text-muted-foreground min-w-0 truncate'>
                  {name}
                  <span className='text-muted-foreground/70 ml-1 font-mono text-[11px]'>
                    {ruleHint}
                  </span>
                </dt>
                <dd className='font-mono text-emerald-600'>−{formatVnd(saved)}₫</dd>
              </div>
            );
          });
        })()}
        <div className='mt-1.5 flex items-center justify-between border-t pt-1.5'>
          <dt className='font-medium'>{tDialog('pricing.summaryFinal')}</dt>
          <dd className='font-mono font-semibold'>{formatVnd(final)}₫</dd>
        </div>
        {specialDiscounts.length > 0 && (
          <div className='mt-2 border-t pt-2'>
            <div className='text-muted-foreground mb-1 text-[11px] font-medium'>
              {tDialog('pricing.summarySpecialPerks')}
            </div>
            <ul className='space-y-0.5'>
              {specialDiscounts.map((d, i) => (
                <li key={i} className='flex items-center gap-2'>
                  <Icons.check className='size-3 text-emerald-600' />
                  <span>
                    <span className='font-medium'>{d.name || `#${i + 1}`}: </span>
                    <span className='text-muted-foreground'>{d.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </dl>
    </div>
  );
}
