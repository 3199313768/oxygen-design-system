import { createRef } from 'react';

import { Button, ColorPicker, QRCode, type ButtonProps, type ColorPickerProps, type QRCodeProps } from '../src';

export function WrappedButton(props: ButtonProps) {
  return <Button {...props} />;
}

export const defaultButtonProps: ButtonProps = {
  ref: createRef<HTMLButtonElement>(),
  onClick: (event) => { event.currentTarget.disabled = true; },
  onFocus: (event) => { event.currentTarget.form?.checkValidity(); },
};

export const childButtonProps: ButtonProps = {
  asChild: true,
  children: <a href="#details">Details</a>,
  ref: createRef<HTMLAnchorElement>(),
  onClick: (event) => {
    event.currentTarget.focus();
    // @ts-expect-error A slotted element need not be a button.
    event.currentTarget.disabled = true;
  },
  onClickCapture: (event) => {
    // @ts-expect-error A slotted element need not have a form.
    event.currentTarget.form?.checkValidity();
  },
  onKeyDown: (event) => {
    // @ts-expect-error A slotted element need not have button validity.
    event.currentTarget.checkValidity();
  },
  onFocus: (event) => {
    // @ts-expect-error All event families must use the actual element contract.
    event.currentTarget.disabled = true;
  },
};

export const wrappedDefaultButton = <WrappedButton {...defaultButtonProps} />;
export const wrappedChildButton = <WrappedButton {...childButtonProps} />;
export const directChildButton = (
  <Button asChild onClick={(event) => {
    // @ts-expect-error Direct calls must also use HTMLElement events.
    event.currentTarget.disabled = true;
  }}><a href="#details">Details</a></Button>
);

// @ts-expect-error Slotted buttons require an element child.
export const missingChildButton: ButtonProps = { asChild: true };
// @ts-expect-error Slotted buttons cannot accept text-only children.
export const textChildButton: ButtonProps = { asChild: true, children: 'Details' };
// @ts-expect-error The default button requires a button-compatible ref.
export const wrongDefaultRef: ButtonProps = { ref: createRef<HTMLAnchorElement>() };

export const qrCodeProps: QRCodeProps = { ariaLabel: 'Named QR alias', value: 'oxygen' };
export const namedQrCode = <QRCode {...qrCodeProps} />;
export const draftFixtureProps: ColorPickerProps = { defaultDraftValue: 'invalid', defaultValue: '#336699', defaultOpen: true };
export const draftFixture = <ColorPicker {...draftFixtureProps} />;
