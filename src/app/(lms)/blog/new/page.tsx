import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { BlogEditorView } from '@/features/blog/components/blog-editor-view';
import { getAuthUser } from '@/lib/auth';

export async function generateMetadata() {
  const t = await getTranslations('blog');
  return { title: t('metaTitleNew') };
}

export default async function NewBlogPostPage() {
  const user = await getAuthUser();
  // Editor is admin-only. notFound() (rather than redirect) so the URL doesn't
  // leak the feature's existence to non-admin viewers via the URL bar.
  if (user?.role !== 'admin') notFound();

  return (
    <PageContainer scrollable={true}>
      <BlogEditorView mode='create' />
    </PageContainer>
  );
}
