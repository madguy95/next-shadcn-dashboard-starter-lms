'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/admin': [{ title: 'Admin', link: '/admin' }],
  '/teacher': [{ title: 'Teacher', link: '/teacher/classes' }],
  '/teacher/classes': [{ title: 'Teacher', link: '/teacher/classes' }],
  '/parent/children': [{ title: 'Parent', link: '/parent/children' }]
};

// Prefix-based overrides: replace auto-generated segment links for these prefixes
const segmentLinkOverrides: Record<string, string> = {
  teacher: '/teacher/classes'
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const link = segmentLinkOverrides[segment] ?? path;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
