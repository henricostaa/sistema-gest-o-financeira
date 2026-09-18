import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/30">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 mb-4 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
