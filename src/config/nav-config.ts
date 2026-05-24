import type { Icons } from '@/components/icons';
import { NavGroup } from '@/types';

export type AppRole = 'admin' | 'teacher' | 'parent';

export const APP_ROLES: AppRole[] = ['admin', 'teacher', 'parent'];

export const roleMeta: Record<
  AppRole,
  { label: string; description: string; icon: keyof typeof Icons; basePath: string }
> = {
  admin: {
    label: 'Admin',
    description: 'Quản trị trung tâm',
    icon: 'settings',
    basePath: '/admin'
  },
  teacher: {
    label: 'Teacher',
    description: 'Lớp dạy & lịch giảng',
    icon: 'teams',
    basePath: '/teacher/classes'
  },
  parent: {
    label: 'Parent',
    description: 'Theo dõi con & đăng ký',
    icon: 'user',
    basePath: '/parent/children'
  }
};

export const navByRole: Record<AppRole, NavGroup[]> = {
  admin: [
    {
      label: 'LMS',
      items: [
        {
          title: 'Dashboard',
          url: '/admin',
          icon: 'dashboard',
          shortcut: ['a', 'd'],
          isActive: false,
          items: []
        },
        {
          title: 'Teachers',
          url: '/admin/teachers',
          icon: 'teams',
          shortcut: ['a', 't'],
          isActive: false,
          items: []
        },
        {
          title: 'Courses',
          url: '/admin/courses',
          icon: 'book',
          shortcut: ['a', 'c'],
          isActive: false,
          items: []
        },
        {
          title: 'Classes',
          url: '/admin/classes',
          icon: 'layoutGrid',
          shortcut: ['a', 's'],
          isActive: false,
          items: []
        },
        {
          title: 'Enrollments',
          url: '/admin/enrollments',
          icon: 'checks',
          shortcut: ['a', 'e'],
          isActive: false,
          items: []
        },
        {
          title: 'Schedule',
          url: '/admin/schedule',
          icon: 'calendar',
          shortcut: ['a', 'h'],
          isActive: false,
          items: []
        }
      ]
    }
  ],
  teacher: [
    {
      label: 'Teacher',
      items: [
        {
          title: 'My Class',
          url: '/teacher/classes',
          icon: 'teams',
          shortcut: ['t', 'c'],
          isActive: false,
          items: []
        },
        {
          title: 'My Schedule',
          url: '/teacher/schedule',
          icon: 'calendar',
          shortcut: ['t', 's'],
          isActive: false,
          items: []
        }
      ]
    }
  ],
  parent: [
    {
      label: 'Parent',
      items: [
        {
          title: 'My Children',
          url: '/parent/children',
          icon: 'teams',
          shortcut: ['p', 'c'],
          isActive: false,
          items: []
        },
        {
          title: 'Enrollment',
          url: '/parent/enrollment',
          icon: 'book',
          shortcut: ['p', 'e'],
          isActive: false,
          items: []
        },
        {
          title: 'Schedule',
          url: '/parent/schedule',
          icon: 'calendar',
          shortcut: ['p', 's'],
          isActive: false,
          items: []
        }
      ]
    }
  ]
};

/** Detect the current role from a pathname like /admin/teachers → 'admin'. */
export function getRoleFromPathname(pathname: string): AppRole {
  if (pathname.startsWith('/teacher')) return 'teacher';
  if (pathname.startsWith('/parent')) return 'parent';
  return 'admin';
}

/** @deprecated Use navByRole keyed by current role instead. Kept for backward compatibility. */
export const navGroups: NavGroup[] = navByRole.admin;
