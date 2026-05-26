'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import {
  isTeacherStatus,
  teacherListOptions,
  teacherStatusTabsOptions,
  type Teacher
} from '@/api/teachers';
import { avatarToneClass, teacherStatusClass } from '@/features/admin/data';
import { useDataTable } from '@/hooks/use-data-table';
import { cn } from '@/lib/utils';
import { AddTeacherDialog } from './add-teacher-dialog';
import { TeacherRowActions } from './teacher-row-actions';
import { TeachersCardList, TeachersCardListSkeleton } from './teachers-card-list';

export function TeachersView() {
  const t = useTranslations('teachers');
  const tTable = useTranslations('table');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [statusFilter, setStatusFilter] = useQueryState('status', parseAsString);

  const {
    data: result,
    isFetching,
    isLoading
  } = useQuery(
    teacherListOptions({
      page,
      perPage,
      status: isTeacherStatus(statusFilter) ? statusFilter : undefined
    })
  );
  const { data: statusTabs } = useQuery(teacherStatusTabsOptions());

  const columns = React.useMemo<ColumnDef<Teacher>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label={tTable('selectAll')}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label={tTable('selectRow', { name: row.original.name })}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 32
      },
      {
        id: 'teacher',
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('columns.teacher')} />
        ),
        cell: ({ row }) => {
          const teacher = row.original;
          return (
            <div className='flex items-center gap-2.5'>
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold',
                  avatarToneClass[teacher.tone]
                )}
              >
                {teacher.initials}
              </span>
              <div className='leading-tight'>
                <div className='font-medium'>{teacher.name}</div>
                <div className='text-muted-foreground font-mono text-[11px]'>{teacher.email}</div>
              </div>
            </div>
          );
        }
      },
      {
        id: 'phone',
        accessorKey: 'phone',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('columns.phone')} />
        ),
        cell: ({ row }) => <span className='font-mono text-[12px]'>{row.original.phone}</span>,
        enableSorting: false
      },
      {
        id: 'subjects',
        accessorKey: 'subjects',
        header: t('columns.subjects'),
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-1'>
            {row.original.subjects.map((s) => (
              <span key={s} className='bg-muted rounded px-1.5 py-0.5 text-[11px]'>
                {s}
              </span>
            ))}
          </div>
        ),
        enableSorting: false
      },
      {
        id: 'classCount',
        accessorKey: 'classCount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('columns.classes')} />
        ),
        cell: ({ row }) => <span className='font-mono text-[12px]'>{row.original.classCount}</span>
      },
      {
        id: 'studentCount',
        accessorKey: 'studentCount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('columns.students')} />
        ),
        cell: ({ row }) => (
          <span className='font-mono text-[12px]'>{row.original.studentCount}</span>
        )
      },
      {
        id: 'rating',
        accessorKey: 'rating',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('columns.rating')} />
        ),
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Icons.star className='size-3.5 fill-amber-500 text-amber-500' />
            <span className='font-mono text-[12px]'>{row.original.rating.toFixed(1)}</span>
          </div>
        )
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('columns.status'),
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
              teacherStatusClass[row.original.status]
            )}
          >
            {t(`status.${row.original.status}`)}
          </span>
        ),
        enableSorting: false
      },
      {
        id: 'actions',
        cell: ({ row }) => <TeacherRowActions teacher={row.original} />,
        enableSorting: false,
        enableHiding: false
      }
    ],
    [t, tTable]
  );

  const { table } = useDataTable({
    data: result?.data ?? [],
    columns,
    pageCount: result?.pageCount ?? 1,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage }
    }
  });

  const rows = result?.data ?? [];

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Status tabs — horizontally scrollable so they don't wrap on narrow viewports. */}
      {statusTabs ? (
        <Tabs
          value={statusFilter ?? 'all'}
          onValueChange={(v) => {
            void setStatusFilter(v === 'all' ? null : v);
            void setPage(1);
          }}
          className='-mx-1 min-w-0 max-w-full overflow-x-auto px-1'
        >
          <TabsList className='h-8'>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className='h-6 px-2.5 text-[12px]'>
                {tab.value === 'all' ? t('tabs.all') : t(`status.${tab.value}`)}{' '}
                <span className='ml-1 font-mono opacity-60'>{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : (
        <div className='flex h-8 items-center gap-1'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-6 w-20 rounded-md' />
          ))}
        </div>
      )}

      {/* md+ : DataTable (own pagination) */}
      <div className='hidden md:flex md:flex-1 md:flex-col'>
        {isLoading ? (
          <DataTableSkeleton
            columnCount={9}
            rowCount={perPage}
            withViewOptions={false}
            withPagination
          />
        ) : (
          <LoadingOverlay visible={isFetching} message={t('updatingList')}>
            <DataTable table={table} />
          </LoadingOverlay>
        )}
      </div>

      {/* < md : card list + separate pagination, sharing the same table instance */}
      <div className='flex flex-col gap-2.5 md:hidden'>
        {isLoading ? (
          <TeachersCardListSkeleton rowCount={perPage} />
        ) : (
          <LoadingOverlay visible={isFetching} message={t('updatingList')}>
            <TeachersCardList rows={rows} />
          </LoadingOverlay>
        )}
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

export function TeachersHeaderAction() {
  const t = useTranslations('teachers');
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.upload className='size-3.5 rotate-180' />
        {t('exportCsv')}
      </Button>
      <AddTeacherDialog />
    </div>
  );
}
