import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { ClassesHeaderAction, ClassesView } from '@/features/admin/components/classes/classes-view';

export const metadata = {
  title: 'Dashboard: LMS Classes'
};

export default async function ClassesPage() {
  const t = await getTranslations('classes');
  return (
    <PageContainer
      pageTitle={t('title')}
      pageDescription={t('pageDescription')}
      pageHeaderAction={<ClassesHeaderAction />}
      scrollable={true}
    >
      <ClassesView />
    </PageContainer>
  );
}
