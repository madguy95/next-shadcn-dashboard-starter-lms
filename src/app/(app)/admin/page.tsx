import PageContainer from '@/components/layout/page-container';
import { LmsDashboardView } from '@/features/lms/components/lms-dashboard-view';

export const metadata = {
  title: 'Dashboard: LMS Overview'
};

export default function LmsDashboardPage() {
  return (
    <PageContainer>
      <LmsDashboardView />
    </PageContainer>
  );
}
