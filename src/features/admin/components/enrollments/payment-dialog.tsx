'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  PAYMENT_STATUSES,
  useUpdateEnrollmentPayment,
  type Enrollment,
  type PaymentStatus
} from '@/api/enrollments';
import { formatApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

type Props = {
  enrollment: Enrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaymentDialog({ enrollment, open, onOpenChange }: Props) {
  const t = useTranslations('enrollments.paymentDialog');
  const tValidation = useTranslations('enrollments.paymentDialog.validation');
  const tStatus = useTranslations('enrollments.detail.paymentStatusLabel');
  const tToast = useTranslations('enrollments.toast');

  const updatePayment = useUpdateEnrollmentPayment();
  const [status, setStatus] = React.useState<PaymentStatus>('unpaid');
  const [amount, setAmount] = React.useState<string>('');
  const [amountTouched, setAmountTouched] = React.useState(false);

  // Reseed local form state whenever the dialog opens against a different
  // enrollment so admin sees the current values, not the previous row's.
  React.useEffect(() => {
    if (!open || !enrollment) return;
    setStatus(enrollment.paymentStatus ?? 'unpaid');
    setAmount(enrollment.paymentAmount != null ? String(enrollment.paymentAmount) : '');
    setAmountTouched(false);
  }, [open, enrollment]);

  if (!enrollment) return null;

  const trimmed = amount.trim();
  const parsedAmount = trimmed.length === 0 ? undefined : Number(trimmed);
  const amountInvalid =
    parsedAmount !== undefined && (!Number.isFinite(parsedAmount) || parsedAmount < 0);
  const showAmountError = amountTouched && amountInvalid;

  const handleSave = async () => {
    setAmountTouched(true);
    if (amountInvalid) return;
    try {
      await updatePayment.mutateAsync({
        id: enrollment.id,
        input: { status, amount: parsedAmount }
      });
      toast.success(tToast('paymentSuccess', { name: enrollment.studentName }));
      onOpenChange(false);
    } catch (e) {
      const { title, description } = formatApiError(e, tToast('paymentError'));
      toast.error(title, description ? { description } : undefined);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (updatePayment.isPending) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[440px]'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description', { name: enrollment.studentName })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label className='text-[12px]'>{t('statusLabel')}</Label>
            <RadioGroup
              value={status}
              onValueChange={(v) => setStatus(v as PaymentStatus)}
              className='grid grid-cols-3 gap-2'
            >
              {PAYMENT_STATUSES.map((s) => {
                const checked = status === s;
                return (
                  <label
                    key={s}
                    htmlFor={`payment-status-${s}`}
                    className={cn(
                      'hover:border-foreground/40 flex cursor-pointer items-center gap-2 rounded-md border p-2 text-[12px]',
                      checked &&
                        'border-foreground/40 bg-foreground/[0.02] ring-foreground/10 ring-2'
                    )}
                  >
                    <RadioGroupItem value={s} id={`payment-status-${s}`} />
                    {tStatus(s)}
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='payment-amount' className='text-[12px]'>
              {t('amountLabel')}
            </Label>
            <Input
              id='payment-amount'
              type='number'
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => setAmountTouched(true)}
              placeholder={t('amountPlaceholder')}
              aria-invalid={showAmountError}
              className={cn(
                showAmountError && 'border-destructive focus-visible:ring-destructive/40'
              )}
            />
            {showAmountError ? (
              <p className='text-destructive text-[12px]'>{tValidation('amountInvalid')}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' size='sm' className='h-9' disabled={updatePayment.isPending}>
              {t('cancel')}
            </Button>
          </DialogClose>
          <Button
            size='sm'
            className='h-9'
            onClick={() => void handleSave()}
            disabled={updatePayment.isPending || amountInvalid}
          >
            {updatePayment.isPending ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
