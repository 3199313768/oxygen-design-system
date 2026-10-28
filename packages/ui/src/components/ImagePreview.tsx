import { forwardRef, useState, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './Dialog';
import { Image, type ImageProps } from './Image';

export interface ImagePreviewProps extends Omit<ImageProps, 'className'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeLabel?: string;
  className?: string;
  previewClassName?: string;
  previewTitle?: ReactNode;
  disabled?: boolean;
}

export const ImagePreview = forwardRef<HTMLImageElement, ImagePreviewProps>(
  ({ alt = '', className, closeLabel, defaultOpen = false, disabled = false, onOpenChange, open: controlledOpen, previewClassName, previewTitle, ...imageProps }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = controlledOpen ?? uncontrolledOpen;
    const handleOpenChange = (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };
    const label = alt || '预览图片';

    return (
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogTrigger asChild>
          <button aria-label={label} className={cn('oxygen-image-preview__trigger', className)} data-oxygen-control="true" disabled={disabled} type="button">
            <Image alt={alt} ref={ref} {...imageProps} />
          </button>
        </DialogTrigger>
        <DialogContent aria-label={label} className={cn('oxygen-image-preview__dialog', previewClassName)} closeLabel={closeLabel}>
          <DialogTitle className="oxygen-display-sr-only">{previewTitle ?? label}</DialogTitle>
          <DialogDescription className="oxygen-display-sr-only">{label}</DialogDescription>
          <Image alt={alt} {...imageProps} className="oxygen-image-preview__image" />
        </DialogContent>
      </Dialog>
    );
  },
);
ImagePreview.displayName = 'ImagePreview';
