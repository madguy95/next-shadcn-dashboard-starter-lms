import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { publicCoursesOptions } from '@/api/courses/queries';
import {
  EnrollmentHeaderAction,
  EnrollmentView
} from '@/features/parent/components/enrollment-view';
import { getAuthUser } from '@/lib/auth';
import { getQueryClient } from '@/lib/query-client';

export const metadata = {
  title: 'Khóa học · IQode Lab'
};

// Public course list is rendered server-side and hydrated into React Query so the page paints
// with real data on first byte (good for SEO + perceived speed). Per project rule:
// public endpoints → server prefetch, authed endpoints → client fetch.
export default async function CoursesPage() {
  const queryClient = getQueryClient();
  // void = fire-and-forget; the dehydrate() below waits for in-flight queries via the
  // shouldDehydrateQuery override in query-client.ts, so this still ends up in the payload.
  void queryClient.prefetchQuery(publicCoursesOptions(24));

  const [user, t] = await Promise.all([getAuthUser(), getTranslations('coursesCatalog')]);
  const titleKey = user ? (`${user.role}Title` as const) : 'guestTitle';
  const descKey = user ? (`${user.role}Description` as const) : 'guestDescription';

  return (
    <PageContainer
      pageTitle={t(titleKey)}
      pageDescription={t(descKey)}
      pageHeaderAction={<EnrollmentHeaderAction role={user?.role ?? null} />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EnrollmentView />
      </HydrationBoundary>
    </PageContainer>
  );
}
