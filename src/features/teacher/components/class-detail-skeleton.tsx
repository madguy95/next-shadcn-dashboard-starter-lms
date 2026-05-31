import { Skeleton } from '@/components/ui/skeleton';

export function ClassDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-5 w-40' />

      {/* Header card */}
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <Skeleton className='h-24 w-full rounded-none' />
        <div className='flex flex-wrap items-start justify-between gap-6 p-5'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-48' />
            <Skeleton className='h-7 w-64' />
            <Skeleton className='h-4 w-72' />
          </div>
          <div className='flex flex-wrap gap-2'>
            <Skeleton className='h-9 w-28' />
            <Skeleton className='h-9 w-28' />
            <Skeleton className='h-9 w-36' />
          </div>
        </div>
        <div className='grid grid-cols-2 divide-x border-t md:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='space-y-2 px-5 py-3'>
              <Skeleton className='h-3 w-16' />
              <Skeleton className='h-6 w-24' />
              <Skeleton className='h-3 w-20' />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-4 border-b pb-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-32' />
        ))}
      </div>

      {/* Table body */}
      <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
        <div className='flex items-center gap-3 border-b p-3 px-4'>
          <Skeleton className='h-8 w-72' />
          <Skeleton className='h-8 w-24' />
          <Skeleton className='ml-auto h-4 w-20' />
        </div>
        <div className='divide-y'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='flex items-center gap-3 px-4 py-3'>
              <Skeleton className='size-8 rounded-full' />
              <div className='flex-1 space-y-1.5'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-3 w-24' />
              </div>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-28' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
