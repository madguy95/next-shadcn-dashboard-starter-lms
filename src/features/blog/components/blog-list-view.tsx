'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { blogListOptions, type BlogFilter, type BlogPost } from '@/api/blog';
import { BlogCard } from './blog-card';
import { BlogFeaturedCarousel } from './blog-featured-carousel';
import { DeletePostDialog } from './delete-post-dialog';

const VALID_FILTERS: BlogFilter[] = ['all', 'article', 'workshop', 'draft'];
const isFilter = (v: string | null | undefined): v is BlogFilter =>
  !!v && VALID_FILTERS.includes(v as BlogFilter);

export function BlogListView({ canEdit }: { canEdit: boolean }) {
  const t = useTranslations('blog.list');
  // Filter + search live in the URL so deep links + back/forward preserve view state.
  const [filterParam, setFilterParam] = useQueryState('tab', parseAsString);
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));

  const filter: BlogFilter = isFilter(filterParam) ? filterParam : 'all';

  const { data } = useSuspenseQuery(
    blogListOptions({
      filter,
      search: search || undefined,
      // Drafts must never leak to non-admin viewers, even via URL tampering.
      includeDrafts: canEdit
    })
  );

  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const onAskDelete = (post: BlogPost) => {
    setPendingDelete(post);
    setDeleteOpen(true);
  };

  // The featured carousel only makes sense on the default "all" tab and when
  // there is no active search — otherwise the carousel + grid show overlapping
  // results which is confusing.
  const showFeatured = filter === 'all' && !search;
  const featuredIds = new Set(data.featured.map((p) => p.id));
  const gridPosts = showFeatured ? data.data.filter((p) => !featuredIds.has(p.id)) : data.data;

  return (
    <div className='flex flex-col gap-6'>
      {showFeatured && data.featured.length > 0 && (
        <BlogFeaturedCarousel posts={data.featured} canEdit={canEdit} onDelete={onAskDelete} />
      )}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Tabs value={filter} onValueChange={(v) => void setFilterParam(v === 'all' ? null : v)}>
          <TabsList>
            <TabsTrigger value='all'>{t('tabAll')}</TabsTrigger>
            <TabsTrigger value='article'>{t('tabArticle')}</TabsTrigger>
            <TabsTrigger value='workshop'>{t('tabWorkshop')}</TabsTrigger>
            {canEdit && <TabsTrigger value='draft'>{t('tabDraft')}</TabsTrigger>}
          </TabsList>
        </Tabs>
        <div className='relative w-full sm:w-72'>
          <Icons.search className='text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(e) => void setSearch(e.target.value || null)}
            placeholder={t('searchPlaceholder')}
            className='h-9 pl-8 text-[13px]'
          />
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <h2 className='text-muted-foreground shrink-0 text-[12px] font-semibold tracking-wider uppercase'>
          {filter === 'draft' ? t('sectionDraft') : t('sectionLatest')}
        </h2>
        <div className='bg-border h-px flex-1' />
      </div>

      {gridPosts.length === 0 ? (
        <EmptyState canEdit={canEdit} hasSearch={!!search} />
      ) : (
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {gridPosts.map((p) => (
            <BlogCard key={p.id} post={p} canEdit={canEdit} onDelete={onAskDelete} />
          ))}
        </div>
      )}

      <div className='text-muted-foreground flex items-center justify-between text-sm'>
        <span>{t('summary', { total: data.total, visibleTotal: data.visibleTotal })}</span>
      </div>

      <DeletePostDialog post={pendingDelete} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}

function EmptyState({ canEdit, hasSearch }: { canEdit: boolean; hasSearch: boolean }) {
  const t = useTranslations('blog.list');
  return (
    <div className='bg-card text-muted-foreground grid min-h-[220px] place-items-center rounded-lg border border-dashed p-6 text-sm'>
      <div className='text-center'>
        <Icons.post className='text-muted-foreground/60 mx-auto mb-2 size-6' />
        <div className='text-foreground font-medium'>
          {hasSearch ? t('emptySearchTitle') : t('emptyTitle')}
        </div>
        <div className='mt-1 text-xs'>
          {hasSearch
            ? t('emptyDescriptionSearch')
            : canEdit
              ? t('emptyDescriptionAdmin')
              : t('emptyDescription')}
        </div>
        {canEdit && !hasSearch && (
          <Button asChild size='sm' className='mt-4'>
            <Link href='/blog/new'>
              <Icons.add className='size-3.5' />
              {t('newPost')}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function BlogListHeaderAction({ canEdit }: { canEdit: boolean }) {
  const t = useTranslations('blog.list');
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' size='sm' className='h-9'>
        <Icons.upload className='size-3.5' />
        {t('exportList')}
      </Button>
      {canEdit && (
        <Button asChild size='sm' className='h-9'>
          <Link href='/blog/new'>
            <Icons.add className='size-3.5' />
            {t('newPost')}
          </Link>
        </Button>
      )}
    </div>
  );
}

export function BlogListSkeleton() {
  return (
    <div className='flex animate-pulse flex-col gap-6'>
      <div className='bg-muted h-[280px] rounded-2xl md:h-[340px]' />
      <div className='flex items-center justify-between gap-3'>
        <div className='bg-muted h-9 w-72 rounded-md' />
        <div className='bg-muted h-9 w-72 rounded-md' />
      </div>
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='bg-card overflow-hidden rounded-xl border'>
            <div className='bg-muted h-40' />
            <div className='space-y-2 p-5'>
              <div className='bg-muted h-3 w-20 rounded' />
              <div className='bg-muted h-4 w-3/4 rounded' />
              <div className='bg-muted h-3 w-full rounded' />
              <div className='bg-muted h-3 w-1/2 rounded' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
