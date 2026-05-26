import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { getClassStats } from '@/api/classes';
import { ClassesHeaderAction, ClassesView } from '@/features/admin/components/classes/classes-view';

export const metadata = {
  title: 'Dashboard: LMS Classes'
};

export default async function ClassesPage() {
  const [t, stats] = await Promise.all([getTranslations('classes'), getClassStats()]);
  return (
    <PageContainer
      pageTitle={t('title')}
      pageDescription={t('pageDescription', {
        running: stats.running,
        upcoming: stats.upcoming
      })}
      pageHeaderAction={<ClassesHeaderAction />}
    >
      <ClassesView />
    </PageContainer>
  );
}
