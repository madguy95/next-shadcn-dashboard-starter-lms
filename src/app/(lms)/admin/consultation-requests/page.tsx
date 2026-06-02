import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { ConsultationRequestsView } from '@/features/admin/components/consultation-requests/consultation-requests-view';

export const metadata = {
  title: 'Dashboard: Consultation Requests'
};

export default async function ConsultationRequestsPage() {
  const t = await getTranslations('consultationRequests');
  return (
    <PageContainer pageTitle={t('title')} pageDescription={t('pageDescription')}>
      <ConsultationRequestsView />
    </PageContainer>
  );
}
