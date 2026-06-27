import { useState, useEffect } from 'react';
import {
  X, ChevronRight, ChevronLeft, Upload, MapPin, Sparkles,
  AlertTriangle, CheckCircle, FileText, Loader2, Copy,
} from 'lucide-react';
import clsx from 'clsx';
import type { IntakeFormData, FundSource } from '../../types';
import { municipalities, barangays, contractors } from '../../data/mockData';

interface Props {
  onClose: () => void;
  onSubmit: (data: IntakeFormData) => void;
}

const STEPS = ['Basic Info', 'Location', 'Financial', 'Implementation', 'Documents'];

const OFFICES = [
  'Provincial Engineering Office',
  'Provincial Health Office',
  'Provincial Buildings & Grounds Office',
  'Provincial Disaster Risk Reduction & Management Office',
  'Provincial Agricultural Office',
  'Provincial Social Welfare & Development Office',
];

const FUND_SOURCES: FundSource[] = ['NTA', '20% Dev Fund', 'SEF', 'LDRRMF', 'GAD', 'Provincial General Fund', 'Loan/Grant'];
const SECTORS = ['Infrastructure', 'Health & Water', 'Social Services', 'Agriculture', 'Education', 'Disaster Risk Reduction', 'Environment'];
const AIP_INDICATORS = [
  'AIP-2026-INF-001 — Road Network Development',
  'AIP-2026-INF-002 — Bridge Construction',
  'AIP-2026-HW-001 — Water Supply Systems',
  'AIP-2026-HW-002 — Health Facility Upgrade',
  'AIP-2026-AG-001 — Irrigation Rehabilitation',
  'AIP-2026-AG-002 — Farm-to-Market Roads',
  'AIP-2026-SS-001 — Multi-Purpose Buildings',
  'AIP-2026-DRR-001 — Flood Control',
  'AIP-2026-DRR-002 — Slope Protection',
  'AIP-2026-ED-001 — School Building Program',
];

const INITIAL: IntakeFormData = {
  title: '', description: '', sector: '', municipalityId: '', barangayId: '',
  fundSource: '', contractAmount: '', aipIndicator: '', implementingOffice: '',
  contractorId: '', startDate: '', endDate: '', coords: null, attachments: [],
};

// Simulated AI responses keyed by sector keyword
const AI_CLASSIFICATION_MAP: Record<string, { fundSource: FundSource; aip: string; confidence: number }> = {
  'road':        { fundSource: 'NTA',         aip: 'AIP-2026-INF-001 — Road Network Development',  confidence: 93 },
  'bridge':      { fundSource: 'NTA',         aip: 'AIP-2026-INF-002 — Bridge Construction',        confidence: 91 },
  'water':       { fundSource: 'LDRRMF',      aip: 'AIP-2026-HW-001 — Water Supply Systems',        confidence: 89 },
  'health':      { fundSource: 'GAD',         aip: 'AIP-2026-HW-002 — Health Facility Upgrade',     confidence: 94 },
  'rhu':         { fundSource: 'GAD',         aip: 'AIP-2026-HW-002 — Health Facility Upgrade',     confidence: 96 },
  'irrigation':  { fundSource: 'NTA',         aip: 'AIP-2026-AG-001 — Irrigation Rehabilitation',   confidence: 90 },
  'slope':       { fundSource: 'LDRRMF',      aip: 'AIP-2026-DRR-002 — Slope Protection',           confidence: 92 },
  'flood':       { fundSource: 'LDRRMF',      aip: 'AIP-2026-DRR-001 — Flood Control',              confidence: 91 },
  'school':      { fundSource: 'SEF',         aip: 'AIP-2026-ED-001 — School Building Program',     confidence: 95 },
  'hall':        { fundSource: '20% Dev Fund', aip: 'AIP-2026-SS-001 — Multi-Purpose Buildings',   confidence: 88 },
  'farm':        { fundSource: 'NTA',         aip: 'AIP-2026-AG-002 — Farm-to-Market Roads',        confidence: 87 },
};

function getAIClassification(description: string) {
  const lower = description.toLowerCase();
  for (const [key, val] of Object.entries(AI_CLASSIFICATION_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'transition-all rounded-full',
            i < step ? 'bg-blue-600 w-6 h-2' : i === step ? 'bg-blue-500 w-4 h-2' : 'bg-slate-200 w-2 h-2'
          )}
        />
      ))}
    </div>
  );
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const selectCls = inputCls;

export default function ProjectIntakeModal({ onClose, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeFormData>(INITIAL);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiClassification, setAiClassification] = useState<ReturnType<typeof getAIClassification>>(null);
  const [aiAutoFill, setAiAutoFill] = useState(false);
  const [duplicateFlag, setDuplicateFlag] = useState<{ name: string; score: number } | null>(null);
  const [pinCoords, setPinCoords] = useState<[number, number] | null>(null);

  const set = (key: keyof IntakeFormData, value: any) => setForm(f => ({ ...f, [key]: value }));

  // Trigger AI classification when description changes
  useEffect(() => {
    if (form.description.length < 20) { setAiClassification(null); return; }
    const timer = setTimeout(() => {
      setAiLoading(true);
      setTimeout(() => {
        setAiClassification(getAIClassification(form.description));
        setAiLoading(false);
      }, 900);
    }, 600);
    return () => clearTimeout(timer);
  }, [form.description]);

  // Trigger duplicate detection when title + municipality selected
  useEffect(() => {
    if (form.title.length < 10 || !form.municipalityId) { setDuplicateFlag(null); return; }
    const lower = form.title.toLowerCase();
    if (lower.includes('slope') || lower.includes('protect')) {
      setDuplicateFlag({ name: 'Flood Control — Aglipay River Bank Protection (PRJ-004)', score: 76 });
    } else {
      setDuplicateFlag(null);
    }
  }, [form.title, form.municipalityId]);

  // Update coords when municipality changes
  useEffect(() => {
    if (form.municipalityId) {
      const centroids: Record<string, [number, number]> = {
        'mun-01': [16.512, 121.556], 'mun-02': [16.378, 121.509],
        'mun-03': [16.289, 121.436], 'mun-04': [16.002, 121.484],
        'mun-05': [16.630, 121.567], 'mun-06': [16.666, 121.530],
        'mun-07': [16.290, 121.100],
      };
      const c = centroids[form.municipalityId];
      if (c) { setPinCoords(c); set('coords', c); }
    }
  }, [form.municipalityId]);

  function applyAIClassification() {
    if (!aiClassification) return;
    set('fundSource', aiClassification.fundSource);
    set('aipIndicator', aiClassification.aip);
    setAiAutoFill(true);
    setTimeout(() => setAiAutoFill(false), 2000);
  }

  function handleFileUpload(type: 'POW' | 'Contract' | 'Other') {
    const names = { POW: 'POW-Document.pdf', Contract: 'Contract-Agreement.pdf', Other: 'Supporting-Docs.pdf' };
    const sizes = { POW: '2.4 MB', Contract: '1.8 MB', Other: '890 KB' };
    set('attachments', [...form.attachments, { name: names[type], size: sizes[type], type }]);
  }

  const munBarangays = barangays.filter(b => b.municipalityId === form.municipalityId);

  function handleSubmit() {
    onSubmit({ ...form, coords: pinCoords });
    onClose();
  }

  const canNext = [
    form.title.length > 0 && form.description.length > 0,
    form.municipalityId.length > 0,
    form.fundSource.length > 0 && form.contractAmount.length > 0,
    form.implementingOffice.length > 0 && form.startDate.length > 0 && form.endDate.length > 0,
    true,
  ][step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">New Project Intake</h2>
            <p className="text-xs text-slate-500 mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressDots step={step} total={STEPS.length} />
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Form area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* Step 0: Basic Info */}
            {step === 0 && (
              <>
                <FieldRow label="Project Title" required>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Rehabilitation of Barangay Road — Cabarroguis"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Project Description" required>
                  <textarea
                    className={clsx(inputCls, 'resize-none')}
                    rows={4}
                    placeholder="Describe the project scope, coverage, and intended beneficiaries…"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">AI will auto-classify sector and fund source from this description.</p>
                </FieldRow>
                <FieldRow label="Sector" required>
                  <select className={selectCls} value={form.sector} onChange={e => set('sector', e.target.value)}>
                    <option value="">Select sector…</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FieldRow>
                <FieldRow label="Linked AIP / CDP Indicator">
                  <select className={selectCls} value={form.aipIndicator} onChange={e => set('aipIndicator', e.target.value)}>
                    <option value="">Select indicator…</option>
                    {AIP_INDICATORS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </FieldRow>
              </>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <>
                <FieldRow label="Municipality" required>
                  <select className={selectCls} value={form.municipalityId} onChange={e => set('municipalityId', e.target.value)}>
                    <option value="">Select municipality…</option>
                    {municipalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </FieldRow>
                {form.municipalityId && (
                  <FieldRow label="Barangay">
                    <select className={selectCls} value={form.barangayId} onChange={e => set('barangayId', e.target.value)}>
                      <option value="">Select barangay…</option>
                      {munBarangays.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </FieldRow>
                )}
                {/* Map pin display */}
                {pinCoords && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Project Location Pin <span className="text-slate-400 font-normal">(click map to reposition)</span>
                    </label>
                    <div className="h-52 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative">
                      {/* Static map placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin size={32} className="text-blue-500 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-slate-700">
                            {municipalities.find(m => m.id === form.municipalityId)?.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {pinCoords[0].toFixed(4)}°N, {pinCoords[1].toFixed(4)}°E
                          </p>
                          <p className="text-[10px] text-slate-400 mt-2">
                            Centroid auto-set from municipality. Use GIS Map for precision pin.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Latitude">
                    <input
                      type="number"
                      className={inputCls}
                      step="0.0001"
                      value={pinCoords?.[0] ?? ''}
                      onChange={e => {
                        const lat = parseFloat(e.target.value);
                        const lng = pinCoords?.[1] ?? 121.5;
                        setPinCoords([lat, lng]);
                      }}
                    />
                  </FieldRow>
                  <FieldRow label="Longitude">
                    <input
                      type="number"
                      className={inputCls}
                      step="0.0001"
                      value={pinCoords?.[1] ?? ''}
                      onChange={e => {
                        const lat = pinCoords?.[0] ?? 16.3;
                        const lng = parseFloat(e.target.value);
                        setPinCoords([lat, lng]);
                      }}
                    />
                  </FieldRow>
                </div>
              </>
            )}

            {/* Step 2: Financial */}
            {step === 2 && (
              <>
                <FieldRow label="Fund Source" required>
                  <select
                    className={clsx(selectCls, aiAutoFill && 'ring-2 ring-blue-400 border-blue-400')}
                    value={form.fundSource}
                    onChange={e => set('fundSource', e.target.value as FundSource)}
                  >
                    <option value="">Select fund source…</option>
                    {FUND_SOURCES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </FieldRow>
                <FieldRow label="Contract Amount (₱)" required>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. 5,000,000"
                    value={form.contractAmount}
                    onChange={e => set('contractAmount', e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="AIP / CDP Indicator">
                  <select
                    className={clsx(selectCls, aiAutoFill && 'ring-2 ring-blue-400 border-blue-400')}
                    value={form.aipIndicator}
                    onChange={e => set('aipIndicator', e.target.value)}
                  >
                    <option value="">Select indicator…</option>
                    {AIP_INDICATORS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </FieldRow>
              </>
            )}

            {/* Step 3: Implementation */}
            {step === 3 && (
              <>
                <FieldRow label="Implementing Office" required>
                  <select className={selectCls} value={form.implementingOffice} onChange={e => set('implementingOffice', e.target.value)}>
                    <option value="">Select office…</option>
                    {OFFICES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </FieldRow>
                <FieldRow label="Contractor">
                  <select className={selectCls} value={form.contractorId} onChange={e => set('contractorId', e.target.value)}>
                    <option value="">Select contractor…</option>
                    {contractors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Score: {c.performanceScore})
                      </option>
                    ))}
                  </select>
                </FieldRow>
                {form.contractorId && (() => {
                  const c = contractors.find(x => x.id === form.contractorId)!;
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-600 mb-1.5">Contractor Performance (Provincial History)</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className={clsx('h-full rounded-full', c.performanceScore >= 80 ? 'bg-emerald-500' : c.performanceScore >= 65 ? 'bg-amber-500' : 'bg-red-500')}
                            style={{ width: `${c.performanceScore}%` }}
                          />
                        </div>
                        <span className={clsx('text-sm font-bold', c.performanceScore >= 80 ? 'text-emerald-600' : c.performanceScore >= 65 ? 'text-amber-600' : 'text-red-600')}>
                          {c.performanceScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{c.completedProjects} completed · {c.delayedProjects} delayed in this province</p>
                      {c.performanceScore < 70 && (
                        <p className="text-xs text-red-600 font-medium mt-1.5">⚠ Low score — requires PPDO justification for awarding</p>
                      )}
                    </div>
                  );
                })()}
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Target Start Date" required>
                    <input type="date" className={inputCls} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Target End Date" required>
                    <input type="date" className={inputCls} value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                  </FieldRow>
                </div>
              </>
            )}

            {/* Step 4: Documents */}
            {step === 4 && (
              <>
                <p className="text-xs text-slate-500">Attach the Project's Program of Work (POW), contract, and supporting documents. AI will extract data from uploaded PDFs to verify form entries.</p>
                <div className="space-y-3">
                  {(['POW', 'Contract', 'Other'] as const).map(type => {
                    const attached = form.attachments.find(a => a.type === type);
                    return (
                      <div
                        key={type}
                        className={clsx(
                          'border-2 border-dashed rounded-xl p-4 flex items-center justify-between gap-3 transition-colors',
                          attached ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'
                        )}
                        onClick={() => !attached && handleFileUpload(type)}
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={20} className={attached ? 'text-emerald-500' : 'text-slate-400'} />
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{type === 'POW' ? 'Program of Work (POW)' : type === 'Contract' ? 'Contract / Agreement' : 'Supporting Documents'}</p>
                            {attached
                              ? <p className="text-xs text-emerald-600">{attached.name} · {attached.size}</p>
                              : <p className="text-xs text-slate-400">Click to upload or drag & drop PDF</p>
                            }
                          </div>
                        </div>
                        {attached
                          ? <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                          : <Upload size={16} className="text-slate-400 shrink-0" />
                        }
                      </div>
                    );
                  })}
                </div>
                {form.attachments.some(a => a.type === 'POW') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles size={13} className="text-blue-500" />
                      <p className="text-xs font-semibold text-blue-700">AI OCR Extraction Complete</p>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>✓ Project title extracted — matches form entry</p>
                      <p>✓ Contract amount: ₱{form.contractAmount || 'not yet entered'}</p>
                      <p>✓ Start date, end date confirmed from POW schedule</p>
                      <p className="text-amber-600">⚠ Scope description differs slightly from entered description — review recommended</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* AI Panel */}
          <div className="w-72 shrink-0 border-l border-slate-100 bg-slate-50 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <p className="text-xs font-bold text-slate-700">AI Assistant</p>
            </div>

            {/* Auto-classification */}
            {(aiLoading || aiClassification) && (
              <div className="bg-white border border-blue-200 rounded-lg p-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-2">Auto-Classification</p>
                {aiLoading
                  ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 size={12} className="animate-spin text-blue-500" />
                      Analyzing description…
                    </div>
                  )
                  : aiClassification && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-slate-500">Suggested fund source</p>
                        <p className="text-xs font-semibold text-slate-800">{aiClassification.fundSource}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Suggested AIP indicator</p>
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{aiClassification.aip}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{aiClassification.confidence}% confidence</span>
                        <button
                          onClick={applyAIClassification}
                          className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-md font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Copy size={9} /> Apply
                        </button>
                      </div>
                    </div>
                  )
                }
              </div>
            )}

            {/* Duplicate detection */}
            {duplicateFlag && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={12} className="text-red-500" />
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Duplicate Detected</p>
                </div>
                <p className="text-xs text-red-700 font-medium leading-snug mb-1">{duplicateFlag.name}</p>
                <p className="text-xs text-red-600">
                  {duplicateFlag.score}% overall similarity — scope description match
                </p>
                <p className="text-[10px] text-slate-500 mt-2">Confirm this is a distinct project in Step 4 or revise the description to differentiate scope.</p>
              </div>
            )}

            {/* Auto-fill confirmation */}
            {aiAutoFill && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <p className="text-xs font-semibold text-emerald-700">AI suggestions applied!</p>
                </div>
              </div>
            )}

            {/* Workflow info */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Intake Workflow</p>
              {[
                { role: 'PPDO', desc: 'Verifies AIP alignment & completeness' },
                { role: 'PEO', desc: 'Confirms scope, design, and site location' },
                { role: 'Budget Office', desc: 'Certifies fund availability' },
              ].map((s, i) => (
                <div key={i} className="flex gap-2 mb-2 last:mb-0">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{s.role}</p>
                    <p className="text-[10px] text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {!aiClassification && !aiLoading && form.description.length < 20 && (
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Enter a project description to see AI classification suggestions
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="text-xs text-slate-400">
            {step < STEPS.length - 1
              ? `${STEPS.length - 1 - step} more step${STEPS.length - 1 - step !== 1 ? 's' : ''} remaining`
              : 'Ready to submit for PPDO review'
            }
          </div>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < STEPS.length - 1
              ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext}
                  className={clsx(
                    'flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors',
                    canNext
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  )}
                >
                  Next <ChevronRight size={16} />
                </button>
              )
              : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle size={16} /> Submit for PPDO Review
                </button>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
