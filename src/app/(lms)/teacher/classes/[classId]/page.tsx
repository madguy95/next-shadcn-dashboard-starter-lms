import PageContainer from '@/components/layout/page-container';
import { ClassDetailView } from '@/features/teacher/components/class-detail-view';

export const metadata = {
  title: 'Teacher: Chi tiết lớp'
};

export default function TeacherClassDetailPage() {
  return (
    <PageContainer>
      <ClassDetailView />
    </PageContainer>
  );
}
