'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth-provider';
import { getRoleFromPathname, navByRole, roleMeta } from '@/config/nav-config';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import { logout } from '@/lib/auth-actions';
import { Icons } from '../icons';

function IQodeCircuit({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' className={className} aria-hidden='true'>
      <circle cx='12' cy='12' r='2' />
      <line x1='12' y1='10' x2='12' y2='5.5' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='12' cy='4.5' r='1.5' />
      <line x1='13.4' y1='10.6' x2='17.2' y2='6.8' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='18' cy='6' r='1.5' />
      <line x1='14' y1='12' x2='18.5' y2='12' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='19.5' cy='12' r='1.5' />
      <line x1='13.4' y1='13.4' x2='17.2' y2='17.2' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='18' cy='18' r='1.5' />
      <line x1='10.6' y1='13.4' x2='6.8' y2='17.2' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='6' cy='18' r='1.5' />
      <line x1='10' y1='12' x2='5.5' y2='12' stroke='currentColor' strokeWidth='1.4' />
      <circle cx='4.5' cy='12' r='1.5' />
    </svg>
  );
}

function IQodeLogotype({ className }: { className?: string }) {
  return (
    <span className={`font-[family-name:var(--font-outfit)] ${className ?? ''}`}>
      <span className='leading-none text-cyan-400 dark:text-cyan-300'>IQode</span>
      <span className='align-baseline leading-none font-medium text-[0.65em] text-amber-500 dark:text-amber-400'>
        Lab
      </span>
      <IQodeCircuit className='ml-0.5 inline size-2.5 -translate-y-1.5 text-amber-400 dark:text-amber-300' />
    </span>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const tNav = useTranslations('nav');
  // Logged-in users are locked to their account's role.
  // Guests follow the URL so they can preview each role's UI.
  const currentRole = user ? user.role : getRoleFromPathname(pathname);
  const groups = navByRole[currentRole];
  const filteredGroups = useFilteredNavGroups(groups);
  // Translate a nav title/group label by its i18n key; fall back to the literal string
  // so untranslated items (most of the existing nav) still render correctly.
  const tr = (literal: string, key?: string) => (key ? tNav(key) : literal);
  const userInitials = user
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('') || 'PH'
    : '';

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='gap-0'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              onClick={() => router.push(user ? roleMeta[user.role].basePath : '/')}
              className='hover:bg-sidebar-accent'
            >
              <span className='grid size-7 shrink-0 place-items-center rounded-md bg-gray-900 dark:bg-gray-800'>
                <IQodeCircuit className='size-4 text-amber-400' />
              </span>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <IQodeLogotype className='truncate font-semibold' />
                <span className='text-muted-foreground truncate text-xs'>
                  {user
                    ? `${roleMeta[user.role].label} ${tNav('workspaceSuffix')}`
                    : tNav('guestSubtitle')}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden'>
        {!user && (
          <SidebarGroup className='py-0 group-data-[collapsible=icon]:hidden'>
            <div className='border-border/60 bg-muted/30 mx-2 mt-2 rounded-lg border p-4'>
              <div className='flex items-center gap-2'>
                <span className='bg-primary/10 text-primary grid h-7 w-7 place-items-center rounded-md'>
                  <Icons.lock className='size-3.5' />
                </span>
                <div className='text-sm font-semibold tracking-tight'>{tNav('guest.greeting')}</div>
              </div>
              <p className='text-muted-foreground mt-2 text-xs leading-relaxed'>
                {tNav('guest.description')}
              </p>
              <div className='mt-3 flex flex-col gap-1.5'>
                <Link
                  href='/login?mode=register'
                  className='bg-primary text-primary-foreground inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium hover:opacity-90'
                >
                  <Icons.add className='size-3' />
                  {tNav('guest.register')}
                </Link>
                <Link
                  href='/login'
                  className='hover:bg-accent inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium'
                >
                  <Icons.login className='size-3' />
                  {tNav('guest.login')}
                </Link>
              </div>
            </div>
            <SidebarGroupLabel className='mt-4'>{tNav('groups.demo')}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={tNav('items.courses')}
                  isActive={pathname === '/courses'}
                >
                  <Link href='/courses'>
                    <Icons.book />
                    <span>{tNav('items.courses')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {user &&
          filteredGroups.map((group) => {
            const groupLabel = tr(group.label, group.labelKey);
            return (
              <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
                {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                    const itemTitle = tr(item.title, item.titleKey);
                    return item?.items && item?.items?.length > 0 ? (
                      <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className='group/collapsible'
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={itemTitle} isActive={pathname === item.url}>
                              {item.icon && <Icon />}
                              <span>{itemTitle}</span>
                              <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => {
                                const subTitle = tr(subItem.title, subItem.titleKey);
                                return (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === subItem.url}
                                    >
                                      <Link href={subItem.url}>
                                        <span>{subTitle}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={itemTitle}
                          isActive={pathname === item.url}
                        >
                          {item.external ? (
                            <a href={item.url} target='_blank' rel='noopener noreferrer'>
                              <Icon />
                              <span>{itemTitle}</span>
                              <Icons.externalLink className='ml-auto size-3 opacity-50' />
                            </a>
                          ) : (
                            <Link href={item.url}>
                              <Icon />
                              <span>{itemTitle}</span>
                            </Link>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size='lg'
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                  >
                    <span className='bg-primary text-primary-foreground grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold'>
                      {userInitials}
                    </span>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-medium'>{user.name}</span>
                      <span className='text-muted-foreground truncate font-mono text-[11px]'>
                        {user.phone} · {roleMeta[user.role].label}
                      </span>
                    </div>
                    <Icons.chevronsUpDown className='ml-auto size-4' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                  side='top'
                  align='end'
                  sideOffset={4}
                >
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='flex items-center gap-2 px-2 py-1.5'>
                      <span className='bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold'>
                        {userInitials}
                      </span>
                      <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-medium'>{user.name}</span>
                        <span className='text-muted-foreground truncate font-mono text-[11px]'>
                          {user.phone}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push('/parent/children')}>
                    <Icons.user className='mr-2 h-4 w-4' />
                    Hồ sơ con
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/courses')}>
                    <Icons.book className='mr-2 h-4 w-4' />
                    Đăng ký khóa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={logout}>
                    <DropdownMenuItem asChild>
                      <button
                        type='submit'
                        className='text-destructive focus:text-destructive w-full'
                      >
                        <Icons.logout className='mr-2 h-4 w-4' />
                        Đăng xuất
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton
                size='lg'
                onClick={() => router.push('/login')}
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <span className='bg-muted text-muted-foreground grid size-7 shrink-0 place-items-center rounded-full'>
                  <Icons.user className='size-4' />
                </span>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Khách</span>
                  <span className='text-muted-foreground truncate text-[11px]'>
                    Đăng nhập để theo dõi con
                  </span>
                </div>
                <Icons.login className='ml-auto size-4' />
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
