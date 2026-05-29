import { Skeleton } from '@/components/ui/skeleton';

const HOUR_HEIGHT = 56;
const HOUR_COUNT = 10;
const WEEK_COLS = 7;

/**
 * Skeleton placeholder shown via Suspense fallback for first-load and route
 * transitions into the schedule page. Matches the real layout (filter card +
 * grid body + footer stats) so the surface doesn't jolt when data resolves.
 */
export function ScheduleViewSkeleton({ view = 'week' }: { view?: 'week' | 'day' | 'month' }) {
  return (
    <div className='space-y-4'>
      <FilterCardSkeleton />
      {view === 'month' ? (
        <MonthGridSkeleton />
      ) : (
        <WeekGridSkeleton dayColumns={view === 'day' ? 1 : WEEK_COLS} />
      )}
      <FooterStatsSkeleton />
    </div>
  );
}

function FilterCardSkeleton() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-wrap items-center gap-3 border-b p-3 px-4'>
        <Skeleton className='h-5 w-48' />
        <Skeleton className='h-3 w-32' />
        <div className='ml-auto flex flex-wrap items-center gap-2'>
          <Skeleton className='h-7 w-40' />
          <Skeleton className='h-7 w-36' />
          <Skeleton className='h-7 w-28' />
        </div>
      </div>
      <div className='bg-muted/30 flex flex-wrap items-center gap-4 px-4 py-2'>
        <Skeleton className='h-3 w-12' />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-3 w-16' />
        ))}
      </div>
    </div>
  );
}

function WeekGridSkeleton({ dayColumns }: { dayColumns: number }) {
  const colTemplate = dayColumns === 1 ? 'grid-cols-[64px_1fr]' : 'grid-cols-[64px_repeat(7,1fr)]';
  return (
    <div className='bg-card flex flex-col overflow-hidden rounded-lg border shadow-sm'>
      <div className={`bg-background grid shrink-0 border-b ${colTemplate}`}>
        <div className='border-r' />
        {Array.from({ length: dayColumns }).map((_, i) => (
          <div key={i} className='border-r px-2 py-2 text-center last:border-r-0'>
            <Skeleton className='mx-auto h-3 w-8' />
            <Skeleton className='mx-auto mt-1 h-4 w-5' />
          </div>
        ))}
      </div>
      <div className={`grid ${colTemplate}`} style={{ height: HOUR_COUNT * HOUR_HEIGHT }}>
        <div className='relative border-r'>
          {Array.from({ length: HOUR_COUNT }).map((_, i) => (
            <Skeleton
              key={i}
              className='absolute right-2 h-2 w-9'
              style={{ top: i * HOUR_HEIGHT - 4 }}
            />
          ))}
        </div>
        {Array.from({ length: dayColumns }).map((_, dayIdx) => (
          <div
            key={dayIdx}
            className='relative border-r last:border-r-0'
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent 0 55px, hsl(var(--border)) 55px 56px)'
            }}
          >
            {/* A couple of fake "events" per column so the surface reads as a
                calendar rather than an empty rectangle. */}
            <Skeleton
              className='absolute right-1 left-1 h-12'
              style={{ top: (dayIdx % 3) * 70 + 30 }}
            />
            {dayIdx % 2 === 0 && (
              <Skeleton
                className='absolute right-1 left-1 h-16'
                style={{ top: 220 + (dayIdx % 4) * 40 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthGridSkeleton() {
  return (
    <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
      <div className='bg-background grid shrink-0 border-b grid-cols-7'>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className='border-r px-2 py-2 text-center last:border-r-0'>
            <Skeleton className='mx-auto h-3 w-8' />
          </div>
        ))}
      </div>
      <div className='grid auto-rows-[minmax(110px,_auto)] grid-cols-7'>
        {Array.from({ length: 35 }).map((_, i) => {
          const lastCol = i % 7 === 6;
          const lastRow = i >= 28;
          return (
            <div
              key={i}
              className={`flex flex-col gap-1 border-r border-b p-2 ${
                lastCol ? 'border-r-0' : ''
              } ${lastRow ? 'border-b-0' : ''}`}
            >
              <Skeleton className='h-4 w-6' />
              {i % 3 === 0 && <Skeleton className='h-3 w-full' />}
              {i % 4 === 0 && <Skeleton className='h-3 w-3/4' />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FooterStatsSkeleton() {
  return (
    <div className='bg-muted/30 flex items-center justify-between gap-3 rounded-lg border px-5 py-3'>
      <Skeleton className='h-3 w-72' />
      <Skeleton className='h-3 w-20' />
    </div>
  );
}
