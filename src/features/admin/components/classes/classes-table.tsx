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
    // Card chrome wraps the whole list. min-h-0 + flex-1 + flex-col let the
    // tab bar stay pinned at the top while the inner table/cards area scrolls.
    <div className='bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex shrink-0 items-center gap-3 border-b p-3'>
        {tabs ? (
          // Horizontal scroll so the tabs don't wrap on narrow viewports.
          <Tabs
            value={filter}
            onValueChange={(v) => onFilterChange(v as ClassStatusFilter)}
            className='-mx-1 min-w-0 flex-1 overflow-x-auto px-1'
          >
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
        <div className='text-muted-foreground shrink-0 font-mono text-[12px]'>
          {t('ofTotal', { count: rows.length, total: totalAll })}
        </div>
      </div>

      {/* Scrollable content area: table on md+, stacked cards on <md.
          Vertical scroll on the outer; horizontal scroll is scoped to the table
          wrapper so the mobile card list cannot be pushed past the screen edge
          by the (hidden) table's intrinsic width. Scrollbar is hidden visually
          so dividers run flush to the card's right border. */}
      <div className='min-h-0 w-full min-w-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {/* md+ : full table */}
        <div className='hidden md:block md:overflow-x-auto'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  {t('columns.class')}
                </TableHead>
                <TableHead className='text-[11px] tracking-wider uppercase'>
                  {t('columns.teacher')}
                </TableHead>
                <TableHead className='hidden text-[11px] tracking-wider uppercase lg:table-cell'>
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
                  <TableCell
                    colSpan={5}
                    className='text-muted-foreground py-10 text-center text-sm'
                  >
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
                      <TableCell className='text-muted-foreground hidden py-3 font-mono text-[12px] lg:table-cell'>
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

        {/* < md : stacked card list */}
        <ul className='divide-y md:hidden'>
          {rows.length === 0 ? (
            <li className='text-muted-foreground py-10 text-center text-sm'>{t('noResults')}</li>
          ) : (
            rows.map((c) => {
              const isSelected = c.id === selectedId;
              return (
                <li key={c.id}>
                  <button
                    type='button'
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      'hover:bg-muted/30 flex w-full items-start gap-3 px-4 py-3 text-left transition',
                      isSelected && 'bg-muted/40'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold',
                        avatarToneClass[c.teacherTone]
                      )}
                    >
                      {c.teacherInitials}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0'>
                          <div className='truncate text-[14px] font-medium'>{c.name}</div>
                          <div className='text-muted-foreground truncate font-mono text-[11px]'>
                            {c.courseTitle} · {c.location}
                          </div>
                        </div>
                        {isSelected && (
                          // On very narrow viewports the row's bg-muted/40
                          // already conveys selection; the text label only
                          // shows from sm+ to avoid overflowing the card edge.
                          <span className='text-muted-foreground hidden shrink-0 font-mono text-[11px] sm:inline'>
                            {t('table.selected')}
                          </span>
                        )}
                      </div>
                      <div className='mt-2 flex flex-wrap items-center justify-between gap-2'>
                        <div className='text-muted-foreground font-mono text-[11px]'>
                          {c.teacherShort} · {c.schedule}
                        </div>
                        <CapacityCell enrolled={c.enrolled} capacity={c.capacity} />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export function ClassesTableSkeleton({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <div className='bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border shadow-sm'>
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
            <Skeleton className='h-9 w-9 shrink-0 rounded-full md:hidden' />
            <Skeleton className='h-9 flex-1' />
            <Skeleton className='hidden h-7 w-28 md:block' />
            <Skeleton className='hidden h-4 w-32 lg:block' />
            <Skeleton className='hidden h-7 w-24 md:block' />
            <Skeleton className='hidden h-4 w-12 md:block' />
          </div>
        ))}
      </div>
    </div>
  );
}
