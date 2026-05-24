'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APP_ROLES, type AppRole, roleMeta } from '@/config/nav-config';
import { loginAs } from '@/lib/auth-actions';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

export function LoginForm({ initialMode = 'login' }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loginRole, setLoginRole] = useState<AppRole>('parent');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const phoneError =
    phone.length > 0 && !/^0\d{9}$/.test(phone)
      ? 'Số điện thoại phải có 10 chữ số, bắt đầu bằng 0.'
      : null;
  const confirmError =
    isRegister && confirmPassword.length > 0 && confirmPassword !== password
      ? 'Mật khẩu nhập lại không khớp.'
      : null;

  const canSubmit = isRegister
    ? name.trim().length >= 2 &&
      phone.length > 0 &&
      password.length >= 6 &&
      confirmPassword === password &&
      agree &&
      !phoneError
    : phone.length > 0 && password.length >= 6 && !phoneError;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    // Register flow is parent-only (real flow: admin/teacher are provisioned, not self-registered).
    const role: AppRole = isRegister ? 'parent' : loginRole;
    await loginAs(role, { name: isRegister ? name : undefined, phone });

    if (isRegister) {
      toast.success('Tạo tài khoản thành công', {
        description: `Chào mừng ${name}! Đang chuyển sang trang đăng ký khóa cho con…`
      });
    } else {
      toast.success('Đăng nhập thành công', {
        description: `Đang vào workspace ${roleMeta[role].label}…`
      });
    }

    router.push(roleMeta[role].basePath);
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
          {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
        </h1>
        <p className='mt-1.5 text-sm text-zinc-500'>
          {isRegister
            ? 'Đăng ký tài khoản phụ huynh để đăng ký khóa và theo dõi tiến độ con.'
            : 'Nhập số điện thoại và mật khẩu để vào hệ thống.'}
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
          Đăng nhập
        </button>
        <button
          type='button'
          onClick={() => switchMode('register')}
          className={cn(
            'h-8 flex-1 rounded text-sm font-medium transition-all',
            mode === 'register' ? 'bg-white text-zinc-900 shadow-sm' : 'hover:text-zinc-900'
          )}
        >
          Đăng ký
        </button>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {!isRegister && (
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs font-medium text-zinc-700'>Đăng nhập với vai trò</Label>
              <span className='rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-amber-800'>
                DEMO
              </span>
            </div>
            <div className='grid grid-cols-3 gap-1.5'>
              {APP_ROLES.map((r) => {
                const RoleIcon = Icons[roleMeta[r].icon];
                const active = loginRole === r;
                return (
                  <button
                    key={r}
                    type='button'
                    onClick={() => setLoginRole(r)}
                    className={cn(
                      'inline-flex h-11 items-center justify-center gap-1.5 rounded-md border text-sm font-medium transition-all',
                      active
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                    )}
                  >
                    <RoleIcon className='size-4' />
                    {roleMeta[r].label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isRegister && (
          <div className='space-y-1.5'>
            <Label htmlFor='name' className='text-xs font-medium text-zinc-700'>
              Họ và tên phụ huynh
            </Label>
            <div className='relative'>
              <Icons.user className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400' />
              <Input
                id='name'
                type='text'
                autoComplete='name'
                placeholder='Nguyễn Văn An'
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
            Số điện thoại
          </Label>
          <div className='relative'>
            <Icons.phone className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400' />
            <Input
              id='phone'
              type='tel'
              inputMode='numeric'
              autoComplete='tel'
              placeholder='09xx xxx xxx'
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
              Mật khẩu
            </Label>
            {!isRegister && (
              <button
                type='button'
                className='text-xs text-cyan-600 underline-offset-2 hover:underline'
                onClick={() => toast('Vui lòng liên hệ trung tâm để khôi phục mật khẩu.')}
              >
                Quên mật khẩu?
              </button>
            )}
          </div>
          <div className='relative'>
            <Icons.lock className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400' />
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder='Tối thiểu 6 ký tự'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='h-11 border-zinc-200 pr-10 pl-10 text-base'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-700'
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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
              Nhập lại mật khẩu
            </Label>
            <div className='relative'>
              <Icons.lock className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400' />
              <Input
                id='confirm'
                type={showPassword ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder='Nhập lại mật khẩu'
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
              Tôi đồng ý với{' '}
              <button
                type='button'
                className='font-medium text-cyan-600 underline-offset-2 hover:underline'
              >
                điều khoản sử dụng
              </button>{' '}
              và{' '}
              <button
                type='button'
                className='font-medium text-cyan-600 underline-offset-2 hover:underline'
              >
                chính sách bảo mật
              </button>{' '}
              của IQode Lab.
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
            Ghi nhớ đăng nhập trên thiết bị này
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
              {isRegister ? 'Đang tạo tài khoản…' : 'Đang đăng nhập…'}
            </>
          ) : (
            <>
              {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
              <Icons.arrowRight className='size-4' />
            </>
          )}
        </Button>
      </form>

      <p className='mt-6 text-center text-xs text-zinc-500'>
        {isRegister ? (
          <>
            Đã có tài khoản?{' '}
            <button
              type='button'
              onClick={() => switchMode('login')}
              className='font-medium text-cyan-600 underline-offset-2 hover:underline'
            >
              Đăng nhập
            </button>
          </>
        ) : (
          <>
            Chưa có tài khoản?{' '}
            <button
              type='button'
              onClick={() => switchMode('register')}
              className='font-medium text-cyan-600 underline-offset-2 hover:underline'
            >
              Đăng ký ngay
            </button>
          </>
        )}
      </p>
    </div>
  );
}
