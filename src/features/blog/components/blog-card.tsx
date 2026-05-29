'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/api/blog';
import { BlogCover } from './blog-cover';
import { BlogTypeBadge } from './blog-type-badge';

// Use an uploaded coverUrl when available; fall back to the gradient/glyph
// placeholder so unedited mock posts and freshly created drafts both render
// something meaningful.
function CoverSlot({ post, size }: { post: BlogPost; size?: number }) {
  if (post.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.coverUrl}
        alt={post.title}
        className='absolute inset-0 h-full w-full object-cover'
      />
    );
  }
  return <BlogCover hue={post.hue} category={post.category} status={post.status} size={size} />;
}

type CardProps = {
  post: BlogPost;
  canEdit: boolean;
  onDelete: (post: BlogPost) => void;
};

function MetaLine({ post }: { post: BlogPost }) {
  const Icon = post.type === 'workshop' ? Icons.calendar : Icons.clock;
  return (
    <span className='text-muted-foreground inline-flex items-center gap-1'>
      <Icon className='size-3' />
      {post.meta}
    </span>
  );
}

function AdminActions({
  post,
  onDelete,
  size = 'sm'
}: {
  post: BlogPost;
  onDelete: (p: BlogPost) => void;
  size?: 'sm' | 'md';
}) {
  const router = useRouter();
  const t = useTranslations('blog.card');
  const btn = size === 'md' ? 'size-8' : 'size-7';
  const icon = size === 'md' ? 'size-3.5' : 'size-3';
  return (
    <div className='absolute top-3 right-3 z-10 flex gap-1'>
      <Button
        variant='secondary'
        size='icon'
        className={cn(
          'rounded-md bg-white/95 text-foreground shadow-sm backdrop-blur hover:bg-white',
          btn
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/blog/${post.slug}/edit`);
        }}
        aria-label={t('edit')}
      >
        <Icons.edit className={icon} />
      </Button>
      <Button
        variant='secondary'
        size='icon'
        className={cn(
          'text-destructive rounded-md bg-white/95 shadow-sm backdrop-blur hover:bg-white',
          btn
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(post);
        }}
        aria-label={t('delete')}
      >
        <Icons.trash className={icon} />
      </Button>
    </div>
  );
}

export function BlogCard({ post, canEdit, onDelete }: CardProps) {
  const tCategory = useTranslations('blog.category');
  return (
    <Link
      href={`/blog/${post.slug}`}
      className='group bg-card relative flex flex-col overflow-hidden rounded-xl border text-left shadow-sm transition-shadow hover:shadow-md'
    >
      <div className='relative h-40 overflow-hidden'>
        <CoverSlot post={post} />
        <span className='absolute top-3 left-3 z-10'>
          <BlogTypeBadge post={post} />
        </span>
        {canEdit && <AdminActions post={post} onDelete={onDelete} />}
      </div>
      <div className='flex flex-1 flex-col p-5'>
        <div className='text-muted-foreground mb-1.5 text-[11px]'>{tCategory(post.category)}</div>
        <h3 className='group-hover:text-primary mb-1.5 text-[15px] leading-snug font-semibold tracking-tight text-balance transition-colors'>
          {post.title}
        </h3>
        <p className='text-muted-foreground mb-4 line-clamp-2 text-[13px] leading-relaxed'>
          {post.excerpt}
        </p>
        <div className='mt-auto flex items-center gap-2 border-t pt-3 text-[12px]'>
          <span className='bg-primary text-primary-foreground grid size-6 place-items-center rounded-full text-[10px] font-semibold'>
            {post.author.initials}
          </span>
          <span className='text-foreground/80 font-medium'>{post.author.name}</span>
          <span className='ml-auto'>
            <MetaLine post={post} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BlogFeaturedCard({ post, canEdit, onDelete }: CardProps) {
  const t = useTranslations('blog.card');
  const tCategory = useTranslations('blog.category');
  return (
    <Link
      href={`/blog/${post.slug}`}
      className='group bg-card relative grid grid-cols-1 overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md md:grid-cols-[1.05fr_1fr]'
    >
      <div className='relative min-h-[280px] overflow-hidden md:min-h-[340px]'>
        <CoverSlot post={post} size={104} />
        <span className='absolute top-4 left-4 z-10'>
          <BlogTypeBadge post={post} />
        </span>
        {canEdit && <AdminActions post={post} onDelete={onDelete} size='md' />}
      </div>
      <div className='flex flex-col justify-center p-7 md:p-9'>
        <div className='text-muted-foreground mb-3 flex items-center gap-2 text-[12px]'>
          <span className='text-foreground/70 text-[11px] font-semibold tracking-wider uppercase'>
            {t('featured')}
          </span>
          <span className='bg-border size-1 rounded-full' />
          {tCategory(post.category)}
        </div>
        <h2 className='group-hover:text-primary mb-3 text-[26px] leading-[1.15] font-semibold tracking-tight text-balance transition-colors md:text-[30px]'>
          {post.title}
        </h2>
        <p className='text-muted-foreground mb-6 max-w-[46ch] text-[15px] leading-relaxed'>
          {post.excerpt}
        </p>
        <div className='mb-6 flex items-center gap-2.5 text-[13px]'>
          <span className='bg-primary text-primary-foreground grid size-7 place-items-center rounded-full text-[11px] font-semibold'>
            {post.author.initials}
          </span>
          <span className='text-foreground/80 font-medium'>{post.author.name}</span>
          <span className='bg-border size-1 rounded-full' />
          <MetaLine post={post} />
        </div>
        <div className='text-foreground inline-flex items-center gap-1.5 text-sm font-medium'>
          {post.type === 'workshop' ? t('ctaWorkshop') : t('ctaArticle')}
          <Icons.arrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
        </div>
      </div>
    </Link>
  );
}
