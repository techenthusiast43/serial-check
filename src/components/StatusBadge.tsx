import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { RegistrationStatus } from '../config/contracts';

interface StatusBadgeProps {
  status: RegistrationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  switch (status) {
    case RegistrationStatus.Registered:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}
        >
          <CheckCircle2 size={iconSizes[size]} className="text-emerald-500" />
          <span>Registered</span>
        </span>
      );

    case RegistrationStatus.Revoked:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${sizeClasses[size]}`}
        >
          <XCircle size={iconSizes[size]} className="text-rose-500" />
          <span>Revoked</span>
        </span>
      );

    case RegistrationStatus.Unregistered:
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30 ${sizeClasses[size]}`}
        >
          <AlertCircle size={iconSizes[size]} className="text-slate-400" />
          <span>Not Registered</span>
        </span>
      );
  }
};

