'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { TEACHER_STATUSES, type Teacher } from '@/api/teachers';
import { TeacherProfileSheet } from './teacher-profile-sheet';

export function TeacherRowActions({ teacher }: { teacher: Teacher }) {
  const t = useTranslations('teachers');
  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <div className='inline-flex justify-end gap-1'>
      <Button variant='ghost' size='sm' className='h-7 px-2 text-[12px]'>
        {t('actions.assign')}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            aria-label={t('actions.menuLabel', { name: teacher.name })}
          >
            <Icons.ellipsis className='size-3.5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
            <Icons.eye className='size-3.5' />
            {t('actions.viewProfile')}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icons.lock className='size-3.5' />
            {t('actions.resetPassword')}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='gap-2 [&_svg:not([class*="text-"])]:text-muted-foreground'>
              <Icons.circleCheck className='size-3.5' />
              {t('actions.changeStatus')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {TEACHER_STATUSES.map((s) => (
                <DropdownMenuItem key={s} disabled={s === teacher.status}>
                  {t(`status.${s}`)}
                  {s === teacher.status ? <Icons.check className='ml-auto size-3.5' /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive'>
            <Icons.trash className='size-3.5' />
            {t('actions.remove')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TeacherProfileSheet teacher={teacher} open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
