import type { LucideIcon } from 'lucide-react';

type DesktopIconProps = {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
};

/**
 * Desktop shortcut. Mirrors Win95 behaviour: one click selects, double click
 * opens. Clicking an already-selected icon also opens it, which is the only
 * way this works on touch, where there is no double click. Enter opens too so
 * the desktop stays keyboard navigable.
 */
const DesktopIcon = ({ label, icon: Icon, selected, onSelect, onOpen }: DesktopIconProps) => (
  <button
    type="button"
    onClick={() => (selected ? onOpen() : onSelect())}
    onDoubleClick={onOpen}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen();
      }
    }}
    className="group flex w-[100px] flex-col items-center gap-[6px] p-1 focus-dotted"
  >
    <span
      className={`flex h-14 w-14 items-center justify-center bg-win-face bevel-out
        ${selected ? 'brightness-90' : ''}`}
    >
      <Icon size={30} strokeWidth={1.75} className="text-win-title" aria-hidden="true" />
    </span>
    <span
      className={`px-1 text-center text-[13px] leading-tight
        ${selected ? 'bg-win-title text-white' : 'text-white'}`}
      style={selected ? undefined : { textShadow: '1px 1px 0 rgba(0,0,0,0.75)' }}
    >
      {label}
    </span>
  </button>
);

export default DesktopIcon;
