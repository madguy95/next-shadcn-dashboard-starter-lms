'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  availableLifecycleActions,
  useClassLifecycleAction,
  type ClassLifecycleAction,
  type ClassRow
} from '@/api/classes';
import { formatApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface ClassLifecycleActionsProps {
  cls: ClassRow;
  className?: string;
}

/**
 * Renders only the lifecycle actions legal from the current class state.
 * Publish / Unpublish run inline; Cancel opens an AlertDialog because it
 * needs a non-empty reason (enforced by the BE — see
 * `class.lifecycle.reason.required`).
 */
export function ClassLifecycleActions({ cls, className }: ClassLifecycleActionsProps) {
  const t = useTranslations('classes.lifecycle');
  const mutation = useClassLifecycleAction();
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [reasonError, setReasonError] = React.useState(false);

  const actions = availableLifecycleActions(cls);
  if (actions.length === 0) return null;

  // Republish vs publish: same backend action, different copy. The button
  // label tracks whether the class was previously published.
  const isRepublish = cls.lifecycleStatus === 'unpublished';

  const runAction = async (action: ClassLifecycleAction, body?: { reason: string }) => {
    try {
      await mutation.mutateAsync({
        id: cls.id,
        input: body ? { action, ...body } : { action }
      });
      toast.success(
        action === 'publish'
          ? t('publishSuccess')
          : action === 'unpublish'
            ? t('unpublishSuccess')
            : t('cancelSuccess')
      );
      if (action === 'cancel') {
        setCancelOpen(false);
        setReason('');
        setReasonError(false);
      }
    } catch (err) {
      // BE surfaces transition + edit-policy errors as 409 with a code in
      // `message` (e.g. class.lifecycle.cannot.unpublish.ongoing). Pass it
      // through formatApiError so any field-level errors still render.
      const { title } = formatApiError(err, t('actionError'));
      toast.error(title);
    }
  };

  const handleCancelSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError(true);
      return;
    }
    setReasonError(false);
    void runAction('cancel', { reason: trimmed });
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {actions.includes('publish') && (
        <Button
          size='sm'
          variant='outline'
          className='h-7 px-2 text-[12px]'
          isLoading={mutation.isPending && mutation.variables?.input.action === 'publish'}
          onClick={() => void runAction('publish')}
        >
          <Icons.check className='size-3.5' />
          {isRepublish ? t('republish') : t('publish')}
        </Button>
      )}
      {actions.includes('unpublish') && (
        <Button
          size='sm'
          variant='outline'
          className='h-7 px-2 text-[12px]'
          isLoading={mutation.isPending && mutation.variables?.input.action === 'unpublish'}
          onClick={() => void runAction('unpublish')}
        >
          <Icons.eyeOff className='size-3.5' />
          {t('unpublish')}
        </Button>
      )}
      {actions.includes('cancel') && (
        <Button
          size='sm'
          variant='outline'
          className='text-destructive hover:text-destructive h-7 px-2 text-[12px]'
          onClick={() => setCancelOpen(true)}
        >
          <Icons.circleX className='size-3.5' />
          {t('cancel')}
        </Button>
      )}

      <AlertDialog
        open={cancelOpen}
        onOpenChange={(next) => {
          // Block close while the mutation is in flight so the user can't
          // dismiss a half-sent request.
          if (mutation.isPending) return;
          setCancelOpen(next);
          if (!next) {
            setReason('');
            setReasonError(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cancelConfirmTitle', { name: cls.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t('cancelConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-1.5'>
            <label htmlFor='cancel-reason' className='text-muted-foreground text-[12px]'>
              {t('cancelReasonLabel')} *
            </label>
            <Textarea
              id='cancel-reason'
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError && e.target.value.trim()) setReasonError(false);
              }}
              rows={3}
              aria-invalid={reasonError || undefined}
              placeholder={t('cancelReasonPlaceholder')}
              disabled={mutation.isPending}
            />
            {reasonError && (
              <p className='text-destructive text-[12px]'>{t('cancelReasonRequired')}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              {t('cancelDismiss')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Prevent the default Radix auto-close — we close manually after
                // the mutation resolves so a network error can keep the dialog
                // open with the user's typed reason intact.
                e.preventDefault();
                handleCancelSubmit();
              }}
              disabled={mutation.isPending}
              className='bg-destructive hover:bg-destructive/90 text-white'
            >
              {mutation.isPending ? t('cancelInProgress') : t('cancelConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
