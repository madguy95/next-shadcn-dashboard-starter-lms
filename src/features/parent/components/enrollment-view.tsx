'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { publicCoursesOptions } from '@/api/courses/queries';
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
import { ClassPickerDialog } from './class-picker-dialog';
import { ConfirmEnrollmentDialog } from './confirm-enrollment-dialog';
import { CourseDetailSheet } from './course-detail-sheet';

const FILTER_GROUPS = [
  { key: 'age', label: 'Độ tuổi', opts: ['Tất cả', '6–8', '9–11', '12+'] },
  { key: 'level', label: 'Cấp độ', opts: ['Tất cả', 'Beginner', 'Intermediate', 'Advanced'] },
  { key: 'mode', label: 'Hình thức', opts: ['Tất cả', 'Offline', 'Online'] },
  { key: 'day', label: 'Ngày học', opts: ['Tất cả', 'T2–T6', 'Cuối tuần'] },
  { key: 'time', label: 'Giờ', opts: ['Tất cả', 'Sáng', 'Chiều', 'Tối'] }
] as const;

type FilterKey = (typeof FILTER_GROUPS)[number]['key'];

function CourseCard({
  course,
  selected,
  onSelect,
  onOpenDetail
}: {
  course: ParentCourse;
  selected: boolean;
  onSelect: () => void;
  onOpenDetail: () => void;
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
        'bg-card text-card-foreground focus-visible:ring-ring flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'hover:border-foreground/20 hover:shadow-md',
        selected && 'ring-ring border-foreground ring-2 ring-offset-2'
      )}
    >
      <div
        className={cn(
          'relative flex h-24 items-end gap-2 border-b p-3',
          !course.coverUrl &&
            'bg-muted/40 [background-image:repeating-linear-gradient(45deg,color-mix(in_srgb,currentColor_4%,transparent)_0_8px,transparent_8px_16px)]'
        )}
      >
        {course.coverUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.coverUrl}
              alt={course.name}
              className='absolute inset-0 h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent' />
          </>
        )}
        {course.popular && (
          <Badge className='relative border-amber-300/50 bg-amber-100/80 text-amber-900'>
            ★ Phổ biến
          </Badge>
        )}
        {course.isNew && (
          <Badge className='relative border-emerald-300/50 bg-emerald-100/80 text-emerald-900'>
            ✨ Mới
          </Badge>
        )}
        <span className='bg-background/80 text-muted-foreground relative ml-auto rounded-md border px-2 py-0.5 font-mono text-[10.5px] backdrop-blur'>
          {course.code}
        </span>
      </div>
      <div className='flex flex-1 flex-col gap-2 p-4'>
        <div className='flex items-baseline justify-between gap-2'>
          <h3 className='font-semibold tracking-tight'>{course.name}</h3>
          <span className='text-muted-foreground shrink-0 font-mono text-xs'>
            {course.ageRange}
          </span>
        </div>
        <div className='text-muted-foreground flex items-center gap-3 text-xs'>
          <span className='inline-flex items-center gap-1'>
            <Icons.book className='size-3' /> {course.sessions} buổi
          </span>
          <span className='inline-flex items-center gap-1'>
            <Icons.clock className='size-3' /> {course.duration}′/buổi
          </span>
          <span className='inline-flex items-center gap-1'>
            {course.mode.includes('Online') ? (
              <Icons.video className='size-3' />
            ) : (
              <Icons.workspace className='size-3' />
            )}
            {course.mode}
          </span>
        </div>
        <p className='text-muted-foreground flex-1 text-xs leading-relaxed'>{course.goals}</p>
      </div>
      <div className='bg-muted/30 flex items-center justify-between gap-2 border-t px-4 py-3'>
        <div>
          <div className='text-sm font-semibold'>{formatVND(course.price)}</div>
          <div className='text-muted-foreground font-mono text-[11px]'>
            /khóa · ★ {course.rating} ({course.learners})
          </div>
        </div>
        <div className='flex items-center gap-1.5'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 text-xs'
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
          >
            Xem chi tiết
          </Button>
          <Button
            size='sm'
            variant={selected ? 'default' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {selected ? (
              <>
                <Icons.check className='size-3' />
                Đã chọn
              </>
            ) : (
              'Chọn khóa'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterBar({
  filters,
  setFilters,
  sort,
  setSort
}: {
  filters: Record<FilterKey, string>;
  setFilters: (f: Record<FilterKey, string>) => void;
  sort: string;
  setSort: (v: string) => void;
}) {
  return (
    <div className='bg-muted/30 flex flex-wrap items-center gap-2 border-t p-4'>
      <div className='text-muted-foreground mr-1 inline-flex items-center gap-1.5 text-xs'>
        <Icons.adjustments className='size-3' />
        Lọc:
      </div>
      {FILTER_GROUPS.map((g) => {
        const v = filters[g.key];
        const on = v !== 'Tất cả';
        const cycle = () => {
          const i = (g.opts as readonly string[]).indexOf(v);
          setFilters({ ...filters, [g.key]: g.opts[(i + 1) % g.opts.length] });
        };
        return (
          <button
            key={g.key}
            type='button'
            onClick={cycle}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors',
              on
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                : 'bg-background border-border hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <span>{g.label}:</span>
            <span className='font-medium'>{v}</span>
            {on ? (
              <Icons.close
                className='size-3 opacity-70'
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters({ ...filters, [g.key]: 'Tất cả' });
                }}
              />
            ) : (
              <Icons.chevronDown className='size-3 opacity-50' />
            )}
          </button>
        );
      })}
      <div className='flex-1' />
      <div className='relative w-64'>
        <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
        <Input placeholder='Tìm khóa học…' className='h-8 pl-8 text-xs' />
      </div>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className='h-8 text-xs'>
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
    <aside className='space-y-4 lg:sticky lg:top-[72px]'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-center justify-between gap-3 border-b p-4'>
          <div className='text-sm font-semibold tracking-tight'>Tóm tắt đăng ký</div>
          <span className='text-muted-foreground font-mono text-[11px]'>{reqId}</span>
        </div>

        {hasConflict && (
          <div className='border-warning/40 bg-warning/10 mx-4 mt-4 flex gap-2 rounded-md border p-3 text-xs'>
            <Icons.warning className='text-warning mt-0.5 size-4 shrink-0' />
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
                <div className='font-medium'>{child.name}</div>
                <div className='text-muted-foreground font-mono text-xs'>
                  {child.age} tuổi · {child.level}
                </div>
              </div>
              <button
                type='button'
                onClick={onSwitchChild}
                className='text-muted-foreground hover:text-foreground shrink-0 pt-0.5 text-xs underline underline-offset-2 hover:no-underline'
              >
                Đổi
              </button>
            </div>
          </SummaryRow>
          <SummaryRow label='Khóa học'>
            {course ? (
              <>
                <div className='font-medium'>{course.name}</div>
                <div className='text-muted-foreground font-mono text-xs'>
                  {course.code} · {course.sessions} buổi
                </div>
              </>
            ) : (
              <span className='text-muted-foreground italic'>Chưa chọn khóa</span>
            )}
          </SummaryRow>
          <SummaryRow label='Lớp'>
            {klass ? (
              <>
                <div className='font-medium'>
                  {klass.id} · {klass.mode}
                </div>
                <div className='text-muted-foreground font-mono text-xs'>{klass.schedule}</div>
              </>
            ) : (
              <span className='text-muted-foreground italic'>Chưa chọn lớp</span>
            )}
          </SummaryRow>
          <SummaryRow label='Khai giảng'>
            <span className={cn('font-mono text-xs', !klass && 'text-muted-foreground')}>
              {klass ? klass.start : '—'}
            </span>
          </SummaryRow>
        </dl>

        <Separator />

        <div className='space-y-2 px-4 py-3'>
          <Label
            htmlFor='trial'
            className='flex cursor-pointer items-center gap-2.5 text-sm font-normal'
          >
            <Checkbox id='trial' checked={trial} onCheckedChange={(v) => onTrial(v === true)} />
            <span>
              Đăng ký <b>học thử</b> 1 buổi (miễn phí)
            </span>
          </Label>
          <Label
            htmlFor='waitlist'
            className='flex cursor-pointer items-center gap-2.5 text-sm font-normal'
          >
            <Checkbox
              id='waitlist'
              checked={waitlist}
              onCheckedChange={(v) => onWaitlist(v === true)}
            />
            <span>
              Vào danh sách <b>chờ</b> nếu lớp đầy
            </span>
          </Label>
        </div>

        <Separator />

        <div className='flex items-baseline justify-between px-4 py-4'>
          <span className='text-muted-foreground text-sm'>Học phí dự kiến</span>
          <div className='text-right'>
            <div className='text-xl font-semibold tracking-tight tabular-nums'>
              {fee !== null ? formatVND(fee) : '—'}
            </div>
            {trial && course && (
              <div className='text-muted-foreground font-mono text-[11px]'>miễn phí buổi thử</div>
            )}
          </div>
        </div>

        <Separator />

        <div className='space-y-2 p-4'>
          <Label htmlFor='parent-note' className='text-muted-foreground text-xs'>
            Ghi chú phụ huynh
          </Label>
          <Textarea
            id='parent-note'
            placeholder='VD: Con mới học lần đầu, mong cô để ý thêm phần làm quen…'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className='p-4 pt-0'>
          <Button className='w-full' disabled={!course} onClick={onContinue}>
            {klass ? (
              <>
                Xác nhận đăng ký
                <Icons.arrowRight className='size-3.5' />
              </>
            ) : (
              <>
                Tiếp tục chọn lớp
                <Icons.arrowRight className='size-3.5' />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className='bg-muted/30 rounded-lg border'>
        <div className='text-muted-foreground flex gap-3 p-4 text-xs'>
          <Icons.sparkles className='text-foreground/70 mt-0.5 size-4 shrink-0' />
          <p>
            Đăng ký gửi lên sẽ ở trạng thái{' '}
            <Badge variant='outline' className='mx-0.5 align-baseline'>
              Chờ duyệt
            </Badge>
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
      <dt className='text-muted-foreground min-w-[80px] pt-0.5 text-xs'>{label}</dt>
      <dd className='text-right'>{children}</dd>
    </div>
  );
}

function AuthGate({ course }: { course: ParentCourse | null }) {
  return (
    <aside className='space-y-4 lg:sticky lg:top-[72px]'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-center gap-3 border-b p-4'>
          <span className='bg-cyan-500/10 text-cyan-600 ring-cyan-500/20 grid h-9 w-9 place-items-center rounded-lg ring-1'>
            <Icons.lock className='size-4' />
          </span>
          <div>
            <div className='text-sm font-semibold tracking-tight'>Đăng nhập để đăng ký</div>
            <div className='text-muted-foreground text-[11px]'>Bạn cần tài khoản phụ huynh</div>
          </div>
        </div>

        <div className='space-y-4 p-4 text-sm'>
          <p className='text-muted-foreground leading-relaxed'>
            Tạo tài khoản miễn phí để đăng ký khóa cho con. Bạn có thể quản lý nhiều hồ sơ con, theo
            dõi tiến độ và lịch học.
          </p>

          {course && (
            <div className='bg-muted/40 rounded-md border p-3'>
              <div className='text-muted-foreground text-[11px] tracking-wider uppercase'>
                Khóa đã chọn
              </div>
              <div className='mt-1 font-medium'>{course.name}</div>
              <div className='text-muted-foreground font-mono text-[11px]'>
                {course.code} · {formatVND(course.price)}
              </div>
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <Button asChild className='w-full'>
              <Link href='/login?mode=register'>
                <Icons.add className='size-3.5' />
                Tạo tài khoản
              </Link>
            </Button>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/login'>
                <Icons.login className='size-3.5' />
                Đăng nhập
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className='bg-muted/30 rounded-lg border'>
        <div className='text-muted-foreground flex gap-3 p-4 text-xs'>
          <Icons.sparkles className='text-foreground/70 mt-0.5 size-4 shrink-0' />
          <p>
            Sau khi đăng nhập, bạn sẽ thấy khóa đã chọn được giữ lại và có thể tiếp tục đăng ký mà
            không phải chọn lại từ đầu.
          </p>
        </div>
      </div>
    </aside>
  );
}

function AdminCoursePanel({ course }: { course: ParentCourse | null }) {
  return (
    <aside className='space-y-4 lg:sticky lg:top-[72px]'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-center gap-3 border-b p-4'>
          <span className='grid h-9 w-9 place-items-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20'>
            <Icons.settings className='size-4' />
          </span>
          <div>
            <div className='text-sm font-semibold tracking-tight'>Quản trị khóa học</div>
            <div className='text-muted-foreground text-[11px]'>Chế độ admin</div>
          </div>
        </div>

        <div className='space-y-4 p-4 text-sm'>
          {course ? (
            <div className='bg-muted/40 rounded-md border p-3'>
              <div className='text-muted-foreground text-[11px] tracking-wider uppercase'>
                Khóa đã chọn
              </div>
              <div className='mt-1 font-medium'>{course.name}</div>
              <div className='text-muted-foreground font-mono text-[11px]'>
                {course.code} · {course.sessions} buổi · {formatVND(course.price)}
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground text-xs italic'>
              Chọn một khóa để mở trang quản lý chi tiết.
            </p>
          )}

          <Button asChild className='w-full' disabled={!course}>
            <Link
              href={
                course
                  ? `/admin/courses?course=${encodeURIComponent(course.code)}`
                  : '/admin/courses'
              }
            >
              <Icons.settings className='size-3.5' />
              Quản lý khóa học
              <Icons.arrowRight className='size-3.5' />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}

function TeacherCoursePanel({ course }: { course: ParentCourse | null }) {
  // Mock teacher data: filter classes the current teacher owns by courseCode match.
  // When wiring to BE, replace with /api/teacher/classes?courseCode={code}.
  const myClasses = useMemo(
    () => (course ? teacherClasses.filter((c) => c.courseCode === course.code) : []),
    [course]
  );

  return (
    <aside className='space-y-4 lg:sticky lg:top-[72px]'>
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-center gap-3 border-b p-4'>
          <span className='grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20'>
            <Icons.teams className='size-4' />
          </span>
          <div>
            <div className='text-sm font-semibold tracking-tight'>Lớp của bạn</div>
            <div className='text-muted-foreground text-[11px]'>Chế độ giáo viên</div>
          </div>
        </div>

        <div className='space-y-3 p-4 text-sm'>
          {!course ? (
            <p className='text-muted-foreground text-xs italic'>
              Chọn một khóa để xem các lớp bạn đang phụ trách.
            </p>
          ) : myClasses.length === 0 ? (
            <div className='bg-muted/40 rounded-md border border-dashed p-3 text-center'>
              <div className='text-muted-foreground text-xs'>
                Bạn chưa có lớp nào thuộc khóa <span className='font-mono'>{course.code}</span>.
              </div>
            </div>
          ) : (
            <>
              <div className='text-muted-foreground text-[11px] tracking-wider uppercase'>
                {myClasses.length} lớp thuộc {course.code}
              </div>
              <ul className='space-y-2'>
                {myClasses.map((cl) => (
                  <li key={cl.id}>
                    <Link
                      href={`/teacher/classes/${cl.id}`}
                      className='hover:border-foreground/30 hover:bg-accent/50 flex items-center justify-between gap-3 rounded-md border p-3 transition-colors'
                    >
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>{cl.classLabel}</span>
                          <Badge variant='secondary' className='text-[10px] font-normal'>
                            {classStatusLabel[cl.status]}
                          </Badge>
                        </div>
                        <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
                          {cl.schedule} · {cl.location}
                        </div>
                      </div>
                      <Icons.arrowRight className='text-muted-foreground size-3.5 shrink-0' />
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

export function EnrollmentView() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const isParent = role === 'parent';
  const [childIdx, setChildIdx] = useState(0);
  const child = parentChildren[childIdx];

  // Public course list is server-prefetched in app/(lms)/courses/page.tsx and hydrated
  // via <HydrationBoundary>. useSuspenseQuery picks that up — no skeleton on first paint.
  // Subsequent navigations (no hydration) suspend until cache populates.
  const { data: publicCourses } = useSuspenseQuery(publicCoursesOptions(24));
  const courses = useMemo<ParentCourse[]>(
    () => publicCourses.map(publicCourseToParentCourse),
    [publicCourses]
  );

  // Deep-link: /courses?course=SC-101 opens that course's detail sheet on mount.
  // Match by `code` (stable, user-friendly) rather than DB id.
  const searchParams = useSearchParams();
  const initialCourseCode = searchParams.get('course');

  const [courseId, setCourseId] = useState<string | null>(null);
  const course = courses.find((c) => c.id === courseId) ?? null;

  const [klass, setKlass] = useState<ClassOption | null>(null);
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const detailCourse = detailCourseId
    ? (courses.find((c) => c.id === detailCourseId) ?? null)
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

  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    age: 'Tất cả',
    level: 'Tất cả',
    mode: 'Tất cả',
    day: 'Tất cả',
    time: 'Tất cả'
  });
  const [sort, setSort] = useState('popular');

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

  return (
    <>
      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]'>
        <div className='min-w-0 space-y-4'>
          <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
            <div className='flex items-center justify-between gap-3 px-5 pt-4 pb-3'>
              <div className='flex min-w-0 items-baseline gap-2'>
                <h3 className='text-base font-semibold tracking-tight'>Khóa học phù hợp</h3>
                <Badge variant='secondary' className='font-mono text-[11px] font-normal'>
                  {`${courses.length} kết quả`}
                </Badge>
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground hover:text-foreground h-8 text-xs'
                >
                  <Icons.help className='size-3' />
                  Cách lọc
                </Button>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <Icons.ellipsis className='size-4' />
                </Button>
              </div>
            </div>

            {isParent ? (
              <div className='text-muted-foreground bg-muted/40 mx-5 mb-3 flex items-center gap-2.5 rounded-md border border-dashed px-3 py-2 text-xs'>
                <Icons.sparkles className='text-foreground/60 size-3 shrink-0' />
                <span className='truncate'>
                  Đề xuất cho <span className='text-foreground font-medium'>{child.name}</span> ·{' '}
                  {child.age} tuổi · cấp độ{' '}
                  <span className='text-foreground font-medium'>{child.level}</span>
                </span>
                <button
                  type='button'
                  onClick={() => setChildIdx((childIdx + 1) % parentChildren.length)}
                  className='text-foreground ml-auto inline-flex shrink-0 items-center gap-1 font-medium hover:underline'
                >
                  <Icons.teams className='size-3' />
                  Đổi học sinh
                </button>
              </div>
            ) : role === 'admin' ? (
              <div className='mx-5 mb-3 flex items-center gap-2.5 rounded-md border border-dashed border-violet-500/30 bg-violet-500/5 px-3 py-2 text-xs text-violet-700 dark:text-violet-300'>
                <Icons.settings className='size-3 shrink-0' />
                <span className='truncate'>
                  Chế độ quản trị · click chọn khóa để mở trang quản lý chi tiết.
                </span>
              </div>
            ) : role === 'teacher' ? (
              <div className='mx-5 mb-3 flex items-center gap-2.5 rounded-md border border-dashed border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300'>
                <Icons.teams className='size-3 shrink-0' />
                <span className='truncate'>
                  Chế độ giáo viên · click chọn khóa để xem các lớp bạn đang phụ trách.
                </span>
              </div>
            ) : (
              <div className='mx-5 mb-3 flex items-center gap-2.5 rounded-md border border-dashed border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-700 dark:text-cyan-300'>
                <Icons.info className='size-3 shrink-0' />
                <span className='truncate'>
                  Bạn đang xem ở chế độ khách. Đăng nhập để đăng ký cho con hoặc vào workspace.
                </span>
                <Link
                  href='/login?mode=register'
                  className='ml-auto inline-flex shrink-0 items-center gap-1 font-medium hover:underline'
                >
                  Đăng nhập
                  <Icons.arrowRight className='size-3' />
                </Link>
              </div>
            )}

            <FilterBar filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} />

            {/* No loading / error branches here — useSuspenseQuery guarantees data is present
                (Suspense fallback handles loading, ErrorBoundary handles failures). */}
            <div className='grid grid-cols-1 gap-4 p-4 xl:grid-cols-2'>
              {courses.length === 0 ? (
                <div className='bg-muted/30 text-muted-foreground col-span-full rounded-md border border-dashed p-10 text-center text-sm'>
                  Trung tâm đang cập nhật danh sách khóa học. Vui lòng quay lại sau.
                </div>
              ) : (
                courses.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    selected={courseId === c.id}
                    onSelect={() => {
                      setCourseId(c.id);
                      setKlass(null);
                    }}
                    onOpenDetail={() => setDetailCourseId(c.id)}
                  />
                ))
              )}
            </div>
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
            onSwitchChild={() => setChildIdx((childIdx + 1) % parentChildren.length)}
          />
        ) : role === 'admin' ? (
          <AdminCoursePanel course={course} />
        ) : role === 'teacher' ? (
          <TeacherCoursePanel course={course} />
        ) : (
          <AuthGate course={course} />
        )}
      </div>

      <CourseDetailSheet
        course={detailCourse}
        isSelected={detailCourse?.id === courseId}
        open={!!detailCourse}
        onOpenChange={(o) => !o && setDetailCourseId(null)}
        onSelect={() => {
          if (detailCourse) {
            setCourseId(detailCourse.id);
            setKlass(null);
          }
        }}
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

export function EnrollmentHeaderAction({ role }: { role: 'admin' | 'teacher' | 'parent' | null }) {
  const t = useTranslations('coursesCatalog.header');
  if (role === 'admin') {
    return (
      <Button asChild variant='outline' size='sm' className='h-9'>
        <Link href='/admin/courses'>
          <Icons.settings className='size-3.5' />
          {t('adminManage')}
        </Link>
      </Button>
    );
  }
  if (role === 'teacher') {
    return (
      <Button asChild variant='outline' size='sm' className='h-9'>
        <Link href='/teacher/classes'>
          <Icons.teams className='size-3.5' />
          {t('teacherMyClasses')}
        </Link>
      </Button>
    );
  }
  if (role === 'parent') {
    return (
      <div className='flex gap-2'>
        <Button variant='outline' size='sm' className='h-9'>
          <Icons.clock className='size-3.5' />
          {t('parentRecent')}
        </Button>
        <Button variant='outline' size='sm' className='h-9'>
          <Icons.sparkles className='size-3.5' />
          {t('parentAdvise')}
        </Button>
      </div>
    );
  }
  return (
    <Button asChild size='sm' className='h-9'>
      <Link href='/login?mode=register'>
        <Icons.add className='size-3.5' />
        {t('guestRegister')}
      </Link>
    </Button>
  );
}
