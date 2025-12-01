
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export const Sheet: React.FC<SheetProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer,
    width = 'max-w-md' 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`
        relative h-full bg-zinc-950 border-l border-white/10 shadow-2xl shadow-black/50 
        transform transition-transform duration-300 w-full ${width} flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </div>

        {footer && (
            <div className="p-6 border-t border-white/5 bg-zinc-900/50 backdrop-blur-sm">
                {footer}
            </div>
        )}
      </div>
    </div>
  );
};
