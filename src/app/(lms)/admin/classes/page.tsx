import PageContainer from '@/components/layout/page-container';
import { ClassesHeaderAction, ClassesView } from '@/features/admin/components/classes/classes-view';

export const metadata = {
  title: 'Dashboard: LMS Classes'
};

export default function ClassesPage() {
  return (
    <PageContainer
      pageTitle='Classes'
      pageDescription='42 running · Summer Term 2026 · select a class to see students'
      pageHeaderAction={<ClassesHeaderAction />}
    >
      <ClassesView />
    </PageContainer>
  );
}
