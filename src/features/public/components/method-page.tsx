'use client';

import {
  IconBulb,
  IconCode,
  IconLayoutGrid,
  IconZoomQuestion,
  IconCircleCheck
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// ─── Hero ────────────────────────────────────────────────────────────────────

function MethodHero() {
  const t = useTranslations('method.hero');
  return (
    <section className='relative flex min-h-[420px] items-center justify-start overflow-hidden bg-gray-900'>
      {/* background image overlay */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.82) 45%, rgba(0,0,0,0.35) 100%)'
        }}
      />
      {/* subtle grid texture */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
      <div className='relative z-10 mx-auto w-full max-w-5xl px-6 py-20 md:px-10'>
        <span className='mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-widest text-white/70 uppercase'>
          {t('badge')}
        </span>
        <h1 className='max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl'>
          {t('title')}
        </h1>
        <p className='mt-5 max-w-lg text-base leading-relaxed text-white/70 md:text-lg'>
          {t('subtitle')}
        </p>
      </div>
    </section>
  );
}

// ─── 4-step overview ─────────────────────────────────────────────────────────

const STEP_ICONS = [IconZoomQuestion, IconBulb, IconLayoutGrid, IconCode];
const STEP_COLORS = [
  'text-cyan-600 bg-cyan-50',
  'text-blue-600 bg-blue-50',
  'text-orange-500 bg-orange-50',
  'text-green-600 bg-green-50'
];

function OverviewSteps() {
  const t = useTranslations('method.overview');
  const steps = [
    { label: t('step1Label'), title: t('step1Title'), desc: t('step1Desc') },
    { label: t('step2Label'), title: t('step2Title'), desc: t('step2Desc') },
    { label: t('step3Label'), title: t('step3Title'), desc: t('step3Desc') },
    { label: t('step4Label'), title: t('step4Title'), desc: t('step4Desc') }
  ];
  return (
    <section className='bg-white py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <p className='mb-10 text-center text-sm text-gray-500 md:text-base'>{t('lead')}</p>
        {/* pagination dots */}
        <div className='mb-8 flex justify-center gap-2'>
          {steps.map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 rounded-full transition-all ${i === 0 ? 'w-6 bg-cyan-500' : 'w-2 bg-gray-200'}`}
            />
          ))}
        </div>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div
                key={i}
                className='flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${STEP_COLORS[i]}`}
                >
                  <Icon size={20} stroke={1.8} />
                </div>
                <div>
                  <div className='mb-1 text-[10px] font-semibold tracking-widest text-gray-400 uppercase'>
                    {step.label}
                  </div>
                  <div className='text-sm font-semibold text-gray-900'>{step.title}</div>
                </div>
                <p className='text-xs leading-relaxed text-gray-500'>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── 15-step detail ──────────────────────────────────────────────────────────

type PhaseConfig = {
  headingKey: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  steps: number[];
};

const PHASES: PhaseConfig[] = [
  {
    headingKey: 'phase1',
    accentClass: 'text-cyan-600',
    borderClass: 'border-cyan-200',
    bgClass: 'bg-cyan-50/60',
    steps: [1, 2, 3, 4, 5]
  },
  {
    headingKey: 'phase2',
    accentClass: 'text-orange-500',
    borderClass: 'border-orange-200',
    bgClass: 'bg-orange-50/60',
    steps: [6, 7, 8, 9, 10]
  },
  {
    headingKey: 'phase3',
    accentClass: 'text-green-600',
    borderClass: 'border-green-200',
    bgClass: 'bg-green-50/60',
    steps: [11, 12, 13, 14, 15]
  }
];

function FifteenSteps() {
  const t = useTranslations('method.steps');
  return (
    <section className='bg-sky-50 py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <div className='mb-10 text-center'>
          <div className='mb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase'>
            {t('eyebrow')}
          </div>
          <h2 className='text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
            {t('heading')}
          </h2>
          <p className='mt-3 text-sm text-gray-500'>{t('subheading')}</p>
        </div>

        <div className='grid gap-5 md:grid-cols-3'>
          {PHASES.map((phase) => (
            <div
              key={phase.headingKey}
              className={`rounded-2xl border ${phase.borderClass} ${phase.bgClass} p-6`}
            >
              <h3 className={`mb-5 text-sm font-bold tracking-wide ${phase.accentClass}`}>
                {t(phase.headingKey)}
              </h3>
              <ol className='space-y-3'>
                {phase.steps.map((n) => (
                  <li key={n} className='flex items-start gap-3'>
                    <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-500 shadow-sm ring-1 ring-gray-200'>
                      {n}
                    </span>
                    <span className='text-sm leading-snug text-gray-700'>{t(`step${n}`)}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why section ─────────────────────────────────────────────────────────────

function WhySection() {
  const t = useTranslations('method.why');
  return (
    <section className='bg-gray-900 py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <h2 className='mb-10 text-center text-2xl font-bold text-white md:text-3xl'>
          {t('heading')}
        </h2>
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='rounded-2xl bg-gray-800 p-8'>
            <h3 className='mb-3 text-base font-semibold text-cyan-400'>{t('card1Title')}</h3>
            <p className='text-sm leading-relaxed text-gray-300'>{t('card1Body')}</p>
          </div>
          <div className='rounded-2xl bg-gray-800 p-8'>
            <h3 className='mb-3 text-base font-semibold text-orange-400'>{t('card2Title')}</h3>
            <p className='text-sm leading-relaxed text-gray-300'>{t('card2Body')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function MethodFooter() {
  const t = useTranslations('method.footer');
  return (
    <footer className='border-t border-gray-100 bg-gray-900 px-4 py-8 md:px-10'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start md:gap-12'>
        {/* brand */}
        <div className='flex-1'>
          <div className='mb-2 text-lg font-bold'>
            <span className='text-white'>IQode</span>
            <span className='text-orange-400'> Lab</span>
          </div>
          <p className='max-w-xs text-xs leading-relaxed text-gray-400'>{t('brand')}</p>
          <div className='mt-4 flex items-center gap-3'>
            <IconCircleCheck size={16} className='text-gray-500' />
            <IconCode size={16} className='text-gray-500' />
          </div>
        </div>
        {/* explore links */}
        <div>
          <div className='mb-3 text-xs font-semibold tracking-widest text-gray-500 uppercase'>
            {t('exploreHeading')}
          </div>
          <ul className='space-y-2'>
            {[
              { href: '/courses', label: t('linkCourses') },
              { href: '/method', label: t('linkMethod') },
              { href: '/about', label: t('linkAbout') },
              { href: '/blog', label: t('linkBlog') }
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className='text-sm text-gray-400 hover:text-white'>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* contact */}
        <div>
          <div className='mb-3 text-xs font-semibold tracking-widest text-gray-500 uppercase'>
            {t('contactHeading')}
          </div>
          <ul className='space-y-2 text-sm text-gray-400'>
            <li>📍 {t('address')}</li>
            <li>📞 {t('phone')}</li>
            <li>✉️ {t('email')}</li>
          </ul>
        </div>
      </div>
      <div className='mx-auto mt-8 flex max-w-5xl items-center justify-between border-t border-gray-800 pt-6 text-xs text-gray-600'>
        <span>{t('copyright')}</span>
        <div className='flex gap-4'>
          <Link href='/privacy-policy' className='hover:text-gray-400'>
            {t('privacy')}
          </Link>
          <Link href='/terms-of-service' className='hover:text-gray-400'>
            {t('terms')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Page assembly ───────────────────────────────────────────────────────────

export function MethodPage() {
  return (
    <div className='min-h-screen'>
      <MethodHero />
      <OverviewSteps />
      <FifteenSteps />
      <WhySection />
      <MethodFooter />
    </div>
  );
}
