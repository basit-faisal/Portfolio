import type { ComponentPropsWithRef, ReactNode } from 'react';

// ComponentPropsWithRef rather than ButtonHTMLAttributes so callers can hold a
// ref to focus the button; under React 19 ref is an ordinary prop and rides
// along with the spread below.
type RetroButtonProps = ComponentPropsWithRef<'button'> & {
  children: ReactNode;
  active?: boolean;
};

/** A classic beveled system button that visibly presses in on click. */
const RetroButton = ({ children, active = false, className = '', ...props }: RetroButtonProps) => (
  <button
    type="button"
    className={`bg-win-face text-win-text font-pixel text-[13px] min-h-[23px] px-3 py-1
      focus-dotted active:bevel-in
      ${active ? 'bevel-in' : 'bevel-out'}
      disabled:text-win-disabled ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default RetroButton;
