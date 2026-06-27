import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Ghost, AlertTriangle, Plus, Upload, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import { StatusBadge, RiskBadge } from '../components/common/StatusBadge';
import ProjectDrawer from '../components/projects/ProjectDrawer';
import IntakeQueuePanel from '../components/projects/IntakeQueuePanel';
import ProjectIntakeModal from '../components/projects/ProjectIntakeModal';
import BulkImportWizard from '../components/projects/BulkImportWizard';
import { projects, municipalities, contractors } from '../data/mockData';
import { draftProjects as initialDraftProjects } from '../data/projectWorkflowData';
import type { Project, ProjectStatus, FundSource, DraftProject, WorkflowRole, WorkflowApproval } from '../types';

const ALL = 'all';
type PageTab = 'registry' | 'intake' | 'bulk';

const statusOptions: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: ALL,         label: 'All Statuses' },
  { value: 'planned',   label: 'Planned' },
  { value: 'ongoing',   label: 'Ongoing' },
  { value: 'delayed',   label: 'Delayed' },
  { value: 'completed', label: 'Completed' },
  { value: 'suspended', label: 'Suspended' },
];

const fundOptions: { value: FundSource | 'all'; label: string }[] = [
  { value: ALL,                       label: 'All Funds' },
  { value: 'NTA',                     label: 'NTA' },
  { value: '20% Dev Fund',            label: '20% Dev Fund' },
  { value: 'SEF',                     label: 'SEF' },
  { value: 'LDRRMF',                  label: 'LDRRMF' },
  { value: 'GAD',                     label: 'GAD' },
  { value: 'Provincial General Fund', label: 'Provincial General Fund' },
  { value: 'Loan/Grant',              label: 'Loan/Grant' },
];

function fmt(n: number) { return `₱${(n / 1_000_000).toFixed(2)}M`; }

function nextWorkflowStatus(current: DraftProject['workflowStatus']): DraftProject['workflowStatus'] {
  if (current === 'pending_ppdo')   return 'pending_peo';
  if (current === 'pending_peo')    return 'pending_budget';
  if (current === 'pending_budget') return 'approved';
  return current;
}

function roleToStatus(role: WorkflowRole): DraftProject['workflowStatus'] {
  if (role === 'PPDO')          return 'pending_ppdo';
  if (role === 'PEO')           return 'pending_peo';
  if (role === 'Budget Office') return 'pending_budget';
  return 'pending_ppdo';
}

interface Toast { id: number; message: string; type: 'success' | 'error' }

export default function Projects() {
  const [tab, setTab]                 = useState<PageTab>('registry');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>(ALL);
  const [fundFilter, setFundFilter]   = useState<FundSource | 'all'>(ALL);
  const [munFilter, setMunFilter]     = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [draftProjects, setDraftProjects] = useState<DraftProject[]>(initialDraftProjects);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showBulkWizard, setShowBulkWizard]   = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, type: Toast['type'] = 'success') {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }

  const pendingCount = draftProjects.filter(
    d => d.workflowStatus === 'pending_ppdo' || d.workflowStatus === 'pending_peo' || d.workflowStatus === 'pending_budget'
  ).length;

  const filtered = useMemo(() => projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.implementingOffice.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== ALL && p.status !== statusFilter) return false;
    if (fundFilter !== ALL && p.fundSource !== fundFilter) return false;
    if (munFilter !== ALL && p.municipalityId !== munFilter) return false;
    return true;
  }), [search, statusFilter, fundFilter, munFilter]);

  function handleApprove(id: string, role: WorkflowRole, remarks: string) {
    setDraftProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const approval: WorkflowApproval = {
        role,
        status: 'approved',
        remarks: remarks || undefined,
        actionedBy: `Demo User (${role})`,
        actionedAt: new Date().toISOString(),
      };
      const existingIndex = p.approvals.findIndex(a => a.role === role);
      const updatedApprovals = existingIndex >= 0
        ? p.approvals.map((a, i) => i === existingIndex ? approval : a)
        : [...p.approvals, approval];
      return {
        ...p,
        workflowStatus: nextWorkflowStatus(p.workflowStatus),
        approvals: updatedApprovals,
      };
    }));
    showToast(`Project approved by ${role}. Moving to next stage.`);
  }

  function handleReject(id: string, role: WorkflowRole, remarks: string) {
    setDraftProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const approval: WorkflowApproval = {
        role,
        status: 'rejected',
        remarks: remarks || 'No remarks provided.',
        actionedBy: `Demo User (${role})`,
        actionedAt: new Date().toISOString(),
      };
      const existingIndex = p.approvals.findIndex(a => a.role === role);
      const updatedApprovals = existingIndex >= 0
        ? p.approvals.map((a, i) => i === existingIndex ? approval : a)
        : [...p.approvals, approval];
      return { ...p, workflowStatus: 'rejected', approvals: updatedApprovals };
    }));
    showToast(`Project rejected by ${role}.`, 'error');
  }

  function handleIntakeSubmit(data: any) {
    const newDraft: DraftProject = {
      id: `DRAFT-${String(draftProjects.length + 1).padStart(3, '0')}`,
      title: data.title,
      description: data.description,
      sector: data.sector,
      municipalityId: data.municipalityId,
      barangayId: data.barangayId || undefined,
      coords: data.coords ?? undefined,
      fundSource: data.fundSource,
      contractAmount: parseFloat(data.contractAmount) || 0,
      aipIndicator: data.aipIndicator,
      implementingOffice: data.implementingOffice,
      contractorId: data.contractorId || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      workflowStatus: 'pending_ppdo',
      createdBy: 'Current User (Demo)',
      createdAt: new Date().toISOString(),
      approvals: [],
      attachments: data.attachments.map((a: any) => ({ name: a.name, type: a.type })),
      duplicateFlags: [],
      aiClassification: undefined,
    };
    setDraftProjects(prev => [newDraft, ...prev]);
    setShowIntakeModal(false);
    setTab('intake');
    showToast(`Project "${data.title}" submitted for PPDO review.`);
  }

  const PAGE_TABS: { key: PageTab; label: string; badge?: number }[] = [
    { key: 'registry', label: 'Registry' },
    { key: 'intake',   label: 'Intake Queue', badge: pendingCount },
    { key: 'bulk',     label: 'Bulk Import' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Project Monitoring"
        subtitle="Registry, intake workflow & S-curve progress"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkWizard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Upload size={13} /> Bulk Import
            </button>
            <button
              onClick={() => setShowIntakeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={13} /> New Project
            </button>
          </div>
        }
      />

      <main className="flex-1 p-6 space-y-5">
        {/* Summary stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total',     value: projects.length,                                    color: 'text-slate-800' },
            { label: 'Ongoing',   value: projects.filter(p => p.status === 'ongoing').length,   color: 'text-blue-600' },
            { label: 'Delayed',   value: projects.filter(p => p.status === 'delayed').length,   color: 'text-amber-600' },
            { label: 'Suspended', value: projects.filter(p => p.status === 'suspended').length, color: 'text-red-600' },
            { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Page tabs */}
        <div className="flex border-b border-slate-200 gap-0">
          {PAGE_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                tab === t.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Registry tab */}
        {tab === 'registry' && (
          <>
            {/* Filters */}
            <Card>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search projects or office…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <SlidersHorizontal size={14} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select
                  value={fundFilter}
                  onChange={e => setFundFilter(e.target.value as any)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {fundOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select
                  value={munFilter}
                  onChange={e => setMunFilter(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Municipalities</option>
                  {municipalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </Card>

            {/* Project Table */}
            <Card noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Municipality</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fund</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contract</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">Progress</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No projects match the current filters.</td>
                      </tr>
                    )}
                    {filtered.map(project => {
                      const contractor   = contractors.find(c => c.id === project.contractorId);
                      const municipality = municipalities.find(m => m.id === project.municipalityId);
                      const variance     = project.actualProgress - project.plannedProgress;
                      return (
                        <tr
                          key={project.id}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedProject(project)}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 leading-snug line-clamp-2 max-w-xs">{project.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{project.implementingOffice}</p>
                            {contractor && <p className="text-xs text-slate-400">{contractor.name}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{municipality?.name}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{project.fundSource}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700 text-xs font-medium">{fmt(project.contractAmount)}</td>
                          <td className="px-4 py-3 text-center"><StatusBadge status={project.status} /></td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                  <div className="bg-slate-300 h-full rounded-full" style={{ width: `${project.plannedProgress}%` }} />
                                </div>
                                <span className="text-[10px] text-slate-400 w-6">{project.plannedProgress}%</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                  <div
                                    className={clsx('h-full rounded-full', variance >= 0 ? 'bg-emerald-500' : variance >= -10 ? 'bg-amber-500' : 'bg-red-500')}
                                    style={{ width: `${project.actualProgress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-600 font-medium w-6">{project.actualProgress}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center"><RiskBadge risk={project.riskLevel} /></td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {project.isGhostFlagged && (
                                <span title="Ghost-flagged" className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Ghost size={10} className="text-purple-600" />
                                </span>
                              )}
                              {(project.riskLevel === 'critical' || project.riskLevel === 'high') && (
                                <span title="High risk" className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                                  <AlertTriangle size={10} className="text-red-500" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">Showing {filtered.length} of {projects.length} projects</p>
                <p className="text-xs text-slate-400">Click any row to view details & S-Curve</p>
              </div>
            </Card>
          </>
        )}

        {/* Intake Queue tab */}
        {tab === 'intake' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                {pendingCount} project{pendingCount !== 1 ? 's' : ''} awaiting review · {draftProjects.filter(d => d.workflowStatus === 'approved').length} approved · {draftProjects.filter(d => d.workflowStatus === 'rejected').length} rejected
              </p>
              <div className="flex gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> PPDO</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> PEO</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Budget Office</span>
              </div>
            </div>
            <IntakeQueuePanel
              projects={draftProjects}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}

        {/* Bulk Import tab */}
        {tab === 'bulk' && (
          <BulkImportWizard onClose={() => setTab('registry')} onComplete={(count) => {
            setTab('intake');
            showToast(`${count} project(s) submitted to intake queue.`);
          }} />
        )}
      </main>

      {/* Drawers & Modals */}
      <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
      {showIntakeModal && (
        <ProjectIntakeModal onClose={() => setShowIntakeModal(false)} onSubmit={handleIntakeSubmit} />
      )}
      {showBulkWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <BulkImportWizard onClose={() => setShowBulkWizard(false)} onComplete={(count) => {
              setShowBulkWizard(false);
              setTab('intake');
              showToast(`${count} project(s) submitted to intake queue.`);
            }} />
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto animate-in slide-in-from-bottom-2',
              t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            )}
          >
            <CheckCircle size={15} />
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
