import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { MyClassesStats, MyClassesView } from '@/features/teacher/components/my-classes-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teacherClasses');
  return { title: t('metaTitle') };
}

export default async function TeacherClassesPage() {
  const t = await getTranslations('teacherClasses');
  return (
    <PageContainer
      pageTitle={t('pageTitle')}
      pageDescription={t('pageDescription')}
      pageHeaderAction={<MyClassesStats />}
    >
      <MyClassesView />
    </PageContainer>
  );
}
