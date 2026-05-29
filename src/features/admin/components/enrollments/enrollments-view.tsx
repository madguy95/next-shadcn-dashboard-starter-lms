'use client';

import { useQuery } from '@tanstack/react-query';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { LoadingOverlay, LoadingState } from '@/components/ui/loading-state';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { classListOptions, type ClassRow } from '@/api/classes';
import {
  enrollmentListOptions,
  enrollmentStatusTabsOptions,
  isEnrollmentStatus,
  useApproveEnrollment,
  useBulkActionEnrollments,
  useWaitlistEnrollment,
  type Enrollment,
  type EnrollmentStatus,
  type EnrollmentStatusFilter
} from '@/api/enrollments';
import { avatarToneClass } from '@/constants/avatar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { ManualEnrollDialog } from './manual-enroll-dialog';
import { PaymentDialog } from './payment-dialog';
import { RejectEnrollmentDialog } from './reject-enrollment-dialog';

const PAGE_SIZE = 20;

const tabKeys: EnrollmentStatusFilter[] = ['pending', 'active', 'waitlist', 'rejected'];

function formatVnd(amount?: number): string {
  if (amount == null) return '—';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}₫`;
}

function EnrollmentRowItem({
  row,
  active,
  selected,
  onSelect,
  onToggleSelect,
  onApprove,
  onWaitlist,
  onReject
}: {
  row: Enrollment;
  active: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggleSelect: () => void;
  onApprove: () => void;
  onWaitlist: () => void;
  onReject: () => void;
}) {
  const t = useTranslations('enrollments.list');
  const format = useFormatter();
  // Stable "now" reference so relativeTime is deterministic across SSR /
  // hydration and stays consistent across all rows rendered in this pass.
  // Refresh every minute so "2m ago" → "3m ago" without a full reload.
  const now = useNow({ updateInterval: 60 * 1000 });
  const submittedLabel = row.submittedAt
    ? format.relativeTime(new Date(row.submittedAt), now)
    : '—';

  return (
    <TableRow
      onClick={onSelect}
      className={cn('cursor-pointer', active && 'bg-foreground/[0.03] hover:bg-foreground/[0.05]')}
    >
      <TableCell className='px-4 py-3' onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={t('selectAria', { name: row.studentName })}
        />
      </TableCell>
      <TableCell className='py-3'>
        <div className='flex items-center gap-2.5'>
          <span
            className={cn(
              'grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold',
              avatarToneClass[row.tone]
            )}
          >
            {row.initials}
          </span>
          <div className='leading-tight'>
            <div className='font-medium'>{row.studentName}</div>
            <div className='text-muted-foreground font-mono text-[11px]'>
              {t('parentLabel', { name: row.parentName })}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className='py-3'>
        <div className='text-[13px] font-medium'>{row.requestedCourse?.title ?? '—'}</div>
        <div className='text-muted-foreground font-mono text-[11px]'>{row.note ?? ''}</div>
      </TableCell>
      <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
        {submittedLabel}
      </TableCell>
      <TableCell className='px-4 py-3 text-right' onClick={(e) => e.stopPropagation()}>
        <div className='inline-flex gap-1'>
          <Button
            size='sm'
            variant={active ? 'default' : 'outline'}
            className='h-7 px-2.5 text-[12px]'
            onClick={onApprove}
            disabled={row.status === 'active'}
          >
            {t('actions.approve')}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-7 px-2.5 text-[12px]'
            onClick={onWaitlist}
            disabled={row.status === 'waitlist'}
          >
            {t('actions.waitlist')}
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-7 w-7'
            onClick={onReject}
            disabled={row.status === 'rejected'}
            aria-label={t('actions.reject')}
          >
            <Icons.close className='size-3' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function EnrollmentDetailPanel({
  row,
  classes,
  selectedClassId,
  onSelectClass,
  onApprove,
  onWaitlist,
  onReject,
  onEditPayment,
  isApprovePending,
  isWaitlistPending,
  onClose,
  hideClose = false
}: {
  row: Enrollment;
  classes: ClassRow[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  onApprove: () => void;
  onWaitlist: () => void;
  onReject: () => void;
  onEditPayment: () => void;
  isApprovePending: boolean;
  isWaitlistPending: boolean;
  onClose: () => void;
  // Sheet provides its own close button; hide ours to avoid two X icons in
  // the header area on mobile.
  hideClose?: boolean;
}) {
  const t = useTranslations('enrollments.detail');
  const tStatus = useTranslations('enrollments.detail.paymentStatusLabel');
  const course = row.requestedCourse;
  const paymentStatusLabel = row.paymentStatus
    ? tStatus(row.paymentStatus)
    : t('paymentNotProvided');

  const gradeAgeLabel = (() => {
    const parts: string[] = [];
    if (row.studentGrade != null) parts.push(t('gradeLabel', { grade: row.studentGrade }));
    if (row.studentAge != null) parts.push(t('ageLabel', { age: row.studentAge }));
    return parts.length === 0 ? t('gradeAgeNone') : parts.join(' · ');
  })();

  const courseMeta = (() => {
    if (!course) return '—';
    const hasFullMeta =
      course.totalSessions != null && course.minAge != null && course.maxAge != null;
    if (hasFullMeta) {
      return t('courseMeta', {
        code: course.code,
        sessions: course.totalSessions ?? 0,
        minAge: course.minAge ?? 0,
        maxAge: course.maxAge ?? 0
      });
    }
    return t('courseMetaCodeOnly', { code: course.code });
  })();

  return (
    // h-full + min-h-0 let the body's overflow-auto activate when this panel
    // is mounted in a height-bounded container (the Sheet on <xl). On the xl
    // inline mount the parent has no height, so h-full collapses to content
    // height harmlessly and the page scrolls instead.
    <aside className='bg-card flex h-full min-h-0 flex-col overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex shrink-0 items-start justify-between gap-3 border-b px-4 pt-4 pb-3 md:px-5'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <span
            className={cn(
              'grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-semibold',
              avatarToneClass[row.tone]
            )}
          >
            {row.initials}
          </span>
          <div className='min-w-0 flex-1 leading-tight'>
            <div className='text-muted-foreground font-mono text-[12px]'>
              {t('idLabel', { id: row.id })}
            </div>
            <div className='truncate text-[17px] font-semibold tracking-tight'>
              {row.studentName}
            </div>
            <div className='text-muted-foreground text-[12px]'>{gradeAgeLabel}</div>
          </div>
        </div>
        {!hideClose && (
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 shrink-0'
            onClick={onClose}
            aria-label={t('close')}
          >
            <Icons.close className='size-3.5' />
          </Button>
        )}
      </div>

      <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 py-4 md:px-5'>
        <section>
          <div className='text-muted-foreground mb-2 text-[11px] font-medium tracking-wider uppercase'>
            {t('requestedCourse')}
          </div>
          <div className='flex items-center gap-3 rounded-md border p-3'>
            <div className='bg-muted grid h-10 w-10 place-items-center rounded-md border'>
              <Icons.book className='text-muted-foreground size-4' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-sm font-medium'>{course?.title ?? '—'}</div>
              <div className='text-muted-foreground font-mono text-[11px]'>{courseMeta}</div>
            </div>
          </div>
        </section>

        <section>
          <div className='mb-2 flex items-center justify-between'>
            <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
              {t('assignToClass')}
            </div>
            <span className='text-muted-foreground font-mono text-[11px]'>
              {t('optionsCount', { count: classes.length })}
            </span>
          </div>
          {classes.length === 0 ? (
            <div className='text-muted-foreground rounded-md border border-dashed p-3 text-[12px]'>
              {t('noOpenClasses')}
            </div>
          ) : (
            <RadioGroup value={selectedClassId} onValueChange={onSelectClass} className='space-y-2'>
              {classes.map((opt) => {
                const isSelected = selectedClassId === opt.id;
                const isFull = opt.enrolled >= opt.capacity;
                return (
                  <label
                    key={opt.id}
                    htmlFor={`assign-${opt.id}`}
                    className={cn(
                      'hover:border-foreground/40 flex cursor-pointer items-center gap-3 rounded-md border p-3',
                      isSelected &&
                        'border-foreground/40 bg-foreground/[0.02] ring-foreground/10 ring-2',
                      isFull && 'pointer-events-none opacity-60'
                    )}
                  >
                    <RadioGroupItem value={opt.id} id={`assign-${opt.id}`} disabled={isFull} />
                    <div className='min-w-0 flex-1'>
                      <div className='text-sm font-medium'>
                        {opt.name}{' '}
                        <span className='text-muted-foreground font-mono text-[11px]'>
                          · {opt.schedule}
                        </span>
                      </div>
                      <div className='text-muted-foreground font-mono text-[11px]'>
                        {opt.teacherShort} · {opt.location}
                        {opt.room ? ` · ${opt.room}` : ''}
                      </div>
                    </div>
                    <div className='font-mono text-[11px]'>
                      {opt.enrolled} / {opt.capacity}
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          )}
        </section>

        <section className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='min-w-0 rounded-md border p-3'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('parent')}
            </div>
            <div className='mt-1 truncate text-sm font-medium'>{row.parentName}</div>
            <div className='text-muted-foreground mt-0.5 font-mono text-[11px]'>
              {row.parentPhone ?? '—'}
            </div>
            <div className='text-muted-foreground truncate font-mono text-[11px]'>
              {row.parentEmail ?? '—'}
            </div>
          </div>
          <div className='min-w-0 rounded-md border p-3'>
            <div className='flex items-start justify-between gap-2'>
              <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
                {t('payment')}
              </div>
              <button
                type='button'
                onClick={onEditPayment}
                className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-[10px] underline decoration-dotted'
              >
                <Icons.userPen className='size-3' />
                {t('paymentEdit')}
              </button>
            </div>
            <div className='mt-1 text-sm font-medium'>{formatVnd(row.paymentAmount)}</div>
            <div
              className={cn(
                'mt-0.5 font-mono text-[11px]',
                row.paymentStatus === 'paid'
                  ? 'text-emerald-700'
                  : row.paymentStatus === 'partial'
                    ? 'text-amber-700'
                    : 'text-muted-foreground'
              )}
            >
              {paymentStatusLabel}
            </div>
            {row.paymentStatus !== 'paid' ? (
              <Button
                size='sm'
                variant='outline'
                className='mt-2 h-7 w-full text-[12px]'
                onClick={onEditPayment}
              >
                <Icons.check className='size-3' />
                {t('paymentMarkPaid')}
              </Button>
            ) : null}
          </div>
        </section>

        {row.note ? (
          <section>
            <div className='text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wider uppercase'>
              {t('parentNote')}
            </div>
            <div className='bg-muted/30 rounded-md border p-3 text-[13px] leading-relaxed'>
              {row.note}
            </div>
          </section>
        ) : null}

        {row.status === 'rejected' && row.rejectionReason ? (
          <section>
            <div className='text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wider uppercase'>
              {t('rejectionReason')}
            </div>
            <div className='rounded-md border border-rose-200 bg-rose-50 p-3 text-[13px] leading-relaxed text-rose-900'>
              {row.rejectionReason}
            </div>
          </section>
        ) : null}
      </div>

      {/* Footer sticks to the bottom because the body above is flex-1 +
          overflow-auto. On <sm the actions stack so long Vietnamese labels
          (e.g. "Phê duyệt & gán") don't crash into each other. Primary action
          (Approve) goes first in the visual stack to stay reachable above the
          fold of the keyboard / safe-area on phones. */}
      <div className='bg-muted/30 flex shrink-0 flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2 md:px-5'>
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-foreground self-start text-[12px] sm:self-auto'
          onClick={onReject}
          disabled={row.status === 'rejected'}
        >
          <Icons.trash className='size-3' />
          {t('rejectButton')}
        </Button>
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center'>
          <Button
            variant='outline'
            size='sm'
            className='h-9 w-full sm:w-auto'
            onClick={onWaitlist}
            disabled={row.status === 'waitlist' || isWaitlistPending}
          >
            {isWaitlistPending ? t('moveToWaitlistPending') : t('moveToWaitlist')}
          </Button>
          <Button
            size='sm'
            className='h-9 w-full sm:w-auto'
            onClick={onApprove}
            disabled={
              !selectedClassId ||
              row.status === 'active' ||
              isApprovePending ||
              classes.length === 0
            }
          >
            <Icons.check className='size-3.5' />
            {isApprovePending ? t('approving') : t('approveAndAssign')}
          </Button>
        </div>
      </div>
    </aside>
  );
}

// Mobile (<md) list item. Mirrors EnrollmentRowItem's data but laid out
// vertically so it fits a phone-width card without the 5-column table.
// Action buttons stay primary-visible because the queue's job is triage —
// hiding them behind a tap would double the work per row.
function EnrollmentCardItem({
  row,
  active,
  selected,
  onSelect,
  onToggleSelect,
  onApprove,
  onWaitlist,
  onReject
}: {
  row: Enrollment;
  active: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggleSelect: () => void;
  onApprove: () => void;
  onWaitlist: () => void;
  onReject: () => void;
}) {
  const t = useTranslations('enrollments.list');
  const format = useFormatter();
  const now = useNow({ updateInterval: 60 * 1000 });
  const submittedLabel = row.submittedAt
    ? format.relativeTime(new Date(row.submittedAt), now)
    : '—';

  return (
    <li
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-start gap-3 p-4 transition-colors',
        active && 'bg-foreground/[0.03]'
      )}
    >
      <div className='pt-0.5' onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={t('selectAria', { name: row.studentName })}
        />
      </div>
      <span
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-semibold',
          avatarToneClass[row.tone]
        )}
      >
        {row.initials}
      </span>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <div className='truncate text-[14px] font-medium'>{row.studentName}</div>
            <div className='text-muted-foreground truncate font-mono text-[11px]'>
              {t('parentLabel', { name: row.parentName })}
            </div>
          </div>
          <span className='text-muted-foreground shrink-0 font-mono text-[11px]'>
            {submittedLabel}
          </span>
        </div>
        <div className='text-[13px]'>
          <span className='font-medium'>{row.requestedCourse?.title ?? '—'}</span>
          {row.note ? (
            <span className='text-muted-foreground line-clamp-1 font-mono text-[11px]'>
              {row.note}
            </span>
          ) : null}
        </div>
        <div
          className='-mr-1 flex items-center justify-end gap-1'
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size='sm'
            variant={active ? 'default' : 'outline'}
            className='h-7 px-2.5 text-[12px]'
            onClick={onApprove}
            disabled={row.status === 'active'}
          >
            {t('actions.approve')}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-7 px-2.5 text-[12px]'
            onClick={onWaitlist}
            disabled={row.status === 'waitlist'}
          >
            {t('actions.waitlist')}
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-7 w-7'
            onClick={onReject}
            disabled={row.status === 'rejected'}
            aria-label={t('actions.reject')}
          >
            <Icons.close className='size-3' />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function EnrollmentsView() {
  const t = useTranslations('enrollments');
  const tTabs = useTranslations('enrollments.tabs');
  const tList = useTranslations('enrollments.list');
  const tDetail = useTranslations('enrollments.detail');
  const tToast = useTranslations('enrollments.toast');

  const [statusParam, setStatusParam] = useQueryState(
    'status',
    parseAsString.withDefault('pending')
  );
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedId, setSelectedId] = useQueryState('selected', parseAsString);
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [rejectTarget, setRejectTarget] = React.useState<Enrollment | null>(null);
  const [paymentTarget, setPaymentTarget] = React.useState<Enrollment | null>(null);
  const [bulkSelection, setBulkSelection] = React.useState<Set<string>>(new Set());
  // <xl: detail panel lives in a bottom Sheet that only opens on explicit row
  // tap; selectedId still auto-syncs for desktop's inline panel. JS + CSS
  // breakpoints (xl = 1280px) must stay in sync.
  const isBelowXl = useMediaQuery('(max-width: 1279px)');
  const [mobileDetailOpen, setMobileDetailOpen] = React.useState(false);

  const activeStatus: EnrollmentStatus = isEnrollmentStatus(statusParam) ? statusParam : 'pending';

  const listQuery = useQuery(
    enrollmentListOptions({
      page: 1,
      perPage: PAGE_SIZE,
      status: activeStatus,
      search: search || undefined
    })
  );
  const tabsQuery = useQuery(enrollmentStatusTabsOptions());
  // Use open classes here so admin can pick from anything currently accepting
  // new enrolments. The BE assignable-class guard rejects bad picks at submit
  // time too, so this list is purely a convenience for the admin.
  const classesQuery = useQuery(classListOptions({ status: 'open' }));

  const enrollments = listQuery.data?.data ?? [];
  const selected =
    enrollments.find((e) => e.id === selectedId) ?? (selectedId ? null : enrollments[0]) ?? null;

  const visibleIds = enrollments.map((e) => e.id).join(',');
  React.useEffect(() => {
    if (!enrollments.length) return;
    if (!selectedId || !enrollments.some((e) => e.id === selectedId)) {
      void setSelectedId(enrollments[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, setSelectedId, visibleIds]);

  // Reset the assign-to-class radio whenever the selected enrollment changes.
  React.useEffect(() => {
    setSelectedClassId('');
  }, [selected?.id]);

  const approve = useApproveEnrollment();
  const waitlist = useWaitlistEnrollment();
  const bulk = useBulkActionEnrollments();

  const tabCounts = React.useMemo(() => {
    const map = new Map<EnrollmentStatusFilter, number>();
    (tabsQuery.data ?? []).forEach((tab) => map.set(tab.value, tab.count));
    return map;
  }, [tabsQuery.data]);

  const handleApprove = async (row: Enrollment, classId?: string) => {
    const targetClassId = classId ?? selectedClassId;
    if (!targetClassId) {
      toast.error(tToast('needClass'));
      return;
    }
    try {
      await approve.mutateAsync({ id: row.id, input: { classId: targetClassId } });
      toast.success(tToast('approveSuccess', { name: row.studentName }));
    } catch (e) {
      const { title, description } = formatApiError(e, tToast('approveError'));
      toast.error(title, description ? { description } : undefined);
    }
  };

  const handleWaitlist = async (row: Enrollment) => {
    try {
      await waitlist.mutateAsync(row.id);
      toast.success(tToast('waitlistSuccess', { name: row.studentName }));
    } catch (e) {
      const { title, description } = formatApiError(e, tToast('waitlistError'));
      toast.error(title, description ? { description } : undefined);
    }
  };

  const handleReject = (row: Enrollment) => setRejectTarget(row);

  // Row tap on either the desktop table or the mobile card list. selectedId
  // drives the inline panel on xl+; on <xl we also pop the Sheet because the
  // inline panel is hidden.
  const handleSelectRow = (id: string) => {
    void setSelectedId(id);
    if (isBelowXl) setMobileDetailOpen(true);
  };

  const handleToggleSelectAll = () => {
    if (bulkSelection.size === enrollments.length) {
      setBulkSelection(new Set());
    } else {
      setBulkSelection(new Set(enrollments.map((e) => e.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setBulkSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkApprove = async () => {
    if (!selectedClassId) {
      toast.error(tToast('needClass'));
      return;
    }
    if (bulkSelection.size === 0) {
      toast.error(tToast('needSelection'));
      return;
    }
    try {
      const result = await bulk.mutateAsync({
        ids: Array.from(bulkSelection),
        action: 'approve',
        classId: selectedClassId
      });
      toast.success(
        tToast('bulkApproveSuccess', { updated: result.updated, skipped: result.skipped })
      );
      setBulkSelection(new Set());
    } catch (e) {
      const { title, description } = formatApiError(e, tToast('bulkError'));
      toast.error(title, description ? { description } : undefined);
    }
  };

  const handleBulkWaitlist = async () => {
    if (bulkSelection.size === 0) {
      toast.error(tToast('needSelection'));
      return;
    }
    try {
      const result = await bulk.mutateAsync({
        ids: Array.from(bulkSelection),
        action: 'waitlist'
      });
      toast.success(tToast('bulkWaitlistSuccess', { updated: result.updated }));
      setBulkSelection(new Set());
    } catch (e) {
      const { title, description } = formatApiError(e, tToast('bulkError'));
      toast.error(title, description ? { description } : undefined);
    }
  };

  const classes = classesQuery.data?.data ?? [];
  const totalForTab = tabCounts.get(activeStatus) ?? enrollments.length;
  const allSelected = enrollments.length > 0 && bulkSelection.size === enrollments.length;

  return (
    <div className='space-y-4'>
      {/* Stack tabs and search on mobile so neither has to truncate; on md+
          they share the border-b row like the original design. */}
      <div className='flex flex-col gap-3 border-b md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-2'>
        {/* Tabs are horizontally scrollable on narrow viewports — wrapping 4
            tabs with badges to two lines breaks the underline alignment. */}
        <div className='-mb-px flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]'>
          {tabKeys.map((key) => {
            const active = activeStatus === key;
            const count = tabCounts.get(key) ?? 0;
            return (
              <button
                key={key}
                type='button'
                onClick={() => {
                  void setStatusParam(key);
                  setBulkSelection(new Set());
                }}
                className={cn(
                  'relative inline-flex h-10 shrink-0 items-center gap-2 px-3 text-sm md:px-4',
                  active
                    ? 'border-foreground -mb-px border-b-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tTabs(key)}
                {active ? (
                  <span className='bg-foreground text-background inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[10px]'>
                    {count}
                  </span>
                ) : (
                  <span className='text-muted-foreground font-mono text-[11px]'>{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className='flex items-center gap-2 pb-2'>
          <div className='relative w-full md:w-64'>
            <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
            <Input
              value={search}
              onChange={(e) => void setSearch(e.target.value || null)}
              placeholder={t('searchPlaceholder')}
              className='h-8 pl-8 text-[13px]'
            />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-12 gap-4'>
        <div className='bg-card col-span-12 overflow-hidden rounded-lg border shadow-sm xl:col-span-7'>
          <div className='bg-muted/40 flex items-center justify-between border-b px-4 py-2.5 text-[12px]'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='select-all-enrollments'
                checked={allSelected}
                onCheckedChange={handleToggleSelectAll}
                aria-label={tList('selectAll')}
              />
              <label htmlFor='select-all-enrollments' className='text-muted-foreground'>
                {tList('selectAll')}
              </label>
            </div>
            <div className='text-muted-foreground font-mono'>
              {tList('tabSummary', { count: totalForTab, status: tTabs(activeStatus) })}
            </div>
          </div>

          {listQuery.isLoading ? (
            <LoadingState minHeight='320px' message={t('loadingList')} />
          ) : enrollments.length === 0 ? (
            <div className='text-muted-foreground grid min-h-[280px] place-items-center px-6 text-center text-sm'>
              {t('noResults')}
            </div>
          ) : (
            <LoadingOverlay visible={listQuery.isFetching && !listQuery.isLoading}>
              {/* md+ : 5-column table. On <md the table overflows so we render
                  the card list below instead. */}
              <Table className='hidden md:table'>
                <TableHeader className='bg-muted/30'>
                  <TableRow>
                    <TableHead className='w-8 px-4' />
                    <TableHead className='text-[11px] tracking-wider uppercase'>
                      {tList('columns.student')}
                    </TableHead>
                    <TableHead className='text-[11px] tracking-wider uppercase'>
                      {tList('columns.requestedCourse')}
                    </TableHead>
                    <TableHead className='text-[11px] tracking-wider uppercase'>
                      {tList('columns.submitted')}
                    </TableHead>
                    <TableHead className='px-4 text-right text-[11px] tracking-wider uppercase'>
                      {tList('columns.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((row) => (
                    <EnrollmentRowItem
                      key={row.id}
                      row={row}
                      active={row.id === selected?.id}
                      selected={bulkSelection.has(row.id)}
                      onSelect={() => handleSelectRow(row.id)}
                      onToggleSelect={() => handleToggleSelect(row.id)}
                      onApprove={() => void handleApprove(row)}
                      onWaitlist={() => void handleWaitlist(row)}
                      onReject={() => handleReject(row)}
                    />
                  ))}
                </TableBody>
              </Table>
              <ul className='divide-y md:hidden'>
                {enrollments.map((row) => (
                  <EnrollmentCardItem
                    key={row.id}
                    row={row}
                    active={row.id === selected?.id}
                    selected={bulkSelection.has(row.id)}
                    onSelect={() => handleSelectRow(row.id)}
                    onToggleSelect={() => handleToggleSelect(row.id)}
                    onApprove={() => void handleApprove(row)}
                    onWaitlist={() => void handleWaitlist(row)}
                    onReject={() => handleReject(row)}
                  />
                ))}
              </ul>
            </LoadingOverlay>
          )}

          {/* On <md the bar floats above the card list (sticky bottom-0 inside
              the scrolling page) only when there's a selection — empty state
              would just add visual noise without an action target. On md+ it
              sits inline at the bottom of the card like before. bg-card is
              required for the sticky case so scrolling content doesn't bleed
              through. */}
          <div
            className={cn(
              'text-muted-foreground bg-card sticky bottom-0 z-10 flex items-center justify-between border-t px-4 py-2.5 text-[12px] md:static md:z-auto',
              bulkSelection.size === 0 && 'hidden md:flex'
            )}
          >
            <div>
              {tList('bulk.label')}
              <button
                className='hover:text-foreground ml-1 underline decoration-dotted disabled:opacity-50'
                disabled={bulk.isPending || bulkSelection.size === 0}
                onClick={() => void handleBulkApprove()}
              >
                {tList('bulk.approveSelected')}
              </button>{' '}
              ·
              <button
                className='hover:text-foreground ml-1 underline decoration-dotted disabled:opacity-50'
                disabled={bulk.isPending || bulkSelection.size === 0}
                onClick={() => void handleBulkWaitlist()}
              >
                {tList('bulk.moveToWaitlist')}
              </button>
            </div>
            <div>{tList('bulk.selectedCount', { count: bulkSelection.size })}</div>
          </div>
        </div>

        {/* xl+ : inline detail panel beside the list. <xl uses the Sheet below
            so the user isn't forced to scroll the whole page after tapping. */}
        <div className='hidden xl:col-span-5 xl:block'>
          {selected ? (
            <EnrollmentDetailPanel
              row={selected}
              classes={classes}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              onApprove={() => void handleApprove(selected)}
              onWaitlist={() => void handleWaitlist(selected)}
              onReject={() => handleReject(selected)}
              onEditPayment={() => setPaymentTarget(selected)}
              isApprovePending={approve.isPending}
              isWaitlistPending={waitlist.isPending}
              onClose={() => void setSelectedId(null)}
            />
          ) : (
            <aside className='bg-card text-muted-foreground grid min-h-[320px] place-items-center rounded-lg border border-dashed text-sm shadow-sm'>
              {tDetail('empty')}
            </aside>
          )}
        </div>
      </div>

      {/* <xl : detail in a bottom Sheet — opened explicitly by row tap so the
          list stays the primary surface. EnrollmentDetailPanel's own card
          chrome (border/rounded/shadow) is stripped so it blends into the
          sheet surface, matching the courses-view pattern. */}
      <Sheet open={isBelowXl && mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent
          side='bottom'
          className='h-[92vh] gap-0 overflow-hidden rounded-t-lg p-0 [&>button:last-of-type]:hidden'
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>{selected?.studentName ?? tDetail('empty')}</SheetTitle>
            <SheetDescription>{selected?.requestedCourse?.title ?? ''}</SheetDescription>
          </SheetHeader>
          <div className='relative flex shrink-0 items-center justify-center border-b py-2.5'>
            <div className='bg-muted h-1 w-10 rounded-full' />
            <SheetClose className='hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 transition-colors'>
              <Icons.close className='size-4' />
              <span className='sr-only'>{tDetail('close')}</span>
            </SheetClose>
          </div>
          {/* flex flex-col so the aside child (h-full + flex-1 body) can pin
              its footer to the bottom of the Sheet; scrolling happens inside
              the panel's body, not at this wrapper level. */}
          <div className='flex min-h-0 flex-1 flex-col [&>aside]:rounded-none [&>aside]:border-0 [&>aside]:shadow-none'>
            {selected ? (
              <EnrollmentDetailPanel
                row={selected}
                classes={classes}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                onApprove={() => {
                  void handleApprove(selected);
                  setMobileDetailOpen(false);
                }}
                onWaitlist={() => {
                  void handleWaitlist(selected);
                  setMobileDetailOpen(false);
                }}
                onReject={() => handleReject(selected)}
                onEditPayment={() => setPaymentTarget(selected)}
                isApprovePending={approve.isPending}
                isWaitlistPending={waitlist.isPending}
                onClose={() => setMobileDetailOpen(false)}
                hideClose
              />
            ) : (
              <div className='text-muted-foreground grid min-h-[320px] place-items-center p-6 text-sm'>
                {tDetail('empty')}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <RejectEnrollmentDialog
        enrollment={rejectTarget}
        open={rejectTarget != null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      />

      <PaymentDialog
        enrollment={paymentTarget}
        open={paymentTarget != null}
        onOpenChange={(open) => {
          if (!open) setPaymentTarget(null);
        }}
      />
    </div>
  );
}

export function EnrollmentsHeaderAction() {
  const t = useTranslations('enrollments');
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.upload className='size-3.5 rotate-180' />
        {t('export')}
      </Button>
      <ManualEnrollDialog />
    </div>
  );
}
