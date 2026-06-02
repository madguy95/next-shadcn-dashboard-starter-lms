'use client';

import { useQuery } from '@tanstack/react-query';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingOverlay, LoadingState } from '@/components/ui/loading-state';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPageSize
} from '@/components/ui/pagination';
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
import {
  consultationListOptions,
  isConsultationStatus,
  useDeleteConsultationRequest,
  useUpdateConsultationStatus,
  type ConsultationRequest,
  type ConsultationStatus,
  type ConsultationStatusFilter
} from '@/api/consultation-requests';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const STATUS_TABS: ConsultationStatusFilter[] = ['new', 'contacted', 'enrolled', 'not_interested'];

const STATUS_NEXT_ACTIONS: Record<ConsultationStatus, ConsultationStatus[]> = {
  new: ['contacted', 'not_interested'],
  contacted: ['enrolled', 'not_interested'],
  enrolled: ['contacted'],
  not_interested: ['contacted']
};

function StatusBadge({ status }: { status: ConsultationStatus }) {
  const t = useTranslations('consultationRequests.status');
  const cls =
    status === 'new'
      ? 'bg-sky-100 text-sky-800'
      : status === 'contacted'
        ? 'bg-amber-100 text-amber-800'
        : status === 'enrolled'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-muted text-muted-foreground';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-medium',
        cls
      )}
    >
      {t(status)}
    </span>
  );
}

function ConsultationRowItem({
  row,
  active,
  onSelect
}: {
  row: ConsultationRequest;
  active: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations('consultationRequests.list');
  const format = useFormatter();
  const now = useNow({ updateInterval: 60 * 1000 });
  const createdLabel = format.relativeTime(new Date(row.createdAt), now);

  return (
    <TableRow
      onClick={onSelect}
      className={cn('cursor-pointer', active && 'bg-foreground/[0.03] hover:bg-foreground/[0.05]')}
    >
      <TableCell className='py-3'>
        <div className='font-medium'>{row.parentName}</div>
        <div className='text-muted-foreground font-mono text-[11px]'>{row.parentPhone}</div>
      </TableCell>
      <TableCell className='py-3 text-[13px]'>{row.childName ?? '—'}</TableCell>
      <TableCell className='py-3 text-[13px]'>{row.interestedCourseTitle ?? '—'}</TableCell>
      <TableCell className='py-3'>
        {row.note ? (
          <span className='text-muted-foreground line-clamp-1 font-mono text-[11px]'>
            {row.note}
          </span>
        ) : (
          <span className='text-muted-foreground font-mono text-[11px]'>—</span>
        )}
      </TableCell>
      <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
        {createdLabel}
      </TableCell>
      <TableCell className='py-3'>
        <StatusBadge status={row.status} />
      </TableCell>
      <TableCell className='text-muted-foreground py-3 font-mono text-[11px]'>
        {t('openDetail')} →
      </TableCell>
    </TableRow>
  );
}

function ConsultationCardItem({
  row,
  active,
  onSelect
}: {
  row: ConsultationRequest;
  active: boolean;
  onSelect: () => void;
}) {
  const format = useFormatter();
  const now = useNow({ updateInterval: 60 * 1000 });
  const createdLabel = format.relativeTime(new Date(row.createdAt), now);

  return (
    <li
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer flex-col gap-1.5 p-4 transition-colors',
        active && 'bg-foreground/[0.03]'
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div>
          <div className='text-[14px] font-medium'>{row.parentName}</div>
          <div className='text-muted-foreground font-mono text-[11px]'>{row.parentPhone}</div>
        </div>
        <StatusBadge status={row.status} />
      </div>
      {row.interestedCourseTitle && <div className='text-[13px]'>{row.interestedCourseTitle}</div>}
      {row.note && (
        <div className='text-muted-foreground line-clamp-2 font-mono text-[11px]'>{row.note}</div>
      )}
      <div className='text-muted-foreground font-mono text-[11px]'>{createdLabel}</div>
    </li>
  );
}

function ConsultationDetailPanel({
  row,
  onUpdateStatus,
  onDelete,
  isUpdating,
  isDeleting,
  onClose,
  hideClose = false
}: {
  row: ConsultationRequest;
  onUpdateStatus: (status: ConsultationStatus) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  onClose: () => void;
  hideClose?: boolean;
}) {
  const t = useTranslations('consultationRequests.detail');
  const tStatus = useTranslations('consultationRequests.status');
  const format = useFormatter();
  const now = useNow({ updateInterval: 60 * 1000 });
  const createdLabel = format.relativeTime(new Date(row.createdAt), now);

  const nextActions = STATUS_NEXT_ACTIONS[row.status];

  return (
    <aside className='bg-card flex h-full min-h-0 flex-col overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex shrink-0 items-start justify-between gap-3 border-b px-4 pt-4 pb-3 md:px-5'>
        <div className='min-w-0 flex-1'>
          <div className='text-muted-foreground font-mono text-[12px]'>
            {t('idLabel', { id: row.id })}
          </div>
          <div className='truncate text-[17px] font-semibold tracking-tight'>{row.parentName}</div>
          <div className='text-muted-foreground font-mono text-[13px]'>{row.parentPhone}</div>
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
            {t('status')}
          </div>
          <StatusBadge status={row.status} />
        </section>

        <section className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('childName')}
            </div>
            <div className='mt-1 text-sm font-medium'>{row.childName ?? '—'}</div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground text-[10px] tracking-wider uppercase'>
              {t('createdAt')}
            </div>
            <div className='mt-1 font-mono text-sm'>{createdLabel}</div>
          </div>
        </section>

        {row.interestedCourseTitle && (
          <section>
            <div className='text-muted-foreground mb-2 text-[11px] font-medium tracking-wider uppercase'>
              {t('interestedCourse')}
            </div>
            <div className='flex items-center gap-3 rounded-md border p-3'>
              <div className='bg-muted grid h-9 w-9 place-items-center rounded-md border'>
                <Icons.book className='text-muted-foreground size-4' />
              </div>
              <div className='min-w-0 flex-1 text-sm font-medium'>{row.interestedCourseTitle}</div>
            </div>
          </section>
        )}

        {row.note && (
          <section>
            <div className='text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wider uppercase'>
              {t('note')}
            </div>
            <div className='bg-muted/30 rounded-md border p-3 text-[13px] leading-relaxed'>
              {row.note}
            </div>
          </section>
        )}
      </div>

      <div className='bg-muted/30 flex shrink-0 flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2 md:px-5'>
        <Button
          variant='ghost'
          size='sm'
          className='text-destructive hover:text-destructive self-start text-[12px] sm:self-auto'
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Icons.trash className='size-3' />
          {isDeleting ? t('deleting') : t('delete')}
        </Button>
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center'>
          {nextActions.map((next) => (
            <Button
              key={next}
              variant={next === 'enrolled' ? 'default' : 'outline'}
              size='sm'
              className='h-9 w-full sm:w-auto'
              onClick={() => onUpdateStatus(next)}
              disabled={isUpdating}
            >
              {isUpdating ? t('updating') : t('moveTo', { status: tStatus(next) })}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function ConsultationRequestsView() {
  const t = useTranslations('consultationRequests');
  const tTabs = useTranslations('consultationRequests.tabs');
  const tList = useTranslations('consultationRequests.list');
  const tTable = useTranslations('table');

  const [statusParam, setStatusParam] = useQueryState('status', parseAsString.withDefault('new'));
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedId, setSelectedId] = useQueryState('selected', parseAsString);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage, setPerPage] = useQueryState('perPage', parseAsInteger.withDefault(20));

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `${pathname}?${params.toString()}`;
  };

  const isBelowXl = useMediaQuery('(max-width: 1279px)');
  const [mobileDetailOpen, setMobileDetailOpen] = React.useState(false);

  const activeStatus = isConsultationStatus(statusParam) ? statusParam : 'new';
  const statusFilter = statusParam === 'all' ? undefined : activeStatus;

  const listQuery = useQuery(
    consultationListOptions({
      page,
      perPage,
      status: isConsultationStatus(statusParam) ? statusParam : undefined,
      search: search || undefined
    })
  );

  const requests = listQuery.data?.data ?? [];
  const selected =
    requests.find((r) => r.id === selectedId) ?? (selectedId ? null : requests[0]) ?? null;

  const visibleIds = requests.map((r) => r.id).join(',');
  React.useEffect(() => {
    if (!requests.length) return;
    if (!selectedId || !requests.some((r) => r.id === selectedId)) {
      void setSelectedId(requests[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, setSelectedId, visibleIds]);

  const updateStatus = useUpdateConsultationStatus();
  const deleteRequest = useDeleteConsultationRequest();

  const handleUpdateStatus = async (row: ConsultationRequest, status: ConsultationStatus) => {
    try {
      await updateStatus.mutateAsync({ id: row.id, input: { status } });
      toast.success(t('toast.statusUpdated'));
    } catch (e) {
      const { title, description } = formatApiError(e, t('toast.statusError'));
      toast.error(title, description ? { description } : undefined);
    }
  };

  const handleDelete = async (row: ConsultationRequest) => {
    try {
      await deleteRequest.mutateAsync(row.id);
      toast.success(t('toast.deleted'));
      if (selectedId === row.id) void setSelectedId(null);
      setMobileDetailOpen(false);
    } catch (e) {
      const { title, description } = formatApiError(e, t('toast.deleteError'));
      toast.error(title, description ? { description } : undefined);
    }
  };

  const handleSelectRow = (id: string) => {
    void setSelectedId(id);
    if (isBelowXl) setMobileDetailOpen(true);
  };

  const tabKeys: ConsultationStatusFilter[] = ['new', 'contacted', 'enrolled', 'not_interested'];

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <div className='flex shrink-0 flex-col gap-3 border-b md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-2'>
        <div className='-mb-px flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]'>
          {tabKeys.map((key) => {
            const active = statusParam === key || (statusParam === 'new' && key === 'new');
            return (
              <button
                key={key}
                type='button'
                onClick={() => {
                  void setStatusParam(key);
                  void setPage(1);
                }}
                className={cn(
                  'relative inline-flex h-10 shrink-0 items-center gap-2 px-3 text-sm md:px-4',
                  active
                    ? 'border-foreground -mb-px border-b-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tTabs(key)}
              </button>
            );
          })}
        </div>
        <div className='flex items-center gap-2 pb-2'>
          <div className='relative w-full md:w-64'>
            <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
            <Input
              value={search}
              onChange={(e) => {
                void setSearch(e.target.value || null);
                void setPage(1);
              }}
              placeholder={t('searchPlaceholder')}
              className='h-8 pl-8 text-[13px]'
            />
          </div>
        </div>
      </div>

      <div className='flex min-h-0 flex-1 gap-4'>
        <div className='flex min-h-0 flex-1 flex-col xl:flex-[7]'>
          <div className='bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border shadow-sm'>
            <div className='min-h-0 flex-1 overflow-y-auto'>
              {listQuery.isLoading ? (
                <LoadingState minHeight='320px' message={t('loadingList')} />
              ) : requests.length === 0 ? (
                <div className='text-muted-foreground grid min-h-[280px] place-items-center px-6 text-center text-sm'>
                  {t('noResults')}
                </div>
              ) : (
                <LoadingOverlay visible={listQuery.isFetching && !listQuery.isLoading}>
                  <Table className='hidden md:table'>
                    <TableHeader className='bg-muted/30'>
                      <TableRow>
                        <TableHead className='text-[11px] tracking-wider uppercase'>
                          {tList('columns.parent')}
                        </TableHead>
                        <TableHead className='text-[11px] tracking-wider uppercase'>
                          {tList('columns.child')}
                        </TableHead>
                        <TableHead className='text-[11px] tracking-wider uppercase'>
                          {tList('columns.course')}
                        </TableHead>
                        <TableHead className='text-[11px] tracking-wider uppercase'>
                          {tList('columns.note')}
                        </TableHead>
                        <TableHead className='text-[11px] tracking-wider uppercase'>
                          {tList('columns.submitted')}
                        </TableHead>
                        <TableHead className='text-[11px] tracking-wider uppercase'>
                          {tList('columns.status')}
                        </TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((row) => (
                        <ConsultationRowItem
                          key={row.id}
                          row={row}
                          active={row.id === selected?.id}
                          onSelect={() => handleSelectRow(row.id)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                  <ul className='divide-y md:hidden'>
                    {requests.map((row) => (
                      <ConsultationCardItem
                        key={row.id}
                        row={row}
                        active={row.id === selected?.id}
                        onSelect={() => handleSelectRow(row.id)}
                      />
                    ))}
                  </ul>
                </LoadingOverlay>
              )}
            </div>

            <div className='text-muted-foreground bg-card flex shrink-0 items-center justify-between border-t px-4 py-2.5 text-[12px]'>
              <div className='font-mono'>
                {tList('total', { count: listQuery.data?.total ?? 0 })}
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between px-4 py-2.5 text-[12px]'>
            <div className='text-muted-foreground flex items-center gap-2'>
              <span>
                {tTable('page', { current: page, total: listQuery.data?.pageCount ?? 1 })}
              </span>
              <PaginationPageSize
                value={perPage}
                onChange={(v) => {
                  void setPerPage(v);
                  void setPage(1);
                }}
                label={tTable('rowsPerPage')}
              />
            </div>
            <Pagination className='mx-0 w-auto'>
              <PaginationContent className='gap-0'>
                <PaginationItem>
                  <PaginationLink
                    href={buildPageUrl(page - 1)}
                    size='icon'
                    aria-disabled={page <= 1}
                    aria-label={tTable('previousPage')}
                    className={`size-7${page <= 1 ? ' pointer-events-none opacity-50' : ''}`}
                  >
                    <Icons.chevronLeft className='size-3.5' />
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href={buildPageUrl(page + 1)}
                    size='icon'
                    aria-disabled={page >= (listQuery.data?.pageCount ?? 1)}
                    aria-label={tTable('nextPage')}
                    className={`size-7${page >= (listQuery.data?.pageCount ?? 1) ? ' pointer-events-none opacity-50' : ''}`}
                  >
                    <Icons.chevronRight className='size-3.5' />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <div className='hidden xl:flex xl:min-h-0 xl:flex-[5] xl:flex-col'>
          {selected ? (
            <ConsultationDetailPanel
              row={selected}
              onUpdateStatus={(status) => void handleUpdateStatus(selected, status)}
              onDelete={() => void handleDelete(selected)}
              isUpdating={updateStatus.isPending}
              isDeleting={deleteRequest.isPending}
              onClose={() => void setSelectedId(null)}
            />
          ) : (
            <aside className='bg-card text-muted-foreground grid min-h-[320px] place-items-center rounded-lg border border-dashed text-sm shadow-sm'>
              {t('detail.empty')}
            </aside>
          )}
        </div>
      </div>

      <Sheet open={isBelowXl && mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent
          side='bottom'
          className='h-[92vh] gap-0 overflow-hidden rounded-t-lg p-0 [&>button:last-of-type]:hidden'
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>{selected?.parentName ?? t('detail.empty')}</SheetTitle>
            <SheetDescription>{selected?.parentPhone ?? ''}</SheetDescription>
          </SheetHeader>
          <div className='relative flex shrink-0 items-center justify-center border-b py-2.5'>
            <div className='bg-muted h-1 w-10 rounded-full' />
            <SheetClose className='hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 transition-colors'>
              <Icons.close className='size-4' />
              <span className='sr-only'>{t('detail.close')}</span>
            </SheetClose>
          </div>
          <div className='flex min-h-0 flex-1 flex-col [&>aside]:rounded-none [&>aside]:border-0 [&>aside]:shadow-none'>
            {selected ? (
              <ConsultationDetailPanel
                row={selected}
                onUpdateStatus={(status) => void handleUpdateStatus(selected, status)}
                onDelete={() => void handleDelete(selected)}
                isUpdating={updateStatus.isPending}
                isDeleting={deleteRequest.isPending}
                onClose={() => setMobileDetailOpen(false)}
                hideClose
              />
            ) : (
              <div className='text-muted-foreground grid min-h-[320px] place-items-center p-6 text-sm'>
                {t('detail.empty')}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
