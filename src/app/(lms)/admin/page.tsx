import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { AdminDashboardView } from '@/features/admin/components/admin-dashboard-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('adminDashboard');
  return { title: t('metaTitle') };
}

export default function AdminDashboardPage() {
  return (
    <PageContainer>
      <AdminDashboardView />
    </PageContainer>
  );
}
