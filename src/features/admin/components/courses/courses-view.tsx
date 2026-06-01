'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { courseListOptions, courseToolTabsOptions, type CourseToolFilter } from '@/api/courses';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { AddCourseDialog } from './add-course-dialog';
import { CourseCard, CourseCardSkeleton } from './course-card';
import { CourseDetailPanel, CourseDetailPanelSkeleton } from './course-detail-panel';

export function CoursesView() {
  const t = useTranslations('courses');
  const tTable = useTranslations('table');
  const [toolParam, setToolParam] = useQueryState('tool', parseAsString);
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedId, setSelectedId] = useQueryState('selected', parseAsString);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage, setPerPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Split layout kicks in at lg; below it the detail lives in a bottom Sheet
  // that opens on card tap. JS + CSS breakpoints must stay in sync.
  const isBelowLg = useMediaQuery('(max-width: 1023px)');

  const tool: CourseToolFilter = toolParam && toolParam !== 'all' ? toolParam : 'all';

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `${pathname}?${params.toString()}`;
  };

  const {
    data: result,
    isFetching,
    isLoading
  } = useQuery(
    courseListOptions({
      tool: tool === 'all' ? undefined : tool,
      search: search || undefined,
      page,
      size: perPage
    })
  );
  const { data: toolTabs } = useQuery(courseToolTabsOptions());

  const visible = result?.data ?? [];
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
    <div className='flex min-h-0 flex-1 flex-col gap-4 lg:flex-row'>
      {/* Left: filter chips + search pinned at top, cards scroll below. */}
      <div className='flex min-h-0 flex-1 flex-col gap-4 lg:flex-[8]'>
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          {toolTabs
            ? toolTabs.map((tab) => {
                const active = tool === tab.value;
                return (
                  <button
                    key={tab.value}
                    type='button'
                    onClick={() => {
                      void setToolParam(tab.value === 'all' ? null : tab.value);
                      void setPage(1);
                    }}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px]',
                      active ? 'bg-foreground text-background border-foreground' : 'hover:bg-accent'
                    )}
                  >
                    {t(`tools.${tab.value}`)}
                    <span className='font-mono opacity-60'>{tab.count}</span>
                  </button>
                );
              })
            : Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-8 w-24 rounded-full' />
              ))}
          <div className='relative w-full sm:ml-auto sm:w-64'>
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

        <LoadingOverlay visible={!isLoading && isFetching} message={t('updatingList')}>
          <>
            <div className='min-h-0 flex-1 overflow-auto pr-1'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
                  : visible.map((c) => (
                      <CourseCard
                        key={c.id}
                        course={c}
                        selected={c.id === selected?.id}
                        onSelect={() => handleSelect(c.id)}
                      />
                    ))}
                {!isLoading && visible.length === 0 && (
                  <div className='text-muted-foreground col-span-full rounded-lg border border-dashed py-10 text-center text-sm'>
                    {t('noResults')}
                  </div>
                )}
              </div>
            </div>
            {!isLoading && (
              <div className='flex shrink-0 items-center justify-between border-t px-1 pt-2.5 text-[12px]'>
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
            )}
          </>
        </LoadingOverlay>
      </div>

      {/* lg+ : inline detail panel — column is pinned, panel content scrolls
          inside a wrapper that lives under LoadingOverlay (same pattern as the
          cards list on the left). Putting overflow on a wrapper rather than the
          column avoids relying on the overlay propagating min-h-0 perfectly. */}
      <div className='hidden min-h-0 flex-col lg:flex lg:flex-[4]'>
        <LoadingOverlay visible={!isLoading && isFetching} message={t('updatingList')}>
          <div className='min-h-0 flex-1 overflow-auto pr-1'>
            {isLoading ? (
              <CourseDetailPanelSkeleton />
            ) : selected ? (
              <CourseDetailPanel course={selected} />
            ) : (
              <div className='bg-card text-muted-foreground grid min-h-[320px] place-items-center rounded-lg border border-dashed text-sm shadow-sm'>
                {t('noResults')}
              </div>
            )}
          </div>
        </LoadingOverlay>
      </div>

      {/* < lg : detail in a Sheet — opened by card tap.
          Inner panel's card chrome (border/rounded/shadow) is stripped so it
          blends into the sheet surface. The default sheet X (top-right) is
          hidden because it overlapped the panel's "Edit" button on the cover;
          a dedicated grab-bar with close button replaces it. */}
      <Sheet open={isBelowLg && mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent
          side='bottom'
          className='h-[92vh] gap-0 overflow-hidden rounded-t-lg p-0 [&>button:last-of-type]:hidden'
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>{selected?.title ?? t('noResults')}</SheetTitle>
            <SheetDescription>{selected?.tagline ?? ''}</SheetDescription>
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
              <CourseDetailPanel course={selected} />
            ) : (
              <div className='text-muted-foreground grid min-h-[320px] place-items-center p-6 text-sm'>
                {t('noResults')}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function CoursesHeaderAction() {
  return <AddCourseDialog />;
}
