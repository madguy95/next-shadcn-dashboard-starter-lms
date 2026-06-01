import { AuthProvider } from '@/components/auth-provider';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicTopNav } from '@/components/layout/public-top-nav';
import { roleMeta } from '@/config/nav-config';
import { getAuthUser } from '@/lib/auth';

export default async function PublicPagesLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  const workspace = user ? roleMeta[user.role] : null;
  return (
    <AuthProvider user={user}>
      <PublicTopNav user={user} workspace={workspace} />
      <main className='flex min-h-[calc(100svh-4rem)] flex-col'>{children}</main>
      <PublicFooter />
    </AuthProvider>
  );
}
