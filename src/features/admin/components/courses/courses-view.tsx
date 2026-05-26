'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading-state';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  courseCategoryTabsOptions,
  courseListOptions,
  isCourseCategory,
  type CourseCategoryFilter
} from '@/api/courses';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { AddCourseDialog } from './add-course-dialog';
import { CourseCard, CourseCardSkeleton } from './course-card';
import { CourseDetailPanel, CourseDetailPanelSkeleton } from './course-detail-panel';

export function CoursesView() {
  const t = useTranslations('courses');
  const [categoryParam, setCategoryParam] = useQueryState('category', parseAsString);
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedId, setSelectedId] = useQueryState('selected', parseAsString);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Split layout kicks in at lg; below it the detail lives in a bottom Sheet
  // that opens on card tap. JS + CSS breakpoints must stay in sync.
  const isBelowLg = useMediaQuery('(max-width: 1023px)');

  const category: CourseCategoryFilter = isCourseCategory(categoryParam) ? categoryParam : 'all';

  const {
    data: result,
    isFetching,
    isLoading
  } = useQuery(
    courseListOptions({
      category: isCourseCategory(categoryParam) ? categoryParam : undefined,
      search: search || undefined
    })
  );
  const { data: categoryTabs } = useQuery(courseCategoryTabsOptions());

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
          {categoryTabs
            ? categoryTabs.map((tab) => {
                const active = category === tab.value;
                return (
                  <button
                    key={tab.value}
                    type='button'
                    onClick={() => {
                      void setCategoryParam(tab.value === 'all' ? null : tab.value);
                    }}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px]',
                      active ? 'bg-foreground text-background border-foreground' : 'hover:bg-accent'
                    )}
                  >
                    {t(`categories.${tab.value}`)}
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
              onChange={(e) => void setSearch(e.target.value || null)}
              placeholder={t('searchPlaceholder')}
              className='h-8 pl-8 text-[13px]'
            />
          </div>
        </div>

        <LoadingOverlay visible={!isLoading && isFetching} message={t('updatingList')}>
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
