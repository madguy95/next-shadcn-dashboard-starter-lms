import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface LoadingStateProps extends React.ComponentProps<'div'> {
  message?: string;
  minHeight?: string;
}

/**
 * Centered spinner used as the default loading fallback across the app.
 * Use for first loads when no prior content is available to overlay.
 * Pass `minHeight` to reserve vertical space and avoid layout shift on resolve.
 */
export function LoadingState({
  message,
  minHeight = '400px',
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'text-muted-foreground flex w-full flex-col items-center justify-center gap-3',
        className
      )}
      style={{ minHeight }}
      {...props}
    >
      <Icons.spinner className='size-6 animate-spin' />
      {message && <p className='text-sm'>{message}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps content and dims it (opacity + disabled pointer events) while showing a
 * spinner overlay. Use for subsequent loads — pagination, filter changes — so the
 * user keeps visual context instead of seeing the content disappear.
 */
export function LoadingOverlay({ visible, message, children, className }: LoadingOverlayProps) {
  return (
    <div className={cn('relative flex flex-1 flex-col', className)}>
      <div
        className={cn(
          'flex flex-1 flex-col transition-opacity duration-200',
          visible && 'pointer-events-none opacity-40 select-none'
        )}
        aria-busy={visible}
        aria-hidden={visible}
      >
        {children}
      </div>
      {visible && (
        <div
          aria-live='polite'
          className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'
        >
          <div className='bg-background/95 flex flex-col items-center gap-2 rounded-lg border px-4 py-3 shadow-sm'>
            <Icons.spinner className='text-muted-foreground size-5 animate-spin' />
            {message && <p className='text-muted-foreground text-xs'>{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
