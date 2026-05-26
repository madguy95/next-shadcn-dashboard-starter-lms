'use client';

import { useTranslations } from 'next-intl';
import type { ClassStatus } from '@/api/classes';
import { classStatusClass } from '@/features/admin/data';
import { cn } from '@/lib/utils';

export function ClassStatusBadge({
  status,
  weekIndex,
  weeksTotal
}: {
  status: ClassStatus;
  weekIndex?: number;
  weeksTotal?: number;
}) {
  const t = useTranslations('classes');
  const showProgress = status === 'running' && weekIndex && weeksTotal;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        classStatusClass[status]
      )}
    >
      {t(`status.${status}`)}
      {showProgress && (
        <span className='ml-1 opacity-80'>
          · {t('detail.weekProgress', { current: weekIndex, total: weeksTotal })}
        </span>
      )}
    </span>
  );
}
