'use client';

import * as React from 'react';
import Dropzone, { type Accept } from 'react-dropzone';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn, formatBytes } from '@/lib/utils';

interface CompactDropzoneProps {
  label: string;
  hint: string;
  description: string;
  icon: React.ReactNode;
  accept: Accept;
  maxSize: number;
  value: File[];
  onChange: (files: File[]) => void;
  replaceLabel: string;
  removeLabel: string;
}

export function CompactDropzone({
  label,
  hint,
  description,
  icon,
  accept,
  maxSize,
  value,
  onChange,
  replaceLabel,
  removeLabel
}: CompactDropzoneProps) {
  const file = value[0];
  return (
    <div className='flex h-full flex-col gap-1'>
      <Label className='text-muted-foreground text-[12px]'>{label}</Label>
      <Dropzone
        onDrop={(accepted, rejected) => {
          if (rejected.length > 0) {
            toast.error(rejected[0].errors[0]?.message ?? 'File rejected');
            return;
          }
          if (accepted.length) onChange([accepted[0]]);
        }}
        accept={accept}
        maxSize={maxSize}
        maxFiles={1}
        multiple={false}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              'group hover:bg-muted/30 flex h-full min-h-[88px] flex-1 cursor-pointer items-center gap-3 rounded-md border border-dashed px-4 py-3 transition',
              isDragActive && 'border-foreground bg-muted/40',
              file && 'border-solid'
            )}
          >
            <input {...getInputProps()} />
            <div className='text-muted-foreground bg-muted/50 grid size-9 shrink-0 place-items-center rounded-md'>
              {icon}
            </div>
            <div className='min-w-0 flex-1 space-y-0.5'>
              {file ? (
                <>
                  <div className='truncate text-[13px] font-medium'>{file.name}</div>
                  <div className='text-muted-foreground font-mono text-[11px]'>
                    {formatBytes(file.size)} · {isDragActive ? replaceLabel : description}
                  </div>
                </>
              ) : (
                <>
                  <div className='text-[13px] leading-snug font-medium'>{hint}</div>
                  <div className='text-muted-foreground text-[11px] leading-snug'>
                    {description}
                  </div>
                </>
              )}
            </div>
            {file && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 shrink-0'
                aria-label={removeLabel}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                <Icons.close className='size-3.5' />
              </Button>
            )}
          </div>
        )}
      </Dropzone>
    </div>
  );
}
