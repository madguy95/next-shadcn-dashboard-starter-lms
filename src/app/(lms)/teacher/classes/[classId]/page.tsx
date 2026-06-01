import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageContainer from '@/components/layout/page-container';
import { ClassDetailView } from '@/features/teacher/components/class-detail-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teacherClassDetail');
  return { title: t('metaTitle') };
}

type PageProps = { params: Promise<{ classId: string }> };

export default async function TeacherClassDetailPage(props: PageProps) {
  const { classId } = await props.params;
  return (
    <PageContainer>
      <ClassDetailView classId={classId} />
    </PageContainer>
  );
}
