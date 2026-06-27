import clsx from 'clsx';
import type { ProjectStatus, RiskLevel } from '../../types';

const statusConfig: Record<ProjectStatus, { label: string; classes: string }> = {
  planned:   { label: 'Planned',   classes: 'bg-slate-100 text-slate-600' },
  ongoing:   { label: 'Ongoing',   classes: 'bg-blue-100 text-blue-700' },
  delayed:   { label: 'Delayed',   classes: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', classes: 'bg-emerald-100 text-emerald-700' },
  suspended: { label: 'Suspended', classes: 'bg-red-100 text-red-700' },
};

const riskConfig: Record<RiskLevel, { label: string; classes: string; dot: string }> = {
  low:      { label: 'Low',      classes: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  medium:   { label: 'Medium',   classes: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-500' },
  high:     { label: 'High',     classes: 'bg-orange-50 text-orange-700',  dot: 'bg-orange-500' },
  critical: { label: 'Critical', classes: 'bg-red-50 text-red-700',        dot: 'bg-red-500' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', cfg.classes)}>
      {cfg.label}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const cfg = riskConfig[risk];
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', cfg.classes)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
