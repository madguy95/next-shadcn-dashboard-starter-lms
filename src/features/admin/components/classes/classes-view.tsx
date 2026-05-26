'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading-state';
import {
  classListOptions,
  classStatusTabsOptions,
  isClassStatus,
  type ClassStatusFilter
} from '@/api/classes';
import { AddClassDialog } from './add-class-dialog';
import { ClassDetailPanel, ClassDetailPanelSkeleton } from './class-detail-panel';
import { ClassesTable, ClassesTableSkeleton } from './classes-table';

export function ClassesView() {
  const t = useTranslations('classes');
  const [statusParam, setStatusParam] = useQueryState('status', parseAsString);
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedId, setSelectedId] = useQueryState('selected', parseAsString);

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

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative ml-auto w-64'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(e) => void setSearch(e.target.value || null)}
            placeholder={t('searchPlaceholder')}
            className='h-8 pl-8 text-[13px]'
          />
        </div>
      </div>

      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-12 xl:col-span-7'>
          {isLoading ? (
            <ClassesTableSkeleton />
          ) : (
            <LoadingOverlay visible={isFetching} message={t('updatingList')}>
              <ClassesTable
                rows={visible}
                selectedId={selected?.id ?? null}
                onSelect={(id) => void setSelectedId(id)}
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
        <div className='col-span-12 xl:col-span-5'>
          {isLoading ? (
            <ClassDetailPanelSkeleton />
          ) : (
            <LoadingOverlay visible={isFetching} message={t('updatingList')}>
              {selected ? (
                <ClassDetailPanel cls={selected} />
              ) : (
                <div className='bg-card text-muted-foreground grid min-h-[320px] place-items-center rounded-lg border border-dashed text-sm shadow-sm'>
                  {t('detail.empty')}
                </div>
              )}
            </LoadingOverlay>
          )}
        </div>
      </div>
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
