import { AuthProvider } from '@/components/auth-provider';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicTopNav } from '@/components/layout/public-top-nav';

export default function PublicPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PublicTopNav />
      <main className='flex min-h-[calc(100svh-4rem)] flex-col'>{children}</main>
      <PublicFooter />
    </AuthProvider>
  );
}
