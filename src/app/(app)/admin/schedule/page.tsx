import PageContainer from '@/components/layout/page-container';
import { ScheduleHeaderAction, ScheduleView } from '@/features/lms/components/schedule-view';

export const metadata = {
  title: 'Dashboard: LMS Schedule'
};

export default function SchedulePage() {
  return (
    <PageContainer
      pageTitle='Schedule'
      pageDescription='Week of May 18–24, 2026 · all teachers'
      pageHeaderAction={<ScheduleHeaderAction />}
    >
      <ScheduleView />
    </PageContainer>
  );
}
