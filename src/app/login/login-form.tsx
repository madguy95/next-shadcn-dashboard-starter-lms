'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roleMeta } from '@/config/nav-config';
// Client-side login (browser → BE directly). Server Action version stayed for logout where
// server-side cookie deletion is convenient; see lib/auth-actions.ts.
import { login } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

export function LoginForm({ initialMode = 'login' }: { initialMode?: Mode }) {
  const router = useRouter();
  const t = useTranslations('auth.form');
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const phoneError = phone.length > 0 && !/^0\d{9}$/.test(phone) ? t('phoneErrorFormat') : null;
  const confirmError =
    isRegister && confirmPassword.length > 0 && confirmPassword !== password
      ? t('confirmErrorMatch')
      : null;

  const canSubmit = isRegister
    ? name.trim().length >= 2 &&
      phone.length > 0 &&
      password.length >= 4 &&
      confirmPassword === password &&
      agree &&
      !phoneError
    : phone.length > 0 && password.length >= 4 && !phoneError;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    if (isRegister) {
      // Self-registration not wired to backend yet.
      toast.info(t('registerNotAvailable'));
      setSubmitting(false);
      return;
    }

    const result = await login(phone, password);
    if (!result.ok) {
      toast.error(t('loginFailed'), { description: result.message });
      setSubmitting(false);
      return;
    }

    toast.success(t('loginSuccess'), {
      description: t('enteringWorkspace', { label: roleMeta[result.user.role].label })
    });
    router.push(roleMeta[result.user.role].basePath);
    router.refresh();
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          {isRegister ? t('titleRegister') : t('titleLogin')}
        </h1>
        <p className='mt-1.5 text-sm text-zinc-500'>
          {isRegister ? t('descRegister') : t('descLogin')}
        </p>
      </div>

      <div className='bg-zinc-100 mb-6 inline-flex w-full rounded-md p-0.5 text-zinc-500'>
        <button
          type='button'
          onClick={() => switchMode('login')}
          className={cn(
            'h-8 flex-1 rounded text-sm font-medium transition-all',
            mode === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'hover:text-zinc-900'
          )}
        >
          {t('tabLogin')}
        </button>
        <button
          type='button'
          onClick={() => switchMode('register')}
          className={cn(
            'h-8 flex-1 rounded text-sm font-medium transition-all',
            mode === 'register' ? 'bg-white text-zinc-900 shadow-sm' : 'hover:text-zinc-900'
          )}
        >
          {t('tabRegister')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {isRegister && (
          <div className='space-y-1.5'>
            <Label htmlFor='name' className='text-xs font-medium text-zinc-700'>
              {t('nameLabel')}
            </Label>
            <div className='relative'>
              <Icons.user className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400' />
              <Input
                id='name'
                type='text'
                autoComplete='name'
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='h-11 border-zinc-200 pl-10 text-base'
                required
              />
            </div>
          </div>
        )}

        <div className='space-y-1.5'>
          <Label htmlFor='phone' className='text-xs font-medium text-zinc-700'>
            {t('phoneLabel')}
          </Label>
          <div className='relative'>
            <Icons.phone className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400' />
            <Input
              id='phone'
              type='tel'
              inputMode='numeric'
              autoComplete='tel'
              placeholder={t('phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replaceAll(/\D/g, '').slice(0, 10))}
              className={cn(
                'h-11 border-zinc-200 pl-10 text-base',
                phoneError && 'border-rose-400 focus-visible:ring-rose-300/40'
              )}
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? 'phone-error' : undefined}
              required
            />
          </div>
          {phoneError && (
            <p id='phone-error' className='text-xs text-rose-600'>
              {phoneError}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <div className='flex items-baseline justify-between'>
            <Label htmlFor='password' className='text-xs font-medium text-zinc-700'>
              {t('passwordLabel')}
            </Label>
            {!isRegister && (
              <button
                type='button'
                className='text-xs text-cyan-600 underline-offset-2 hover:underline'
                onClick={() => toast(t('forgotPasswordToast'))}
              >
                {t('forgotPassword')}
              </button>
            )}
          </div>
          <div className='relative'>
            <Icons.lock className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400' />
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='h-11 border-zinc-200 pr-10 pl-10 text-base'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-700'
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            >
              {showPassword ? (
                <Icons.eyeOff className='size-4' />
              ) : (
                <Icons.eye className='size-4' />
              )}
            </button>
          </div>
        </div>

        {isRegister && (
          <div className='space-y-1.5'>
            <Label htmlFor='confirm' className='text-xs font-medium text-zinc-700'>
              {t('confirmLabel')}
            </Label>
            <div className='relative'>
              <Icons.lock className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400' />
              <Input
                id='confirm'
                type={showPassword ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder={t('confirmPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  'h-11 border-zinc-200 pl-10 text-base',
                  confirmError && 'border-rose-400 focus-visible:ring-rose-300/40'
                )}
                aria-invalid={!!confirmError}
                aria-describedby={confirmError ? 'confirm-error' : undefined}
                required
              />
            </div>
            {confirmError && (
              <p id='confirm-error' className='text-xs text-rose-600'>
                {confirmError}
              </p>
            )}
          </div>
        )}

        {isRegister ? (
          <Label
            htmlFor='agree'
            className='flex cursor-pointer items-start gap-2 text-xs font-normal text-zinc-700'
          >
            <Checkbox
              id='agree'
              checked={agree}
              onCheckedChange={(v) => setAgree(v === true)}
              className='mt-0.5'
            />
            <span>
              {/*
                Multi-token agreement copy — split into prefix / link / mid /
                link / suffix so translators can reorder around the two links.
                Buttons stay buttons (not anchors) since they aren't wired to
                real routes yet; swap to Link when terms / privacy pages exist.
              */}
              {t('agreePrefix')}{' '}
              <button
                type='button'
                className='font-medium text-cyan-600 underline-offset-2 hover:underline'
              >
                {t('agreeTerms')}
              </button>{' '}
              {t('agreeMid')}{' '}
              <button
                type='button'
                className='font-medium text-cyan-600 underline-offset-2 hover:underline'
              >
                {t('agreePrivacy')}
              </button>{' '}
              {t('agreeSuffix')}
            </span>
          </Label>
        ) : (
          <Label
            htmlFor='remember'
            className='flex cursor-pointer items-center gap-2 text-xs font-normal text-zinc-700'
          >
            <Checkbox
              id='remember'
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
            />
            {t('rememberMe')}
          </Label>
        )}

        <Button
          type='submit'
          disabled={!canSubmit || submitting}
          className='h-11 w-full bg-cyan-500 text-base font-medium text-white hover:bg-cyan-400'
        >
          {submitting ? (
            <>
              <Icons.spinner className='size-4 animate-spin' />
              {isRegister ? t('submittingRegister') : t('submittingLogin')}
            </>
          ) : (
            <>
              {isRegister ? t('submitRegister') : t('submitLogin')}
              <Icons.arrowRight className='size-4' />
            </>
          )}
        </Button>
      </form>

      <p className='mt-6 text-center text-xs text-zinc-500'>
        {isRegister ? (
          <>
            {t('haveAccount')}{' '}
            <button
              type='button'
              onClick={() => switchMode('login')}
              className='font-medium text-cyan-600 underline-offset-2 hover:underline'
            >
              {t('switchToLogin')}
            </button>
          </>
        ) : (
          <>
            {t('noAccount')}{' '}
            <button
              type='button'
              onClick={() => switchMode('register')}
              className='font-medium text-cyan-600 underline-offset-2 hover:underline'
            >
              {t('switchToRegister')}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
