'use client';

import {
  IconBrain,
  IconCode,
  IconLayersLinked,
  IconRocket,
  IconCircleCheck
} from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { publicTeachersOptions } from '@/api/public-teachers';

// ─── Hero ─────────────────────────────────────────────────────────────────────

function AboutHero() {
  const t = useTranslations('about.hero');
  return (
    <section className='relative flex min-h-[360px] items-center justify-center overflow-hidden bg-[#0d1b35] text-center'>
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
      <div className='relative z-10 mx-auto max-w-3xl px-6 py-20 md:px-10'>
        <span className='mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] tracking-widest text-white/60 uppercase'>
          {t('badge')}
        </span>
        <h1 className='text-4xl font-bold tracking-tight text-white md:text-5xl'>{t('title')}</h1>
        <p
          className='mt-5 text-base leading-relaxed text-white/70 md:text-lg'
          dangerouslySetInnerHTML={{ __html: t.raw('subtitle') as string }}
        />
      </div>
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

const STAT_COLORS = ['text-blue-600', 'text-orange-500', 'text-purple-600', 'text-green-600'];

function StatsBar() {
  const t = useTranslations('about.stats');
  const stats = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
    { value: t('stat4Value'), label: t('stat4Label') }
  ];
  return (
    <section className='border-b bg-white py-10'>
      <div className='mx-auto max-w-4xl px-6'>
        <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
          {stats.map((s, i) => (
            <div key={i} className='flex flex-col items-center gap-1 text-center'>
              <span
                className={`text-3xl font-extrabold tracking-tight md:text-4xl ${STAT_COLORS[i]}`}
              >
                {s.value}
              </span>
              <span className='text-xs font-medium text-gray-400 uppercase tracking-wider'>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Story section ────────────────────────────────────────────────────────────

function StorySection() {
  const t = useTranslations('about.story');
  return (
    <section className='bg-sky-50 py-16 md:py-20'>
      <div className='mx-auto grid max-w-5xl items-center gap-10 px-6 md:grid-cols-2 md:px-10'>
        {/* about image */}
        <div className='relative overflow-hidden rounded-2xl shadow-md'>
          <Image
            src='/about.png'
            alt='IQode Lab Team'
            width={600}
            height={450}
            className='aspect-[4/3] w-full object-cover'
            priority
          />
        </div>

        {/* content */}
        <div>
          <div className='mb-3 text-[10px] font-semibold tracking-widest text-blue-500 uppercase'>
            {t('eyebrow')}
          </div>
          <h2 className='mb-5 text-2xl font-bold leading-snug tracking-tight text-gray-900 md:text-3xl'>
            {t('heading')}
          </h2>
          <div className='space-y-4 text-sm leading-relaxed text-gray-600'>
            <p>{t('body1')}</p>
            <p dangerouslySetInnerHTML={{ __html: t.raw('body2') as string }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4 Pillars ────────────────────────────────────────────────────────────────

const PILLAR_ICONS = [IconBrain, IconLayersLinked, IconCode, IconRocket];
const PILLAR_STYLES = [
  { icon: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
  { icon: 'text-orange-500 bg-orange-50', border: 'border-orange-100' },
  { icon: 'text-green-600 bg-green-50', border: 'border-green-100' },
  { icon: 'text-purple-600 bg-purple-50', border: 'border-purple-100' }
];

function PillarsSection() {
  const t = useTranslations('about.pillars');
  const pillars = [
    { title: t('p1Title'), desc: t('p1Desc') },
    { title: t('p2Title'), desc: t('p2Desc') },
    { title: t('p3Title'), desc: t('p3Desc') },
    { title: t('p4Title'), desc: t('p4Desc') }
  ];
  return (
    <section className='bg-white py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <h2 className='mb-10 text-center text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
          {t('heading')}
        </h2>
        <div className='grid gap-5 sm:grid-cols-2'>
          {pillars.map((p, i) => {
            const Icon = PILLAR_ICONS[i];
            const style = PILLAR_STYLES[i];
            return (
              <div
                key={i}
                className={`flex items-start gap-4 rounded-2xl border ${style.border} bg-white p-6 shadow-sm`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                >
                  <Icon size={20} stroke={1.8} />
                </div>
                <div>
                  <h3 className='mb-1 text-sm font-semibold text-gray-900'>{p.title}</h3>
                  <p className='text-xs leading-relaxed text-gray-500'>{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Team section ─────────────────────────────────────────────────────────────

const AVATAR_BG = ['bg-blue-600', 'bg-rose-500', 'bg-emerald-600', 'bg-orange-500'];
const SUBJECT_COLOR = ['text-blue-600', 'text-rose-500', 'text-emerald-600', 'text-orange-500'];

function TeamSectionSkeleton() {
  return (
    <section className='bg-sky-50 py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <div className='mx-auto mb-10 h-8 w-40 animate-pulse rounded bg-gray-200' />
        <div className='flex gap-5 overflow-x-auto pb-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='flex w-56 shrink-0 flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm'
            >
              <div className='h-16 w-16 animate-pulse rounded-xl bg-gray-200' />
              <div className='space-y-2'>
                <div className='h-4 w-24 animate-pulse rounded bg-gray-200' />
                <div className='h-3 w-16 animate-pulse rounded bg-gray-200' />
              </div>
              <div className='space-y-1'>
                <div className='h-3 w-full animate-pulse rounded bg-gray-200' />
                <div className='h-3 w-4/5 animate-pulse rounded bg-gray-200' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSectionInner() {
  const t = useTranslations('about.team');
  const { data: teachers } = useSuspenseQuery(publicTeachersOptions());

  return (
    <section className='bg-sky-50 py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <h2 className='mb-10 text-center text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
          {t('heading')}
        </h2>
        <div className='flex gap-5 overflow-x-auto pb-2'>
          {teachers.map((teacher, i) => (
            <div
              key={teacher.id}
              className='flex w-56 shrink-0 flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm'
            >
              {teacher.avatarUrl ? (
                <Image
                  src={teacher.avatarUrl}
                  alt={teacher.name}
                  width={64}
                  height={64}
                  className='h-16 w-16 rounded-xl object-cover'
                />
              ) : (
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-xl text-lg font-bold text-white ${AVATAR_BG[i % AVATAR_BG.length]}`}
                >
                  {teacher.initials}
                </div>
              )}
              <div>
                <div className='text-sm font-semibold text-gray-900'>{teacher.name}</div>
                <div className={`text-xs font-medium ${SUBJECT_COLOR[i % SUBJECT_COLOR.length]}`}>
                  {teacher.subjects.slice(0, 2).join(' · ')}
                </div>
              </div>
              {teacher.bio && (
                <p className='text-xs leading-relaxed text-gray-500'>{teacher.bio}</p>
              )}
            </div>
          ))}
        </div>

        {/* teacher progression banner */}
        <div className='mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gray-900 px-6 py-5'>
          <div>
            <div className='text-sm font-semibold text-white'>{t('pathTitle')}</div>
            <div className='mt-0.5 text-xs text-gray-400'>{t('pathSubtitle')}</div>
          </div>
          <div className='flex items-center gap-2'>
            {['T1', 'T2', 'T3', 'T4'].map((level, i) => (
              <div key={level} className='flex items-center gap-2'>
                <span className='inline-flex h-7 items-center rounded-full bg-white/10 px-3 text-xs font-semibold text-white ring-1 ring-white/20'>
                  {level}
                </span>
                {i < 3 && <span className='text-gray-500 text-xs'>›</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <Suspense fallback={<TeamSectionSkeleton />}>
      <TeamSectionInner />
    </Suspense>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function AboutFooter() {
  const t = useTranslations('about.footer');
  return (
    <footer className='border-t border-gray-800 bg-gray-900 px-4 py-8 md:px-10'>
      <div className='mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-start md:gap-12'>
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

// ─── Page assembly ────────────────────────────────────────────────────────────

export function AboutPage() {
  return (
    <div className='min-h-screen'>
      <AboutHero />
      <StatsBar />
      <StorySection />
      <PillarsSection />
      <TeamSection />
      <AboutFooter />
    </div>
  );
}
