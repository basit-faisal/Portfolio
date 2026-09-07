import { useRef, useState, type ReactNode } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';

type WindowProps = {
  title: string;
  status?: string;
  children: ReactNode;
  onClose: () => void;
};

/** Small beveled title-bar control with a pixel glyph. */
const TitleBarButton = ({
  label,
  glyph,
  onClick
}: {
  label: string;
  glyph: ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="bg-win-face bevel-out active:bevel-in flex h-[15px] w-[16px] items-center
      justify-center text-[9px] leading-none text-win-text focus-dotted"
  >
    {glyph}
  </button>
);

const RetroWindow = ({ title, status, children, onClose }: WindowProps) => {
  const [maximized, setMaximized] = useState(false);
  const dragConstraints = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Drag offsets are held as motion values so maximizing can zero them out.
  // Otherwise a dragged window keeps its translate and lands off-screen when
  // it switches to inset-0, taking the close button with it.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const toggleMaximize = () => {
    setMaximized((wasMaximized) => {
      if (!wasMaximized) {
        x.set(0);
        y.set(0);
      }
      return !wasMaximized;
    });
  };

  return (
    // Drag area stops above the taskbar so a window can never be dragged behind it.
    <div ref={dragConstraints} className="pointer-events-none absolute inset-0 bottom-[32px] z-20">
      <motion.div
        drag={!maximized}
        dragMomentum={false}
        dragConstraints={dragConstraints}
        dragElastic={0}
        dragListener={false}
        dragControls={dragControls}
        style={{ x, y }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }}
        role="dialog"
        aria-label={title}
        className={`pointer-events-auto absolute flex flex-col bg-win-face bevel-out p-[3px] ${
          maximized
            ? 'inset-0'
            : 'left-1/2 top-1/2 h-[min(78vh,620px)] w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2'
        }`}
      >
        {/* Title bar doubles as the drag handle, like the real thing. */}
        <div
          onPointerDown={(event) => {
            if (!maximized) dragControls.start(event);
          }}
          onDoubleClick={toggleMaximize}
          className={`flex items-center gap-1 bg-win-title px-1 py-[2px] text-white ${
            maximized ? '' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          <span className="flex-1 truncate px-1 text-[13px] font-bold tracking-tight">{title}</span>
          <div className="flex items-center gap-[2px]">
            <TitleBarButton label="Minimize" glyph={<span className="-mb-[6px]">_</span>} onClick={onClose} />
            <TitleBarButton
              label={maximized ? 'Restore' : 'Maximize'}
              glyph={<span className="block h-[7px] w-[7px] border border-win-text border-t-2" />}
              onClick={toggleMaximize}
            />
            <TitleBarButton label="Close" glyph={<span>✕</span>} onClick={onClose} />
          </div>
        </div>

        {/* Menu bar (decorative, matches the era) */}
        <div className="flex gap-3 border-b border-win-shadow/40 px-2 py-[3px] text-[13px]">
          {['File', 'Edit', 'View', 'Help'].map((item) => (
            <span key={item}>
              <span className="underline decoration-1 underline-offset-2">{item.charAt(0)}</span>
              {item.slice(1)}
            </span>
          ))}
        </div>

        {/* Content well */}
        <div className="retro-scrollbar m-[2px] flex-1 overflow-y-auto bg-white bevel-field p-4">
          {children}
        </div>

        {/* Status bar */}
        {status && (
          <div className="flex gap-[2px] px-[2px] pb-[1px] text-[13px]">
            <span className="bevel-group flex-1 truncate px-2 py-[2px]">{status}</span>
            <span className="bevel-group px-2 py-[2px]">Basit Faisal</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RetroWindow;
