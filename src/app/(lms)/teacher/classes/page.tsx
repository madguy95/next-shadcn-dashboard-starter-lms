import PageContainer from '@/components/layout/page-container';
import { MyClassesStats, MyClassesView } from '@/features/teacher/components/my-classes-view';

export const metadata = {
  title: 'Teacher: Lớp dạy'
};

export default function TeacherClassesPage() {
  return (
    <PageContainer
      pageTitle='Lớp dạy'
      pageDescription='Tất cả lớp bạn đang phụ trách · Học kỳ Hè 2026'
      pageHeaderAction={<MyClassesStats />}
    >
      <MyClassesView />
    </PageContainer>
  );
}
