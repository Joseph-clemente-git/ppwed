import { useState } from 'react';
import { AlertTriangle, Camera, BarChart2, ExternalLink, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { aiGISFindings } from '../../data/gisData';
import clsx from 'clsx';

type Tab = 'mismatch' | 'photos' | 'equity';

const TABS: { key: Tab; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
  { key: 'mismatch', label: 'Geotag',  icon: AlertTriangle, badge: aiGISFindings.geomismatches.length },
  { key: 'photos',   label: 'Photos',  icon: Camera,        badge: aiGISFindings.photoFlags.length },
  { key: 'equity',   label: 'Equity',  icon: BarChart2 },
];

const AVG_PER_CAPITA = Math.round(
  aiGISFindings.equityAnalysis.reduce((s, m) => s + (m.budgetPerCapita ?? 0), 0) /
  aiGISFindings.equityAnalysis.length
);

export default function AIGISPanel() {
  const [tab, setTab] = useState<Tab>('mismatch');

  return (
    <div className="border-t border-slate-200 bg-white flex flex-col">
      {/* Panel header */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-100">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI GIS Analysis</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                tab === t.key
                  ? 'text-blue-600 border-b-2 border-blue-500 -mb-px'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon size={11} />
              <span>{t.label}</span>
              {t.badge && (
                <span className={clsx(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5',
                  tab === t.key ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                )}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="px-3 py-3 overflow-y-auto" style={{ maxHeight: 280 }}>

        {/* Geotag Mismatch */}
        {tab === 'mismatch' && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              AI cross-references submitted GPS coordinates against satellite imagery and field data. Mismatches trigger an investigation flag.
            </p>
            {aiGISFindings.geomismatches.map(m => (
              <div key={m.projectId} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-semibold text-red-800 leading-snug">{m.projectName}</p>
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full shrink-0">
                    {m.confidence}% conf.
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <p>Reported: {m.reportedCoords[0].toFixed(3)}°N, {m.reportedCoords[1].toFixed(3)}°E</p>
                  <p className="text-red-600 font-medium">Detected: {m.detectedCoords[0].toFixed(3)}°N, {m.detectedCoords[1].toFixed(3)}°E</p>
                  <p className="text-red-700 font-semibold">Discrepancy: {m.discrepancyKm} km</p>
                </div>
                <button className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                  <ExternalLink size={10} /> View on map
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Photo Detection */}
        {tab === 'photos' && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Computer vision scans all uploaded progress photos for duplicates, recycled images, EXIF inconsistencies, and timestamp anomalies.
            </p>
            {aiGISFindings.photoFlags.map(f => (
              <div
                key={f.id}
                className={clsx(
                  'border rounded-lg p-3',
                  f.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={clsx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase',
                    f.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {f.severity} risk
                  </span>
                  {f.similarity !== null && (
                    <span className="text-[10px] text-slate-500">{f.similarity}% visual similarity</span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-snug mb-1">{f.description}</p>
                <p className="text-[10px] text-slate-500">
                  Affects: {f.projectNames.join(' · ')}
                </p>
              </div>
            ))}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500 shrink-0" />
              <p className="text-[11px] text-slate-600">4 other projects — no anomalies detected</p>
            </div>
          </div>
        )}

        {/* Equity Analysis */}
        {tab === 'equity' && (
          <div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Budget per capita by municipality vs. provincial average (₱{AVG_PER_CAPITA.toLocaleString()}/person). Bars below average indicate underserved LGUs.
            </p>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiGISFindings.equityAnalysis} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={72} />
                  <Tooltip
                    formatter={(v: any) => [`₱${Number(v).toLocaleString()}/person`, 'Budget per capita']}
                    labelStyle={{ fontSize: 11 }}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <ReferenceLine x={AVG_PER_CAPITA} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} />
                  <Bar dataKey="budgetPerCapita" radius={[0, 3, 3, 0]} barSize={12}>
                    {aiGISFindings.equityAnalysis.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={(entry.budgetPerCapita ?? 0) >= AVG_PER_CAPITA ? '#3b82f6' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
              <div className="flex items-center gap-1"><div className="w-3 h-2 rounded bg-blue-500" /> Above avg.</div>
              <div className="flex items-center gap-1"><div className="w-3 h-2 rounded bg-amber-500" /> Below avg.</div>
              <div className="flex items-center gap-1"><div className="w-6 border-t border-dashed border-red-400" /> Avg. line</div>
            </div>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <p className="text-[11px] text-amber-800 font-medium">
                Maddela &amp; Dupax del Norte significantly below average — recommend prioritizing in next AIP.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
