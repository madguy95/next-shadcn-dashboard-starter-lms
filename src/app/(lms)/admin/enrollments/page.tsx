import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import {
  EnrollmentsHeaderAction,
  EnrollmentsView
} from '@/features/admin/components/enrollments/enrollments-view';

export const metadata = {
  title: 'Dashboard: LMS Enrollments'
};

export default async function EnrollmentsPage() {
  const t = await getTranslations('enrollments');
  return (
    <PageContainer
      pageTitle={t('title')}
      pageDescription={t('pageDescription')}
      pageHeaderAction={<EnrollmentsHeaderAction />}
    >
      <EnrollmentsView />
    </PageContainer>
  );
}
