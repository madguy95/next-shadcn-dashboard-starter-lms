import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getPublicCourses } from '@/api/courses/service';
import type { CourseCategory, CourseLevel, PublicCourse } from '@/api/courses/types';
import { roleMeta } from '@/config/nav-config';
import { formatVND } from '@/features/parent/data';
import { getAuthUser } from '@/lib/auth';
import { logout } from '@/lib/auth-actions';

// Hue + chip color per course category. Used to give each card a distinct accent
// without needing a per-course config.
const categoryAccents: Record<CourseCategory, { hue: number; chip: string }> = {
  coding: { hue: 195, chip: 'text-cyan-300' },
  design: { hue: 320, chip: 'text-pink-300' },
  robotics: { hue: 270, chip: 'text-violet-300' },
  stem: { hue: 30, chip: 'text-orange-300' },
  language: { hue: 145, chip: 'text-emerald-300' },
  game: { hue: 350, chip: 'text-rose-300' }
};

const levelLabel: Record<CourseLevel, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao'
};

// 30-day window: anything published this month gets a "Mới" badge.
const NEW_BADGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function isRecent(iso?: string): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < NEW_BADGE_WINDOW_MS;
}

export const metadata = {
  title: 'IQode Lab — Build thinking, not just coding.'
};

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
  const accent = categoryAccents[course.category] ?? { hue: 200, chip: 'text-cyan-300' };
  const isNew = isRecent(course.createdAt);
  const goalsText = course.tagline?.trim() || course.description?.trim() || '';

  return (
    <Link
      // Deep-link by course code so the enrollment view can auto-open the detail sheet.
      href={`/courses?course=${encodeURIComponent(course.code)}`}
      aria-label={`Xem khóa ${course.title}`}
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
              ✨ Mới
            </span>
          )}
        </div>

        <div>
          <h3 className='text-lg leading-tight font-semibold tracking-tight text-white'>
            {course.title}
          </h3>
          <div className='mt-1 text-xs text-white/50'>
            Độ tuổi {course.minAge}–{course.maxAge} · {levelLabel[course.level]}
          </div>
        </div>

        {goalsText && (
          <p className='line-clamp-3 text-sm leading-relaxed text-white/70'>{goalsText}</p>
        )}

        <div className='mt-auto flex flex-wrap items-center gap-3 pt-3 text-[11px] text-white/50'>
          <span className='inline-flex items-center gap-1'>
            <Icons.book className='size-3' />
            {course.totalSessions} buổi
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
            <div className='text-[10px] text-white/40'>/khóa</div>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${accent.chip} transition-transform group-hover:translate-x-0.5`}
          >
            Tìm hiểu
            <Icons.arrowRight className='size-3' />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyCoursesState() {
  return (
    <div className='col-span-full rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur'>
      <Icons.info className='mx-auto size-6 text-white/40' />
      <div className='mt-3 text-sm font-medium text-white/80'>Đang cập nhật danh sách khóa học</div>
      <p className='mt-1 text-xs text-white/50'>
        Trung tâm sẽ sớm công bố các khóa mới. Hãy quay lại sau hoặc liên hệ tư vấn.
      </p>
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

export default async function LandingPage() {
  const [courses, user] = await Promise.all([loadPublicCourses(), getAuthUser()]);
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
          {user && workspace ? (
            <>
              <span className='hidden text-sm text-white/60 sm:inline'>
                Xin chào, <span className='text-white'>{user.name || user.phone}</span>
              </span>
              <Link
                href={workspace.basePath}
                className='inline-flex h-9 items-center gap-1.5 rounded-md bg-cyan-400 px-4 text-sm font-medium text-black transition-colors hover:bg-cyan-300'
              >
                Vào workspace {workspace.label}
                <Icons.arrowRight className='size-3.5' />
              </Link>
              <form action={logout}>
                <button
                  type='submit'
                  className='text-sm text-white/70 transition-colors hover:text-white'
                >
                  Đăng xuất
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href='/login'
                className='text-sm text-white/70 transition-colors hover:text-white'
              >
                Đăng nhập
              </Link>
              <Link
                href='/login?mode=register'
                className='inline-flex h-9 items-center gap-1.5 rounded-md bg-cyan-400 px-4 text-sm font-medium text-black transition-colors hover:bg-cyan-300'
              >
                Đăng ký
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
        <p className='mt-6 max-w-xl text-base text-white/80 md:text-lg'>
          Build thinking, not just coding.
        </p>
        <p className='mt-3 max-w-md text-sm text-white/50'>
          Học viện lập trình tư duy dành cho học sinh 6 — 16 tuổi. Học bằng dự án, bằng câu hỏi,
          bằng sự tò mò.
        </p>

        <div className='mt-10 flex flex-wrap items-center justify-center gap-3'>
          {user && workspace ? (
            <Button
              asChild
              className='h-11 rounded-md bg-cyan-400 px-6 text-base font-medium text-black hover:bg-cyan-300'
            >
              <Link href={workspace.basePath}>
                Vào workspace {workspace.label}
                <Icons.arrowRight className='ml-1 size-4' />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                className='h-11 rounded-md bg-cyan-400 px-6 text-base font-medium text-black hover:bg-cyan-300'
              >
                <Link href='/login'>Đăng nhập</Link>
              </Button>
              <Button
                asChild
                variant='outline'
                className='h-11 rounded-md border-white/20 bg-transparent px-6 text-base font-medium text-white hover:bg-white/10 hover:text-white'
              >
                <Link href='/login?mode=register'>
                  Đăng ký
                  <Icons.arrowRight className='ml-1 size-4' />
                </Link>
              </Button>
            </>
          )}
        </div>
      </main>

      <section className='relative z-10 px-6 pt-4 pb-16 md:px-10 md:pb-24'>
        <div className='mx-auto max-w-6xl'>
          <div className='mb-10 flex flex-wrap items-end justify-between gap-4'>
            <div>
              <div className='text-[11px] tracking-wider text-cyan-300/80 uppercase'>
                Curriculum
              </div>
              <h2 className='mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl'>
                Khóa học nổi bật
              </h2>
              <p className='mt-2 max-w-xl text-sm text-white/50'>
                Lộ trình từ Scratch kéo–thả đến Python, Web và AI — thiết kế theo độ tuổi và tốc độ
                tiếp thu của từng học sinh.
              </p>
            </div>
            <Link
              href='/courses'
              className='inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white'
            >
              Xem tất cả khóa học
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

          {user?.role === 'parent' ? (
            <div className='mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-8'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div className='flex items-start gap-4'>
                  <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30'>
                    <Icons.sparkles className='size-5' />
                  </span>
                  <div>
                    <div className='text-base font-semibold tracking-tight text-white'>
                      Đăng ký khóa mới cho con
                    </div>
                    <p className='mt-1 max-w-md text-sm text-white/60'>
                      Chọn khóa phù hợp với độ tuổi và sở thích — đội ngũ IQode Lab sẽ tư vấn lộ
                      trình tốt nhất.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className='h-10 rounded-md bg-cyan-400 px-5 text-sm font-medium text-black hover:bg-cyan-300'
                >
                  <Link href='/courses'>
                    Đăng ký khóa mới
                    <Icons.arrowRight className='ml-1 size-4' />
                  </Link>
                </Button>
              </div>
            </div>
          ) : user ? null : (
            <div className='mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-8'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div className='flex items-start gap-4'>
                  <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30'>
                    <Icons.sparkles className='size-5' />
                  </span>
                  <div>
                    <div className='text-base font-semibold tracking-tight text-white'>
                      Chưa biết bắt đầu từ đâu?
                    </div>
                    <p className='mt-1 max-w-md text-sm text-white/60'>
                      Đăng ký buổi học thử miễn phí — đội ngũ IQode Lab sẽ tư vấn lộ trình phù hợp
                      nhất cho con.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className='h-10 rounded-md bg-cyan-400 px-5 text-sm font-medium text-black hover:bg-cyan-300'
                >
                  <Link href='/login?mode=register'>
                    Đăng ký học thử
                    <Icons.arrowRight className='ml-1 size-4' />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className='relative z-10 border-t border-white/10 px-6 py-6 md:px-10'>
        <div className='mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-white/40'>
          <span>© 2026 IQodeLab. Build thinking, not just coding.</span>
          <div className='flex items-center gap-4'>
            <Link href='/privacy-policy' className='hover:text-white/70'>
              Chính sách
            </Link>
            <Link href='/terms-of-service' className='hover:text-white/70'>
              Điều khoản
            </Link>
            <a href='mailto:iqode.file@gmail.com' className='hover:text-white/70'>
              Liên hệ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
