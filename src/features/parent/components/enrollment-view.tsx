'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { Icons } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { publicCoursesOptions, PUBLIC_COURSES_PAGE_SIZE } from '@/api/courses/queries';
import { masterDataOptions } from '@/api/master-data';
import { cn } from '@/lib/utils';
import {
  formatVND,
  parentChildren,
  publicCourseToParentCourse,
  type ClassOption,
  type ParentChild,
  type ParentCourse
} from '@/features/parent/data';
import { teacherClasses, classStatusLabel } from '@/features/teacher/data';
import { ConsultationRequestDialog } from '@/features/public/components/consultation-request-dialog';
import { ClassPickerDialog } from './class-picker-dialog';
import { ConfirmEnrollmentDialog } from './confirm-enrollment-dialog';
import { CourseDetailSheet } from './course-detail-sheet';
import type { MasterDataItem } from '@/api/master-data';

// ─── Hero ───────────────────────────────────────────────────────────────────
// Dark marketing hero matching the about/method pages. Role-aware copy comes
// from the `coursesCatalog` namespace (guestTitle / parentTitle / …).

export function CoursesHero() {
  const t = useTranslations('coursesCatalog');
  const { user } = useAuth();
  const role = user?.role ?? null;
  const titleKey = (role ? `${role}Title` : 'guestTitle') as
    | 'guestTitle'
    | 'parentTitle'
    | 'adminTitle'
    | 'teacherTitle';
  const descKey = (role ? `${role}Description` : 'guestDescription') as
    | 'guestDescription'
    | 'parentDescription'
    | 'adminDescription'
    | 'teacherDescription';

  return (
    <section className='relative overflow-hidden bg-[#0b1a2e]'>
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
        className='pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full opacity-20'
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.4), transparent 65%)' }}
      />
      <div
        className='pointer-events-none absolute -bottom-24 left-0 h-[280px] w-[360px] rounded-full opacity-10'
        style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.5), transparent 65%)' }}
      />

      <div className='relative z-10 mx-auto max-w-6xl px-6 py-16 text-center md:px-10 md:py-20'>
        <span className='mb-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium tracking-widest text-cyan-300 uppercase'>
          <Icons.book className='size-3' />
          IQode Lab
        </span>
        <h1 className='mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight'>
          {t(titleKey)}
        </h1>
        <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base'>
          {t(descKey)}
        </p>

        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <HeroCta role={role} t={t} />
        </div>
      </div>
    </section>
  );
}

function HeroCta({
  role,
  t
}: {
  role: 'admin' | 'teacher' | 'parent' | null;
  t: ReturnType<typeof useTranslations>;
}) {
  const primary =
    'inline-flex h-11 items-center gap-2 rounded-lg bg-cyan-500 px-6 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-cyan-400';

  if (role === 'admin') {
    return (
      <Link href='/admin/courses' className={primary}>
        <Icons.settings className='size-4' />
        {t('header.adminManage')}
        <Icons.arrowRight className='size-4' />
      </Link>
    );
  }
  if (role === 'teacher') {
    return (
      <Link href='/teacher/classes' className={primary}>
        <Icons.teams className='size-4' />
        {t('header.teacherMyClasses')}
        <Icons.arrowRight className='size-4' />
      </Link>
    );
  }
  if (role === 'parent') {
    return (
      <a href='#catalog' className={primary}>
        <Icons.sparkles className='size-4' />
        {t('header.parentAdvise')}
        <Icons.arrowRight className='size-4' />
      </a>
    );
  }
  // guest — no CTA buttons in the hero
  return null;
}

// ─── Course card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  selected,
  onOpenDetail,
  onConsult
}: {
  course: ParentCourse;
  selected: boolean;
  onOpenDetail: () => void;
  onConsult: () => void;
}) {
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail();
        }
      }}
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition-all',
        'hover:border-gray-300 hover:shadow-md',
        'focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:outline-none',
        selected && 'border-cyan-500 ring-2 ring-cyan-500/40'
      )}
    >
      {/* cover */}
      <div className='relative h-40 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50'>
        {course.coverUrl ? (
          <>
            <Image
              src={course.coverUrl}
              alt={course.name}
              fill
              sizes='(min-width: 640px) 50vw, 100vw'
              className='object-cover transition-transform duration-500 group-hover:scale-105'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent' />
          </>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <Icons.code className='size-10 text-blue-200' />
          </div>
        )}
        <div className='absolute top-3 left-3 flex flex-wrap gap-1.5'>
          {course.popular && (
            <span className='rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase'>
              ★ Phổ biến
            </span>
          )}
          {course.isNew && (
            <span className='rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase'>
              Mới
            </span>
          )}
        </div>
        <span className='absolute top-3 right-3 rounded-full bg-white/85 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-gray-600 backdrop-blur'>
          {course.code}
        </span>
        {selected && (
          <span className='absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-cyan-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm'>
            <Icons.check className='size-3' />
            Đã chọn
          </span>
        )}
      </div>

      <div className='flex flex-1 flex-col gap-3 p-5'>
        <div className='flex items-center gap-2 text-[11px] text-gray-400'>
          <span>{course.ageRange} tuổi</span>
          <span className='h-1 w-1 rounded-full bg-gray-200' />
          <span className='inline-flex items-center gap-1'>
            <Icons.book className='size-3' /> {course.sessions} buổi
          </span>
        </div>

        <h3 className='text-[15px] leading-snug font-semibold text-gray-900'>{course.name}</h3>

        <p className='line-clamp-2 text-[12px] leading-relaxed text-gray-500'>
          {course.description}
        </p>

        <div className='mt-auto flex items-end justify-between gap-2 border-t border-gray-100 pt-4'>
          <div>
            <div className='text-base font-bold text-gray-900'>{formatVND(course.price)}</div>
            <div className='mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-gray-400'>
              <Icons.star className='size-3 fill-amber-400 text-amber-400' />
              {course.rating} · {course.learners} học viên
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onConsult();
              }}
              className='inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900'
            >
              Tư vấn
            </button>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail();
              }}
              className='inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700'
            >
              Xem chi tiết
              <Icons.arrowRight className='size-3' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({
  search,
  onSearch,
  tool,
  onTool,
  toolItems,
  sort,
  onSort
}: {
  search: string;
  onSearch: (v: string) => void;
  tool: string;
  onTool: (v: string) => void;
  toolItems: MasterDataItem[];
  sort: string;
  onSort: (v: string) => void;
}) {
  return (
    <div className='flex flex-wrap items-center gap-2 border-t border-gray-100 bg-gray-50/60 p-4'>
      <div className='relative flex-1 sm:max-w-56'>
        <Icons.search className='absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400' />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder='Tìm khóa học…'
          className='h-8 border-gray-200 bg-white pl-8 text-xs'
        />
      </div>
      <Select value={tool || 'all'} onValueChange={(v) => onTool(v === 'all' ? '' : v)}>
        <SelectTrigger className='h-8 w-36 border-gray-200 bg-white text-xs'>
          <SelectValue placeholder='Công cụ' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Tất cả công cụ</SelectItem>
          {toolItems.map((item) => (
            <SelectItem key={item.id} value={item.code}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className='flex-1' />
      <Select value={sort} onValueChange={onSort}>
        <SelectTrigger className='h-8 w-40 border-gray-200 bg-white text-xs'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='popular'>Phổ biến</SelectItem>
          <SelectItem value='recent'>Mới khai giảng</SelectItem>
          <SelectItem value='price-asc'>Học phí thấp → cao</SelectItem>
          <SelectItem value='rating'>Đánh giá cao</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Parent summary panel ───────────────────────────────────────────────────

function SummaryPanel({
  child,
  course,
  klass,
  trial,
  onTrial,
  waitlist,
  onWaitlist,
  note,
  setNote,
  reqId,
  hasConflict,
  onContinue,
  onSwitchChild
}: {
  child: ParentChild;
  course: ParentCourse | null;
  klass: ClassOption | null;
  trial: boolean;
  onTrial: (v: boolean) => void;
  waitlist: boolean;
  onWaitlist: (v: boolean) => void;
  note: string;
  setNote: (v: string) => void;
  reqId: string;
  hasConflict: boolean;
  onContinue: () => void;
  onSwitchChild: () => void;
}) {
  const fee = course ? (trial ? 0 : course.price) : null;

  return (
    <aside className='space-y-4 lg:sticky lg:top-24'>
      <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between gap-3 border-b border-gray-100 p-4'>
          <div className='text-sm font-semibold tracking-tight text-gray-900'>Tóm tắt đăng ký</div>
          <span className='font-mono text-[11px] text-gray-400'>{reqId}</span>
        </div>

        {hasConflict && (
          <div className='mx-4 mt-4 flex gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-900'>
            <Icons.warning className='mt-0.5 size-4 shrink-0 text-amber-500' />
            <div>
              <div className='mb-0.5 font-semibold'>Đang học khóa tương đương</div>
              <div className='opacity-80'>
                {child.name} đang trong &quot;Scratch Cơ bản&quot;. Bạn vẫn muốn đăng ký song song?
              </div>
            </div>
          </div>
        )}

        <dl className='space-y-3 p-4 text-sm'>
          <SummaryRow label='Học sinh'>
            <div className='flex items-start justify-end gap-2'>
              <div>
                <div className='font-medium text-gray-900'>{child.name}</div>
                <div className='font-mono text-xs text-gray-400'>
                  {child.age} tuổi · {child.level}
                </div>
              </div>
              <button
                type='button'
                onClick={onSwitchChild}
                className='shrink-0 pt-0.5 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700 hover:no-underline'
              >
                Đổi
              </button>
            </div>
          </SummaryRow>
          <SummaryRow label='Khóa học'>
            {course ? (
              <>
                <div className='font-medium text-gray-900'>{course.name}</div>
                <div className='font-mono text-xs text-gray-400'>
                  {course.code} · {course.sessions} buổi
                </div>
              </>
            ) : (
              <span className='text-gray-400 italic'>Chưa chọn khóa</span>
            )}
          </SummaryRow>
          <SummaryRow label='Lớp'>
            {klass ? (
              <>
                <div className='font-medium text-gray-900'>
                  {klass.id} · {klass.mode}
                </div>
                <div className='font-mono text-xs text-gray-400'>{klass.schedule}</div>
              </>
            ) : (
              <span className='text-gray-400 italic'>Chưa chọn lớp</span>
            )}
          </SummaryRow>
          <SummaryRow label='Khai giảng'>
            <span className={cn('font-mono text-xs', klass ? 'text-gray-700' : 'text-gray-400')}>
              {klass ? klass.start : '—'}
            </span>
          </SummaryRow>
        </dl>

        <div className='space-y-2 border-t border-gray-100 px-4 py-3'>
          <Label
            htmlFor='trial'
            className='flex cursor-pointer items-center gap-2.5 text-sm font-normal text-gray-700'
          >
            <Checkbox id='trial' checked={trial} onCheckedChange={(v) => onTrial(v === true)} />
            <span>
              Đăng ký <b className='font-semibold text-gray-900'>học thử</b> 1 buổi (miễn phí)
            </span>
          </Label>
          <Label
            htmlFor='waitlist'
            className='flex cursor-pointer items-center gap-2.5 text-sm font-normal text-gray-700'
          >
            <Checkbox
              id='waitlist'
              checked={waitlist}
              onCheckedChange={(v) => onWaitlist(v === true)}
            />
            <span>
              Vào danh sách <b className='font-semibold text-gray-900'>chờ</b> nếu lớp đầy
            </span>
          </Label>
        </div>

        <div className='flex items-baseline justify-between border-t border-gray-100 px-4 py-4'>
          <span className='text-sm text-gray-500'>Học phí dự kiến</span>
          <div className='text-right'>
            <div className='text-xl font-bold tracking-tight text-gray-900 tabular-nums'>
              {fee !== null ? formatVND(fee) : '—'}
            </div>
            {trial && course && (
              <div className='font-mono text-[11px] text-gray-400'>miễn phí buổi thử</div>
            )}
          </div>
        </div>

        <div className='space-y-2 border-t border-gray-100 p-4'>
          <Label htmlFor='parent-note' className='text-xs text-gray-400'>
            Ghi chú phụ huynh
          </Label>
          <Textarea
            id='parent-note'
            placeholder='VD: Con mới học lần đầu, mong cô để ý thêm phần làm quen…'
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className='border-gray-200'
          />
        </div>

        <div className='p-4 pt-0'>
          <button
            type='button'
            disabled={!course}
            onClick={onContinue}
            className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {klass ? 'Xác nhận đăng ký' : 'Tiếp tục chọn lớp'}
            <Icons.arrowRight className='size-4' />
          </button>
        </div>
      </div>

      <div className='rounded-2xl border border-gray-200 bg-white'>
        <div className='flex gap-3 p-4 text-xs text-gray-500'>
          <Icons.sparkles className='mt-0.5 size-4 shrink-0 text-cyan-500' />
          <p>
            Đăng ký gửi lên sẽ ở trạng thái{' '}
            <span className='mx-0.5 rounded-md border border-gray-200 px-1.5 py-0.5 align-baseline font-medium text-gray-700'>
              Chờ duyệt
            </span>
            . Trung tâm liên hệ trong 24h để xác nhận lớp.
          </p>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <dt className='min-w-[80px] pt-0.5 text-xs text-gray-400'>{label}</dt>
      <dd className='text-right'>{children}</dd>
    </div>
  );
}

// ─── Admin panel ──────────────────────────────────────────────────────────────

function AdminCoursePanel({ course }: { course: ParentCourse | null }) {
  return (
    <aside className='space-y-4 lg:sticky lg:top-24'>
      <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
        <div className='flex items-center gap-3 border-b border-gray-100 p-4'>
          <span className='grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600'>
            <Icons.settings className='size-4' />
          </span>
          <div>
            <div className='text-sm font-semibold tracking-tight text-gray-900'>
              Quản trị khóa học
            </div>
            <div className='text-[11px] text-gray-400'>Chế độ admin</div>
          </div>
        </div>

        <div className='space-y-4 p-4 text-sm'>
          {course ? (
            <div className='rounded-xl border border-gray-100 bg-gray-50 p-3'>
              <div className='text-[11px] tracking-wider text-gray-400 uppercase'>Khóa đã chọn</div>
              <div className='mt-1 font-medium text-gray-900'>{course.name}</div>
              <div className='font-mono text-[11px] text-gray-400'>
                {course.code} · {course.sessions} buổi · {formatVND(course.price)}
              </div>
            </div>
          ) : (
            <p className='text-xs text-gray-400 italic'>
              Chọn một khóa để mở trang quản lý chi tiết.
            </p>
          )}

          <Link
            href={
              course ? `/admin/courses?course=${encodeURIComponent(course.code)}` : '/admin/courses'
            }
            aria-disabled={!course}
            className={cn(
              'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-semibold text-white transition-colors hover:bg-violet-700',
              !course && 'pointer-events-none opacity-50'
            )}
          >
            <Icons.settings className='size-4' />
            Quản lý khóa học
            <Icons.arrowRight className='size-4' />
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ─── Teacher panel ────────────────────────────────────────────────────────────

function TeacherCoursePanel({ course }: { course: ParentCourse | null }) {
  // Mock teacher data: filter classes the current teacher owns by courseCode match.
  // When wiring to BE, replace with /api/teacher/classes?courseCode={code}.
  const myClasses = useMemo(
    () => (course ? teacherClasses.filter((c) => c.courseCode === course.code) : []),
    [course]
  );

  return (
    <aside className='space-y-4 lg:sticky lg:top-24'>
      <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
        <div className='flex items-center gap-3 border-b border-gray-100 p-4'>
          <span className='grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600'>
            <Icons.teams className='size-4' />
          </span>
          <div>
            <div className='text-sm font-semibold tracking-tight text-gray-900'>Lớp của bạn</div>
            <div className='text-[11px] text-gray-400'>Chế độ giáo viên</div>
          </div>
        </div>

        <div className='space-y-3 p-4 text-sm'>
          {!course ? (
            <p className='text-xs text-gray-400 italic'>
              Chọn một khóa để xem các lớp bạn đang phụ trách.
            </p>
          ) : myClasses.length === 0 ? (
            <div className='rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-center'>
              <div className='text-xs text-gray-400'>
                Bạn chưa có lớp nào thuộc khóa <span className='font-mono'>{course.code}</span>.
              </div>
            </div>
          ) : (
            <>
              <div className='text-[11px] tracking-wider text-gray-400 uppercase'>
                {myClasses.length} lớp thuộc {course.code}
              </div>
              <ul className='space-y-2'>
                {myClasses.map((cl) => (
                  <li key={cl.id}>
                    <Link
                      href={`/teacher/classes/${cl.id}`}
                      className='flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50'
                    >
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-gray-900'>{cl.classLabel}</span>
                          <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500'>
                            {classStatusLabel[cl.status]}
                          </span>
                        </div>
                        <div className='mt-0.5 font-mono text-[11px] text-gray-400'>
                          {cl.schedule} · {cl.location}
                        </div>
                      </div>
                      <Icons.arrowRight className='size-3.5 shrink-0 text-gray-400' />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Role banner ────────────────────────────────────────────────────────────

function RoleBanner({
  role,
  child,
  onSwitchChild
}: {
  role: 'admin' | 'teacher' | 'parent' | null;
  child: ParentChild;
  onSwitchChild: () => void;
}) {
  if (role === 'parent') {
    return (
      <div className='mx-5 mb-3 flex items-center gap-2.5 rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2 text-xs text-gray-600'>
        <Icons.sparkles className='size-3.5 shrink-0 text-cyan-500' />
        <span className='truncate'>
          Đề xuất cho <span className='font-semibold text-gray-900'>{child.name}</span> ·{' '}
          {child.age} tuổi · cấp độ{' '}
          <span className='font-semibold text-gray-900'>{child.level}</span>
        </span>
        <button
          type='button'
          onClick={onSwitchChild}
          className='ml-auto inline-flex shrink-0 items-center gap-1 font-medium text-cyan-700 hover:underline'
        >
          <Icons.teams className='size-3' />
          Đổi học sinh
        </button>
      </div>
    );
  }
  if (role === 'admin') {
    return (
      <div className='mx-5 mb-3 flex items-center gap-2.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700'>
        <Icons.settings className='size-3.5 shrink-0' />
        <span className='truncate'>Chế độ quản trị · mở chi tiết khóa để vào trang quản lý.</span>
      </div>
    );
  }
  if (role === 'teacher') {
    return (
      <div className='mx-5 mb-3 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700'>
        <Icons.teams className='size-3.5 shrink-0' />
        <span className='truncate'>
          Chế độ giáo viên · mở chi tiết khóa để xem lớp bạn phụ trách.
        </span>
      </div>
    );
  }
  // guest
  return (
    <div className='mx-5 mb-3 flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-gray-600'>
      <Icons.info className='size-3.5 shrink-0 text-blue-500' />
      <span className='truncate'>Đăng nhập để đăng ký khóa cho con hoặc vào workspace.</span>
      <Link
        href='/login?mode=register'
        className='ml-auto inline-flex shrink-0 items-center gap-1 font-medium text-blue-600 hover:underline'
      >
        Tạo tài khoản
        <Icons.arrowRight className='size-3' />
      </Link>
    </div>
  );
}

// ─── Pagination bar ───────────────────────────────────────────────────────────

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  const range: (number | '...')[] = [1];
  if (start > 2) range.push('...');
  for (let i = start; i <= end; i++) range.push(i);
  if (end < total - 1) range.push('...');
  range.push(total);
  return range;
}

function CoursePagination({ page, totalPages }: { page: number; totalPages: number }) {
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    params.delete('course');
    return `/courses?${params.toString()}`;
  };

  const pages = buildPageRange(page, totalPages);
  return (
    <div className='flex items-center justify-center gap-1 border-t border-gray-100 py-5'>
      <Link
        href={buildUrl(page - 1)}
        aria-disabled={page === 1}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50',
          page === 1 && 'pointer-events-none opacity-40'
        )}
      >
        <Icons.chevronLeft className='size-4' />
      </Link>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`el-${i}`} className='px-1 text-xs text-gray-400'>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors',
              p === page
                ? 'border-blue-600 bg-blue-600 font-semibold text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildUrl(page + 1)}
        aria-disabled={page === totalPages}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50',
          page === totalPages && 'pointer-events-none opacity-40'
        )}
      >
        <Icons.chevronRight className='size-4' />
      </Link>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function EnrollmentView() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const isParent = role === 'parent';
  const hasSidebar = role === 'parent' || role === 'admin' || role === 'teacher';
  const [childIdx, setChildIdx] = useState(0);
  const child = parentChildren[childIdx];

  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [tool, setTool] = useQueryState('tool', parseAsString);
  const [sort, setSort] = useState('popular');

  const { data: pagedCourses, isFetching } = useQuery(
    publicCoursesOptions({
      page,
      size: PUBLIC_COURSES_PAGE_SIZE,
      search: search || undefined,
      tool: tool ?? undefined,
      sort: sort !== 'popular' ? sort : undefined
    })
  );
  const { data: toolItems } = useQuery(masterDataOptions('tool'));

  const courses = useMemo<ParentCourse[]>(
    () => (pagedCourses?.data ?? []).map(publicCourseToParentCourse),
    [pagedCourses]
  );
  const totalPages = pagedCourses?.pageCount ?? 1;

  // Deep-link: /courses?course=SC-101 opens that course's detail sheet on mount.
  const initialCourseCode = searchParams.get('course');

  const [courseId, setCourseId] = useState<string | null>(null);
  const course = courses.find((c) => c.id === courseId) ?? null;

  const [klass, setKlass] = useState<ClassOption | null>(null);
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const [consultCourseId, setConsultCourseId] = useState<string | null>(null);
  const detailCourse = detailCourseId
    ? (courses.find((c) => c.id === detailCourseId) ?? null)
    : null;
  const consultCourse = consultCourseId
    ? (courses.find((c) => c.id === consultCourseId) ?? null)
    : null;

  // Once the course list lands, sync selection to either the deep-linked course (via ?course=code)
  // or fall back to the first item. Re-run when the list changes (e.g. refetch).
  const didApplyDeepLink = useState({ done: false })[0];
  useEffect(() => {
    if (courses.length === 0) return;
    if (!didApplyDeepLink.done && initialCourseCode) {
      const match = courses.find((c) => c.code === initialCourseCode);
      if (match) {
        setCourseId(match.id);
        setDetailCourseId(match.id);
      } else if (!courseId) {
        setCourseId(courses[0].id);
      }
      didApplyDeepLink.done = true;
      return;
    }
    if (!courseId) {
      setCourseId(courses[0].id);
    }
  }, [courses, initialCourseCode, courseId, didApplyDeepLink]);

  const [trial, setTrial] = useState(false);
  const [waitlist, setWaitlist] = useState(false);
  const [note, setNote] = useState('');
  const [reqId] = useState(() => `REQ-${Math.floor(1000 + Math.random() * 9000)}`);

  // The original "conflict" warning was hard-coded against a mock id; without real enrollment
  // data we can't reliably detect overlapping courses, so leave the banner off for now.
  const hasConflict = false;

  const handleContinue = () => {
    if (!klass) setShowClassDialog(true);
    else setShowConfirm(true);
  };

  const handleSubmit = () => {
    setShowConfirm(false);
    toast.success(`Đã gửi đăng ký · ${reqId}`, {
      description: 'Trạng thái: Chờ duyệt. Trung tâm sẽ liên hệ trong 24h.'
    });
  };

  const switchChild = () => setChildIdx((childIdx + 1) % parentChildren.length);

  return (
    <>
      <div
        id='catalog'
        className={cn(
          'grid grid-cols-1 items-start gap-6',
          hasSidebar && 'lg:grid-cols-[1fr_340px]'
        )}
      >
        <div className='min-w-0 space-y-4'>
          <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
            <div className='flex items-center justify-between gap-3 px-5 pt-5 pb-3'>
              <div className='flex min-w-0 items-baseline gap-2'>
                <h2 className='text-lg font-bold tracking-tight text-gray-900'>Khóa học phù hợp</h2>
                <span className='rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-500'>
                  {`${pagedCourses?.total ?? 0} kết quả`}
                </span>
              </div>
            </div>

            <RoleBanner role={role} child={child} onSwitchChild={switchChild} />

            <FilterBar
              search={search}
              onSearch={(v) => {
                void setSearch(v || null);
              }}
              tool={tool ?? ''}
              onTool={(v) => {
                void setTool(v || null);
              }}
              toolItems={toolItems ?? []}
              sort={sort}
              onSort={setSort}
            />

            <div
              className={cn(
                'grid grid-cols-1 gap-4 p-5 sm:grid-cols-2',
                !hasSidebar && 'lg:grid-cols-3',
                isFetching && 'opacity-60 transition-opacity duration-150'
              )}
            >
              {courses.length === 0 ? (
                <div className='col-span-full rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-400'>
                  Trung tâm đang cập nhật danh sách khóa học. Vui lòng quay lại sau.
                </div>
              ) : (
                courses.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    selected={courseId === c.id}
                    onOpenDetail={() => {
                      setDetailCourseId(c.id);
                      setCourseId(c.id);
                      setKlass(null);
                    }}
                    onConsult={() => setConsultCourseId(c.id)}
                  />
                ))
              )}
            </div>

            <CoursePagination page={page} totalPages={totalPages} />
          </div>
        </div>

        {role === 'parent' ? (
          <SummaryPanel
            child={child}
            course={course}
            klass={klass}
            trial={trial}
            onTrial={setTrial}
            waitlist={waitlist}
            onWaitlist={setWaitlist}
            note={note}
            setNote={setNote}
            reqId={reqId}
            hasConflict={hasConflict}
            onContinue={handleContinue}
            onSwitchChild={switchChild}
          />
        ) : role === 'admin' ? (
          <AdminCoursePanel course={course} />
        ) : role === 'teacher' ? (
          <TeacherCoursePanel course={course} />
        ) : null}
      </div>

      <CourseDetailSheet
        course={detailCourse}
        open={!!detailCourse}
        onOpenChange={(o) => !o && setDetailCourseId(null)}
      />

      <ConsultationRequestDialog
        open={!!consultCourse}
        onOpenChange={(o) => !o && setConsultCourseId(null)}
        course={
          consultCourse ? { id: Number(consultCourse.id), title: consultCourse.name } : undefined
        }
      />

      {isParent && (
        <>
          <ClassPickerDialog
            course={course}
            selectedId={klass?.id}
            open={showClassDialog}
            onOpenChange={setShowClassDialog}
            onPick={(cl) => {
              setKlass(cl);
              setShowClassDialog(false);
              setShowConfirm(true);
            }}
          />

          {course && klass && (
            <ConfirmEnrollmentDialog
              open={showConfirm}
              onOpenChange={setShowConfirm}
              child={child}
              course={course}
              klass={klass}
              note={note}
              trial={trial}
              onBack={() => {
                setShowConfirm(false);
                setShowClassDialog(true);
              }}
              onSubmit={handleSubmit}
            />
          )}
        </>
      )}
    </>
  );
}
