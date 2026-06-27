import { useState } from 'react';
import {
  X, AlertTriangle, Ghost, Building2, Calendar, Banknote, MapPin,
} from 'lucide-react';
import clsx from 'clsx';
import type { Project } from '../../types';
import { contractors, municipalities, barangays } from '../../data/mockData';
import { StatusBadge, RiskBadge } from '../common/StatusBadge';
import SCurveChart from './SCurveChart';
import EditHistoryPanel from './EditHistoryPanel';
import ClosureChecklist from './ClosureChecklist';

function fmt(n: number) { return `₱${n.toLocaleString()}`; }

type DrawerTab = 'overview' | 'progress' | 'milestones' | 'variations' | 'history' | 'closure';

const TABS: { key: DrawerTab; label: string }[] = [
  { key: 'overview',   label: 'Overview' },
  { key: 'progress',   label: 'S-Curve' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'variations', label: 'Var. Orders' },
  { key: 'history',    label: 'Edit History' },
  { key: 'closure',    label: 'Closure' },
];

interface Props {
  project: Project | null;
  onClose: () => void;
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <p className="text-xs font-medium text-slate-800 leading-tight">{value}</p>
    </div>
  );
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-14 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={clsx('h-full rounded-full', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-700 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function ProjectDrawer({ project, onClose }: Props) {
  const [tab, setTab] = useState<DrawerTab>('overview');

  if (!project) return null;

  const contractor  = contractors.find(c => c.id === project.contractorId);
  const municipality = municipalities.find(m => m.id === project.municipalityId);
  const barangay    = barangays.find(b => b.id === project.barangayId);
  const variance    = project.actualProgress - project.plannedProgress;
  const voTotal     = project.variationOrders.reduce((s, v) => s + v.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-140 bg-white h-full flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <StatusBadge status={project.status} />
                <RiskBadge risk={project.riskLevel} />
                {project.isGhostFlagged && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    <Ghost size={11} /> Ghost-Flagged
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-slate-900 leading-snug">{project.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{project.id} · {project.sector}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 shrink-0">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex mt-3 -mb-px gap-0 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                'px-3 py-1.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors shrink-0',
                tab === t.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
              >
                {t.label}
                {t.key === 'variations' && project.variationOrders.length > 0 && (
                  <span className="ml-1 text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 rounded-full">
                    {project.variationOrders.length}
                  </span>
                )}
                {t.key === 'history' && (
                  <span className="ml-1 text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 rounded-full">
                    ●
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-4">
              {/* AI Risk */}
              {(project.riskLevel === 'high' || project.riskLevel === 'critical') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-500" />
                    <p className="text-xs font-semibold text-red-700">AI Delay-Risk Assessment · Score: {project.riskScore}/100</p>
                  </div>
                  <p className="text-xs text-red-600 leading-relaxed">
                    {project.isGhostFlagged
                      ? 'Ghost-project anomaly: status updates submitted without matching geotagged evidence. Contractor documentation gap detected.'
                      : 'Contractor performance below threshold. Progress variance suggests physical completion by target date is at risk without immediate intervention.'}
                  </p>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={<Building2 size={13} />} label="Implementing Office" value={project.implementingOffice} />
                <InfoItem icon={<Building2 size={13} />} label="Contractor" value={contractor?.name ?? '—'} />
                <InfoItem icon={<Banknote size={13} />} label="Fund Source" value={project.fundSource} />
                <InfoItem icon={<Banknote size={13} />} label="Contract Amount" value={fmt(project.contractAmount)} />
                <InfoItem icon={<MapPin size={13} />} label="Municipality" value={municipality?.name ?? '—'} />
                <InfoItem icon={<MapPin size={13} />} label="Barangay" value={barangay?.name ?? 'N/A'} />
                <InfoItem icon={<Calendar size={13} />} label="Start Date" value={project.startDate} />
                <InfoItem icon={<Calendar size={13} />} label="Target End Date" value={project.targetEndDate} />
              </div>

              {/* Contractor score */}
              {contractor && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Contractor Performance Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className={clsx('h-full rounded-full', contractor.performanceScore >= 80 ? 'bg-emerald-500' : contractor.performanceScore >= 65 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${contractor.performanceScore}%` }}
                      />
                    </div>
                    <span className={clsx('text-sm font-bold', contractor.performanceScore >= 80 ? 'text-emerald-600' : contractor.performanceScore >= 65 ? 'text-amber-600' : 'text-red-600')}>
                      {contractor.performanceScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{contractor.completedProjects} completed · {contractor.delayedProjects} delayed projects (provincial history)</p>
                </div>
              )}

              <p className="text-xs text-slate-400 text-right">Last updated: {project.lastUpdateDate}</p>
            </div>
          )}

          {/* S-Curve / Progress */}
          {tab === 'progress' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">Physical Progress</p>
                <ProgressRow label="Planned" value={project.plannedProgress} color="bg-slate-300" />
                <ProgressRow
                  label="Actual"
                  value={project.actualProgress}
                  color={variance >= 0 ? 'bg-emerald-500' : variance >= -10 ? 'bg-amber-500' : 'bg-red-500'}
                />
                <p className={clsx('text-xs font-medium', variance >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                  Variance: {variance >= 0 ? '+' : ''}{variance}%
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">S-Curve (Planned vs. Actual)</p>
                <SCurveChart project={project} />
              </div>
            </div>
          )}

          {/* Milestones */}
          {tab === 'milestones' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">
                {project.milestones.filter(m => m.completed).length}/{project.milestones.length} milestones completed
              </p>
              {project.milestones.map(m => (
                <div key={m.id} className={clsx(
                  'border rounded-xl p-3 flex items-start gap-3',
                  m.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                )}>
                  <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                    m.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  )}>
                    {m.completed ? '✓' : '○'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Target: {m.targetDate}</p>
                    {m.actualDate && <p className="text-xs text-emerald-600 font-medium">Completed: {m.actualDate}</p>}
                    {!m.completed && m.targetDate < '2026-06-28' && (
                      <p className="text-xs text-red-500 font-medium mt-0.5">⚠ Overdue</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Variation Orders */}
          {tab === 'variations' && (
            <div>
              {project.variationOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm">No variation orders on record.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-800">Total Variation Orders</p>
                    <p className="text-sm font-bold text-amber-700">{fmt(voTotal)}</p>
                  </div>
                  {project.variationOrders.map(vo => (
                    <div key={vo.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold text-slate-800">{vo.description}</p>
                        <p className="text-sm font-bold text-amber-700 shrink-0 ml-3">{fmt(vo.amount)}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Approved: {vo.dateApproved}</p>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400">
                    Original contract: {fmt(project.contractAmount - voTotal)} + VOs: {fmt(voTotal)} = Revised: {fmt(project.contractAmount)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Edit History */}
          {tab === 'history' && (
            <EditHistoryPanel projectId={project.id} />
          )}

          {/* Closure Checklist */}
          {tab === 'closure' && (
            <ClosureChecklist projectId={project.id} />
          )}
        </div>
      </div>
    </div>
  );
}
