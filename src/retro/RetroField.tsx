import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

/**
 * Win95 text controls. The era's fields are sunken wells with a hard white
 * interior, so both share `bevel-field` and drop the browser's own border and
 * focus ring in favour of the dotted rectangle used elsewhere.
 */
const wellClasses =
  'w-full bg-white text-win-text font-pixel text-[13px] border-none outline-none px-[5px] py-[3px] bevel-field disabled:text-win-disabled read-only:text-win-shadow';

export const RetroInput = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${wellClasses} ${className}`} {...props} />
);

export const RetroTextarea = ({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={`${wellClasses} retro-scrollbar resize-none leading-[17px] ${className}`} {...props} />
);
