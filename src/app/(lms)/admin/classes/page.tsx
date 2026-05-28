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
        ongoing: stats.ongoing,
        open: stats.open
      })}
      pageHeaderAction={<ClassesHeaderAction />}
      // ClassesView owns its scroll so the detail panel stays pinned on the
      // right while the list scrolls on the left.
      scrollable={true}
    >
      <ClassesView />
    </PageContainer>
  );
}
