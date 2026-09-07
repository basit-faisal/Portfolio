import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';
import type { Section } from '../data/sections';

type TaskbarProps = {
  openSection?: Section;
  onStart: () => void;
  onTaskClick: () => void;
};

const useClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const Taskbar = ({ openSection, onStart, onTaskClick }: TaskbarProps) => {
  const time = useClock();

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex h-[32px] items-center gap-1 bg-win-face bevel-out px-[3px]">
      <button
        type="button"
        onClick={onStart}
        className="flex items-center gap-1 bg-win-face bevel-out active:bevel-in px-2 py-[3px] text-[13px] font-bold focus-dotted"
      >
        <Monitor size={14} aria-hidden="true" />
        Start
      </button>

      <span className="mx-1 h-[20px] w-[2px] bevel-group" aria-hidden="true" />

      {openSection && (
        <button
          type="button"
          onClick={onTaskClick}
          className="max-w-[180px] truncate bg-win-face bevel-in px-2 py-[3px] text-left text-[13px] font-bold focus-dotted"
        >
          {openSection.windowTitle}
        </button>
      )}

      <div className="ml-auto bevel-field px-2 py-[3px] text-[13px] tabular-nums">{time}</div>
    </div>
  );
};

export default Taskbar;
