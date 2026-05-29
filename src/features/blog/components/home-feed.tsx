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

// Server component — no client state. Renders the magazine-style mixed feed of
// upcoming workshops + latest blog posts, designed to slot into the dark-themed
// landing page between the courses grid and the bottom CTA.
export function HomeFeed({ items }: { items: HomeFeedItem[] }) {
  const t = useTranslations('blog.homeFeed');
  if (items.length === 0) {
    // Hide the whole section when there's nothing to show — an empty
    // "News & Events" block on a landing page reads worse than no section.
    return null;
  }

  const [spotlight, ...rest] = items;
  const tiles = rest.slice(0, 3);

  return (
    <section className='relative z-10 px-4 pt-4 pb-16 md:px-10 md:pb-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-wrap items-end justify-between gap-3 md:mb-10 md:gap-4'>
          <div>
            <div className='text-[11px] tracking-wider text-orange-300/80 uppercase'>
              {t('eyebrow')}
            </div>
            <h2 className='mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl'>
              {t('title')}
            </h2>
            <p className='mt-2 max-w-xl text-sm text-white/50'>{t('description')}</p>
          </div>
          <Link
            href='/blog'
            className='inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white'
          >
            {t('viewAll')}
            <Icons.arrowRight className='size-3.5' />
          </Link>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
          <SpotlightCard item={spotlight} />
          {tiles.length > 0 && (
            <div className='flex flex-col gap-4'>
              {tiles.map((item) => (
                <TileCard key={item.post.id} item={item} />
              ))}
              {/* Pad to keep right column's height aligned with the spotlight on
                  desktop — without padding, fewer than 3 tiles leave the column
                  short and the visual rhythm collapses. */}
              {Array.from({ length: Math.max(0, 3 - tiles.length) }).map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className='hidden flex-1 rounded-2xl border border-white/5 bg-white/[0.02] lg:block'
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

// Editorial pin. Sits next to the type badge so admins (and curious readers)
// can see this card surfaced because we hand-picked it, not because of date.
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

function MetaRow({ item }: { item: HomeFeedItem }) {
  const t = useTranslations('blog.homeFeed');
  if (item.kind === 'workshop') {
    const seats = workshopSeatsLeft(item.workshop);
    const seatsLow = seats <= 4;
    return (
      <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/60'>
        <span className='inline-flex items-center gap-1'>
          <Icons.calendar className='size-3' />
          {item.workshop.schedule}
        </span>
        <span className='inline-flex items-center gap-1'>
          <Icons.workspace className='size-3' />
          {item.workshop.location}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1',
            seatsLow ? 'text-orange-300' : 'text-white/60'
          )}
        >
          <Icons.teams className='size-3' />
          {seats === 0
            ? t('seatsFull')
            : t('seatsRemaining', { seats, capacity: item.workshop.capacity })}
        </span>
      </div>
    );
  }
  return (
    <div className='inline-flex items-center gap-1 text-[12px] text-white/60'>
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
  // BlogCover renders white glyphs on a colored gradient — looks good against
  // the dark page background without further tweaking.
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

function SpotlightCard({ item }: { item: HomeFeedItem }) {
  const t = useTranslations('blog.homeFeed');
  const href =
    item.kind === 'workshop' && item.workshop
      ? `/blog/${item.post.slug}`
      : `/blog/${item.post.slug}`;
  const ctaLabel = item.kind === 'workshop' ? t('ctaWorkshop') : t('ctaArticle');

  return (
    <Link
      href={href}
      className='group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur transition-all hover:border-white/30 hover:bg-white/[0.08] lg:min-h-[520px]'
    >
      <div className='relative h-56 w-full overflow-hidden lg:h-[280px]'>
        <SpotlightCover post={item.post} />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
        <div className='absolute top-4 left-4 flex flex-wrap items-center gap-2'>
          <TypeBadge kind={item.kind} />
          {item.post.featured && <FeaturedPill />}
        </div>
        {item.kind === 'workshop' && item.workshop.status === 'open' && (
          <span className='absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur'>
            <span className='size-1.5 rounded-full bg-emerald-400' />
            {t('statusOpen')}
          </span>
        )}
      </div>

      <div className='relative flex flex-1 flex-col gap-4 p-6 md:p-8'>
        <h3 className='text-xl leading-tight font-semibold tracking-tight text-white md:text-2xl'>
          {item.post.title}
        </h3>
        <p className='line-clamp-3 text-sm leading-relaxed text-white/70'>{item.post.excerpt}</p>

        <div className='mt-auto space-y-4 border-t border-white/10 pt-4'>
          <MetaRow item={item} />
          <div className='inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 transition-transform group-hover:translate-x-0.5'>
            {ctaLabel}
            <Icons.arrowRight className='size-3.5' />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TileCard({ item }: { item: HomeFeedItem }) {
  return (
    <Link
      href={`/blog/${item.post.slug}`}
      className='group flex flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:border-white/30 hover:bg-white/[0.08]'
    >
      <div className='relative w-[120px] shrink-0 overflow-hidden sm:w-[140px]'>
        <TileCover post={item.post} />
      </div>
      <div className='flex min-w-0 flex-1 flex-col gap-1.5 p-4'>
        <div className='flex flex-wrap items-center gap-1.5'>
          <TypeBadge kind={item.kind} />
          {item.post.featured && <FeaturedPill />}
        </div>
        <h4 className='line-clamp-2 text-[15px] leading-snug font-semibold tracking-tight text-white transition-colors group-hover:text-cyan-200'>
          {item.post.title}
        </h4>
        <div className='mt-auto'>
          <MetaRow item={item} />
        </div>
      </div>
    </Link>
  );
}
