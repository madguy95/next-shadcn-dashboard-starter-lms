import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { BlogCover } from '@/features/blog/components/blog-cover';
import type { AttachedClass } from '@/api/blog';

function workshopSeatsLeft(c: AttachedClass) {
  return Math.max(0, c.capacity - c.enrolled);
}
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/api/blog';
import type { HomeFeedItem } from '@/api/blog';

type Variant = 'dark' | 'light';

export function HomeFeed({
  items,
  variant = 'dark'
}: {
  items: HomeFeedItem[];
  variant?: Variant;
}) {
  const t = useTranslations('blog.homeFeed');
  const dark = variant === 'dark';

  if (items.length === 0) {
    return null;
  }

  const [spotlight, ...rest] = items;
  const tiles = rest.slice(0, 3);

  return (
    <section className='relative z-10 px-4 pt-4 pb-16 md:px-10 md:pb-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-wrap items-end justify-between gap-3 md:mb-10 md:gap-4'>
          <div>
            <div
              className={cn(
                'text-[11px] tracking-wider uppercase',
                dark ? 'text-orange-300/80' : 'text-orange-500/70'
              )}
            >
              {t('eyebrow')}
            </div>
            <h2
              className={cn(
                'mt-2 text-2xl font-semibold tracking-tight md:text-3xl',
                dark ? 'text-white' : 'text-gray-900'
              )}
            >
              {t('title')}
            </h2>
            <p className={cn('mt-2 max-w-xl text-sm', dark ? 'text-white/50' : 'text-gray-500')}>
              {t('description')}
            </p>
          </div>
          <Link
            href='/blog'
            className={cn(
              'inline-flex items-center gap-1.5 text-sm transition-colors',
              dark ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            {t('viewAll')}
            <Icons.arrowRight className='size-3.5' />
          </Link>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
          <SpotlightCard item={spotlight} dark={dark} />
          {tiles.length > 0 && (
            <div className='flex flex-col gap-4'>
              {tiles.map((item) => (
                <TileCard key={item.post.id} item={item} dark={dark} />
              ))}
              {Array.from({ length: Math.max(0, 3 - tiles.length) }).map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className={cn(
                    'hidden flex-1 rounded-2xl border lg:block',
                    dark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TypeBadge({ kind, dark = true }: { kind: HomeFeedItem['kind']; dark?: boolean }) {
  const t = useTranslations('blog.homeFeed');
  const cfg =
    kind === 'workshop'
      ? {
          label: t('typeWorkshop'),
          chip: dark
            ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700',
          dot: 'bg-emerald-400'
        }
      : {
          label: t('typeArticle'),
          chip: dark
            ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
            : 'border-cyan-200 bg-cyan-50 text-cyan-700',
          dot: 'bg-cyan-400'
        };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
        cfg.chip
      )}
    >
      <span className={cn('size-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function FeaturedPill({ dark = true }: { dark?: boolean }) {
  const t = useTranslations('blog.homeFeed');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
        dark
          ? 'border-amber-400/30 bg-amber-400/15 text-amber-200'
          : 'border-amber-200 bg-amber-50 text-amber-700'
      )}
    >
      <span aria-hidden>✨</span>
      {t('featuredPill')}
    </span>
  );
}

function MetaRow({ item, dark = true }: { item: HomeFeedItem; dark?: boolean }) {
  const t = useTranslations('blog.homeFeed');
  const baseText = dark ? 'text-white/60' : 'text-gray-500';
  const lowText = dark ? 'text-orange-300' : 'text-orange-500';

  if (item.kind === 'workshop') {
    const seats = workshopSeatsLeft(item.workshop);
    const seatsLow = seats <= 4;
    return (
      <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]', baseText)}>
        <span className='inline-flex items-center gap-1'>
          <Icons.calendar className='size-3' />
          {item.workshop.schedule}
        </span>
        <span className='inline-flex items-center gap-1'>
          <Icons.workspace className='size-3' />
          {item.workshop.location}
        </span>
        <span className={cn('inline-flex items-center gap-1', seatsLow ? lowText : baseText)}>
          <Icons.teams className='size-3' />
          {seats === 0
            ? t('seatsFull')
            : t('seatsRemaining', { seats, capacity: item.workshop.capacity })}
        </span>
      </div>
    );
  }
  return (
    <div className={cn('inline-flex items-center gap-1 text-[12px]', baseText)}>
      <Icons.clock className='size-3' />
      {item.post.meta}
    </div>
  );
}

function SpotlightCover({ post }: { post: BlogPost }) {
  if (post.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.coverUrl}
        alt={post.title}
        className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
      />
    );
  }
  return (
    <div className='absolute inset-0 transition-transform duration-500 group-hover:scale-105'>
      <BlogCover hue={post.hue} category={post.category} status={post.status} size={120} />
    </div>
  );
}

function TileCover({ post }: { post: BlogPost }) {
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
  return (
    <div className='absolute inset-0'>
      <BlogCover hue={post.hue} category={post.category} status={post.status} size={42} />
    </div>
  );
}

function SpotlightCard({ item, dark }: { item: HomeFeedItem; dark: boolean }) {
  const t = useTranslations('blog.homeFeed');
  const href = `/blog/${item.post.slug}`;
  const ctaLabel = item.kind === 'workshop' ? t('ctaWorkshop') : t('ctaArticle');

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl text-left transition-all lg:min-h-[520px]',
        dark
          ? 'border border-white/10 bg-white/5 backdrop-blur hover:border-white/30 hover:bg-white/[0.08]'
          : 'border border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md'
      )}
    >
      <div className='relative h-56 w-full overflow-hidden lg:h-[280px]'>
        <SpotlightCover post={item.post} />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
        <div className='absolute top-4 left-4 flex flex-wrap items-center gap-2'>
          <TypeBadge kind={item.kind} dark={dark} />
          {item.post.featured && <FeaturedPill dark={dark} />}
        </div>
        {item.kind === 'workshop' && item.workshop.status === 'open' && (
          <span className='absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur'>
            <span className='size-1.5 rounded-full bg-emerald-400' />
            {t('statusOpen')}
          </span>
        )}
      </div>

      <div className='relative flex flex-1 flex-col gap-4 p-6 md:p-8'>
        <h3
          className={cn(
            'text-xl leading-tight font-semibold tracking-tight md:text-2xl',
            dark ? 'text-white' : 'text-gray-900'
          )}
        >
          {item.post.title}
        </h3>
        <p
          className={cn(
            'line-clamp-3 text-sm leading-relaxed',
            dark ? 'text-white/70' : 'text-gray-600'
          )}
        >
          {item.post.excerpt}
        </p>

        <div
          className={cn(
            'mt-auto space-y-4 border-t pt-4',
            dark ? 'border-white/10' : 'border-gray-100'
          )}
        >
          <MetaRow item={item} dark={dark} />
          <div
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium transition-transform group-hover:translate-x-0.5',
              dark ? 'text-cyan-300' : 'text-blue-600'
            )}
          >
            {ctaLabel}
            <Icons.arrowRight className='size-3.5' />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TileCard({ item, dark }: { item: HomeFeedItem; dark: boolean }) {
  return (
    <Link
      href={`/blog/${item.post.slug}`}
      className={cn(
        'group flex flex-1 overflow-hidden rounded-xl transition-all',
        dark
          ? 'border border-white/10 bg-white/5 backdrop-blur hover:border-white/30 hover:bg-white/[0.08]'
          : 'border border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow'
      )}
    >
      <div className='relative w-[120px] shrink-0 overflow-hidden sm:w-[140px]'>
        <TileCover post={item.post} />
      </div>
      <div className='flex min-w-0 flex-1 flex-col gap-1.5 p-4'>
        <div className='flex flex-wrap items-center gap-1.5'>
          <TypeBadge kind={item.kind} dark={dark} />
          {item.post.featured && <FeaturedPill dark={dark} />}
        </div>
        <h4
          className={cn(
            'line-clamp-2 text-[15px] leading-snug font-semibold tracking-tight transition-colors',
            dark
              ? 'text-white group-hover:text-cyan-200'
              : 'text-gray-900 group-hover:text-blue-600'
          )}
        >
          {item.post.title}
        </h4>
        <div className='mt-auto'>
          <MetaRow item={item} dark={dark} />
        </div>
      </div>
    </Link>
  );
}
