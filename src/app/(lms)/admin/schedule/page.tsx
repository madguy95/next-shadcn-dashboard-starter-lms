import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import {
  ScheduleHeaderAction,
  ScheduleView
} from '@/features/admin/components/schedule/schedule-view';

export const metadata = {
  title: 'Dashboard: LMS Schedule'
};

export default async function SchedulePage() {
  const t = await getTranslations('schedule');
  return (
    <PageContainer
      pageTitle={t('title')}
      pageDescription={t('pageDescription')}
      pageHeaderAction={<ScheduleHeaderAction />}
    >
      <ScheduleView />
    </PageContainer>
  );
}
