import PageContainer from '@/components/layout/page-container';
import { AdminDashboardView } from '@/features/admin/components/admin-dashboard-view';

export const metadata = {
  title: 'Dashboard: LMS Overview'
};

export default function AdminDashboardPage() {
  return (
    <PageContainer>
      <AdminDashboardView />
    </PageContainer>
  );
}
