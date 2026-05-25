import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { getCourseStats } from '@/features/admin/api/service';
import { CoursesHeaderAction, CoursesView } from '@/features/admin/components/courses/courses-view';

export const metadata = {
  title: 'Dashboard: LMS Courses'
};

export default async function CoursesPage() {
  const [t, stats] = await Promise.all([getTranslations('courses'), getCourseStats()]);
  return (
    <PageContainer
      pageTitle={t('title')}
      pageDescription={t('pageDescription', {
        published: stats.published,
        drafts: stats.drafts
      })}
      pageHeaderAction={<CoursesHeaderAction />}
    >
      <CoursesView />
    </PageContainer>
  );
}
