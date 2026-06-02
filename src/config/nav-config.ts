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
      labelKey: 'groups.lms',
      items: [
        {
          title: 'Dashboard',
          titleKey: 'items.dashboard',
          url: '/admin',
          icon: 'dashboard',
          shortcut: ['a', 'd'],
          isActive: false,
          items: []
        },
        {
          title: 'Teachers',
          titleKey: 'items.teachers',
          url: '/admin/teachers',
          icon: 'teams',
          shortcut: ['a', 't'],
          isActive: false,
          items: []
        },
        {
          title: 'Courses',
          titleKey: 'items.coursesManage',
          url: '/admin/courses',
          icon: 'book',
          shortcut: ['a', 'c'],
          isActive: false,
          items: []
        },
        {
          title: 'Classes',
          titleKey: 'items.classes',
          url: '/admin/classes',
          icon: 'layoutGrid',
          shortcut: ['a', 's'],
          isActive: false,
          items: []
        },
        {
          title: 'Enrollments',
          titleKey: 'items.enrollments',
          url: '/admin/enrollments',
          icon: 'checks',
          shortcut: ['a', 'e'],
          isActive: false,
          items: []
        },
        {
          title: 'Consultation Requests',
          titleKey: 'items.consultationRequests',
          url: '/admin/consultation-requests',
          icon: 'help',
          shortcut: ['a', 'q'],
          isActive: false,
          items: []
        },
        {
          title: 'Schedule',
          titleKey: 'items.schedule',
          url: '/admin/schedule',
          icon: 'calendar',
          shortcut: ['a', 'h'],
          isActive: false,
          items: []
        },
        {
          title: 'Blog & Workshop',
          titleKey: 'items.blog',
          url: '/admin/blog',
          icon: 'post',
          shortcut: ['a', 'b'],
          isActive: false,
          items: []
        }
      ]
    },
    {
      label: 'Khám phá',
      labelKey: 'groups.discover',
      items: [
        {
          title: 'Khóa học (chung)',
          titleKey: 'items.catalog',
          url: '/courses',
          icon: 'galleryVerticalEnd',
          shortcut: ['a', 'k'],
          isActive: false,
          external: true,
          items: []
        },
        {
          title: 'Bài viết & Workshop',
          titleKey: 'items.blogDiscover',
          url: '/blog',
          icon: 'sparkles',
          shortcut: ['a', 'b'],
          isActive: false,
          external: true,
          items: []
        }
      ]
    }
  ],
  teacher: [
    {
      label: 'Teacher',
      labelKey: 'groups.teacher',
      items: [
        {
          title: 'My Class',
          titleKey: 'items.myClass',
          url: '/teacher/classes',
          icon: 'teams',
          shortcut: ['t', 'c'],
          isActive: false,
          items: []
        },
        {
          title: 'My Schedule',
          titleKey: 'items.mySchedule',
          url: '/teacher/schedule',
          icon: 'calendar',
          shortcut: ['t', 's'],
          isActive: false,
          items: []
        }
      ]
    },
    {
      label: 'Khám phá',
      labelKey: 'groups.discover',
      items: [
        {
          title: 'Khóa học (chung)',
          titleKey: 'items.catalog',
          url: '/courses',
          icon: 'galleryVerticalEnd',
          shortcut: ['t', 'k'],
          isActive: false,
          external: true,
          items: []
        },
        {
          title: 'Bài viết & Workshop',
          titleKey: 'items.blogDiscover',
          url: '/blog',
          icon: 'sparkles',
          shortcut: ['t', 'b'],
          isActive: false,
          external: true,
          items: []
        }
      ]
    }
  ],
  parent: [
    {
      label: 'Parent',
      labelKey: 'groups.parent',
      items: [
        {
          title: 'My Children',
          titleKey: 'items.myChildren',
          url: '/parent/children',
          icon: 'teams',
          shortcut: ['p', 'c'],
          isActive: false,
          items: []
        },
        {
          title: 'Schedule',
          titleKey: 'items.schedule',
          url: '/parent/schedule',
          icon: 'calendar',
          shortcut: ['p', 's'],
          isActive: false,
          items: []
        }
      ]
    },
    {
      label: 'Khám phá',
      labelKey: 'groups.discover',
      items: [
        {
          title: 'Khóa học (chung)',
          titleKey: 'items.catalog',
          url: '/courses',
          icon: 'galleryVerticalEnd',
          shortcut: ['p', 'k'],
          isActive: false,
          external: true,
          items: []
        },
        {
          title: 'Bài viết & Workshop',
          titleKey: 'items.blogDiscover',
          url: '/blog',
          icon: 'sparkles',
          shortcut: ['p', 'b'],
          isActive: false,
          external: true,
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
