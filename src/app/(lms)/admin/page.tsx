import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  adminDashboardSummaryOptions,
  isDashboardPeriod,
  type DashboardPeriod
} from '@/api/admin-dashboard';
import {
  AdminDashboardSkeleton,
  AdminDashboardView
} from '@/features/admin/components/admin-dashboard-view';
import { getQueryClient } from '@/lib/query-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('adminDashboard');
  return { title: t('metaTitle') };
}

type SearchParams = Promise<{ period?: string }>;

export default async function AdminDashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const period: DashboardPeriod = isDashboardPeriod(sp.period) ? sp.period : 'week';

  const queryClient = getQueryClient();
  // Prefetch the exact (period) key the client will request so the cache is
  // already hydrated when useSuspenseQuery runs — no fallback flash.
  void queryClient.prefetchQuery(adminDashboardSummaryOptions({ period }));

  return (
    <PageContainer>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AdminDashboardSkeleton />}>
          <AdminDashboardView />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
