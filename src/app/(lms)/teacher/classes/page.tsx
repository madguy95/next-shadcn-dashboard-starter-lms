import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  isTeacherClassStatusFilter,
  teacherClassesSummaryOptions,
  type TeacherClassStatusFilter
} from '@/api/teacher-classes';
import {
  MyClassesStats,
  MyClassesStatsSkeleton,
  MyClassesView,
  MyClassesViewSkeleton
} from '@/features/teacher/components/my-classes-view';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teacherClasses');
  return { title: t('metaTitle') };
}

type SearchParams = Promise<{ status?: string }>;

export default async function TeacherClassesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const status: TeacherClassStatusFilter = isTeacherClassStatusFilter(sp.status)
    ? sp.status
    : 'all';

  const t = await getTranslations('teacherClasses');

  const queryClient = getQueryClient();
  // The stats card always reads the `all` summary; the grid reads the active
  // status. Prefetch both keys so neither Suspense boundary falls back on the
  // first paint (when status is already `all`, these collapse to one fetch).
  void queryClient.prefetchQuery(teacherClassesSummaryOptions({ status: 'all' }));
  if (status !== 'all') {
    void queryClient.prefetchQuery(teacherClassesSummaryOptions({ status }));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer
        pageTitle={t('pageTitle')}
        pageDescription={t('pageDescription')}
        pageHeaderAction={
          <Suspense fallback={<MyClassesStatsSkeleton />}>
            <MyClassesStats />
          </Suspense>
        }
      >
        <Suspense fallback={<MyClassesViewSkeleton />}>
          <MyClassesView />
        </Suspense>
      </PageContainer>
    </HydrationBoundary>
  );
}
