'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { ClassRow, ClassStatusFilter, ClassStatusTab } from '@/api/classes';
import { avatarToneClass } from '@/features/admin/data';
import { cn } from '@/lib/utils';

function CapacityCell({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const pct = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
  const isLow = pct < 70;
  return (
    <div>
      <div className='font-mono text-[12px]'>
        {enrolled} / {capacity}
      </div>
      <div className='bg-muted mt-1 h-1 w-20 overflow-hidden rounded-full'>
        <div
          className={cn('h-full', isLow ? 'bg-amber-500' : 'bg-foreground')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ClassesTable({
  rows,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  tabs,
  totalAll
}: {
  rows: ClassRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: ClassStatusFilter;
  onFilterChange: (v: ClassStatusFilter) => void;
  tabs: ClassStatusTab[] | undefined;
  totalAll: number;
}) {
  const t = useTranslations('classes');
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex items-center gap-3 border-b p-3'>
        {tabs ? (
          <Tabs value={filter} onValueChange={(v) => onFilterChange(v as ClassStatusFilter)}>
            <TabsList className='h-8'>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className='h-6 px-2.5 text-[12px]'>
                  {tab.value === 'all' ? t('tabs.all') : t(`status.${tab.value}`)}
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
        <div className='text-muted-foreground ml-auto font-mono text-[12px]'>
          {t('ofTotal', { count: rows.length, total: totalAll })}
        </div>
      </div>
      <Table>
        <TableHeader className='bg-muted/40'>
          <TableRow>
            <TableHead className='text-[11px] tracking-wider uppercase'>
              {t('columns.class')}
            </TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>
              {t('columns.teacher')}
            </TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>
              {t('columns.schedule')}
            </TableHead>
            <TableHead className='text-[11px] tracking-wider uppercase'>
              {t('columns.capacity')}
            </TableHead>
            <TableHead className='px-4 text-right' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='text-muted-foreground py-10 text-center text-sm'>
                {t('noResults')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((c) => {
              const isSelected = c.id === selectedId;
              return (
                <TableRow
                  key={c.id}
                  className={cn('cursor-pointer', isSelected && 'bg-muted/40')}
                  onClick={() => onSelect(c.id)}
                >
                  <TableCell className='px-4 py-3'>
                    <div className='font-medium'>{c.name}</div>
                    <div className='text-muted-foreground font-mono text-[11px]'>
                      {c.courseTitle} · {c.location}
                    </div>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={cn(
                          'grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold',
                          avatarToneClass[c.teacherTone]
                        )}
                      >
                        {c.teacherInitials}
                      </span>
                      <span className='text-[13px]'>{c.teacherShort}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground py-3 font-mono text-[12px]'>
                    {c.schedule}
                  </TableCell>
                  <TableCell className='py-3'>
                    <CapacityCell enrolled={c.enrolled} capacity={c.capacity} />
                  </TableCell>
                  <TableCell className='px-4 py-3 text-right'>
                    {isSelected ? (
                      <span className='text-muted-foreground font-mono text-[12px]'>
                        {t('table.selected')}
                      </span>
                    ) : (
                      <button
                        type='button'
                        className='text-muted-foreground hover:text-foreground text-[12px]'
                      >
                        {t('table.open')}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function ClassesTableSkeleton({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex items-center gap-3 border-b p-3'>
        <div className='flex h-8 items-center gap-1'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-6 w-20 rounded-md' />
          ))}
        </div>
        <Skeleton className='ml-auto h-4 w-16' />
      </div>
      <div className='divide-y'>
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className='flex items-center gap-4 px-4 py-3'>
            <Skeleton className='h-9 flex-1' />
            <Skeleton className='h-7 w-28' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-7 w-24' />
            <Skeleton className='h-4 w-12' />
          </div>
        ))}
      </div>
    </div>
  );
}
