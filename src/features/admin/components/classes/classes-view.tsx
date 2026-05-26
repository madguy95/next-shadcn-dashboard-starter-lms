'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
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
import {
  classListOptions,
  classStatusTabsOptions,
  isClassStatus,
  type ClassStatusFilter
} from '@/api/classes';
import { useMediaQuery } from '@/hooks/use-media-query';
import { AddClassDialog } from './add-class-dialog';
import { ClassDetailPanel, ClassDetailPanelSkeleton } from './class-detail-panel';
import { ClassesTable, ClassesTableSkeleton } from './classes-table';

export function ClassesView() {
  const t = useTranslations('classes');
  const [statusParam, setStatusParam] = useQueryState('status', parseAsString);
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedId, setSelectedId] = useQueryState('selected', parseAsString);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

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
      status: isClassStatus(statusParam) ? statusParam : undefined,
      search: search || undefined
    })
  );
  const { data: statusTabs } = useQuery(classStatusTabsOptions());

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
      {/* Search bar pinned at the top. */}
      <div className='flex shrink-0 flex-wrap items-center gap-2'>
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
              <ClassesTable
                rows={visible}
                selectedId={selected?.id ?? null}
                onSelect={handleSelect}
                filter={filter}
                onFilterChange={(v) => {
                  void setStatusParam(v === 'all' ? null : v);
                }}
                tabs={statusTabs}
                totalAll={totalAll}
              />
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
