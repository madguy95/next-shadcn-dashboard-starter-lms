'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading-state';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPageSize
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  classListOptions,
  classStatusTabsOptions,
  isClassStatus,
  type ClassStatusFilter
} from '@/api/classes';
import { courseListOptions } from '@/api/courses';
import { masterDataOptions } from '@/api/master-data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { AddClassDialog } from './add-class-dialog';
import { ClassDetailPanel, ClassDetailPanelSkeleton } from './class-detail-panel';
import { ClassesTable, ClassesTableSkeleton } from './classes-table';

export function ClassesView() {
  const t = useTranslations('classes');
  const tTable = useTranslations('table');
  const [statusParam, setStatusParam] = useQueryState('status', parseAsString);
  const [courseParam, setCourseParam] = useQueryState('courseId', parseAsString);
  const [locationParam, setLocationParam] = useQueryState('location', parseAsString);
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedId, setSelectedId] = useQueryState('selected', parseAsString);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage, setPerPage] = useQueryState('perPage', parseAsInteger.withDefault(20));
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `${pathname}?${params.toString()}`;
  };

  // The split layout kicks in at lg; below it, the detail lives in a Sheet
  // that opens on row tap. Matching breakpoints in JS + CSS keeps the two in sync.
  const isBelowLg = useMediaQuery('(max-width: 1023px)');

  const filter: ClassStatusFilter = isClassStatus(statusParam) ? statusParam : 'all';

  const {
    data: result,
    isFetching,
    isLoading
  } = useQuery(
    classListOptions({
      page,
      size: perPage,
      status: isClassStatus(statusParam) ? statusParam : undefined,
      search: search || undefined,
      courseId: courseParam ?? undefined,
      location: locationParam ?? undefined
    })
  );
  const { data: statusTabs } = useQuery(classStatusTabsOptions());
  const { data: coursesResult } = useQuery(courseListOptions({ page: 1, size: 100 }));
  const { data: locations } = useQuery(masterDataOptions('location'));

  const visible = result?.data ?? [];
  const totalAll = statusTabs?.find((tab) => tab.value === 'all')?.count ?? visible.length;
  const selected = visible.find((c) => c.id === selectedId) ?? visible[0];
  const visibleIds = visible.map((c) => c.id).join(',');

  // Keep `selected` query param in sync when filters narrow the list.
  useEffect(() => {
    if (!visible.length) return;
    if (!selectedId || !visible.some((c) => c.id === selectedId)) {
      void setSelectedId(visible[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, setSelectedId, visibleIds]);

  const handleSelect = (id: string) => {
    void setSelectedId(id);
    if (isBelowLg) setMobileDetailOpen(true);
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      {/* Search + filter bar pinned at the top. */}
      <div className='flex shrink-0 flex-wrap items-center gap-2'>
        <div className='relative flex-1 sm:max-w-64'>
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
        <Select
          value={courseParam ?? 'all'}
          onValueChange={(v) => {
            void setCourseParam(v === 'all' ? null : v);
            void setPage(1);
          }}
        >
          <SelectTrigger className='h-8 w-44 text-[13px]'>
            <SelectValue placeholder={t('filterCourse')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allCourses')}</SelectItem>
            {coursesResult?.data.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code} · {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={locationParam ?? 'all'}
          onValueChange={(v) => {
            void setLocationParam(v === 'all' ? null : v);
            void setPage(1);
          }}
        >
          <SelectTrigger className='h-8 w-40 text-[13px]'>
            <SelectValue placeholder={t('filterLocation')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allLocations')}</SelectItem>
            {locations?.map((loc) => (
              <SelectItem key={loc.id} value={loc.code}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Master-detail area: list on the left scrolls internally; on lg+ the
          detail panel is pinned on the right and scrolls independently.
          min-w-0 on the row + list column keeps the card from being pushed past
          the viewport edge on narrow screens (flex items default to min-width:auto
          which lets wide content grow the column). */}
      <div className='flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 lg:flex-row'>
        <div className='flex min-h-0 w-full min-w-0 flex-1 flex-col lg:flex-[7]'>
          {isLoading ? (
            <ClassesTableSkeleton />
          ) : (
            <LoadingOverlay visible={isFetching} message={t('updatingList')}>
              <>
                <ClassesTable
                  rows={visible}
                  selectedId={selected?.id ?? null}
                  onSelect={handleSelect}
                  filter={filter}
                  onFilterChange={(v) => {
                    void setStatusParam(v === 'all' ? null : v);
                    void setPage(1);
                  }}
                  tabs={statusTabs}
                  totalAll={totalAll}
                />
                <div className='flex items-center justify-between border-t px-4 py-2.5 text-[12px]'>
                  <div className='text-muted-foreground flex items-center gap-2'>
                    <span>{tTable('page', { current: page, total: result?.pageCount ?? 1 })}</span>
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
                          aria-disabled={page >= (result?.pageCount ?? 1)}
                          aria-label={tTable('nextPage')}
                          className={`size-7${page >= (result?.pageCount ?? 1) ? ' pointer-events-none opacity-50' : ''}`}
                        >
                          <Icons.chevronRight className='size-3.5' />
                        </PaginationLink>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            </LoadingOverlay>
          )}
        </div>

        {/* lg+ : inline detail panel — column is pinned, panel content scrolls
            inside a wrapper under LoadingOverlay (same pattern as CoursesView). */}
        <div className='hidden min-h-0 flex-col lg:flex lg:flex-[5]'>
          {isLoading ? (
            <ClassDetailPanelSkeleton />
          ) : (
            <LoadingOverlay visible={isFetching} message={t('updatingList')}>
              <div className='min-h-0 flex-1 overflow-auto pr-1'>
                {selected ? (
                  <ClassDetailPanel cls={selected} />
                ) : (
                  <div className='bg-card text-muted-foreground grid min-h-[320px] place-items-center rounded-lg border border-dashed text-sm shadow-sm'>
                    {t('detail.empty')}
                  </div>
                )}
              </div>
            </LoadingOverlay>
          )}
        </div>
      </div>

      {/* < lg : detail in a Sheet — opened by row tap. The default sheet X
          (top-right) is hidden because it overlapped content on the panel; a
          dedicated grab-bar with close button replaces it. The panel renders
          the same component as the inline desktop view, but we strip its outer
          chrome (border/rounded/shadow) so it blends into the sheet surface. */}
      <Sheet open={isBelowLg && mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent
          side='bottom'
          className='h-[92vh] gap-0 overflow-hidden rounded-t-lg p-0 [&>button:last-of-type]:hidden'
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>{selected?.name ?? t('detail.empty')}</SheetTitle>
            <SheetDescription>
              {selected ? `${selected.courseTitle} · ${selected.courseCode}` : ''}
            </SheetDescription>
          </SheetHeader>
          <div className='relative flex shrink-0 items-center justify-center border-b py-2.5'>
            <div className='bg-muted h-1 w-10 rounded-full' />
            <SheetClose className='hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 transition-colors'>
              <Icons.close className='size-4' />
              <span className='sr-only'>Close</span>
            </SheetClose>
          </div>
          <div className='min-h-0 flex-1 overflow-auto [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none'>
            {selected ? (
              <ClassDetailPanel cls={selected} />
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

export function ClassesHeaderAction() {
  const t = useTranslations('classes');
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.adjustments className='size-3.5' />
        {t('filters')}
      </Button>
      <AddClassDialog />
    </div>
  );
}
