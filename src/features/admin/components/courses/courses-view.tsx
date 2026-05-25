'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courseCategoryTabsOptions, courseListOptions } from '@/features/admin/api/queries';
import { isCourseCategory, type CourseCategoryFilter } from '@/features/admin/api/types';
import { cn } from '@/lib/utils';
import { AddCourseDialog } from './add-course-dialog';
import { CourseCard, CourseCardSkeleton } from './course-card';
import { CourseDetailPanel, CourseDetailPanelSkeleton } from './course-detail-panel';

export function CoursesView() {
  const t = useTranslations('courses');
  const [categoryParam, setCategoryParam] = useQueryState('category', parseAsString);
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedId, setSelectedId] = useQueryState('selected', parseAsString);

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

  return (
    <div className='grid grid-cols-12 gap-4'>
      <div className='col-span-12 space-y-4 xl:col-span-8'>
        <div className='flex flex-wrap items-center gap-2'>
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

        <LoadingOverlay visible={!isLoading && isFetching} message={t('updatingList')}>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : visible.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    selected={c.id === selected?.id}
                    onSelect={() => void setSelectedId(c.id)}
                  />
                ))}
            {!isLoading && visible.length === 0 && (
              <div className='text-muted-foreground col-span-full rounded-lg border border-dashed py-10 text-center text-sm'>
                {t('noResults')}
              </div>
            )}
          </div>
        </LoadingOverlay>
      </div>

      <div className='col-span-12 xl:col-span-4'>
        <LoadingOverlay visible={!isLoading && isFetching} message={t('updatingList')}>
          {isLoading ? (
            <CourseDetailPanelSkeleton />
          ) : selected ? (
            <CourseDetailPanel course={selected} />
          ) : (
            <div className='bg-card text-muted-foreground grid min-h-[320px] place-items-center rounded-lg border border-dashed text-sm shadow-sm'>
              {t('noResults')}
            </div>
          )}
        </LoadingOverlay>
      </div>
    </div>
  );
}

export function CoursesHeaderAction() {
  const t = useTranslations('courses');
  return (
    <div className='flex items-center gap-2'>
      <Tabs defaultValue='cards'>
        <TabsList className='h-9'>
          <TabsTrigger value='cards' className='h-7 px-3 text-sm'>
            <Icons.layoutGrid className='size-3.5' />
            {t('viewCards')}
          </TabsTrigger>
          <TabsTrigger value='table' className='h-7 px-3 text-sm'>
            <Icons.kanban className='size-3.5' />
            {t('viewTable')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <AddCourseDialog />
    </div>
  );
}
