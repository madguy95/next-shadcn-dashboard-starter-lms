import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { publicCoursesOptions } from '@/api/courses/queries';
import {
  EnrollmentHeaderAction,
  EnrollmentView
} from '@/features/parent/components/enrollment-view';
import { getQueryClient } from '@/lib/query-client';

export const metadata = {
  title: 'Parent: Đăng ký khóa học'
};

// Public course list is rendered server-side and hydrated into React Query so the page paints
// with real data on first byte (good for SEO + perceived speed). Per project rule:
// public endpoints → server prefetch, authed endpoints → client fetch.
export default function ParentEnrollmentPage() {
  const queryClient = getQueryClient();
  // void = fire-and-forget; the dehydrate() below waits for in-flight queries via the
  // shouldDehydrateQuery override in query-client.ts, so this still ends up in the payload.
  void queryClient.prefetchQuery(publicCoursesOptions(24));

  return (
    <PageContainer
      pageTitle='Đăng ký khóa học cho con'
      pageDescription='Tìm và đăng ký khóa phù hợp với con. Trung tâm xác nhận lớp trong vòng 24 giờ.'
      pageHeaderAction={<EnrollmentHeaderAction />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EnrollmentView />
      </HydrationBoundary>
    </PageContainer>
  );
}
