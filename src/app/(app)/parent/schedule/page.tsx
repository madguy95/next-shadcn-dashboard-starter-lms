import PageContainer from '@/components/layout/page-container';
import {
  ParentScheduleHeaderAction,
  ParentScheduleStats,
  ParentScheduleView
} from '@/features/parent/components/parent-schedule-view';

export const metadata = {
  title: 'Parent: Lịch học'
};

export default function ParentSchedulePage() {
  return (
    <PageContainer
      pageTitle='Lịch học'
      pageDescription='Tất cả buổi học, học bù, học thử của các con — gom theo tuần.'
      pageHeaderAction={
        <div className='flex flex-col items-end gap-3'>
          <ParentScheduleHeaderAction />
          <ParentScheduleStats />
        </div>
      }
    >
      <ParentScheduleView />
    </PageContainer>
  );
}
