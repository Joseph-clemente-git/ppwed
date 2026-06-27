import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import type { DraftProject, WorkflowStatus, WorkflowApproval, WorkflowRole } from '../../types';
import { municipalities } from '../../data/mockData';

const WORKFLOW_STEPS: WorkflowRole[] = ['PPDO', 'PEO', 'Budget Office'];

const STATUS_META: Record<WorkflowStatus, { label: string; color: string; bg: string; icon: React.ComponentType<any> }> = {
  draft:          { label: 'Draft',            color: 'text-slate-600',   bg: 'bg-slate-100',   icon: Clock },
  pending_ppdo:   { label: 'Pending PPDO',     color: 'text-blue-700',    bg: 'bg-blue-100',    icon: Clock },
  pending_peo:    { label: 'Pending PEO',      color: 'text-violet-700',  bg: 'bg-violet-100',  icon: Clock },
  pending_budget: { label: 'Pending Budget',   color: 'text-amber-700',   bg: 'bg-amber-100',   icon: Clock },
  approved:       { label: 'Approved',         color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  rejected:       { label: 'Rejected',         color: 'text-red-700',     bg: 'bg-red-100',     icon: XCircle },
};

function WorkflowStepper({ approvals, workflowStatus }: { approvals: WorkflowApproval[]; workflowStatus: WorkflowStatus }) {
  const currentStepIndex = workflowStatus === 'pending_ppdo' ? 0
    : workflowStatus === 'pending_peo' ? 1
    : workflowStatus === 'pending_budget' ? 2
    : workflowStatus === 'approved' ? 3
    : workflowStatus === 'rejected' ? (approvals.findIndex(a => a.status === 'rejected') + 1 || 1)
    : 0;

  return (
    <div className="flex items-center gap-0 mt-3">
      {WORKFLOW_STEPS.map((role, i) => {
        const approval = approvals.find(a => a.role === role);
        const isActive = i === currentStepIndex - 1 || (workflowStatus !== 'rejected' && workflowStatus !== 'approved' && i === currentStepIndex);
        const isDone = approval?.status === 'approved';
        const isRejected = approval?.status === 'rejected';
        const isPending = !approval && i < currentStepIndex;
        const isFuture = i >= currentStepIndex && workflowStatus !== 'approved';

        return (
          <div key={role} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                isDone      ? 'bg-emerald-500 border-emerald-500 text-white' :
                isRejected  ? 'bg-red-500 border-red-500 text-white' :
                isActive    ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                isFuture    ? 'bg-white border-slate-200 text-slate-400' :
                              'bg-slate-100 border-slate-300 text-slate-400'
              )}>
                {isDone ? '✓' : isRejected ? '✗' : i + 1}
              </div>
              <p className={clsx('text-[9px] mt-1 font-medium text-center whitespace-nowrap',
                isDone ? 'text-emerald-600' : isRejected ? 'text-red-600' : isActive ? 'text-blue-600' : 'text-slate-400'
              )}>
                {role}
              </p>
            </div>
            {i < WORKFLOW_STEPS.length - 1 && (
              <div className={clsx(
                'flex-1 h-0.5 mx-1 mt-[-10px]',
                isDone ? 'bg-emerald-400' : 'bg-slate-200'
              )} />
            )}
          </div>
        );
      })}
      {/* Final approved bubble */}
      <div className="flex items-center flex-1">
        <div className={clsx('flex-1 h-0.5 mx-1 mt-[-10px]', workflowStatus === 'approved' ? 'bg-emerald-400' : 'bg-slate-200')} />
        <div className="flex flex-col items-center">
          <div className={clsx(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2',
            workflowStatus === 'approved' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'
          )}>
            ✓
          </div>
          <p className={clsx('text-[9px] mt-1 font-medium text-center', workflowStatus === 'approved' ? 'text-emerald-600' : 'text-slate-400')}>
            Live
          </p>
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ approval, role }: { approval: WorkflowApproval; role: WorkflowRole }) {
  return (
    <div className={clsx(
      'border rounded-lg p-3 mb-2',
      approval.status === 'approved' ? 'bg-emerald-50 border-emerald-200' :
      approval.status === 'rejected' ? 'bg-red-50 border-red-200' :
      'bg-slate-50 border-slate-200'
    )}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-700">{role}</p>
        <span className={clsx(
          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
          approval.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
          approval.status === 'rejected' ? 'bg-red-100 text-red-700' :
          'bg-amber-100 text-amber-700'
        )}>
          {approval.status}
        </span>
      </div>
      {approval.actionedBy && <p className="text-xs text-slate-600">{approval.actionedBy}</p>}
      {approval.actionedAt && (
        <p className="text-[10px] text-slate-400">{new Date(approval.actionedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      )}
      {approval.remarks && (
        <div className="mt-2 flex gap-1.5">
          <MessageSquare size={11} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed italic">"{approval.remarks}"</p>
        </div>
      )}
    </div>
  );
}

interface Props {
  projects: DraftProject[];
  onApprove: (id: string, role: WorkflowRole, remarks: string) => void;
  onReject:  (id: string, role: WorkflowRole, remarks: string) => void;
}

export default function IntakeQueuePanel({ projects, onApprove, onReject }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionTarget, setActionTarget] = useState<{ id: string; role: WorkflowRole; action: 'approve' | 'reject' } | null>(null);

  const munMap = Object.fromEntries(municipalities.map(m => [m.id, m.name]));

  const currentRole = (ws: WorkflowStatus): WorkflowRole | null => {
    if (ws === 'pending_ppdo')   return 'PPDO';
    if (ws === 'pending_peo')    return 'PEO';
    if (ws === 'pending_budget') return 'Budget Office';
    return null;
  };

  function submitAction() {
    if (!actionTarget) return;
    if (actionTarget.action === 'approve') onApprove(actionTarget.id, actionTarget.role, actionRemarks);
    else onReject(actionTarget.id, actionTarget.role, actionRemarks);
    setActionTarget(null);
    setActionRemarks('');
  }

  return (
    <div className="space-y-3">
      {projects.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">No projects in the intake queue.</div>
      )}
      {projects.map(project => {
        const isExpanded = expandedId === project.id;
        const meta = STATUS_META[project.workflowStatus];
        const Icon = meta.icon;
        const role = currentRole(project.workflowStatus);
        const munName = munMap[project.municipalityId] ?? '—';

        return (
          <div key={project.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Row header */}
            <div
              className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : project.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', meta.bg, meta.color)}>
                    <Icon size={10} />
                    {meta.label}
                  </span>
                  {project.duplicateFlags.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                      <AlertTriangle size={10} /> AI Duplicate Flag
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{project.id}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{project.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>{munName}</span>
                  <span>·</span>
                  <span>{project.fundSource}</span>
                  <span>·</span>
                  <span>₱{(project.contractAmount / 1_000_000).toFixed(2)}M</span>
                  <span>·</span>
                  <span>By {project.createdBy}</span>
                </div>
              </div>
              <button className="shrink-0 text-slate-400 hover:text-slate-600 mt-1">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Workflow stepper */}
            <div className="px-4 pb-3">
              <WorkflowStepper approvals={project.approvals} workflowStatus={project.workflowStatus} />
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-slate-100 px-4 py-4 bg-slate-50 space-y-4">
                {/* Info grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Implementing Office', project.implementingOffice],
                    ['AIP Indicator', project.aipIndicator || '—'],
                    ['Sector', project.sector],
                    ['Start Date', project.startDate],
                    ['End Date', project.endDate],
                    ['Attachments', project.attachments.length > 0 ? project.attachments.map(a => a.name).join(', ') : 'None'],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-white rounded-lg p-2 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{l}</p>
                      <p className="text-xs text-slate-700 font-medium mt-0.5 leading-tight">{v}</p>
                    </div>
                  ))}
                </div>

                {/* AI Classification */}
                {project.aiClassification && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1.5">AI Classification Result</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-slate-500">Sector: </span><strong>{project.aiClassification.sector}</strong></div>
                      <div><span className="text-slate-500">Fund: </span><strong>{project.aiClassification.fundSource}</strong></div>
                      <div><span className="text-slate-500">Confidence: </span><strong>{project.aiClassification.confidence}%</strong></div>
                    </div>
                  </div>
                )}

                {/* Duplicate flags */}
                {project.duplicateFlags.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-2">AI Duplicate Detection</p>
                    {project.duplicateFlags.map(flag => (
                      <div key={flag.matchId}>
                        <p className="text-xs font-medium text-red-800">{flag.matchName}</p>
                        <div className="flex gap-4 text-xs text-red-700 mt-1">
                          <span>Location match: {flag.locationSimilarity}%</span>
                          <span>Scope match: {flag.scopeSimilarity}%</span>
                          <span>Overall: {flag.overallScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prior approval history */}
                {project.approvals.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Approval History</p>
                    {project.approvals.map(a => (
                      <ApprovalCard key={a.role} approval={a} role={a.role} />
                    ))}
                  </div>
                )}

                {/* Action buttons (only if there's a pending role) */}
                {role && (
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Action as {role}</p>
                    <textarea
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                      placeholder="Add remarks or conditions (optional for approval, required for rejection)…"
                      value={actionTarget?.id === project.id ? actionRemarks : ''}
                      onChange={e => { setActionTarget({ id: project.id, role, action: 'approve' }); setActionRemarks(e.target.value); }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => { setActionTarget({ id: project.id, role, action: 'approve' }); setTimeout(submitAction, 10); }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        onClick={() => { setActionTarget({ id: project.id, role, action: 'reject' }); setTimeout(submitAction, 10); }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
