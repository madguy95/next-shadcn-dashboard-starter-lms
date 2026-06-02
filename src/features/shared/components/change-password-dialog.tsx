'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangePassword } from '@/api/user';
import { formatApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const t = useTranslations('changePassword');
  const mutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const confirmError =
    confirmPassword.length > 0 && confirmPassword !== newPassword ? t('confirmMismatch') : null;

  const canSubmit =
    currentPassword.length >= 1 &&
    newPassword.length >= 4 &&
    confirmPassword === newPassword &&
    !mutation.isPending;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    mutation.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          toast.success(t('successTitle'), { description: t('successDesc') });
          handleClose();
        },
        onError: (err) => {
          const { title, description } = formatApiError(err, t('errorFallback'));
          toast.error(title, { description });
        }
      }
    );
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[420px]'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='current-password' className='text-sm font-medium'>
              {t('currentLabel')}
            </Label>
            <div className='relative'>
              <Icons.lock className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='current-password'
                type={showCurrent ? 'text' : 'password'}
                autoComplete='current-password'
                placeholder={t('currentPlaceholder')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='pr-10 pl-10'
                required
              />
              <button
                type='button'
                onClick={() => setShowCurrent((v) => !v)}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showCurrent ? t('hidePassword') : t('showPassword')}
              >
                {showCurrent ? (
                  <Icons.eyeOff className='size-4' />
                ) : (
                  <Icons.eye className='size-4' />
                )}
              </button>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='new-password' className='text-sm font-medium'>
              {t('newLabel')}
            </Label>
            <div className='relative'>
              <Icons.lock className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='new-password'
                type={showNew ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder={t('newPlaceholder')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='pr-10 pl-10'
                required
              />
              <button
                type='button'
                onClick={() => setShowNew((v) => !v)}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showNew ? t('hidePassword') : t('showPassword')}
              >
                {showNew ? <Icons.eyeOff className='size-4' /> : <Icons.eye className='size-4' />}
              </button>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='confirm-password' className='text-sm font-medium'>
              {t('confirmLabel')}
            </Label>
            <div className='relative'>
              <Icons.lock className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='confirm-password'
                type={showNew ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder={t('confirmPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  'pl-10',
                  confirmError && 'border-destructive focus-visible:ring-destructive/30'
                )}
                aria-invalid={!!confirmError}
                required
              />
            </div>
            {confirmError && <p className='text-xs text-destructive'>{confirmError}</p>}
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button type='submit' disabled={!canSubmit}>
              {mutation.isPending ? (
                <>
                  <Icons.spinner className='mr-2 size-4 animate-spin' />
                  {t('submitting')}
                </>
              ) : (
                t('submit')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
