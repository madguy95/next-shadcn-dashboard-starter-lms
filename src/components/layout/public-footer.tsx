'use client';

import { IconBrandFacebook, IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

function CircuitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' className={className} aria-hidden='true'>
      <circle cx='12' cy='12' r='2' />
      <line x1='12' y1='10' x2='12' y2='5.5' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='12' cy='4.5' r='1.5' />
      <line x1='13.4' y1='10.6' x2='17.2' y2='6.8' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='18' cy='6' r='1.5' />
      <line x1='14' y1='12' x2='18.5' y2='12' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='19.5' cy='12' r='1.5' />
      <line x1='13.4' y1='13.4' x2='17.2' y2='17.2' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='18' cy='18' r='1.5' />
      <line x1='10.6' y1='13.4' x2='6.8' y2='17.2' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='6' cy='18' r='1.5' />
      <line x1='10' y1='12' x2='5.5' y2='12' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='4.5' cy='12' r='1.5' />
    </svg>
  );
}

export function PublicFooter() {
  const t = useTranslations('home.footer');
  return (
    <footer className='bg-gray-950 px-4 py-12 md:px-10'>
      <div className='mx-auto flex max-w-5xl flex-col gap-10 md:flex-row md:gap-14'>
        {/* brand */}
        <div className='flex-1'>
          <Link href='/' className='mb-3 flex items-baseline font-[family-name:var(--font-outfit)]'>
            <span className='text-xl font-black leading-none tracking-tight text-cyan-400'>
              IQode
            </span>
            <span className='text-sm font-medium leading-none tracking-tight text-amber-400'>
              Lab
            </span>
            <CircuitIcon className='ml-0.5 size-3.5 -translate-y-2 text-amber-400' />
          </Link>
          <p className='max-w-xs text-xs leading-relaxed text-gray-400'>{t('brand')}</p>
          <div className='mt-5 flex items-center gap-3'>
            <a
              href='https://facebook.com/iqode'
              target='_blank'
              rel='noopener noreferrer'
              className='flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:text-white'
            >
              <IconBrandFacebook size={16} />
            </a>
            <a
              href='mailto:iqode.file@gmail.com'
              className='flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors hover:text-white'
            >
              <IconMail size={16} />
            </a>
          </div>
        </div>

        {/* explore */}
        <div>
          <div className='mb-4 text-[10px] font-semibold tracking-widest text-gray-500 uppercase'>
            {t('exploreHeading')}
          </div>
          <ul className='space-y-2.5'>
            {[
              { href: '/courses', label: t('linkCourses') },
              { href: '/method', label: t('linkMethod') },
              { href: '/about', label: t('linkAbout') },
              { href: '/blog', label: t('linkBlog') }
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className='text-sm text-gray-400 transition-colors hover:text-white'
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <div className='mb-4 text-[10px] font-semibold tracking-widest text-gray-500 uppercase'>
            {t('contactHeading')}
          </div>
          <ul className='space-y-3 text-sm text-gray-400'>
            <li className='flex items-start gap-2'>
              <IconMapPin size={15} className='mt-0.5 shrink-0 text-gray-500' />
              {t('address')}
            </li>
            <li className='flex items-center gap-2'>
              <IconPhone size={15} className='shrink-0 text-gray-500' />
              {t('phone')}
            </li>
            <li className='flex items-center gap-2'>
              <IconMail size={15} className='shrink-0 text-gray-500' />
              {t('email')}
            </li>
          </ul>
        </div>
      </div>

      <div className='mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-6 text-xs text-gray-600'>
        <span>{t('copyright')}</span>
        <div className='flex gap-5'>
          <Link href='/privacy-policy' className='transition-colors hover:text-gray-400'>
            {t('privacy')}
          </Link>
          <Link href='/terms-of-service' className='transition-colors hover:text-gray-400'>
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
