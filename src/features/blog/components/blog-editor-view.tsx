'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent
} from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  blogDetailOptions,
  useCreateBlogPost,
  useUpdateBlogPost,
  type BlogCategory,
  type BlogPost,
  type BlogStatus,
  type BlogType,
  type CreateBlogPostInput
} from '@/api/blog';
import { classDetailOptions, classListOptions, type ClassRow } from '@/api/classes';
import { uploadAsset } from '@/api/files/service';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { BlogBody } from './blog-body';
import { BlogRichEditor } from './blog-rich-editor';

// Small derived helper used in a few places. The BE returns enrolled + capacity;
// "seats left" is what readers actually want to know on the workshop sidebar.
function seatsLeft(c: { capacity: number; enrolled: number }) {
  return Math.max(0, c.capacity - c.enrolled);
}

// Adapter — a ClassRow from /api/classes lacks the public Course context (age
// range, tuition) that AttachedClass carries on the BE response. For the editor
// preview we only need date / location / capacity, which both shapes provide.
function classRowToPreviewBits(cls: ClassRow) {
  return {
    title: cls.courseTitle || cls.name,
    schedule: cls.schedule,
    location: cls.location,
    room: cls.room,
    capacity: cls.capacity,
    enrolled: cls.enrolled
  };
}

type Mode = 'create' | 'edit';

const CATEGORIES: BlogCategory[] = ['parent_tips', 'center_news', 'student_story', 'event'];

type FormState = {
  type: BlogType;
  status: BlogStatus;
  category: BlogCategory;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverUrl?: string;
  classId?: string;
  featured?: boolean;
};

const EMPTY: FormState = {
  type: 'article',
  status: 'published',
  category: 'parent_tips',
  title: '',
  excerpt: '',
  body: '',
  tags: []
};

function fromPost(post: BlogPost): FormState {
  return {
    type: post.type,
    status: post.status,
    category: post.category,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    tags: [...post.tags],
    coverUrl: post.coverUrl,
    classId: post.classId,
    featured: post.featured ?? false
  };
}

type Props = ({ mode: 'create' } | { mode: 'edit'; slug: string }) & { basePath: string };

export function BlogEditorView(props: Props) {
  if (props.mode === 'create') return <Editor mode='create' basePath={props.basePath} />;
  return <EditWrapper slug={props.slug} basePath={props.basePath} />;
}

// Edit mode needs to load the post before mounting the form so initial values
// are correct; useSuspenseQuery streams it in via the page-level Suspense boundary.
function EditWrapper({ slug, basePath }: { slug: string; basePath: string }) {
  const { data } = useSuspenseQuery(blogDetailOptions(slug));
  const t = useTranslations('blog.detail');
  if (!data) {
    return (
      <div className='text-muted-foreground grid min-h-[400px] place-items-center text-sm'>
        {t('notFound')}
      </div>
    );
  }
  return <Editor mode='edit' initial={data} basePath={basePath} />;
}

function Editor({ mode, initial, basePath }: { mode: Mode; initial?: BlogPost; basePath: string }) {
  const router = useRouter();
  const t = useTranslations('blog.editor');
  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();
  const [form, setForm] = useState<FormState>(initial ? fromPost(initial) : EMPTY);
  const [tagDraft, setTagDraft] = useState('');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  // True while a cover upload is in-flight. We block submit during upload so
  // the post doesn't get saved with a stale or missing coverUrl.
  const [coverUploading, setCoverUploading] = useState(false);

  const isPending = create.isPending || update.isPending;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Upload to the BE file service (which forwards to Cloudinary or whatever
  // storage backend is configured), then store the returned access URL on the
  // form. Local blob URLs are intentionally NOT used here — they wouldn't
  // survive a page reload and the BE would reject them on save.
  const replaceCoverFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        set('coverUrl', undefined);
        return;
      }
      setCoverUploading(true);
      try {
        const res = await uploadAsset(file, 'BLOG_COVER');
        set('coverUrl', res.accessUrl);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('coverUploadFailed'));
      } finally {
        setCoverUploading(false);
      }
    },
    // `set` is a stable closure over setForm; safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  const submit = async (status: BlogStatus) => {
    if (coverUploading) {
      toast.error(t('coverUploading'));
      return;
    }
    if (!form.title.trim()) {
      toast.error(t('titleRequired'));
      return;
    }
    // Workshops without a linked class would render an empty sidebar — block
    // publishing until admin picks one. Drafts are allowed without it so admins
    // can park a half-finished post.
    if (form.type === 'workshop' && status === 'published' && !form.classId) {
      toast.error(t('workshopNoClass'));
      return;
    }
    const payload: CreateBlogPostInput = {
      type: form.type,
      status,
      category: form.category,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body,
      tags: form.tags,
      coverUrl: form.coverUrl,
      // Strip classId if author switched type back to 'article' before saving —
      // otherwise the post would still carry a stale class reference.
      classId: form.type === 'workshop' ? form.classId : undefined,
      featured: form.featured ?? false
    };
    try {
      if (mode === 'edit' && initial) {
        const post = await update.mutateAsync({ id: initial.id, input: payload });
        toast.success(status === 'draft' ? t('draftSaved') : t('postUpdated'));
        router.push(`${basePath}/${post.slug}`);
      } else {
        const post = await create.mutateAsync(payload);
        toast.success(status === 'draft' ? t('draftSaved') : t('postPublished'));
        router.push(`${basePath}/${post.slug}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('saveFailed'));
    }
  };

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const v = tagDraft.trim().replace(/^#/, '');
    if (!v) return;
    if (form.tags.includes(v)) {
      setTagDraft('');
      return;
    }
    set('tags', [...form.tags, v]);
    setTagDraft('');
  };

  return (
    <div className='-mt-2 flex flex-col'>
      <div className='bg-background flex h-14 shrink-0 items-center gap-2 border-b px-2 md:gap-3'>
        <Button variant='ghost' size='sm' onClick={() => router.back()} className='shrink-0'>
          <Icons.chevronLeft className='size-3.5' />
          {/* "Hủy" label takes ~30px we can't spare on phone widths; chevron +
              aria-label keep the affordance. */}
          <span className='hidden sm:inline'>{t('cancel')}</span>
          <span className='sr-only sm:hidden'>{t('cancel')}</span>
        </Button>
        <div className='bg-border hidden h-5 w-px sm:block' />
        <span className='truncate text-sm font-medium'>
          {mode === 'edit' ? t('editTitle') : t('createTitle')}
        </span>
        <span className='text-muted-foreground hidden items-center gap-1.5 text-[12px] md:inline-flex'>
          <span className='bg-amber-500 size-1.5 rounded-full' />
          {t('autosave')}
        </span>
        {/* Edit / Preview toggle. Lives in the header (not the body) so it's
            still visible no matter how far the user has scrolled. Labels hide
            on <sm so the toggle + back button + title fit on one line. */}
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as 'edit' | 'preview')}
          className='ml-auto md:ml-2'
        >
          <TabsList className='h-8'>
            <TabsTrigger value='edit' className='px-2 text-xs md:px-3' aria-label={t('edit')}>
              <Icons.edit className='size-3' />
              <span className='hidden sm:inline'>{t('edit')}</span>
            </TabsTrigger>
            <TabsTrigger value='preview' className='px-2 text-xs md:px-3' aria-label={t('preview')}>
              <Icons.eye className='size-3' />
              <span className='hidden sm:inline'>{t('preview')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {/* Save Draft + Publish render in a sticky footer on <md (see
            MobileActionBar below) so the header doesn't get cramped. md+ keeps
            them inline at the right of the header. */}
        <div className='ml-auto hidden items-center gap-2 md:flex'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => submit('draft')}
            isLoading={isPending}
            disabled={coverUploading}
          >
            {t('saveDraft')}
          </Button>
          <Button
            size='sm'
            onClick={() => submit('published')}
            isLoading={isPending}
            disabled={coverUploading}
          >
            {t('publish')}
          </Button>
        </div>
      </div>

      {view === 'preview' ? (
        <EditorPreview form={form} />
      ) : (
        // pb-24 on <md leaves room for the sticky mobile action bar so the
        // bottom of the editor / SettingsRail isn't hidden behind it.
        <div className='mx-auto grid w-full max-w-[1400px] grid-cols-1 pb-24 md:pb-0 lg:grid-cols-[1fr_320px]'>
          {/* border-r only on lg+ where the SettingsRail sits next to the
              editor — on mobile (single column) there's no neighbor to
              divide from and the orphan rule looked broken. */}
          <div className='min-h-0 px-4 py-6 sm:px-6 sm:py-8 lg:border-r lg:px-10'>
            <CoverDropzone
              value={form.coverUrl}
              onFile={replaceCoverFile}
              uploading={coverUploading}
            />

            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={t('titlePlaceholder')}
              className='placeholder:text-foreground/25 mb-3 h-auto border-0 bg-transparent p-0 text-[32px] leading-tight font-semibold tracking-tight shadow-none focus-visible:ring-0 md:text-[32px]'
            />
            <Input
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              placeholder={t('excerptPlaceholder')}
              className='text-muted-foreground placeholder:text-muted-foreground/50 mb-6 h-auto border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0'
            />

            <BlogRichEditor
              value={form.body}
              onChange={(html) => set('body', html)}
              placeholder={t('bodyPlaceholder')}
            />
          </div>

          <SettingsRail
            form={form}
            set={set}
            tagDraft={tagDraft}
            setTagDraft={setTagDraft}
            onTagKeyDown={onTagKeyDown}
            onRemoveTag={(t) =>
              set(
                'tags',
                form.tags.filter((x) => x !== t)
              )
            }
          />
        </div>
      )}

      {/* Mobile action bar — pinned to the viewport bottom on <md because the
          header's Save Draft + Publish buttons are hidden there. Lives outside
          the edit/preview branch so the same actions are reachable from both
          modes. */}
      <div className='bg-background/95 sticky bottom-0 z-20 flex shrink-0 items-center gap-2 border-t px-4 py-3 backdrop-blur md:hidden'>
        <Button
          variant='outline'
          size='sm'
          className='h-9 flex-1'
          onClick={() => submit('draft')}
          isLoading={isPending}
          disabled={coverUploading}
        >
          {t('saveDraft')}
        </Button>
        <Button
          size='sm'
          className='h-9 flex-1'
          onClick={() => submit('published')}
          isLoading={isPending}
          disabled={coverUploading}
        >
          {t('publish')}
        </Button>
      </div>
    </div>
  );
}

// Preview mirrors the read-side detail layout. Article previews use the 920px
// column; workshop previews widen to 1100px and add the workshop info sidebar
// (resolved from the linked Class).
function EditorPreview({ form }: { form: FormState }) {
  const t = useTranslations('blog.editor');
  const tBadge = useTranslations('blog.badge');
  const tCategory = useTranslations('blog.category');
  const tDetail = useTranslations('blog.detail');
  const hasContent = form.title.trim() || form.body.trim();
  if (!hasContent) {
    return (
      <div className='text-muted-foreground mx-auto grid w-full max-w-[920px] place-items-center px-6 py-16 text-sm'>
        <div className='text-center'>
          <Icons.eye className='text-muted-foreground/60 mx-auto mb-2 size-6' />
          <div className='text-foreground font-medium'>{t('previewEmptyTitle')}</div>
          <div className='mt-1 text-xs'>{t('previewEmptyDesc')}</div>
        </div>
      </div>
    );
  }

  const isWorkshop = form.type === 'workshop';
  const maxWidth = isWorkshop ? 'max-w-[1100px]' : 'max-w-[920px]';

  return (
    <div className={cn('mx-auto w-full px-4 pt-6 pb-24 sm:px-6 sm:pt-8 md:pb-16', maxWidth)}>
      <div className='border-primary/30 bg-primary/5 text-primary mb-6 rounded-md border px-3 py-2 text-[12px]'>
        {t('previewBanner')}
      </div>
      <div className='mb-3 flex items-center gap-2'>
        <span className='bg-primary/10 text-primary rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider uppercase'>
          {isWorkshop ? tBadge('workshop') : tBadge('article')}
        </span>
        <span className='text-muted-foreground text-[12px]'>{tCategory(form.category)}</span>
      </div>

      {isWorkshop ? (
        <>
          {form.coverUrl && (
            <div className='ring-border relative mb-8 h-[320px] overflow-hidden rounded-2xl ring-1'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.coverUrl}
                alt={form.title || t('coverAlt')}
                className='absolute inset-0 h-full w-full object-cover'
              />
            </div>
          )}
          <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <h1 className='mb-4 text-[36px] leading-[1.15] font-semibold tracking-tight text-balance'>
                {form.title || t('previewWorkshopTitle')}
              </h1>
              {form.excerpt && (
                <p className='text-muted-foreground mb-6 text-lg leading-relaxed [text-wrap:pretty]'>
                  {form.excerpt}
                </p>
              )}
              <BlogBody body={form.body} />
            </div>
            <aside className='lg:col-span-1'>
              {form.classId ? (
                <WorkshopPreviewSidebar classId={form.classId} />
              ) : (
                <div className='bg-warning/5 border-warning/40 sticky top-4 rounded-xl border p-5 text-sm'>
                  <div className='text-warning-foreground mb-1 font-medium'>
                    {t('previewNoClass')}
                  </div>
                  <p className='text-muted-foreground text-[13px]'>{t('previewNoClassDesc')}</p>
                </div>
              )}
            </aside>
          </div>
        </>
      ) : (
        <>
          <h1 className='mb-4 text-[40px] leading-[1.15] font-semibold tracking-tight text-balance'>
            {form.title || t('previewArticleTitle')}
          </h1>
          {form.excerpt && (
            <p className='text-muted-foreground mb-6 text-lg leading-relaxed [text-wrap:pretty]'>
              {form.excerpt}
            </p>
          )}
          {form.coverUrl && (
            <div className='ring-border relative mb-9 h-[380px] overflow-hidden rounded-2xl ring-1'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.coverUrl}
                alt={form.title || t('coverAlt')}
                className='absolute inset-0 h-full w-full object-cover'
              />
            </div>
          )}
          <BlogBody body={form.body} />
        </>
      )}

      {form.tags.length > 0 && (
        <div className='mt-10 flex flex-wrap gap-2 border-t pt-6'>
          <span className='text-muted-foreground mr-1 self-center text-[12px]'>
            {tDetail('tagsLabel')}
          </span>
          {form.tags.map((tag) => (
            <span
              key={tag}
              className='bg-muted text-foreground/70 rounded-full px-2.5 py-1 text-[12px]'
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewInfoRow({
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

const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB — generous for cover images, blocks accidental uploads of huge originals.
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

function CoverDropzone({
  value,
  onFile,
  uploading
}: {
  value: string | undefined;
  // Pass `null` to clear. Parent owns the upload lifecycle — this component
  // only validates locally + forwards the file. The returned promise is the
  // parent's upload; while it's in-flight we render a spinner overlay.
  onFile: (file: File | null) => void;
  uploading: boolean;
}) {
  const t = useTranslations('blog.editor');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = useCallback(
    (file: File) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(t('coverUnsupported'));
        return;
      }
      if (file.size > MAX_COVER_BYTES) {
        toast.error(t('coverTooLarge'));
        return;
      }
      onFile(file);
    },
    [onFile, t]
  );

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) accept(file);
    // Reset so picking the same file twice still triggers change.
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) accept(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragging) setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFile(null);
  };

  // Uploading state can happen in two situations:
  //   - From the empty dropzone → no value yet, show a spinner-only placeholder
  //   - Replacing an existing cover → keep the old image visible with an overlay
  if (uploading && !value) {
    return (
      <div className='ring-border bg-muted/40 mb-7 grid h-[200px] place-items-center rounded-xl ring-1'>
        <div className='text-center'>
          <Icons.spinner className='text-muted-foreground mx-auto mb-2 size-5 animate-spin' />
          <div className='text-sm font-medium'>{t('coverUploadingHero')}</div>
        </div>
      </div>
    );
  }

  if (value) {
    return (
      <div className='ring-border group relative mb-7 h-[200px] overflow-hidden rounded-xl ring-1'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt={t('coverAlt')} className='h-full w-full object-cover' />
        <div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30' />
        {/* Replace/Remove buttons are hover-revealed on desktop, always visible
            on <md — touch devices have no hover so otherwise these are
            unreachable on phones. */}
        <div className='absolute top-3 right-3 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100'>
          <Button
            type='button'
            size='sm'
            variant='secondary'
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Icons.refresh className='size-3.5' />
            {t('coverReplace')}
          </Button>
          <Button
            type='button'
            size='sm'
            variant='destructive'
            onClick={clear}
            disabled={uploading}
          >
            <Icons.trash className='size-3.5' />
            {t('coverRemove')}
          </Button>
        </div>
        {uploading && (
          <div className='absolute inset-0 grid place-items-center bg-black/50 text-white'>
            <div className='text-center'>
              <Icons.spinner className='mx-auto mb-2 size-5 animate-spin' />
              <div className='text-sm font-medium'>{t('coverUploadingReplace')}</div>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type='file'
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          aria-label={t('coverPickAria')}
          onChange={onFileChange}
          className='hidden'
        />
      </div>
    );
  }

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        'mb-7 grid h-[200px] cursor-pointer place-items-center rounded-xl border-2 border-dashed transition-colors',
        'bg-muted/40 hover:border-foreground/30 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
        dragging && 'border-primary bg-primary/5'
      )}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, color-mix(in srgb, currentColor 4%, transparent) 0 9px, transparent 9px 18px)'
      }}
    >
      <div className='text-center'>
        <Icons.media className='text-muted-foreground mx-auto mb-2 size-5' />
        <div className='text-sm font-medium'>
          {dragging ? t('coverDropping') : t('coverPickPrompt')}
        </div>
        <div className='text-muted-foreground mt-0.5 text-[12px]'>{t('coverHint')}</div>
      </div>
      <input
        ref={inputRef}
        type='file'
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        aria-label={t('coverPickAria')}
        onChange={onFileChange}
        className='hidden'
      />
    </div>
  );
}

function SettingsRail({
  form,
  set,
  tagDraft,
  setTagDraft,
  onTagKeyDown,
  onRemoveTag
}: {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  tagDraft: string;
  setTagDraft: (v: string) => void;
  onTagKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const t = useTranslations('blog.editor');
  const tCategory = useTranslations('blog.category');
  return (
    <div className='space-y-7 px-4 py-6 sm:px-6 sm:py-8'>
      <div>
        <SectionLabel>{t('sectionType')}</SectionLabel>
        <Tabs value={form.type} onValueChange={(v) => set('type', v as BlogType)}>
          <TabsList className='w-full'>
            <TabsTrigger value='article' className='flex-1'>
              {t('typeArticle')}
            </TabsTrigger>
            <TabsTrigger value='workshop' className='flex-1'>
              {t('typeWorkshop')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {form.type === 'workshop' && (
        <WorkshopClassPicker value={form.classId} onChange={(id) => set('classId', id)} />
      )}

      <div>
        <SectionLabel>{t('sectionStatus')}</SectionLabel>
        <div className='space-y-2 text-sm'>
          <label className='flex cursor-pointer items-center gap-2.5'>
            <input
              type='radio'
              name='status'
              aria-label={t('statusDraft')}
              checked={form.status === 'draft'}
              onChange={() => set('status', 'draft')}
              className='accent-foreground'
            />
            <span>{t('statusDraft')}</span>
          </label>
          <label className='flex cursor-pointer items-center gap-2.5'>
            <input
              type='radio'
              name='status'
              aria-label={t('statusPublished')}
              checked={form.status === 'published'}
              onChange={() => set('status', 'published')}
              className='accent-foreground'
            />
            <span>{t('statusPublished')}</span>
          </label>
        </div>
      </div>

      <div>
        <SectionLabel>{t('sectionFeatured')}</SectionLabel>
        <div className='flex items-start justify-between gap-3 rounded-md border p-3'>
          <div className='min-w-0 flex-1'>
            <div className='text-sm font-medium'>{t('featuredLabel')}</div>
            <p className='text-muted-foreground mt-0.5 text-[12px]'>{t('featuredDesc')}</p>
          </div>
          <Switch
            checked={form.featured ?? false}
            onCheckedChange={(v) => set('featured', v)}
            aria-label={t('featuredAria')}
          />
        </div>
      </div>

      <div>
        <SectionLabel>{t('sectionCategory')}</SectionLabel>
        <Select value={form.category} onValueChange={(v) => set('category', v as BlogCategory)}>
          <SelectTrigger className='h-9 w-full text-sm'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {tCategory(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <SectionLabel>{t('sectionTags')}</SectionLabel>
        {form.tags.length > 0 && (
          <div className='mb-2 flex flex-wrap gap-1.5'>
            {form.tags.map((tag) => (
              <span
                key={tag}
                className='bg-muted inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px]'
              >
                {tag}
                <button
                  type='button'
                  onClick={() => onRemoveTag(tag)}
                  className='text-muted-foreground hover:text-foreground'
                  aria-label={t('tagRemoveAria', { tag })}
                >
                  <Icons.close className='size-3' />
                </button>
              </span>
            ))}
          </div>
        )}
        <Input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={onTagKeyDown}
          placeholder={t('tagPlaceholder')}
          className='h-9 text-sm'
        />
      </div>

      <div>
        <SectionLabel>{t('sectionAuthor')}</SectionLabel>
        <div className='flex items-center gap-2.5 rounded-md border p-2'>
          <span className='bg-primary text-primary-foreground grid size-8 place-items-center rounded-full text-[11px] font-semibold'>
            AT
          </span>
          <div className='leading-tight'>
            <div className='text-sm font-medium'>Anh Trần</div>
            <div className='text-muted-foreground text-[11px]'>admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className='text-muted-foreground mb-2.5 block text-[11px] font-medium tracking-wider uppercase'>
      {children}
    </Label>
  );
}

// Pulled out as its own component so the (conditional) class query can mount /
// unmount alongside the preview tab without dragging the rest of the editor.
function WorkshopPreviewSidebar({ classId }: { classId: string }) {
  const { data: cls, isPending } = useQuery(classDetailOptions(classId));
  const t = useTranslations('blog.editor');
  const tWorkshop = useTranslations('blog.workshop');

  if (isPending) {
    return (
      <div className='bg-card sticky top-4 rounded-xl border p-5 text-sm shadow-sm'>
        <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
          {tWorkshop('sectionLabel')}
        </div>
        <div className='text-muted-foreground mt-3 text-xs'>{t('loading')}</div>
      </div>
    );
  }
  if (!cls) {
    return (
      <div className='bg-destructive/5 border-destructive/40 sticky top-4 rounded-xl border p-5 text-sm'>
        <div className='text-destructive mb-1 font-medium'>{t('classNotFound')}</div>
        <p className='text-muted-foreground text-[13px]'>{t('classNotFoundDesc')}</p>
      </div>
    );
  }
  const bits = classRowToPreviewBits(cls);
  return (
    <div className='bg-card sticky top-4 space-y-4 rounded-xl border p-5 text-sm shadow-sm'>
      <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
        {tWorkshop('sectionLabel')}
      </div>
      <PreviewInfoRow icon='calendar' title={bits.schedule} />
      <PreviewInfoRow icon='workspace' title={bits.location} sub={bits.room} />
      <PreviewInfoRow
        icon='teams'
        title={t('previewSessions', { count: cls.totalSessions ?? 0 })}
        sub={tWorkshop('seatsRemaining', { seats: seatsLeft(bits), capacity: bits.capacity })}
      />
      <Button className='mt-2 w-full' disabled>
        {tWorkshop('registerCta')}
      </Button>
    </div>
  );
}

// Picker for the Class entity the workshop post points at. Driven by the real
// admin Class API — the admin's discretion picks which class qualifies as a
// "workshop" (we don't enforce a BE-side type discriminator).
function WorkshopClassPicker({
  value,
  onChange
}: {
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}) {
  const { data: result, isPending } = useQuery(classListOptions({}));
  const t = useTranslations('blog.editor');
  const classes: ClassRow[] = result?.data ?? [];
  const selected = value ? classes.find((c) => c.id === value) : undefined;

  return (
    <div>
      <SectionLabel>{t('sectionWorkshop')}</SectionLabel>
      <Select
        value={value ?? ''}
        onValueChange={(v) => onChange(v || undefined)}
        disabled={isPending}
      >
        <SelectTrigger className='h-9 w-full text-sm'>
          <SelectValue
            placeholder={isPending ? t('workshopPickerLoading') : t('workshopPickerPlaceholder')}
          />
        </SelectTrigger>
        <SelectContent>
          {!isPending && classes.length === 0 ? (
            <div className='text-muted-foreground px-2 py-3 text-center text-sm'>
              {t('workshopPickerEmpty')}
            </div>
          ) : (
            classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className='text-foreground font-medium'>{c.courseTitle}</span>
                <span className='text-muted-foreground ml-2 text-xs'>· {c.schedule}</span>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {selected ? (
        <div className='bg-muted/40 mt-3 space-y-1.5 rounded-md border p-3 text-xs'>
          <div className='inline-flex items-center gap-1.5'>
            <Icons.calendar className='text-muted-foreground size-3' />
            <span>{selected.schedule}</span>
          </div>
          <div className='inline-flex items-center gap-1.5'>
            <Icons.workspace className='text-muted-foreground size-3' />
            <span>
              {selected.location}
              {selected.room ? ` · ${selected.room}` : ''}
            </span>
          </div>
          <div className='inline-flex items-center gap-1.5'>
            <Icons.teams className='text-muted-foreground size-3' />
            <span>
              {t('workshopSeatsRemaining', {
                seats: seatsLeft(selected),
                capacity: selected.capacity
              })}
            </span>
          </div>
          <div className='border-border/60 text-muted-foreground mt-2 border-t pt-1.5 text-[11px]'>
            {t('workshopPickerNotePrefix')}{' '}
            <Link href='/admin/classes' className='text-primary underline'>
              {t('workshopPickerNoteLink')}
            </Link>
            .
          </div>
        </div>
      ) : (
        <p className='text-muted-foreground mt-2 text-[11px]'>{t('workshopPickerHint')}</p>
      )}
    </div>
  );
}
