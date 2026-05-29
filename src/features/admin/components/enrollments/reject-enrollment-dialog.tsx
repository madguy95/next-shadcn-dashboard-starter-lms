'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRejectEnrollment, type Enrollment } from '@/api/enrollments';
import { formatApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

type Props = {
  enrollment: Enrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RejectEnrollmentDialog({ enrollment, open, onOpenChange }: Props) {
  const t = useTranslations('enrollments.rejectDialog');
  const tToast = useTranslations('enrollments.toast');
  const [reason, setReason] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const reject = useRejectEnrollment();

  React.useEffect(() => {
    if (!open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);

  if (!enrollment) return null;

  const trimmed = reason.trim();
  const showError = touched && trimmed.length === 0;

  const handleConfirm = async () => {
    setTouched(true);
    if (!trimmed) return;
    try {
      await reject.mutateAsync({ id: enrollment.id, input: { reason } });
      toast.success(tToast('rejectSuccess', { name: enrollment.studentName }));
      onOpenChange(false);
    } catch (e) {
      const { title, description } = formatApiError(e, tToast('rejectError'));
      toast.error(title, description ? { description } : undefined);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('description', { name: enrollment.studentName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='reject-reason' className='text-[12px]'>
            {t('reasonLabel')}
          </Label>
          <Textarea
            id='reject-reason'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={t('reasonPlaceholder')}
            rows={4}
            maxLength={500}
            aria-invalid={showError}
            className={cn(showError && 'border-destructive focus-visible:ring-destructive/40')}
          />
          {showError ? <p className='text-destructive text-[12px]'>{t('reasonRequired')}</p> : null}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={reject.isPending}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={reject.isPending}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            className='bg-destructive text-white hover:bg-destructive/90'
          >
            {reject.isPending ? t('confirmPending') : t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
