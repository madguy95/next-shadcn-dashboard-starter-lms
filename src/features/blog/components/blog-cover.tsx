import { cn } from '@/lib/utils';
import type { BlogCategory, BlogStatus } from '@/api/blog';

// Stable, decorative cover used in lieu of a real image. The HTML mock seeds
// each post with a hue + category and renders a gradient + dotted overlay +
// glow + a category-specific glyph. We replicate that here so the visual
// language stays consistent with the design comp.

type CoverProps = {
  hue: number;
  category: BlogCategory;
  status?: BlogStatus;
  size?: number;
  className?: string;
};

function CategoryGlyph({ category, size }: { category: BlogCategory; size: number }) {
  // Inline SVG glyphs so we don't pay for icon imports per card.
  const sw = 1.4;
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'white',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'relative opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]'
  };
  switch (category) {
    case 'event':
      return (
        <svg {...props}>
          <path d='m12 3-1.9 5.8L4 11l6.1 2.2L12 19l1.9-5.8L20 11l-6.1-2.2Z' />
        </svg>
      );
    case 'parent_tips':
      return (
        <svg {...props}>
          <path d='M9 18h6M10 22h4' />
          <path d='M15.1 14c.2-.8.7-1.4 1.3-2A5 5 0 1 0 7 8c0 1.5.5 2.8 1.6 4 .6.6 1.1 1.2 1.3 2' />
        </svg>
      );
    case 'student_story':
      return (
        <svg {...props}>
          <path d='M22 10 12 5 2 10l10 5 10-5Z' />
          <path d='M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5' />
        </svg>
      );
    case 'center_news':
      return (
        <svg {...props}>
          <path d='m3 11 18-5v12L3 14v-3Z' />
          <path d='M11.6 16.8a3 3 0 1 1-5.8-1.6' />
        </svg>
      );
  }
}

export function BlogCover({ hue, category, status, size = 48, className }: CoverProps) {
  const isDraft = status === 'draft';
  // Drafts use a desaturated palette so they read as work-in-progress at a glance.
  const gradient = isDraft
    ? `linear-gradient(140deg, hsl(${hue} 16% 76%), hsl(${hue} 20% 60%))`
    : `linear-gradient(140deg, hsl(${hue} 52% 60%), hsl(${hue} 64% 39%))`;

  return (
    <div
      className={cn('relative grid h-full w-full place-items-center overflow-hidden', className)}
    >
      <div className='absolute inset-0' style={{ background: gradient }} />
      <div
        className='absolute inset-0 opacity-90'
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1.4px)',
          backgroundSize: '14px 14px'
        }}
      />
      <div
        className='absolute inset-0'
        style={{
          backgroundImage:
            'radial-gradient(120% 90% at 80% 0%, rgba(255,255,255,0.22), transparent 60%)'
        }}
      />
      <CategoryGlyph category={category} size={size} />
    </div>
  );
}
