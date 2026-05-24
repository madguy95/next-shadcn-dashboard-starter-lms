import PageContainer from '@/components/layout/page-container';
import {
  TeacherScheduleHeaderAction,
  TeacherScheduleStats,
  TeacherScheduleView
} from '@/features/teacher/components/teacher-schedule-view';

export const metadata = {
  title: 'Teacher: Lịch dạy'
};

export default function TeacherSchedulePage() {
  return (
    <PageContainer
      pageTitle='Lịch dạy'
      pageDescription='Lịch các buổi dạy của bạn trong tuần — gồm cả buổi học bù.'
      pageHeaderAction={
        <div className='flex flex-col items-end gap-3'>
          <TeacherScheduleHeaderAction />
          <TeacherScheduleStats />
        </div>
      }
    >
      <TeacherScheduleView />
    </PageContainer>
  );
}
