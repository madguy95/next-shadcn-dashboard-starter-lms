import { AuthProvider } from '@/components/auth-provider';
import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getAuthUser } from '@/lib/auth';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'IQode Lab',
  description: 'Learning management system',
  robots: {
    index: false,
    follow: false
  }
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const user = await getAuthUser();
  // Guests always start with sidebar collapsed; authed users honor their saved preference.
  const defaultOpen = user ? cookieStore.get('sidebar_state')?.value === 'true' : false;
  return (
    <AuthProvider user={user}>
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <InfobarProvider defaultOpen={false}>
              {children}
              <InfoSidebar side='right' />
            </InfobarProvider>
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </AuthProvider>
  );
}
