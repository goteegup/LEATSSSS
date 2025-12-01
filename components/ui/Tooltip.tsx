
import React from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className = '', side = 'top' }) => {
  return (
    <div className={`group relative inline-flex items-center justify-center cursor-help ${className}`}>
      <HelpCircle className="w-3.5 h-3.5 text-zinc-400 hover:text-primary-500 transition-colors" />
      
      <div className={`
        absolute z-50 px-3 py-2 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-48 text-center
        ${side === 'top' ? 'bottom-full mb-2' : ''}
        ${side === 'bottom' ? 'top-full mt-2' : ''}
        ${side === 'right' ? 'left-full ml-2' : ''}
        ${side === 'left' ? 'right-full mr-2' : ''}
      `}>
        {content}
        <div className={`
            absolute w-2 h-2 bg-zinc-900 dark:bg-zinc-800 rotate-45
            ${side === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${side === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${side === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
            ${side === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
        `} />
      </div>
    </div>
  );
};
