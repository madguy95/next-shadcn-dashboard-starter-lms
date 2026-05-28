'use client';

import { useTranslations } from 'next-intl';
import type { ClassStatus } from '@/api/classes';
import { classStatusClass } from '@/features/admin/data';
import { cn } from '@/lib/utils';

export function ClassStatusBadge({ status }: { status: ClassStatus }) {
  const t = useTranslations('classes');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        classStatusClass[status]
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}
