import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import {
  TeacherScheduleHeaderAction,
  TeacherScheduleView
} from '@/features/teacher/components/teacher-schedule-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teacherSchedule');
  return { title: t('metaTitle') };
}

export default async function TeacherSchedulePage() {
  const t = await getTranslations('teacherSchedule');
  return (
    <PageContainer
      pageTitle={t('pageTitle')}
      pageDescription={t('pageDescription')}
      pageHeaderAction={<TeacherScheduleHeaderAction />}
    >
      <TeacherScheduleView />
    </PageContainer>
  );
}
