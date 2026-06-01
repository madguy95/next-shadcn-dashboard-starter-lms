'use client';

import {
  IconArrowRight,
  IconBulb,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCode,
  IconLayersLinked,
  IconMapPin,
  IconPlayerPlayFilled,
  IconQuote,
  IconRocket,
  IconStar,
  IconUsers,
  IconZoomQuestion
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { publicCoursesOptions } from '@/api/courses/queries';
import { homeFeedOptions } from '@/api/blog/queries';
import { BlogCover } from '@/features/blog/components/blog-cover';
import { PublicFooter } from '@/components/layout/public-footer';
import { formatTuition } from '@/lib/format-vnd';
import type { PublicCourse } from '@/api/courses/types';
import type { HomeFeedItem } from '@/api/blog';
import type { AppRole } from '@/config/nav-config';
import { HomeCourseCardActions } from './home-course-card-actions';

type AuthUser = { name?: string | null; phone?: string; role: AppRole };

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ user }: { user?: AuthUser | null }) {
  const t = useTranslations('home.hero');
  return (
    <section className='relative min-h-[560px] overflow-hidden bg-[#0b1a2e]'>
      {/* grid texture */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            'linear-gradient(to right,rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
      {/* ambient glow */}
      <div
        className='pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full opacity-20'
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.4), transparent 65%)' }}
      />
      <div
        className='pointer-events-none absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full opacity-10'
        style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.5), transparent 65%)' }}
      />

      <div className='relative z-10 mx-auto flex max-w-6xl flex-col justify-center gap-8 px-6 py-20 md:flex-row md:items-center md:px-10 md:py-28'>
        {/* text */}
        <div className='flex-1'>
          <span className='mb-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium tracking-widest text-cyan-300'>
            {t('badge')}
          </span>
          <h1 className='max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-[3.25rem]'>
            {t('line1')}
            <br />
            <span>{t('line2Prefix')} </span>
            <span className='text-cyan-400'>{t('line2Accent')}</span>
          </h1>
          <p className='mt-5 max-w-md text-sm leading-relaxed text-white/60 md:text-base'>
            {t('desc')}
          </p>
          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <Link
              href='/courses'
              className='inline-flex h-11 items-center gap-2 rounded-lg bg-cyan-500 px-6 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-cyan-400'
            >
              {t('ctaPrimary')}
              <IconArrowRight size={16} />
            </Link>
            <Link
              href='/contact'
              className='inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10'
            >
              {t('ctaSecondary')}
            </Link>
          </div>

          {/* stats */}
          <div className='mt-10 flex flex-wrap gap-8'>
            {(
              [
                { value: t('stat1Value'), label: t('stat1Label') },
                { value: t('stat2Value'), label: t('stat2Label') },
                { value: t('stat3Value'), label: t('stat3Label') }
              ] as { value: string; label: string }[]
            ).map((s) => (
              <div key={s.label}>
                <div className='text-2xl font-extrabold text-white'>{s.value}</div>
                <div className='mt-0.5 text-xs text-white/40'>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* workshop carousel */}
        <div className='flex-shrink-0 md:w-[340px] lg:w-[420px]'>
          <HeroWorkshopCarousel imageCaption={t('imageCaption')} />
        </div>
      </div>
    </section>
  );
}

// ─── Hero workshop carousel ─────────────────────────────────────────────────────

function HeroWorkshopFallback({ imageCaption }: { imageCaption: string }) {
  return (
    <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-cyan-500/10 backdrop-blur'>
      <div className='flex h-[420px] flex-col items-center justify-center gap-4 p-8 text-white/20'>
        <IconPlayerPlayFilled size={56} />
        <span className='text-xs tracking-widest uppercase'>{imageCaption}</span>
      </div>
      <div className='absolute inset-x-0 top-0 flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-2.5'>
        {['bg-red-400/60', 'bg-yellow-400/60', 'bg-green-400/60'].map((c) => (
          <span key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
        ))}
      </div>
    </div>
  );
}

function HeroFeedSlide({ item }: { item: HomeFeedItem }) {
  const t = useTranslations('blog.homeFeed');
  const { post } = item;
  const isWorkshop = item.kind === 'workshop';
  const seats = isWorkshop ? Math.max(0, item.workshop.capacity - item.workshop.enrolled) : 0;
  const seatsLow = seats <= 4;
  const tuition = isWorkshop ? item.workshop.tuitionAmount : undefined;
  const showOpen = isWorkshop && item.workshop.status === 'open';

  return (
    <Link
      href={`/blog/${post.slug}`}
      className='group relative flex h-[420px] w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left shadow-xl shadow-black/20 backdrop-blur transition-all hover:border-cyan-400/40 hover:bg-white/[0.07]'
    >
      {/* cover */}
      <div className='relative h-44 w-full shrink-0 overflow-hidden'>
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt={post.title}
            className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='absolute inset-0 transition-transform duration-500 group-hover:scale-105'>
            <BlogCover hue={post.hue} category={post.category} status={post.status} size={72} />
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent' />
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase backdrop-blur ${
            isWorkshop
              ? 'border-emerald-400/30 bg-emerald-400/20 text-emerald-200'
              : 'border-cyan-400/30 bg-cyan-400/20 text-cyan-200'
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${isWorkshop ? 'bg-emerald-400' : 'bg-cyan-400'}`}
          />
          {isWorkshop ? t('typeWorkshop') : t('typeArticle')}
        </span>
        {showOpen && (
          <span className='absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur'>
            <span className='size-1.5 animate-pulse rounded-full bg-emerald-400' />
            {t('statusOpen')}
          </span>
        )}
      </div>

      {/* body */}
      <div className='flex flex-1 flex-col gap-2 p-5'>
        <h3 className='line-clamp-2 text-[15px] leading-snug font-semibold text-white'>
          {post.title}
        </h3>
        <p className='line-clamp-2 text-[12px] leading-relaxed text-white/50'>{post.excerpt}</p>

        {/* meta */}
        <div className='mt-auto space-y-3 border-t border-white/10 pt-3'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/55'>
            {item.kind === 'workshop' ? (
              <>
                <span className='inline-flex items-center gap-1.5'>
                  <IconCalendar size={13} className='shrink-0 text-white/40' />
                  {item.workshop.schedule}
                </span>
                <span className='inline-flex items-center gap-1.5'>
                  <IconMapPin size={13} className='shrink-0 text-white/40' />
                  {item.workshop.location}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 ${seatsLow ? 'text-orange-300' : 'text-white/55'}`}
                >
                  <IconUsers size={13} className='shrink-0' />
                  {seats === 0
                    ? t('seatsFull')
                    : t('seatsRemaining', { seats, capacity: item.workshop.capacity })}
                </span>
              </>
            ) : (
              <span className='inline-flex items-center gap-1.5'>
                <IconClock size={13} className='shrink-0 text-white/40' />
                {post.meta}
              </span>
            )}
          </div>

          {/* footer: price or author + CTA arrow */}
          <div className='flex items-center justify-between gap-2'>
            {tuition ? (
              <span className='text-sm font-bold text-white'>{formatTuition(tuition)}</span>
            ) : (
              <span className='inline-flex min-w-0 items-center gap-2 text-[12px] text-white/55'>
                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/80'>
                  {post.author.initials}
                </span>
                <span className='truncate'>{post.author.name}</span>
              </span>
            )}
            <span
              aria-label={isWorkshop ? t('ctaWorkshop') : t('ctaArticle')}
              className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 transition-colors group-hover:bg-cyan-500 group-hover:text-black'
            >
              <IconArrowRight
                size={15}
                className='transition-transform group-hover:translate-x-0.5'
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeroWorkshopCarousel({ imageCaption }: { imageCaption: string }) {
  const t = useTranslations('blog.homeFeed');
  // Reuse the same feed query that the page prefetches + dehydrates, so the
  // carousel shares the streamed server→client lifecycle as the news feed below
  // it. Using a different limit creates a non-dehydrated query whose client
  // cache can diverge from the server render → hydration mismatch.
  const { data: items = [] } = useQuery(homeFeedOptions(8));
  const [index, setIndex] = useState(0);
  const count = items.length;

  // Auto-advance every 5s; restarts whenever the active slide changes.
  useEffect(() => {
    if (count <= 1) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearTimeout(id);
  }, [index, count]);

  if (count === 0) {
    return <HeroWorkshopFallback imageCaption={imageCaption} />;
  }

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div className='w-full'>
      {/* header */}
      <div className='mb-3 flex items-center justify-between'>
        <span className='inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-orange-300/80 uppercase'>
          <span className='size-1.5 rounded-full bg-orange-400' />
          {t('eyebrow')}
        </span>
        <Link
          href='/blog'
          className='inline-flex items-center gap-1 text-[12px] text-white/50 transition-colors hover:text-white'
        >
          {t('viewAll')}
          <IconArrowRight size={13} />
        </Link>
      </div>

      {/* viewport */}
      <div className='overflow-hidden rounded-2xl'>
        <div
          className='flex transition-transform duration-500 ease-out'
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item) => (
            <div key={item.post.id} className='w-full shrink-0'>
              <HeroFeedSlide item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* controls */}
      {count > 1 && (
        <div className='mt-4 flex items-center justify-between'>
          <div className='flex gap-1.5'>
            {items.map((item, i) => (
              <button
                key={item.post.id}
                type='button'
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/25 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              aria-label='Previous'
              onClick={() => go(index - 1)}
              className='flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white'
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              type='button'
              aria-label='Next'
              onClick={() => go(index + 1)}
              className='flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white'
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Featured Courses ─────────────────────────────────────────────────────────

function CourseCard({ course }: { course: PublicCourse }) {
  return (
    <Link
      href={`/courses?course=${encodeURIComponent(course.code)}`}
      className='relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md'
    >
      {/* Cover */}
      <div className='relative h-40 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50'>
        {course.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverUrl}
            alt={course.title}
            className='absolute inset-0 h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <IconCode size={40} className='text-blue-200' />
          </div>
        )}
        <span className='absolute top-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 backdrop-blur'>
          {course.tool}
        </span>
        {course.originalTuitionAmount && (
          <span className='absolute top-3 right-3 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white'>
            SALE
          </span>
        )}
      </div>

      <div className='flex flex-1 flex-col gap-3 p-5'>
        <div className='flex items-center gap-2 text-[11px] text-gray-400'>
          <span>
            {course.minAge}–{course.maxAge} tuổi
          </span>
          <span className='h-1 w-1 rounded-full bg-gray-200' />
          <span>{course.totalSessions} buổi</span>
        </div>

        <h3 className='text-sm font-semibold leading-snug text-gray-900'>{course.title}</h3>

        {course.tagline && (
          <p className='line-clamp-2 text-[12px] leading-relaxed text-gray-500'>
            {course.description}
          </p>
        )}

        <div className='mt-auto space-y-3 border-t border-gray-100 pt-4'>
          <div className='flex items-baseline gap-2'>
            <span className='text-base font-bold text-gray-900'>
              {formatTuition(course.tuitionAmount)}
            </span>
            {course.originalTuitionAmount && (
              <span className='text-xs text-gray-400 line-through'>
                {formatTuition(course.originalTuitionAmount)}
              </span>
            )}
          </div>
          <HomeCourseCardActions course={course} />
        </div>
      </div>
    </Link>
  );
}

function FeaturedCoursesSection() {
  const t = useTranslations('home.courses');
  const { data: paged } = useQuery(publicCoursesOptions({ page: 1, size: 3 }));
  const courses = paged?.data ?? [];

  if (courses.length === 0) return null;

  return (
    <section className='bg-gray-50 py-16 md:py-20'>
      <div className='mx-auto max-w-6xl px-6 md:px-10'>
        <div className='mb-10 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <div className='mb-2 text-[10px] font-semibold tracking-widest text-orange-500/70 uppercase'>
              {t('eyebrow')}
            </div>
            <h2 className='text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
              {t('heading')}
            </h2>
            <p className='mt-2 max-w-xl text-sm text-gray-500'>{t('desc')}</p>
          </div>
          <Link
            href='/courses'
            className='inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900'
          >
            {t('viewAll')}
            <IconArrowRight size={15} />
          </Link>
        </div>

        <div className='grid gap-4 sm:grid-cols-3'>
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Method preview ───────────────────────────────────────────────────────────

const METHOD_ICONS = [IconZoomQuestion, IconBulb, IconLayersLinked, IconCode, IconRocket];
const METHOD_COLORS = [
  { icon: 'text-cyan-600 bg-cyan-50', border: 'border-cyan-100' },
  { icon: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
  { icon: 'text-orange-500 bg-orange-50', border: 'border-orange-100' },
  { icon: 'text-green-600 bg-green-50', border: 'border-green-100' },
  { icon: 'text-purple-600 bg-purple-50', border: 'border-purple-100' }
];

function MethodPreviewSection() {
  const t = useTranslations('home.method5');
  const steps = [
    { label: t('s1Label'), title: t('s1Title'), desc: t('s1Desc') },
    { label: t('s2Label'), title: t('s2Title'), desc: t('s2Desc') },
    { label: t('s3Label'), title: t('s3Title'), desc: t('s3Desc') },
    { label: t('s4Label'), title: t('s4Title'), desc: t('s4Desc') },
    { label: t('s5Label'), title: t('s5Title'), desc: t('s5Desc') }
  ];
  return (
    <section className='bg-sky-50 py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <div className='mb-10 text-center'>
          <div className='mb-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase'>
            {t('eyebrow')}
          </div>
          <h2 className='text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
            {t('heading')}
          </h2>
          <p className='mt-3 max-w-xl mx-auto text-sm text-gray-500'>{t('desc')}</p>
        </div>

        <div className='grid gap-4 sm:grid-cols-5'>
          {steps.map((step, i) => {
            const Icon = METHOD_ICONS[i];
            const { icon, border } = METHOD_COLORS[i];
            return (
              <div
                key={i}
                className={`flex flex-col gap-3 rounded-2xl border ${border} bg-white p-5 shadow-sm`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${icon}`}>
                  <Icon size={18} stroke={1.8} />
                </div>
                <div>
                  <div className='mb-0.5 text-[9px] font-bold tracking-widest text-gray-400 uppercase'>
                    {step.label}
                  </div>
                  <div className='text-sm font-semibold text-gray-900'>{step.title}</div>
                </div>
                <p className='text-xs leading-relaxed text-gray-500'>{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className='mt-8 text-center'>
          <Link
            href='/method'
            className='inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700'
          >
            {t('viewAll')}
            <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Learning journey ─────────────────────────────────────────────────────────

const STAGE_COLORS = [
  { badge: 'bg-blue-600', border: 'border-blue-100', accent: 'text-blue-600' },
  { badge: 'bg-cyan-600', border: 'border-cyan-100', accent: 'text-cyan-600' },
  { badge: 'bg-green-600', border: 'border-green-100', accent: 'text-green-600' },
  { badge: 'bg-purple-600', border: 'border-purple-100', accent: 'text-purple-600' }
];

function LearningJourneySection() {
  const t = useTranslations('home.journey');
  const stages = [
    {
      badge: t('s1Badge'),
      title: t('s1Title'),
      age: t('s1Age'),
      items: [t('s1i1'), t('s1i2'), t('s1i3')]
    },
    {
      badge: t('s2Badge'),
      title: t('s2Title'),
      age: t('s2Age'),
      items: [t('s2i1'), t('s2i2'), t('s2i3')]
    },
    {
      badge: t('s3Badge'),
      title: t('s3Title'),
      age: t('s3Age'),
      items: [t('s3i1'), t('s3i2'), t('s3i3')]
    },
    {
      badge: t('s4Badge'),
      title: t('s4Title'),
      age: t('s4Age'),
      items: [t('s4i1'), t('s4i2'), t('s4i3')]
    }
  ];
  return (
    <section className='bg-white py-16 md:py-20'>
      <div className='mx-auto max-w-5xl px-6 md:px-10'>
        <div className='mb-10 text-center'>
          <div className='mb-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase'>
            {t('eyebrow')}
          </div>
          <h2 className='text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
            {t('heading')}
          </h2>
          <p className='mt-3 max-w-xl mx-auto text-sm text-gray-500'>{t('desc')}</p>
        </div>

        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
          {stages.map((stage, i) => {
            const { badge, border, accent } = STAGE_COLORS[i];
            return (
              <div
                key={i}
                className={`flex flex-col gap-4 rounded-2xl border ${border} bg-white p-5 shadow-sm`}
              >
                <span
                  className={`inline-flex w-fit items-center rounded-full ${badge} px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase`}
                >
                  {stage.badge}
                </span>
                <div>
                  <div className={`text-sm font-bold ${accent}`}>{stage.title}</div>
                  <div className='mt-0.5 text-xs text-gray-400'>{stage.age}</div>
                </div>
                <ul className='space-y-1.5'>
                  {stage.items.map((item) => (
                    <li key={item} className='flex items-start gap-2 text-xs text-gray-600'>
                      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${badge}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className='mt-8 flex justify-center'>
          <Link
            href='/login?mode=register'
            className='inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-blue-700'
          >
            {t('cta')}
            <IconArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const tTest = useTranslations('home.testimonials');

  return (
    <div className='bg-white'>
      <section className='px-4 py-16 md:px-10 md:py-20'>
        <div className='mx-auto max-w-3xl'>
          <div className='mb-10 text-center'>
            <div className='mb-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase'>
              {tTest('eyebrow')}
            </div>
            <h2 className='text-2xl font-bold tracking-tight text-gray-900 md:text-3xl'>
              {tTest('heading')}
            </h2>
            <p className='mt-2 text-sm text-gray-500'>{tTest('desc')}</p>
          </div>

          <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
            <IconQuote size={32} className='mb-4 text-blue-200' />
            <blockquote className='text-base leading-relaxed text-gray-700 md:text-lg'>
              {tTest('quote')}
            </blockquote>
            <div className='mt-6 flex items-center gap-4 border-t border-gray-100 pt-5'>
              <div className='flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white'>
                {tTest('authorInitials')}
              </div>
              <div>
                <div className='text-sm font-semibold text-gray-900'>{tTest('author')}</div>
                <div className='text-xs text-gray-400'>{tTest('authorRole')}</div>
              </div>
              <div className='ml-auto flex items-center gap-0.5'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} size={14} className='fill-yellow-400 text-yellow-400' />
                ))}
              </div>
            </div>
          </div>

          <div className='mt-5 flex justify-center gap-1.5'>
            {[true, false, false].map((active, i) => (
              <span
                key={i}
                className={`block h-1.5 rounded-full ${active ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CtaBannerSection() {
  const t = useTranslations('home.ctaBanner');
  return (
    <section className='bg-[#0b1a2e] py-16 md:py-20'>
      <div className='mx-auto max-w-3xl px-6 text-center md:px-10'>
        {/* mini brand */}
        <div className='mb-6 flex justify-center'>
          <div className='flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2'>
            <span className='text-base font-bold text-white'>IQode</span>
            <span className='text-base font-bold text-orange-400'> Lab</span>
          </div>
        </div>
        <h2 className='text-3xl font-extrabold tracking-tight text-white md:text-4xl'>
          {t('heading')}
        </h2>
        <p className='mt-4 text-sm leading-relaxed text-white/60 md:text-base'>{t('desc')}</p>
        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <Link
            href='/contact'
            className='inline-flex h-11 items-center gap-2 rounded-lg bg-cyan-500 px-7 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-cyan-400'
          >
            {t('ctaPrimary')}
          </Link>
          <Link
            href='/courses'
            className='inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 px-7 text-sm font-semibold text-white hover:bg-white/5'
          >
            {t('ctaSecondary')}
            <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page assembly ────────────────────────────────────────────────────────────

export function HomeLanding({ user }: { user?: AuthUser | null }) {
  return (
    <div className='min-h-screen overflow-x-hidden bg-white'>
      <HeroSection user={user} />
      <FeaturedCoursesSection />
      <MethodPreviewSection />
      <LearningJourneySection />
      <TestimonialsSection />
      <CtaBannerSection />
      <PublicFooter />
    </div>
  );
}
