import { useEffect, useRef } from 'react';
import { CircleAlert, Info } from 'lucide-react';
import RetroButton from './RetroButton';

type MessageBoxProps = {
  title: string;
  message: string;
  variant?: 'info' | 'error';
  onClose: () => void;
};

/** Win95 modal dialog: icon on the left, message beside it, OK underneath. */
const MessageBox = ({ title, message, variant = 'info', onClose }: MessageBoxProps) => {
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    okRef.current?.focus();
  }, []);

  useEffect(() => {
    // Capture phase, so Escape dismisses this dialog without also reaching the
    // desktop's own Escape handler, which would close the whole window behind it.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  const Icon = variant === 'error' ? CircleAlert : Info;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-[min(92%,340px)] bg-win-face bevel-out p-[3px]"
      >
        <div className="flex items-center bg-win-title px-1 py-[2px] text-white">
          <span className="flex-1 truncate px-1 text-[13px] font-bold tracking-tight">{title}</span>
        </div>

        <div className="flex items-start gap-3 px-4 py-5">
          <Icon
            size={30}
            aria-hidden="true"
            className={`shrink-0 ${variant === 'error' ? 'text-[#800000]' : 'text-win-title'}`}
          />
          <p className="text-[13px] leading-[17px]">{message}</p>
        </div>

        <div className="flex justify-center pb-4">
          <RetroButton ref={okRef} onClick={onClose} className="min-w-[75px]">
            OK
          </RetroButton>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
