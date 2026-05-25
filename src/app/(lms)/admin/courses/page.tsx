import PageContainer from '@/components/layout/page-container';
import { CoursesHeaderAction, CoursesView } from '@/features/admin/components/courses/courses-view';

export const metadata = {
  title: 'Dashboard: LMS Courses'
};

export default function CoursesPage() {
  return (
    <PageContainer
      pageTitle='Courses'
      pageDescription='18 published · 4 drafts · curriculum library'
      pageHeaderAction={<CoursesHeaderAction />}
    >
      <CoursesView />
    </PageContainer>
  );
}
