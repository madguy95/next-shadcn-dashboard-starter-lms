import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  classDetailOptions,
  classSessionsOptions,
  classStudentsOptions
} from '@/api/teacher-class-detail';
import { ClassDetailSkeleton } from '@/features/teacher/components/class-detail-skeleton';
import { ClassDetailView } from '@/features/teacher/components/class-detail-view';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teacherClassDetail');
  return { title: t('metaTitle') };
}

type PageProps = { params: Promise<{ classId: string }> };

export default async function TeacherClassDetailPage(props: PageProps) {
  const { classId } = await props.params;

  const queryClient = getQueryClient();
  // Prefetch the three queries the view reads through useSuspenseQuery (streamed
  // via shouldDehydrateQuery: pending) so the client hydrates with data on first
  // paint instead of falling back to the Suspense skeleton. Attendance/notes load
  // lazily on tab open (their own skeleton, then LoadingOverlay per navigation).
  void queryClient.prefetchQuery(classDetailOptions(classId));
  void queryClient.prefetchQuery(classSessionsOptions(classId));
  void queryClient.prefetchQuery(classStudentsOptions(classId));

  return (
    <PageContainer>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<ClassDetailSkeleton />}>
          <ClassDetailView classId={classId} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
