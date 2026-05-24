import PageContainer from '@/components/layout/page-container';
import {
  EnrollmentsHeaderAction,
  EnrollmentsView
} from '@/features/lms/components/enrollments-view';

export const metadata = {
  title: 'Dashboard: LMS Enrollments'
};

export default function EnrollmentsPage() {
  return (
    <PageContainer
      pageTitle='Enrollments'
      pageDescription='Approve, place, or waitlist new students · 12 awaiting review'
      pageHeaderAction={<EnrollmentsHeaderAction />}
    >
      <EnrollmentsView />
    </PageContainer>
  );
}
