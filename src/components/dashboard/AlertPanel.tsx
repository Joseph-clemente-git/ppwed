import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import type { Alert } from '../../types';

const alertStyles = {
  danger:  { icon: XCircle,        bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',     iconColor: 'text-red-500' },
  warning: { icon: AlertTriangle,   bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',   iconColor: 'text-amber-500' },
  info:    { icon: Info,            bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',    iconColor: 'text-blue-500' },
  success: { icon: CheckCircle,     bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700', iconColor: 'text-emerald-500' },
};

export default function AlertPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="space-y-2.5">
      {alerts.map(alert => {
        const cfg = alertStyles[alert.type];
        const Icon = cfg.icon;
        return (
          <div
            key={alert.id}
            className={clsx('flex gap-3 p-3 rounded-lg border', cfg.bg, cfg.border)}
          >
            <Icon size={16} className={clsx('mt-0.5 flex-shrink-0', cfg.iconColor)} />
            <div className="min-w-0">
              <p className={clsx('text-xs font-semibold', cfg.text)}>{alert.title}</p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
              <p className="text-[10px] text-slate-400 mt-1">{alert.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
