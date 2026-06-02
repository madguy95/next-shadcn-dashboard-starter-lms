'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { blogDetailOptions, type AttachedClass, type BlogPost } from '@/api/blog';

function workshopSeatsLeft(c: AttachedClass) {
  return Math.max(0, c.capacity - c.enrolled);
}
import { BlogBody } from './blog-body';
import { BlogCover } from './blog-cover';
import { BlogTypeBadge } from './blog-type-badge';
import { DeletePostDialog } from './delete-post-dialog';
import { WorkshopSignupDialog } from './workshop-signup-dialog';

type Props = { slug: string; canEdit: boolean; basePath: string };

export function BlogDetailView({ slug, canEdit, basePath }: Props) {
  const { data } = useSuspenseQuery(blogDetailOptions(slug));
  if (!data) notFound();
  if (data.type === 'workshop') {
    return <WorkshopDetail post={data} canEdit={canEdit} basePath={basePath} />;
  }
  return <ArticleDetail post={data} canEdit={canEdit} basePath={basePath} />;
}

function DetailHeader({
  post,
  canEdit,
  onAskDelete,
  basePath
}: {
  post: BlogPost;
  canEdit: boolean;
  onAskDelete: () => void;
  basePath: string;
}) {
  const t = useTranslations('blog.detail');
  return (
    <div className='mb-6 flex items-center justify-between gap-3'>
      <Button asChild variant='ghost' size='sm' className='-ml-2 h-8'>
        <Link href={basePath}>
          <Icons.chevronLeft className='size-3.5' />
          {t('back')}
        </Link>
      </Button>
      {canEdit && (
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline' size='sm' className='h-8'>
            <Link href={`${basePath}/${post.slug}/edit`}>
              <Icons.edit className='size-3.5' />
              {t('edit')}
            </Link>
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='text-destructive hover:text-destructive h-8'
            onClick={onAskDelete}
          >
            <Icons.trash className='size-3.5' />
            {t('delete')}
          </Button>
        </div>
      )}
    </div>
  );
}

function ArticleDetail({
  post,
  canEdit,
  basePath
}: {
  post: BlogPost;
  canEdit: boolean;
  basePath: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const tCategory = useTranslations('blog.category');
  const tDetail = useTranslations('blog.detail');

  return (
    <div className='mx-auto w-full max-w-[920px] pb-16'>
      <DetailHeader
        post={post}
        canEdit={canEdit}
        onAskDelete={() => setDeleteOpen(true)}
        basePath={basePath}
      />

      <div className='mb-3 flex items-center gap-2'>
        <BlogTypeBadge post={post} className='bg-primary/10 shadow-none' />
        <span className='text-muted-foreground text-[12px]'>{tCategory(post.category)}</span>
      </div>
      <h1 className='mb-4 text-[40px] leading-[1.15] font-semibold tracking-tight text-balance'>
        {post.title}
      </h1>
      <p className='text-muted-foreground mb-6 text-lg leading-relaxed [text-wrap:pretty]'>
        {post.excerpt}
      </p>

      <div className='mb-8 flex items-center gap-3 border-b pb-6'>
        <span className='bg-primary text-primary-foreground grid size-10 place-items-center rounded-full text-[12px] font-semibold'>
          {post.author.initials}
        </span>
        <div className='leading-tight'>
          <div className='text-sm font-medium'>{post.author.name}</div>
          <div className='text-muted-foreground text-[12px]'>{post.meta}</div>
        </div>
      </div>

      <div className='ring-border relative mb-9 h-[380px] overflow-hidden rounded-2xl ring-1'>
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt={post.title}
            className='absolute inset-0 h-full w-full object-cover'
          />
        ) : (
          <BlogCover hue={post.hue} category={post.category} status={post.status} size={120} />
        )}
      </div>

      <BlogBody body={post.body} />

      {post.tags.length > 0 && (
        <div className='mt-10 flex flex-wrap gap-2 border-t pt-6'>
          <span className='text-muted-foreground mr-1 self-center text-[12px]'>
            {tDetail('tagsLabel')}
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className='bg-muted text-foreground/70 rounded-full px-2.5 py-1 text-[12px]'
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <DeletePostDialog
        post={post}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectOnSuccess
        basePath={basePath}
      />
    </div>
  );
}

function WorkshopDetail({
  post,
  canEdit,
  basePath
}: {
  post: BlogPost;
  canEdit: boolean;
  basePath: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  // BE inlines the joined class snapshot on the detail response. Single source
  // of truth — editing the class in /admin/classes shows up here on next read.
  const cls = post.attachedClass ?? null;

  return (
    <div className='mx-auto w-full max-w-[1100px] pb-16'>
      <DetailHeader
        post={post}
        canEdit={canEdit}
        onAskDelete={() => setDeleteOpen(true)}
        basePath={basePath}
      />

      <div className='ring-border relative mb-8 h-[320px] overflow-hidden rounded-2xl ring-1'>
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt={post.title}
            className='absolute inset-0 h-full w-full object-cover'
          />
        ) : (
          <BlogCover hue={post.hue} category={post.category} status={post.status} size={108} />
        )}
        <span className='absolute top-4 left-4 z-10'>
          <BlogTypeBadge post={post} />
        </span>
      </div>

      <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <h1 className='mb-4 text-[36px] leading-[1.15] font-semibold tracking-tight text-balance'>
            {post.title}
          </h1>
          <p className='text-muted-foreground mb-6 text-lg leading-relaxed [text-wrap:pretty]'>
            {post.excerpt}
          </p>
          <BlogBody body={post.body} />
        </div>

        <aside className='lg:col-span-1'>
          <WorkshopSidebar post={post} cls={cls} canEdit={canEdit} />
        </aside>
      </div>

      <DeletePostDialog
        post={post}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        redirectOnSuccess
        basePath={basePath}
      />
    </div>
  );
}

function useFormatAgeRange() {
  const t = useTranslations('blog.workshop');
  return (min: number | undefined, max: number | undefined) => {
    if (min != null && max != null) return t('ageBoth', { min, max });
    if (min != null) return t('ageMin', { min });
    if (max != null) return t('ageMax', { max });
    return t('ageAll');
  };
}

function useFormatFee() {
  const t = useTranslations('blog.workshop');
  return (tuition: number | undefined) => {
    if (tuition == null || tuition === 0) return t('feeFree');
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tuition);
  };
}

function WorkshopSidebar({
  post,
  cls,
  canEdit
}: {
  post: BlogPost;
  cls: AttachedClass | null;
  canEdit: boolean;
}) {
  const t = useTranslations('blog.workshop');
  const formatAgeRange = useFormatAgeRange();
  const formatFee = useFormatFee();
  // Three render states:
  //   - Post has no classId yet: admin needs to attach one (visible only to admin)
  //   - Post has classId but class is missing in mock: data inconsistency banner
  //   - Class found and not cancelled: full info card
  //   - Class found and cancelled: cancelled banner
  if (!post.classId) {
    if (!canEdit) return null;
    return (
      <div className='bg-warning/5 border-warning/40 sticky top-4 rounded-xl border p-5 text-sm'>
        <div className='text-warning-foreground mb-1 font-medium'>{t('notAttached')}</div>
        <p className='text-muted-foreground text-[13px]'>{t('notAttachedDesc')}</p>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className='bg-destructive/5 border-destructive/40 sticky top-4 rounded-xl border p-5 text-sm'>
        <div className='text-destructive mb-1 font-medium'>{t('classMissing')}</div>
        <p className='text-muted-foreground text-[13px]'>{t('classMissingDesc')}</p>
      </div>
    );
  }

  if (cls.status === 'cancelled') {
    return (
      <div className='bg-destructive/5 border-destructive/40 sticky top-4 rounded-xl border p-5 text-sm'>
        <div className='text-destructive mb-1 font-medium'>{t('cancelled')}</div>
        <p className='text-muted-foreground text-[13px]'>{t('cancelledDesc')}</p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const isEnded = !!cls.endDate && cls.endDate < today;

  const seats = workshopSeatsLeft(cls);
  const isFull = seats === 0 || cls.status === 'full';

  return (
    <div className='bg-card shadow-card sticky top-4 rounded-xl border p-5 shadow-sm'>
      <div className='text-muted-foreground mb-3 text-[11px] font-medium tracking-wider uppercase'>
        {t('sectionLabel')}
      </div>
      <div className='space-y-4 text-sm'>
        <InfoRow icon='calendar' title={cls.schedule} />
        <InfoRow icon='workspace' title={cls.location} sub={cls.room} />
        <InfoRow
          icon='teams'
          title={formatAgeRange(cls.minAge, cls.maxAge)}
          sub={isFull ? t('seatsFull') : t('seatsRemaining', { seats, capacity: cls.capacity })}
        />
        <InfoRow icon='billing' title={formatFee(cls.tuitionAmount)} />
      </div>
      {!isEnded && <SignupTrigger cls={cls} disabled={isFull} />}
      {isEnded && (
        <p className='text-muted-foreground mt-5 text-center text-[13px]'>{t('ended')}</p>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  title,
  sub
}: {
  icon: 'calendar' | 'workspace' | 'teams' | 'billing';
  title: string;
  sub?: string;
}) {
  const Icon = Icons[icon];
  return (
    <div className='flex gap-3'>
      <Icon className='text-muted-foreground mt-0.5 size-4 shrink-0' />
      <div>
        <div className='font-medium'>{title}</div>
        {sub && <div className='text-muted-foreground text-xs'>{sub}</div>}
      </div>
    </div>
  );
}

// Owns the dialog open state so the surrounding sidebar (which can re-render
// when the parent post data refreshes) doesn't accidentally close it.
function SignupTrigger({ cls, disabled }: { cls: AttachedClass; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('blog.workshop');
  return (
    <>
      <Button className='mt-5 w-full' disabled={disabled} onClick={() => setOpen(true)}>
        {disabled ? t('registerFull') : t('registerCta')}
      </Button>
      <WorkshopSignupDialog open={open} onOpenChange={setOpen} workshop={cls} />
    </>
  );
}

export function BlogDetailSkeleton() {
  return (
    <div className='mx-auto w-full max-w-[920px] animate-pulse pb-16'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='bg-muted h-8 w-40 rounded' />
        <div className='bg-muted h-8 w-32 rounded' />
      </div>
      <div className='bg-muted mb-3 h-5 w-32 rounded' />
      <div className='bg-muted mb-3 h-10 w-3/4 rounded' />
      <div className='bg-muted mb-6 h-4 w-full rounded' />
      <div className='bg-muted mb-9 h-[380px] rounded-2xl' />
      <div className='space-y-3'>
        <div className='bg-muted h-4 w-full rounded' />
        <div className='bg-muted h-4 w-full rounded' />
        <div className='bg-muted h-4 w-3/4 rounded' />
      </div>
    </div>
  );
}
