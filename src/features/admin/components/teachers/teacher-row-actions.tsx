'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
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
import {
  TEACHER_STATUSES,
  useDeleteTeacher,
  useUpdateTeacherStatus,
  type Teacher,
  type TeacherStatus
} from '@/api/teachers';
import { formatApiError } from '@/lib/api-client';
import { TeacherProfileSheet } from './teacher-profile-sheet';

export function TeacherRowActions({ teacher }: { teacher: Teacher }) {
  const t = useTranslations('teachers');
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const updateStatus = useUpdateTeacherStatus();
  const deleteTeacher = useDeleteTeacher();

  const handleStatusChange = (next: TeacherStatus) => {
    updateStatus.mutate(
      { id: teacher.id, status: next },
      {
        onSuccess: () => toast.success(t('actions.statusUpdated', { name: teacher.name })),
        onError: (e) => {
          const { title, description } = formatApiError(e, t('actions.statusError'));
          toast.error(title, description ? { description } : undefined);
        }
      }
    );
  };

  const handleDelete = () => {
    deleteTeacher.mutate(teacher.id, {
      onSuccess: () => {
        toast.success(t('actions.removeSuccess', { name: teacher.name }));
        setConfirmOpen(false);
      },
      onError: (e) => {
        const { title, description } = formatApiError(e, t('actions.removeError'));
        toast.error(title, description ? { description } : undefined);
      }
    });
  };

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
                <DropdownMenuItem
                  key={s}
                  disabled={s === teacher.status || updateStatus.isPending}
                  onSelect={() => handleStatusChange(s)}
                >
                  {t(`status.${s}`)}
                  {s === teacher.status ? <Icons.check className='ml-auto size-3.5' /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onSelect={() => setConfirmOpen(true)}>
            <Icons.trash className='size-3.5' />
            {t('actions.remove')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TeacherProfileSheet teacher={teacher} open={profileOpen} onOpenChange={setProfileOpen} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('actions.removeDescription', { name: teacher.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTeacher.isPending}>
              {t('actions.removeCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteTeacher.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className='bg-destructive text-white hover:bg-destructive/90'
            >
              {t('actions.removeConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
