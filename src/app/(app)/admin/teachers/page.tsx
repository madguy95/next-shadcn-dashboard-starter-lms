import PageContainer from '@/components/layout/page-container';
import { TeachersHeaderAction, TeachersView } from '@/features/lms/components/teachers-view';

export const metadata = {
  title: 'Dashboard: LMS Teachers'
};

export default function TeachersPage() {
  return (
    <PageContainer
      pageTitle='Teachers'
      pageDescription='24 active · 3 on leave · 2 pending onboarding'
      pageHeaderAction={<TeachersHeaderAction />}
    >
      <TeachersView />
    </PageContainer>
  );
}
