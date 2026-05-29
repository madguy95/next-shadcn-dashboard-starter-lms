'use client';

import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { Youtube } from '@tiptap/extension-youtube';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

// Tiptap v3 ships Link + Underline inside StarterKit, so we only need to add
// what's NOT there: image, tables (4 packages), youtube embed, placeholder.
export function BlogRichEditor({ value, onChange, placeholder }: Props) {
  const t = useTranslations('blog.toolbar');
  const tEditor = useTranslations('blog.editor');
  const editor = useEditor({
    // SSR-safety: Next.js renders this on the server, but the Tiptap doc model
    // can produce different HTML on first paint, triggering a hydration warning.
    // immediatelyRender: false defers the first render to the client.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // openOnClick: false so admins can click a link to edit it in the
        // toolbar instead of navigating away from the editor.
        link: { openOnClick: false, autolink: true }
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        // Default 16:9 sizing; the YouTube extension wraps the iframe in a div
        // so subsequent CSS can keep it responsive.
        width: 640,
        height: 360,
        nocookie: true
      }),
      Placeholder.configure({
        placeholder: placeholder ?? t('editorPlaceholder')
      })
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        // The class drives the in-editor typography. Same `.blog-prose`
        // utility is reused by BlogBody so authored content looks identical
        // when previewed on the detail page.
        class:
          'blog-prose min-h-[400px] focus:outline-none rounded-md border border-input bg-background p-4'
      }
    }
  });

  // Keep the editor in sync if the parent swaps the post (e.g. edit-mode mount
  // after the post resolves). Reset only when the incoming HTML differs from
  // what the editor currently holds — otherwise the cursor jumps to start on
  // every keystroke.
  useEffect(() => {
    if (!editor) return;
    if (value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className='border-input bg-background min-h-[400px] animate-pulse rounded-md border p-4 text-sm text-muted-foreground'>
        {tEditor('initializing')}
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const t = useTranslations('blog.toolbar');
  const headingValue = editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
      ? 'h3'
      : editor.isActive('blockquote')
        ? 'quote'
        : 'p';

  const setBlock = (v: string) => {
    if (v === 'p') editor.chain().focus().setParagraph().run();
    else if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
    else if (v === 'quote') editor.chain().focus().toggleBlockquote().run();
  };

  const insertLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    // prompt() is intentional for the mock — a real editor would open a popover
    // input. Empty string unsets, cancel keeps current.
    const url = window.prompt(t('promptLink'), previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = window.prompt(t('promptImage'), 'https://');
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: '' }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt(t('promptYoutube'), 'https://www.youtube.com/watch?v=');
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className='bg-background/95 sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-lg border p-1 backdrop-blur'>
      <Select value={headingValue} onValueChange={setBlock}>
        <SelectTrigger className='mr-1 h-8 w-[140px] border-0 bg-transparent text-sm hover:bg-accent focus:ring-0'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='p'>{t('paragraph')}</SelectItem>
          <SelectItem value='h2'>{t('heading2')}</SelectItem>
          <SelectItem value='h3'>{t('heading3')}</SelectItem>
          <SelectItem value='quote'>{t('quote')}</SelectItem>
        </SelectContent>
      </Select>
      <Sep />
      <Btn
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title={t('bold')}
      >
        <Icons.bold className='size-4' />
      </Btn>
      <Btn
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title={t('italic')}
      >
        <Icons.italic className='size-4' />
      </Btn>
      <Btn
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title={t('underline')}
      >
        <Icons.underline className='size-4' />
      </Btn>
      <Sep />
      <Btn
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title={t('bulletList')}
      >
        <BulletIcon />
      </Btn>
      <Btn
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title={t('orderedList')}
      >
        <OrderedIcon />
      </Btn>
      <Sep />
      <Btn active={editor.isActive('link')} onClick={insertLink} title={t('link')}>
        <LinkIcon />
      </Btn>
      <Btn onClick={insertImage} title={t('image')}>
        <Icons.media className='size-4' />
      </Btn>
      <Btn onClick={insertYoutube} title={t('video')}>
        <Icons.video className='size-4' />
      </Btn>
      <Btn onClick={insertTable} title={t('table')}>
        <TableIcon />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title={t('hr')}>
        <HrIcon />
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title={t('undo')}
      >
        <Icons.refresh className='size-4 -scale-x-100' />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title={t('redo')}
      >
        <Icons.refresh className='size-4' />
      </Btn>
    </div>
  );
}

function Btn({
  active,
  disabled,
  onClick,
  title,
  children
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        'hover:bg-accent text-muted-foreground grid size-8 place-items-center rounded transition-colors',
        active && 'bg-accent text-foreground',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className='bg-border mx-1 h-5 w-px' />;
}

function BulletIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <line x1='8' y1='6' x2='21' y2='6' />
      <line x1='8' y1='12' x2='21' y2='12' />
      <line x1='8' y1='18' x2='21' y2='18' />
      <circle cx='3.5' cy='6' r='1' />
      <circle cx='3.5' cy='12' r='1' />
      <circle cx='3.5' cy='18' r='1' />
    </svg>
  );
}

function OrderedIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <line x1='10' y1='6' x2='21' y2='6' />
      <line x1='10' y1='12' x2='21' y2='12' />
      <line x1='10' y1='18' x2='21' y2='18' />
      <path d='M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1' />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
      <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='3' y='3' width='18' height='18' rx='2' />
      <line x1='3' y1='9' x2='21' y2='9' />
      <line x1='3' y1='15' x2='21' y2='15' />
      <line x1='9' y1='3' x2='9' y2='21' />
      <line x1='15' y1='3' x2='15' y2='21' />
    </svg>
  );
}

function HrIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <line x1='4' y1='12' x2='20' y2='12' />
    </svg>
  );
}
