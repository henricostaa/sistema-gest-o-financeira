import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'green' | 'red' | 'blue' | 'purple' | 'amber' | 'emerald';
  badgeText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  badgeText,
}) => {
  const schemeStyles = {
    green: {
      bgIcon: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      textValue: 'text-emerald-600 dark:text-emerald-400',
    },
    red: {
      bgIcon: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
      textValue: 'text-rose-600 dark:text-rose-400',
    },
    blue: {
      bgIcon: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      textValue: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bgIcon: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      textValue: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
      bgIcon: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      textValue: 'text-amber-600 dark:text-amber-400',
    },
    emerald: {
      bgIcon: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
      textValue: 'text-teal-600 dark:text-teal-400',
    },
  }[colorScheme];

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${schemeStyles.bgIcon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3">
        <h4 className={`text-xl font-extrabold tracking-tight ${schemeStyles.textValue}`}>
          {value}
        </h4>
        {subtitle && (
          <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      {badgeText && (
        <span className="mt-2 inline-self-start rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {badgeText}
        </span>
      )}
    </div>
  );
};
