import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { BlogEditorView } from '@/features/blog/components/blog-editor-view';
import { getAuthUser } from '@/lib/auth';

export async function generateMetadata() {
  const t = await getTranslations('blog');
  return { title: t('metaTitleNew') };
}

export default async function AdminNewBlogPostPage() {
  const user = await getAuthUser();
  if (user?.role !== 'admin') notFound();

  return (
    <PageContainer scrollable={true}>
      <BlogEditorView mode='create' basePath='/admin/blog' />
    </PageContainer>
  );
}
