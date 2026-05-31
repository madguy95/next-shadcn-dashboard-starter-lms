import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { teacherScheduleWeekOptions } from '@/api/teacher-schedule';
import {
  TeacherScheduleHeaderAction,
  TeacherScheduleView
} from '@/features/teacher/components/teacher-schedule-view';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teacherSchedule');
  return { title: t('metaTitle') };
}

type SearchParams = Promise<{ view?: string; anchor?: string; classId?: string }>;

export default async function TeacherSchedulePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const [sp, t] = await Promise.all([searchParams, getTranslations('teacherSchedule')]);
  const params = { anchor: sp.anchor, classId: sp.classId };

  const queryClient = getQueryClient();
  // Prefetch (streamed via shouldDehydrateQuery: pending) so the client hydrates
  // with data on first paint. TeacherScheduleView uses useQuery: it renders its
  // own skeleton while this first load resolves, then a LoadingOverlay (not the
  // skeleton) for every subsequent week / day / class navigation.
  void queryClient.prefetchQuery(teacherScheduleWeekOptions(params));

  return (
    <PageContainer
      pageTitle={t('pageTitle')}
      pageDescription={t('pageDescription')}
      pageHeaderAction={<TeacherScheduleHeaderAction />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TeacherScheduleView />
      </HydrationBoundary>
    </PageContainer>
  );
}
