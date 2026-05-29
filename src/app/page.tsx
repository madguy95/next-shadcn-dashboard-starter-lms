import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Button } from '@/components/ui/button';
import { getPublicHomeFeed, type HomeFeedItem } from '@/api/blog';
import { getPublicCourses } from '@/api/courses/service';
import type { PublicCourse } from '@/api/courses/types';
import { roleMeta } from '@/config/nav-config';
import { formatVND } from '@/features/parent/data';
import { HomeFeed } from '@/features/blog/components/home-feed';
import { getAuthUser } from '@/lib/auth';
import { logout } from '@/lib/auth-actions';

// Hue + chip color per tool. Used to give each card a distinct accent without
// needing a per-course config.
const toolAccents: Record<string, { hue: number; chip: string; label: string }> = {
  mtiny: { hue: 30, chip: 'text-orange-300', label: 'mTiny' },
  scratch: { hue: 195, chip: 'text-cyan-300', label: 'Scratch' },
  mbot2: { hue: 270, chip: 'text-violet-300', label: 'mBot2' },
  techai: { hue: 145, chip: 'text-emerald-300', label: 'TechAI' },
  violin: { hue: 320, chip: 'text-pink-300', label: 'Violin' }
};
const DEFAULT_ACCENT = { hue: 200, chip: 'text-cyan-300', label: '' };

// 30-day window: anything published this month gets a "Mới" badge.
const NEW_BADGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function isRecent(iso?: string): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < NEW_BADGE_WINDOW_MS;
}

export async function generateMetadata() {
  const t = await getTranslations('home');
  return { title: t('metaTitle') };
}

// Always render fresh on each request — the landing page should reflect newly published courses
// without waiting for ISR. Switch to `revalidate` if traffic warrants caching.
export const dynamic = 'force-dynamic';

function BrandAsterisk({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 64 64'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <circle cx='32' cy='32' r='3.5' fill='currentColor' stroke='none' />
      <line x1='32' y1='32' x2='32' y2='10' />
      <circle cx='32' cy='10' r='2.5' fill='currentColor' stroke='none' />
      <line x1='32' y1='32' x2='32' y2='54' />
      <circle cx='32' cy='54' r='2.5' fill='currentColor' stroke='none' />
      <line x1='32' y1='32' x2='10' y2='32' />
      <circle cx='10' cy='32' r='2.5' fill='currentColor' stroke='none' />
      <line x1='32' y1='32' x2='54' y2='32' />
      <circle cx='54' cy='32' r='2.5' fill='currentColor' stroke='none' />
      <line x1='32' y1='32' x2='15' y2='15' />
      <circle cx='15' cy='15' r='2.5' fill='currentColor' stroke='none' />
      <line x1='32' y1='32' x2='49' y2='49' />
      <circle cx='49' cy='49' r='2.5' fill='currentColor' stroke='none' />
      <line x1='32' y1='32' x2='49' y2='15' />
      <circle cx='49' cy='15' r='2.5' fill='currentColor' stroke='none' />
      <line x1='32' y1='32' x2='15' y2='49' />
      <circle cx='15' cy='49' r='2.5' fill='currentColor' stroke='none' />
    </svg>
  );
}

function CourseCard({ course }: { course: PublicCourse }) {
  const t = useTranslations('home.courses');
  const tHeader = useTranslations('home.header');
  const accent = toolAccents[course.tool] ?? { ...DEFAULT_ACCENT, label: course.tool };
  const isNew = isRecent(course.createdAt);
  const goalsText = course.tagline?.trim() || course.description?.trim() || '';

  return (
    <Link
      // Deep-link by course code so the enrollment view can auto-open the detail sheet.
      href={`/courses?course=${encodeURIComponent(course.code)}`}
      aria-label={tHeader('courseAriaLabel', { title: course.title })}
      className='group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur transition-all hover:border-white/30 hover:bg-white/[0.08]'
    >
      {course.coverUrl ? (
        <div className='relative h-32 w-full overflow-hidden'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.coverUrl}
            alt={course.title}
            className='absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent' />
        </div>
      ) : (
        <div
          className='relative h-1.5 w-full'
          style={{
            background: `linear-gradient(90deg, hsl(${accent.hue} 70% 55%), hsl(${accent.hue} 80% 65%))`
          }}
        />
      )}
      <div
        className='pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-30 transition-opacity group-hover:opacity-60'
        style={{
          background: `radial-gradient(circle, hsl(${accent.hue} 70% 55% / 0.6), transparent 60%)`
        }}
      />

      <div className='relative flex flex-1 flex-col gap-3 p-6'>
        <div className='flex items-center justify-between'>
          <span className={`font-mono text-[11px] tracking-wider ${accent.chip}`}>
            {course.code}
          </span>
          {isNew && (
            <span className='inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200'>
              {t('newBadge')}
            </span>
          )}
        </div>

        <div>
          <h3 className='text-lg leading-tight font-semibold tracking-tight text-white'>
            {course.title}
          </h3>
          <div className='mt-1 text-xs text-white/50'>
            {t('ageRange', { min: course.minAge, max: course.maxAge })}
            {accent.label ? ` · ${accent.label}` : ''}
          </div>
        </div>

        {goalsText && (
          <p className='line-clamp-3 text-sm leading-relaxed text-white/70'>{goalsText}</p>
        )}

        <div className='mt-auto flex flex-wrap items-center gap-3 pt-3 text-[11px] text-white/50'>
          <span className='inline-flex items-center gap-1'>
            <Icons.book className='size-3' />
            {t('sessionsLabel', { count: course.totalSessions })}
          </span>
          <span className='inline-flex items-center gap-1'>
            <Icons.clock className='size-3' />
            {course.sessionDurationMinutes}′
          </span>
        </div>

        <div className='flex items-baseline justify-between border-t border-white/10 pt-4'>
          <div>
            <div className='text-sm font-semibold text-white'>
              {formatVND(course.tuitionAmount)}
            </div>
            {course.originalTuitionAmount &&
              course.originalTuitionAmount > course.tuitionAmount && (
                <div className='text-[10px] text-white/40 line-through'>
                  {formatVND(course.originalTuitionAmount)}
                </div>
              )}
            <div className='text-[10px] text-white/40'>{t('perCourse')}</div>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${accent.chip} transition-transform group-hover:translate-x-0.5`}
          >
            {t('learnMore')}
            <Icons.arrowRight className='size-3' />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyCoursesState() {
  const t = useTranslations('home.courses');
  return (
    <div className='col-span-full rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur'>
      <Icons.info className='mx-auto size-6 text-white/40' />
      <div className='mt-3 text-sm font-medium text-white/80'>{t('emptyTitle')}</div>
      <p className='mt-1 text-xs text-white/50'>{t('emptyDescription')}</p>
    </div>
  );
}

// Fetch landing-page courses server-side. Swallow errors so a BE outage doesn't 500
// the marketing site — we show the empty state instead.
async function loadPublicCourses(): Promise<PublicCourse[]> {
  try {
    return await getPublicCourses(4);
  } catch {
    return [];
  }
}

// The blog/workshop feed is mock-backed (in-memory), but wrap in try/catch
// anyway so a future swap to a real BE follows the same outage-safe pattern as
// the courses fetch above.
async function loadHomeFeed(): Promise<HomeFeedItem[]> {
  try {
    return await getPublicHomeFeed(4);
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const [courses, feed, user, t] = await Promise.all([
    loadPublicCourses(),
    loadHomeFeed(),
    getAuthUser(),
    getTranslations('home')
  ]);
  const workspace = user ? roleMeta[user.role] : null;

  return (
    <div className='relative min-h-screen overflow-hidden bg-black text-white'>
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.07]'
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '56px 56px'
        }}
      />
      <div
        className='pointer-events-none absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full'
        style={{
          background: 'radial-gradient(ellipse at center, rgba(20,210,220,0.18), transparent 60%)'
        }}
      />
      <div
        className='pointer-events-none absolute right-0 bottom-0 h-[400px] w-[500px] rounded-full'
        style={{
          background: 'radial-gradient(ellipse at center, rgba(244,164,96,0.12), transparent 70%)'
        }}
      />

      <header className='relative z-10 flex items-center justify-between px-6 py-5 md:px-10'>
        <div className='flex items-center gap-2'>
          <span className='text-xl font-bold tracking-tight text-cyan-400'>
            IQode<span className='font-light text-orange-300'>Lab</span>
          </span>
        </div>
        <div className='flex items-center gap-3'>
          {/* Language picker — overrides ghost-button tokens because the
              landing page is hard-coded dark; without these overrides the
              theme-tinted ghost styles get washed out against pure black. */}
          <LanguageSwitcher className='text-white/70 hover:bg-white/10 hover:text-white' />
          {user && workspace ? (
            <>
              <span className='hidden text-sm text-white/60 sm:inline'>
                {t('header.greeting')} <span className='text-white'>{user.name || user.phone}</span>
              </span>
              <Link
                href={workspace.basePath}
                className='inline-flex h-9 items-center gap-1.5 rounded-md bg-cyan-400 px-4 text-sm font-medium text-black transition-colors hover:bg-cyan-300'
              >
                {t('header.enterWorkspace', { label: workspace.label })}
                <Icons.arrowRight className='size-3.5' />
              </Link>
              <form action={logout}>
                <button
                  type='submit'
                  className='text-sm text-white/70 transition-colors hover:text-white'
                >
                  {t('header.logout')}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href='/login'
                className='text-sm text-white/70 transition-colors hover:text-white'
              >
                {t('header.login')}
              </Link>
              <Link
                href='/login?mode=register'
                className='inline-flex h-9 items-center gap-1.5 rounded-md bg-cyan-400 px-4 text-sm font-medium text-black transition-colors hover:bg-cyan-300'
              >
                {t('header.register')}
                <Icons.arrowRight className='size-3.5' />
              </Link>
            </>
          )}
        </div>
      </header>

      <main className='relative z-10 flex flex-col items-center px-6 pt-16 pb-12 text-center md:pt-24'>
        <div className='relative inline-flex items-baseline gap-3'>
          <h1 className='text-7xl font-bold tracking-tight text-cyan-400 sm:text-8xl md:text-9xl'>
            IQode
          </h1>
          <div className='relative'>
            <span className='text-3xl font-light text-orange-300 sm:text-4xl md:text-5xl'>Lab</span>
            <BrandAsterisk className='text-orange-300 absolute -top-6 -right-7 size-10 md:-top-8 md:-right-9 md:size-12' />
          </div>
        </div>
        <p className='mt-6 max-w-xl text-base text-white/80 md:text-lg'>{t('hero.tagline')}</p>
        <p className='mt-3 max-w-md text-sm text-white/50'>{t('hero.description')}</p>

        {user && workspace ? (
          <div className='mt-10 flex flex-wrap items-center justify-center gap-3'>
            <Button
              asChild
              className='h-11 rounded-md bg-cyan-400 px-6 text-base font-medium text-black hover:bg-cyan-300'
            >
              <Link href={workspace.basePath}>
                {t('header.enterWorkspace', { label: workspace.label })}
                <Icons.arrowRight className='ml-1 size-4' />
              </Link>
            </Button>
          </div>
        ) : (
          // Guest hero CTA — login/register live in the header for returning
          // users, so the hero focuses on the lead-gen ask (free trial class)
          // instead of repeating the same auth buttons.
          <div className='mt-10 flex flex-col items-center gap-3'>
            <span className='text-sm text-white/60'>{t('hero.guestEyebrow')}</span>
            <Button
              asChild
              className='h-12 rounded-md bg-cyan-400 px-7 text-base font-semibold text-black hover:bg-cyan-300'
            >
              <Link href='/login?mode=register'>
                {t('hero.guestCta')}
                <Icons.arrowRight className='ml-1 size-4' />
              </Link>
            </Button>
            <p className='mt-1 max-w-sm text-xs text-white/40'>{t('hero.guestHint')}</p>
          </div>
        )}
      </main>

      <section className='relative z-10 px-6 pt-4 pb-16 md:px-10 md:pb-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-10 flex flex-wrap items-end justify-between gap-4'>
            <div>
              <div className='text-[11px] tracking-wider text-cyan-300/80 uppercase'>
                {t('courses.eyebrow')}
              </div>
              <h2 className='mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl'>
                {t('courses.title')}
              </h2>
              <p className='mt-2 max-w-xl text-sm text-white/50'>{t('courses.description')}</p>
            </div>
            <Link
              href='/courses'
              className='inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white'
            >
              {t('courses.viewAll')}
              <Icons.arrowRight className='size-3.5' />
            </Link>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {courses.length === 0 ? (
              <EmptyCoursesState />
            ) : (
              courses.map((c) => <CourseCard key={c.id} course={c} />)
            )}
          </div>
        </div>
      </section>

      <HomeFeed items={feed} />

      {/* Parent contextual CTA — kept near the bottom because it's about
          courses, which were the section above. Guests already got their CTA
          ("Đăng ký học thử") in the hero so they don't need a second ask here;
          teachers aren't a conversion target. */}
      {user?.role === 'parent' && (
        <section className='relative z-10 px-6 pt-4 pb-16 md:px-10 md:pb-20'>
          <div className='mx-auto max-w-6xl'>
            <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-8'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div className='flex items-start gap-4'>
                  <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30'>
                    <Icons.sparkles className='size-5' />
                  </span>
                  <div>
                    <div className='text-base font-semibold tracking-tight text-white'>
                      {t('parentCta.title')}
                    </div>
                    <p className='mt-1 max-w-md text-sm text-white/60'>
                      {t('parentCta.description')}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className='h-10 rounded-md bg-cyan-400 px-5 text-sm font-medium text-black hover:bg-cyan-300'
                >
                  <Link href='/courses'>
                    {t('parentCta.button')}
                    <Icons.arrowRight className='ml-1 size-4' />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className='relative z-10 border-t border-white/10 px-6 py-6 md:px-10'>
        <div className='mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-white/40'>
          <span>{t('footer.copyright')}</span>
          <div className='flex items-center gap-4'>
            <Link href='/privacy-policy' className='hover:text-white/70'>
              {t('footer.privacy')}
            </Link>
            <Link href='/terms-of-service' className='hover:text-white/70'>
              {t('footer.terms')}
            </Link>
            <a href='mailto:iqode.file@gmail.com' className='hover:text-white/70'>
              {t('footer.contact')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
