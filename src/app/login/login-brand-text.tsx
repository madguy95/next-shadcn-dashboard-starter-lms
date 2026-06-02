'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export function LoginBrandText() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const isRegister = searchParams.get('mode') === 'register';

  return (
    <p className='mt-4 max-w-md text-2xl leading-snug text-white/90'>
      {isRegister ? t('welcomeTitleRegister') : t('welcomeTitleLogin')}
      <br />
      <span className='text-white/60'>
        {isRegister ? t('welcomeSubRegister') : t('welcomeSubLogin')}{' '}
        <span className='font-medium text-white'>{t('tagline')}</span>
      </span>
    </p>
  );
}
