import React from 'react';
import { Navigation2, ArrowRight } from 'lucide-react';

interface StartNavButtonProps {
  onClick: () => void;
  title?: string;
}

export const StartNavButton: React.FC<StartNavButtonProps> = ({
  onClick,
  title = 'Start Navigation',
}) => {
  return (
    <div className="pt-2 select-none" id="start-nav-container">
      <button
        type="button"
        onClick={onClick}
        id="btn-start-navigation"
        className="w-full py-4 px-6 rounded-[22px] bg-[#00ffa3] hover:bg-[#00e895] active:scale-[0.985] text-[#023122] font-extrabold text-[16.5px] flex items-center justify-center gap-2.5 shadow-[0_8px_30px_rgba(0,255,163,0.38)] transition-all cursor-pointer tracking-tight"
      >
        <Navigation2 className="w-5 h-5 fill-[#023122] rotate-45 stroke-[2.2]" />
        <span>{title}</span>
        <ArrowRight className="w-5 h-5 stroke-[2.6]" />
      </button>
    </div>
  );
};
