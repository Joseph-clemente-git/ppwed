import { useState, useRef } from 'react';
import {
  Upload, Download, CheckCircle, AlertTriangle, XCircle,
  FileSpreadsheet, ChevronRight, ChevronLeft, Loader2, X,
} from 'lucide-react';
import clsx from 'clsx';
import { bulkImportSampleRows } from '../../data/projectWorkflowData';

interface Props {
  onClose: () => void;
  onSubmit: (count: number) => void;
}

type WizardStep = 'upload' | 'preview' | 'validate' | 'confirm';
const STEPS: WizardStep[] = ['upload', 'preview', 'validate', 'confirm'];
const STEP_LABELS = ['Upload File', 'Preview Data', 'AI Validation', 'Submit'];

type RowStatus = 'valid' | 'duplicate' | 'error';

interface ImportRow {
  title: string;
  sector: string;
  municipality: string;
  fund: string;
  amount: string;
  start: string;
  end: string;
  office: string;
  aip: string;
  status: RowStatus;
  duplicateOf?: string;
  errorMsg?: string;
  aiSector?: string;
  aiSectorConf?: number;
}

const STATUS_CONFIG: Record<RowStatus, { icon: React.ComponentType<any>; color: string; bg: string; label: string }> = {
  valid:     { icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50',  label: 'Valid' },
  duplicate: { icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50',    label: 'Duplicate Flag' },
  error:     { icon: XCircle,       color: 'text-red-600',     bg: 'bg-red-50',      label: 'Error' },
};

export default function BulkImportWizard({ onClose, onSubmit }: Props) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [validationDone, setValidationDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const stepIdx = STEPS.indexOf(step);

  function simulateUpload(name: string) {
    setFileName(name);
    setFileUploaded(true);
    setRows(bulkImportSampleRows.map(r => ({ ...r, status: r.status as RowStatus })));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateUpload(file.name);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file.name);
  }

  function runValidation() {
    setValidating(true);
    setTimeout(() => {
      setRows(prev => prev.map(r => ({
        ...r,
        aiSector: r.sector,
        aiSectorConf: r.status === 'valid' ? (85 + Math.floor(Math.random() * 12)) : undefined,
      })));
      setValidating(false);
      setValidationDone(true);
    }, 1800);
  }

  const validCount = rows.filter(r => r.status === 'valid').length;
  const dupCount   = rows.filter(r => r.status === 'duplicate').length;
  const errCount   = rows.filter(r => r.status === 'error').length;

  function goNext() {
    const next = STEPS[stepIdx + 1];
    if (next === 'validate' && !validationDone) runValidation();
    setStep(next);
  }

  function downloadTemplate() {
    const csv = [
      'title,sector,municipality,fund_source,contract_amount,start_date,end_date,implementing_office,aip_indicator',
      'Sample Project — [Municipality] [Barangay],Infrastructure,Cabarroguis,NTA,5000000,2026-09-01,2027-03-31,Provincial Engineering Office,AIP-2026-INF-001',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PPWED-Bulk-Import-Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bulk Project Import</h2>
            <p className="text-xs text-slate-500 mt-0.5">Import multiple projects from an Excel/CSV file at fiscal year start</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Step bar */}
        <div className="flex border-b border-slate-100 shrink-0">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className={clsx(
              'flex-1 py-2.5 text-center text-xs font-medium border-b-2 transition-colors',
              i < stepIdx ? 'text-emerald-600 border-emerald-500 bg-emerald-50/30' :
              i === stepIdx ? 'text-blue-600 border-blue-500' :
              'text-slate-400 border-transparent'
            )}>
              {i < stepIdx ? '✓ ' : ''}{label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Expected format</p>
                  <p className="text-xs text-blue-600">Excel (.xlsx) or CSV. Each row = one project. Required columns: title, sector, municipality, fund_source, contract_amount, start_date, end_date, implementing_office.</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="shrink-0 flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors h-fit"
                >
                  <Download size={15} />
                  Download Template
                </button>
              </div>

              {!fileUploaded ? (
                <div
                  className={clsx(
                    'border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer',
                    isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  )}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <FileSpreadsheet size={40} className={clsx('mx-auto mb-3', isDragging ? 'text-blue-500' : 'text-slate-300')} />
                  <p className="text-sm font-medium text-slate-600">Drag & drop your AIP file here</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse — .xlsx, .csv accepted</p>
                  <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileInput} />
                </div>
              ) : (
                <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet size={22} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{fileName || 'AIP-Projects-2026.xlsx'}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">{rows.length} project rows detected · Ready to preview</p>
                  </div>
                  <CheckCircle size={20} className="text-emerald-500" />
                </div>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <div>
              <p className="text-xs text-slate-500 mb-3">Review the parsed project data before AI validation. Fix errors in your source file and re-upload if needed.</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['#', 'Title', 'Sector', 'Municipality', 'Fund', 'Amount', 'Start', 'End', 'Status'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, i) => {
                      const s = STATUS_CONFIG[row.status];
                      const Icon = s.icon;
                      return (
                        <tr key={i} className={clsx('hover:bg-slate-50', row.status === 'error' && 'bg-red-50/40', row.status === 'duplicate' && 'bg-amber-50/40')}>
                          <td className="px-3 py-2.5 text-slate-400 font-mono">{i + 1}</td>
                          <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[200px] truncate">{row.title}</td>
                          <td className="px-3 py-2.5 text-slate-600">{row.sector}</td>
                          <td className="px-3 py-2.5 text-slate-600">{row.municipality}</td>
                          <td className="px-3 py-2.5 text-slate-600">{row.fund}</td>
                          <td className="px-3 py-2.5 text-slate-700 font-medium">
                            {row.amount ? `₱${row.amount}` : <span className="text-red-500">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{row.start}</td>
                          <td className="px-3 py-2.5 text-slate-600">{row.end}</td>
                          <td className="px-3 py-2.5">
                            <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', s.bg, s.color)}>
                              <Icon size={9} />
                              {s.label}
                            </span>
                            {row.errorMsg && <p className="text-[10px] text-red-500 mt-0.5">{row.errorMsg}</p>}
                            {row.duplicateOf && <p className="text-[10px] text-amber-600 mt-0.5">Matches {row.duplicateOf}</p>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-2">{rows.length} rows · {validCount} valid · {dupCount} flagged · {errCount} errors</p>
            </div>
          )}

          {/* Step: AI Validation */}
          {step === 'validate' && (
            <div className="space-y-4">
              {validating ? (
                <div className="flex flex-col items-center py-12 gap-4">
                  <Loader2 size={32} className="text-blue-500 animate-spin" />
                  <p className="text-sm font-medium text-slate-700">AI is validating all rows…</p>
                  <p className="text-xs text-slate-400">Running duplicate detection, sector classification, and field validation</p>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{validCount}</p>
                      <p className="text-xs text-emerald-700 mt-0.5">Ready to import</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-amber-600">{dupCount}</p>
                      <p className="text-xs text-amber-700 mt-0.5">Duplicate flags — needs review</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{errCount}</p>
                      <p className="text-xs text-red-700 mt-0.5">Errors — will be skipped</p>
                    </div>
                  </div>

                  {/* AI findings per row */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600">AI Validation Details</p>
                    {rows.map((row, i) => {
                      const s = STATUS_CONFIG[row.status];
                      const Icon = s.icon;
                      return (
                        <div key={i} className={clsx('border rounded-lg p-3', s.bg, 'border-slate-200')}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Icon size={13} className={s.color} />
                              <p className="text-xs font-medium text-slate-800 leading-snug">{row.title}</p>
                            </div>
                            <span className={clsx('text-[10px] font-semibold shrink-0', s.color)}>{s.label}</span>
                          </div>
                          {row.aiSector && (
                            <p className="text-[10px] text-slate-500 mt-1 ml-5">AI sector classification: <strong>{row.aiSector}</strong> ({row.aiSectorConf}% confidence)</p>
                          )}
                          {row.duplicateOf && (
                            <p className="text-[10px] text-amber-700 mt-1 ml-5">Possible duplicate of <strong>{row.duplicateOf}</strong> — review before importing</p>
                          )}
                          {row.errorMsg && (
                            <p className="text-[10px] text-red-600 mt-1 ml-5">Error: {row.errorMsg} — this row will be skipped</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="text-sm font-bold text-blue-800 mb-2">Ready to Submit {validCount} Projects</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  The <strong>{validCount} valid projects</strong> will be added to the Intake Queue with status <em>Pending PPDO</em>.
                  {dupCount > 0 && ` ${dupCount} duplicate-flagged rows will also be submitted but will require PPDO review.`}
                  {errCount > 0 && ` ${errCount} rows with errors will be skipped.`}
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                {rows.filter(r => r.status !== 'error').map((row, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    {row.status === 'duplicate'
                      ? <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                      : <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{row.title}</p>
                      <p className="text-[10px] text-slate-500">{row.municipality} · {row.fund} · ₱{row.amount}</p>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold shrink-0">Pending PPDO</span>
                  </div>
                ))}
              </div>

              {errCount > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500">
                  Skipped ({errCount}): {rows.filter(r => r.status === 'error').map(r => r.title).join('; ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="text-xs text-slate-400">
            {step === 'upload' && (fileUploaded ? `${rows.length} rows ready` : 'Upload a file to continue')}
            {step === 'preview' && `${validCount} valid · ${dupCount} flagged · ${errCount} errors`}
            {step === 'validate' && (validating ? 'Validating…' : `AI validation complete`)}
            {step === 'confirm' && `${validCount + dupCount} projects will be queued for approval`}
          </div>
          <div className="flex items-center gap-3">
            {stepIdx > 0 && (
              <button
                onClick={() => setStep(STEPS[stepIdx - 1])}
                className="flex items-center gap-1 text-sm text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                onClick={goNext}
                disabled={step === 'upload' && !fileUploaded}
                className={clsx(
                  'flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg transition-colors',
                  (step !== 'upload' || fileUploaded)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => { onSubmit(validCount + dupCount); onClose(); }}
                className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <Upload size={15} /> Submit {validCount + dupCount} Projects
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
