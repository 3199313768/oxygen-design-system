import { QRCodeSVG } from 'qrcode.react';
import type { ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export interface QRCodeProps
  extends Omit<React.ComponentPropsWithoutRef<typeof QRCodeSVG>, 'value' | 'size' | 'fgColor' | 'bgColor' | 'includeMargin' | 'title'> {
  value?: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
  /** Message shown when value is empty. */
  error?: ReactNode;
  /** Accessible name for the generated code. */
  label?: string;
}

export function QRCode({
  ariaLabel,
  'aria-label': ariaLabelProp,
  bgColor,
  className,
  error,
  fgColor,
  includeMargin,
  label,
  value,
  ...props
}: QRCodeProps & { ariaLabel?: string }) {
  const locale = useOxygenLocale();
  const accessibleLabel = ariaLabelProp ?? ariaLabel ?? label ?? locale.common.qrcode;

  if (!value?.trim()) {
    return (
      <div
        aria-live="polite"
        className={cn('oxygen-qrcode oxygen-qrcode--empty', className)}
        data-status="error"
        role="alert"
      >
        {error ?? locale.common.empty}
      </div>
    );
  }

  return (
    <QRCodeSVG
      aria-label={accessibleLabel}
      className={cn('oxygen-qrcode', className)}
      role="img"
      value={value}
      bgColor={bgColor}
      fgColor={fgColor}
      includeMargin={includeMargin}
      {...props}
    />
  );
}

QRCode.displayName = 'QRCode';
