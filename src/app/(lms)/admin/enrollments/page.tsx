import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { getEnrollmentStatusTabs } from '@/api/enrollments';
import {
  EnrollmentsHeaderAction,
  EnrollmentsView
} from '@/features/admin/components/enrollments/enrollments-view';

export const metadata = {
  title: 'Dashboard: LMS Enrollments'
};

export default async function EnrollmentsPage() {
  const t = await getTranslations('enrollments');

  // Server-side count so the page header shows the correct "awaiting review" badge
  // before the client cache hydrates. Failure mode is non-fatal: if the BE is
  // down the view itself surfaces the error — we just fall back to a generic copy.
  let pendingCount = 0;
  try {
    const tabs = await getEnrollmentStatusTabs();
    pendingCount = tabs.find((tab) => tab.value === 'pending')?.count ?? 0;
  } catch {
    pendingCount = 0;
  }

  const description =
    pendingCount > 0
      ? t('pageDescriptionWithCount', { count: pendingCount })
      : t('pageDescription');

  return (
    <PageContainer
      pageTitle={t('title')}
      pageDescription={description}
      pageHeaderAction={<EnrollmentsHeaderAction />}
    >
      <EnrollmentsView />
    </PageContainer>
  );
}
