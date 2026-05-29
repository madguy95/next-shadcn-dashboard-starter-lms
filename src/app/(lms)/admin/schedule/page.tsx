import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  isScheduleView,
  scheduleFiltersOptions,
  scheduleMonthOptions,
  scheduleWeekOptions,
  type ScheduleParams
} from '@/api/schedule';
import { ScheduleViewSkeleton } from '@/features/admin/components/schedule/schedule-skeleton';
import {
  ScheduleHeaderAction,
  ScheduleView
} from '@/features/admin/components/schedule/schedule-view';
import { getQueryClient } from '@/lib/query-client';

export const metadata = {
  title: 'Dashboard: LMS Schedule'
};

type SearchParams = Promise<{
  view?: string;
  anchor?: string;
  teacherId?: string;
  classId?: string;
  location?: string;
}>;

export default async function SchedulePage({ searchParams }: { searchParams: SearchParams }) {
  const [sp, t] = await Promise.all([searchParams, getTranslations('schedule')]);
  const view = isScheduleView(sp.view) ? sp.view : 'week';
  const params: ScheduleParams = {
    view,
    anchor: sp.anchor,
    teacherId: sp.teacherId,
    classId: sp.classId,
    location: sp.location
  };

  const queryClient = getQueryClient();
  // Prefetch the exact query the client will request so the initial paint hits
  // a hydrated cache rather than triggering a Suspense fallback.
  if (view === 'month') {
    void queryClient.prefetchQuery(scheduleMonthOptions(params));
  } else {
    void queryClient.prefetchQuery(scheduleWeekOptions(params));
  }
  void queryClient.prefetchQuery(scheduleFiltersOptions());

  return (
    <PageContainer
      pageTitle={t('title')}
      pageDescription={t('pageDescription')}
      pageHeaderAction={<ScheduleHeaderAction />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ScheduleViewSkeleton view={view} />}>
          <ScheduleView />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
