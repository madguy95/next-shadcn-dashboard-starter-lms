'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingOverlay } from '@/components/ui/loading-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { teacherCountsOptions, teacherListOptions } from '@/features/admin/api/queries';
import type { Teacher, TeacherStatus } from '@/features/admin/api/types';
import { avatarToneClass, teacherStatusClass, teacherStatusLabel } from '@/features/admin/data';
import { useDataTable } from '@/hooks/use-data-table';
import { cn } from '@/lib/utils';
import { AddTeacherDialog } from './add-teacher-dialog';

export function TeachersView() {
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
      status: (statusFilter ?? undefined) as TeacherStatus | undefined
    })
  );
  const { data: counts } = useQuery(teacherCountsOptions());

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
            aria-label='Select all'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 32
      },
      {
        id: 'teacher',
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Teacher' />,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className='flex items-center gap-2.5'>
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold',
                  avatarToneClass[t.tone]
                )}
              >
                {t.initials}
              </span>
              <div className='leading-tight'>
                <div className='font-medium'>{t.name}</div>
                <div className='text-muted-foreground font-mono text-[11px]'>{t.email}</div>
              </div>
            </div>
          );
        }
      },
      {
        id: 'subjects',
        accessorKey: 'subjects',
        header: 'Subjects',
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Classes' />,
        cell: ({ row }) => <span className='font-mono text-[12px]'>{row.original.classCount}</span>
      },
      {
        id: 'studentCount',
        accessorKey: 'studentCount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Students' />,
        cell: ({ row }) => (
          <span className='font-mono text-[12px]'>{row.original.studentCount}</span>
        )
      },
      {
        id: 'rating',
        accessorKey: 'rating',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rating' />,
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
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
              teacherStatusClass[row.original.status]
            )}
          >
            {teacherStatusLabel[row.original.status]}
          </span>
        ),
        enableSorting: false
      },
      {
        id: 'actions',
        cell: () => (
          <div className='inline-flex justify-end gap-1'>
            <Button variant='ghost' size='sm' className='h-7 px-2 text-[12px]'>
              Assign
            </Button>
            <Button variant='ghost' size='icon' className='h-7 w-7'>
              <Icons.ellipsis className='size-3.5' />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );

  const { table } = useDataTable({
    data: result?.data ?? [],
    columns,
    pageCount: result?.pageCount ?? 1,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage }
    }
  });

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <Tabs
        value={statusFilter ?? 'all'}
        onValueChange={(v) => {
          void setStatusFilter(v === 'all' ? null : v);
          void setPage(1);
        }}
      >
        <TabsList className='h-8'>
          <TabsTrigger value='all' className='h-6 px-2.5 text-[12px]'>
            All <span className='ml-1 font-mono opacity-60'>{counts?.all ?? '–'}</span>
          </TabsTrigger>
          <TabsTrigger value='active' className='h-6 px-2.5 text-[12px]'>
            Active <span className='ml-1 font-mono opacity-60'>{counts?.active ?? '–'}</span>
          </TabsTrigger>
          <TabsTrigger value='on_leave' className='h-6 px-2.5 text-[12px]'>
            On leave <span className='ml-1 font-mono opacity-60'>{counts?.on_leave ?? '–'}</span>
          </TabsTrigger>
          <TabsTrigger value='pending' className='h-6 px-2.5 text-[12px]'>
            Pending <span className='ml-1 font-mono opacity-60'>{counts?.pending ?? '–'}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <LoadingOverlay
        visible={isLoading || isFetching}
        message={isLoading ? 'Đang tải danh sách giáo viên…' : 'Đang cập nhật…'}
      >
        <DataTable table={table} />
      </LoadingOverlay>
    </div>
  );
}

export function TeachersHeaderAction() {
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.upload className='size-3.5 rotate-180' />
        Export CSV
      </Button>
      <AddTeacherDialog />
    </div>
  );
}
