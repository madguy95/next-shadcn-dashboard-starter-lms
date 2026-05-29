'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useDeleteBlogPost, type BlogPost } from '@/api/blog';

type Props = {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Whether to navigate back to /blog after a successful delete (true on detail pages).
  redirectOnSuccess?: boolean;
};

export function DeletePostDialog({ post, open, onOpenChange, redirectOnSuccess }: Props) {
  const router = useRouter();
  const t = useTranslations('blog.delete');
  const mutation = useDeleteBlogPost();

  const handleDelete = async () => {
    if (!post) return;
    try {
      await mutation.mutateAsync(post.id);
      toast.success(t('success'));
      onOpenChange(false);
      if (redirectOnSuccess) router.push('/blog');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('failure'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[440px]'>
        <DialogHeader>
          <div className='flex items-start gap-3'>
            <div className='bg-destructive/10 grid size-10 shrink-0 place-items-center rounded-full'>
              <Icons.trash className='text-destructive size-4' />
            </div>
            <div className='flex-1'>
              <DialogTitle>{t('title')}</DialogTitle>
              <DialogDescription className='mt-1.5'>
                {t('descriptionPrefix')}{' '}
                <span className='text-foreground font-medium'>
                  “{post?.title ?? t('descriptionFallback')}”
                </span>
                {t('descriptionSuffix')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button variant='destructive' onClick={handleDelete} isLoading={mutation.isPending}>
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
