import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, Cell,
} from 'recharts';
import { AlertTriangle, TrendingDown, CheckCircle, Info } from 'lucide-react';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import { fundLedgers, projects, spendForecast, municipalities } from '../data/mockData';
import clsx from 'clsx';

function fmt(n: number) {
  return `₱${(n / 1_000_000).toFixed(2)}M`;
}

function pct(a: number, b: number) {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}

const FUND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

function UtilizationBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const p = pct(value, max);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-20 shrink-0 text-right">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-10 text-right">{p}%</span>
      <span className="text-xs text-slate-400 w-20 text-right">{fmt(value)}</span>
    </div>
  );
}

function AAODRow({ ledger, color }: { ledger: typeof fundLedgers[0]; color: string }) {
  const utilizationRate = pct(ledger.disbursement, ledger.appropriation);
  const oblRate = pct(ledger.obligation, ledger.appropriation);
  const isAtRisk = utilizationRate < 50 && ledger.appropriation > 5_000_000;

  return (
    <tr className={clsx('border-b border-slate-100 hover:bg-slate-50', isAtRisk && 'bg-amber-50/50')}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium text-slate-800">{ledger.fundSource}</span>
          {isAtRisk && <AlertTriangle size={12} className="text-amber-500" />}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-700">{fmt(ledger.appropriation)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-700">{fmt(ledger.allotment)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-700">{fmt(ledger.obligation)}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{fmt(ledger.disbursement)}</td>
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div className="h-full rounded-full bg-green-400" style={{ width: `${oblRate}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 w-8">{oblRate}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div
                className={clsx('h-full rounded-full', utilizationRate >= 70 ? 'bg-emerald-500' : utilizationRate >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-600 w-8">{utilizationRate}%</span>
          </div>
        </div>
      </td>
    </tr>
  );
}

const munBudgetData = municipalities.map(m => {
  const munProjects = projects.filter(p => p.municipalityId === m.id);
  const total = munProjects.reduce((s, p) => s + p.contractAmount, 0);
  return {
    name: m.name.length > 8 ? m.name.slice(0, 8) + '…' : m.name,
    total: +(total / 1_000_000).toFixed(2),
  };
}).filter(m => m.total > 0);

function AnomalyCard({ type, title, body }: { type: 'warning' | 'danger' | 'info' | 'success'; title: string; body: string }) {
  const styles = {
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle size={14} className="text-amber-500 mt-0.5" />, title: 'text-amber-700' },
    danger:  { bg: 'bg-red-50',   border: 'border-red-200',   icon: <TrendingDown size={14} className="text-red-500 mt-0.5" />,   title: 'text-red-700' },
    info:    { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: <Info size={14} className="text-blue-500 mt-0.5" />,          title: 'text-blue-700' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle size={14} className="text-emerald-500 mt-0.5" />, title: 'text-emerald-700' },
  };
  const s = styles[type];
  return (
    <div className={clsx('flex gap-3 p-3 rounded-lg border', s.bg, s.border)}>
      {s.icon}
      <div>
        <p className={clsx('text-xs font-semibold', s.title)}>{title}</p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function Budget() {
  const totalApprop  = fundLedgers.reduce((s, f) => s + f.appropriation, 0);
  const totalAllot   = fundLedgers.reduce((s, f) => s + f.allotment, 0);
  const totalOblg    = fundLedgers.reduce((s, f) => s + f.obligation, 0);
  const totalDisb    = fundLedgers.reduce((s, f) => s + f.disbursement, 0);
  const utilizationRate = pct(totalDisb, totalApprop);

  const waterfall = fundLedgers.map((f, i) => ({
    name: f.fundSource.length > 10 ? f.fundSource.slice(0, 10) + '…' : f.fundSource,
    Appropriation: +(f.appropriation / 1_000_000).toFixed(2),
    Obligation:    +(f.obligation / 1_000_000).toFixed(2),
    Disbursement:  +(f.disbursement / 1_000_000).toFixed(2),
    fill: FUND_COLORS[i % FUND_COLORS.length],
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Budget & Financial Management"
        subtitle="Appropriation → Allotment → Obligation → Disbursement tracking"
      />

      <main className="flex-1 p-6 space-y-5">
        {/* Top KPI Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Appropriation', value: fmt(totalApprop), sub: '7 fund sources', color: 'text-slate-800' },
            { label: 'Total Allotment',     value: fmt(totalAllot),  sub: `${pct(totalAllot, totalApprop)}% of approp.`, color: 'text-blue-700' },
            { label: 'Total Obligation',    value: fmt(totalOblg),   sub: `${pct(totalOblg, totalApprop)}% of approp.`,  color: 'text-violet-700' },
            { label: 'Total Disbursement',  value: fmt(totalDisb),   sub: `${utilizationRate}% utilization rate`,        color: 'text-emerald-700' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{k.label}</p>
              <p className={clsx('text-xl font-bold', k.color)}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Overall Utilization */}
        <Card title="Overall Budget Pipeline" subtitle="Appropriation → Allotment → Obligation → Disbursement">
          <div className="space-y-3">
            <UtilizationBar label="Allotment" value={totalAllot} max={totalApprop} color="#93c5fd" />
            <UtilizationBar label="Obligation" value={totalOblg} max={totalApprop} color="#8b5cf6" />
            <UtilizationBar label="Disbursement" value={totalDisb} max={totalApprop} color="#10b981" />
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
            <span>Base: {fmt(totalApprop)}</span>
            <span>Unobligated: {fmt(totalAllot - totalOblg)}</span>
            <span>Undisbursed: {fmt(totalOblg - totalDisb)}</span>
          </div>
        </Card>

        {/* AAOD Table + AI Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Fund Ledger — AAOD Tracking" subtitle="Obligation rate (top bar) · Disbursement rate (bottom bar)" className="lg:col-span-2" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fund Source</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Appropriation</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Allotment</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Obligation</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Disbursement</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {fundLedgers.map((ledger, i) => (
                    <AAODRow key={ledger.fundSource} ledger={ledger} color={FUND_COLORS[i % FUND_COLORS.length]} />
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">TOTAL</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-800">{fmt(totalApprop)}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">{fmt(totalAllot)}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">{fmt(totalOblg)}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">{fmt(totalDisb)}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-xs font-bold',
                        utilizationRate >= 70 ? 'text-emerald-600' : utilizationRate >= 50 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {utilizationRate}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* AI Anomaly Panel */}
          <Card title="AI Financial Insights" subtitle="Anomaly detection & forecasts">
            <div className="space-y-3">
              <AnomalyCard
                type="warning"
                title="Year-End Reversion Risk — SEF"
                body="SEF disbursement at 38.75%. At current rate, ₱2.32M risks reversion by Dec 31. Recommend accelerating school building completions."
              />
              <AnomalyCard
                type="danger"
                title="Budget-Accomplishment Mismatch"
                body="Multi-Purpose Bldg, Maddela: 66% of contract amount obligated but only 40% physical progress. Possible billing irregularity."
              />
              <AnomalyCard
                type="info"
                title="NTA Spend Forecast"
                body="AI projects NTA disbursement reaching ₱40.2M (89%) by Dec 2026. On track, but contingent on PRJ-001 completion."
              />
              <AnomalyCard
                type="success"
                title="GAD Budget On Track"
                body="GAD budget utilization at 69%. PRJ-007 completed. Remaining balance within expected year-end obligation range."
              />
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Budget by Fund Source" subtitle="Appropriation vs Obligation vs Disbursement (₱M)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={waterfall} barSize={14} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="M" />
                <Tooltip formatter={(v: any) => [`₱${v}M`, '']} />
                <Legend iconSize={9} formatter={v => <span className="text-xs">{v}</span>} />
                <Bar dataKey="Appropriation" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Obligation"    fill="#93c5fd" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Disbursement"  fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Budget Allocation by Municipality" subtitle="Total contract amounts per LGU (₱M)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={munBudgetData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="M" />
                <Tooltip formatter={(v: any) => [`₱${v}M`, '']} />
                <Bar dataKey="total" name="Contract Amount" radius={[4, 4, 0, 0]}>
                  {munBudgetData.map((_, i) => (
                    <Cell key={i} fill={FUND_COLORS[i % FUND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Spend Forecast */}
        <Card title="Cumulative Spend Forecast (FY 2026)" subtitle="AI projection through December 2026 — actual (blue) vs. forecast (amber dashed)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={spendForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₱${(v / 1_000_000).toFixed(0)}M`} />
              <Tooltip formatter={(v: any, name: any) => [`₱${(v / 1_000_000).toFixed(1)}M`, name]} />
              <Legend iconSize={10} formatter={v => <span className="text-xs">{v}</span>} />
              <Line type="monotone" dataKey="actual"   stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Actual Disbursement" connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4 }} name="AI Forecast" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </main>
    </div>
  );
}
