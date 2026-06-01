import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { CoursesHeaderAction, CoursesView } from '@/features/admin/components/courses/courses-view';

export const metadata = {
  title: 'Dashboard: LMS Courses'
};

export default async function CoursesPage() {
  const t = await getTranslations('courses');
  return (
    <PageContainer
      pageTitle={t('title')}
      pageDescription={t('pageDescription')}
      pageHeaderAction={<CoursesHeaderAction />}
      scrollable={false}
    >
      <CoursesView />
    </PageContainer>
  );
}
