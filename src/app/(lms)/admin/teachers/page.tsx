import PageContainer from '@/components/layout/page-container';
import {
  TeachersHeaderAction,
  TeachersView
} from '@/features/admin/components/teachers/teachers-view';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'Dashboard: LMS Teachers'
};

export default async function TeachersPage() {
  const t = await getTranslations('teachers');
  return (
    <PageContainer pageTitle={t('title')} pageHeaderAction={<TeachersHeaderAction />}>
      <TeachersView />
    </PageContainer>
  );
}
