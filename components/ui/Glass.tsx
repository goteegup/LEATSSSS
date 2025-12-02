import React from 'react';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassProps> = ({ 
  children, 
  className = '', 
  intensity = 'medium',
  hoverEffect = false,
  ...props 
}) => {
  // Enhanced Backgrounds for better Light Mode contrast
  const darkBg = intensity === 'low' ? 'dark:bg-zinc-900/40' : intensity === 'medium' ? 'dark:bg-zinc-900/60' : 'dark:bg-zinc-950/80';
  const lightBg = intensity === 'low' ? 'bg-white/60' : intensity === 'medium' ? 'bg-white/80' : 'bg-white';
  
  // Refined Borders: Subtler in Light Mode
  const borderClass = "border border-zinc-200/80 dark:border-white/5";

  const hoverClass = hoverEffect 
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-primary-500/5 hover:bg-white dark:hover:bg-zinc-800/60' 
    : '';

  return (
    <div 
      className={`
        backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-none
        text-zinc-900 dark:text-zinc-100
        ${borderClass} ${darkBg} ${lightBg} ${hoverClass} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ 
    children, variant = 'primary', className = '', ...props 
}) => {
    const base = "px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
    
    const variants = {
        primary: "bg-primary-500 text-white hover:bg-primary-400 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 border border-primary-400/50",
        secondary: "bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 shadow-sm",
        danger: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20",
        ghost: "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5"
    };

    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, icon, className = '', ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-1">{label}</label>}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input 
                    className={`
                        w-full bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 
                        rounded-xl py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400
                        focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 
                        transition-all duration-200 shadow-sm dark:shadow-none
                        ${icon ? 'pl-10 pr-4' : 'px-4'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
        </div>
    )
}

export const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => {
  return (
    <div 
        onClick={() => !disabled && onChange(!checked)}
        className={`
            relative w-12 h-6 rounded-full cursor-pointer transition-all duration-500 ease-out border
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            ${checked 
                ? 'bg-primary-500/10 border-primary-500/50 shadow-[0_0_12px_rgba(var(--color-primary-500),0.3)]' 
                : 'bg-zinc-200 dark:bg-zinc-900/50 border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20'
            }
        `}
    >
        <div className={`
            absolute top-0.5 bottom-0.5 w-5 rounded-full shadow-sm transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
            ${checked 
                ? 'left-[calc(100%-1.35rem)] bg-primary-400 shadow-[0_0_8px_rgba(var(--color-primary-400),0.8)]' 
                : 'left-0.5 bg-white dark:bg-zinc-500 border border-zinc-300 dark:border-transparent'
            }
        `} />
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'primary' | 'zinc' | 'blue' | 'purple' | 'rose' }> = ({ children, color = 'zinc' }) => {
    const colors = {
        primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20',
        zinc: 'bg-zinc-100 dark:bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-500/20',
        blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
        rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    }
    return (
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${colors[color]}`}>
            {children}
        </span>
    )
}