import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Icons } from '@/components/icons';
import { roleMeta } from '@/config/nav-config';
import { getAuthUser } from '@/lib/auth';
import { LoginForm } from './login-form';

export const metadata = {
  title: 'Đăng nhập · IQode Lab'
};

type SearchParams = { mode?: string };

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [{ mode }, user] = await Promise.all([searchParams, getAuthUser()]);
  // Already logged in → no reason to see the login form. Send them to their workspace.
  if (user) redirect(roleMeta[user.role].basePath);
  const initialMode: 'login' | 'register' = mode === 'register' ? 'register' : 'login';
  return (
    <div className='relative grid min-h-screen overflow-hidden bg-black text-white lg:grid-cols-[1.1fr_1fr]'>
      <div className='relative hidden flex-col justify-between p-10 lg:flex'>
        <div
          className='pointer-events-none absolute inset-0 opacity-[0.07]'
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '56px 56px'
          }}
        />
        <div
          className='pointer-events-none absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full'
          style={{
            background: 'radial-gradient(ellipse at center, rgba(20,210,220,0.22), transparent 60%)'
          }}
        />
        <div
          className='pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full'
          style={{
            background: 'radial-gradient(ellipse at center, rgba(244,164,96,0.15), transparent 70%)'
          }}
        />

        <Link
          href='/'
          className='relative z-10 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white'
        >
          <Icons.chevronLeft className='size-3.5' />
          Quay về trang chủ
        </Link>

        <div className='relative z-10'>
          <div className='inline-flex items-baseline gap-2'>
            <span className='text-5xl font-bold tracking-tight text-cyan-400'>IQode</span>
            <span className='text-2xl font-light text-orange-300'>Lab</span>
          </div>
          <p className='mt-4 max-w-md text-2xl leading-snug text-white/90'>
            {initialMode === 'register' ? 'Bắt đầu cùng IQode Lab.' : 'Chào mừng trở lại.'}
            <br />
            <span className='text-white/60'>
              {initialMode === 'register'
                ? 'Tạo tài khoản để con khởi đầu hành trình'
                : 'Tiếp tục hành trình'}{' '}
              <span className='font-medium text-white'>build thinking, not just coding.</span>
            </span>
          </p>
        </div>

        <div className='relative z-10 max-w-sm space-y-3 text-sm text-white/50'>
          <div className='flex items-start gap-3'>
            <span className='text-cyan-300 mt-0.5'>
              <Icons.sparkles className='size-4' />
            </span>
            <p>
              Học sinh phát triển tư duy giải quyết vấn đề qua từng buổi học, không chỉ học cú pháp.
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <span className='text-orange-300 mt-0.5'>
              <Icons.book className='size-4' />
            </span>
            <p>Lộ trình từ Scratch, Python đến AI Explorers — phù hợp 6 đến 16 tuổi.</p>
          </div>
        </div>
      </div>

      <div className='relative flex items-center justify-center bg-white px-6 py-12 text-zinc-900 lg:px-12'>
        <Link
          href='/'
          className='absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 lg:hidden'
        >
          <Icons.chevronLeft className='size-3.5' />
          Trang chủ
        </Link>

        <div className='w-full max-w-sm'>
          <div className='mb-8 text-center lg:hidden'>
            <div className='inline-flex items-baseline gap-2'>
              <span className='text-3xl font-bold tracking-tight text-cyan-500'>IQode</span>
              <span className='text-xl font-light text-orange-500'>Lab</span>
            </div>
          </div>

          <LoginForm initialMode={initialMode} />
        </div>
      </div>
    </div>
  );
}
