import React from 'react';
import { Heading } from '../ui/heading';
import type { InfobarContent } from '@/components/ui/infobar';
import { cn } from '@/lib/utils';

function PageSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='bg-muted mb-2 h-8 w-48 rounded' />
          <div className='bg-muted h-4 w-96 rounded' />
        </div>
      </div>
      <div className='bg-muted mt-6 h-40 w-full rounded-lg' />
      <div className='bg-muted h-40 w-full rounded-lg' />
    </div>
  );
}

/**
 * Page shell for admin routes.
 *
 * The shell is viewport-bound (root wrapper uses `h-svh overflow-hidden`), so
 * tall pages must scroll internally rather than the document.
 *
 * - `scrollable` (default `true`): the content area becomes `overflow-y-auto`.
 *   Use this for pages whose content has natural height (dashboard, schedule,
 *   master-detail pages where the whole page can scroll).
 *
 * - `scrollable={false}`: the content area is just a fixed-height flex column.
 *   Use this when the page itself implements internal scroll regions — e.g.
 *   teachers where the DataTable owns its scroll and pagination stays pinned.
 *
 * The page heading stays outside the scroll area in both modes so it never
 * scrolls away with the content.
 */
export default function PageContainer({
  children,
  isLoading = false,
  access = true,
  accessFallback,
  pageTitle,
  pageDescription,
  infoContent,
  pageHeaderAction,
  scrollable = true
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
  scrollable?: boolean;
}) {
  if (!access) {
    return (
      <div className='flex flex-1 items-center justify-center p-4 md:px-6'>
        {accessFallback ?? (
          <div className='text-muted-foreground text-center text-lg'>
            You do not have access to this page.
          </div>
        )}
      </div>
    );
  }

  const content = isLoading ? <PageSkeleton /> : children;

  const hasHeader = pageTitle || pageHeaderAction;

  return (
    // min-w-0 is critical here: PageContainer is a flex-row item inside
    // InfobarProvider (alongside the right InfoSidebar). Without it, wide page
    // content forces this column past the viewport edge on narrow screens.
    <div className='flex min-h-0 w-full min-w-0 flex-1 flex-col px-4 pt-2 md:px-6 md:pt-4'>
      {hasHeader && (
        // Stack title + actions on mobile so a long page description can't
        // push the action buttons past the right edge. min-w-0 on the heading
        // wrapper lets the description wrap instead of forcing the row wider.
        <div className='mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <div className='min-w-0 flex-1'>
            <Heading
              title={pageTitle ?? ''}
              description={pageDescription ?? ''}
              infoContent={infoContent}
            />
          </div>
          {pageHeaderAction && <div className='shrink-0'>{pageHeaderAction}</div>}
        </div>
      )}
      <div className={cn('flex min-h-0 flex-1 flex-col pb-4', scrollable && 'overflow-y-auto')}>
        {content}
      </div>
    </div>
  );
}
