import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import {
  FolderKanban, CheckCircle, AlertTriangle, TrendingUp,
  Wallet, Target, Zap, BookOpen,
} from 'lucide-react';
import Header from '../components/common/Header';
import Card from '../components/common/Card';
import KPICard from '../components/dashboard/KPICard';
import AlertPanel from '../components/dashboard/AlertPanel';
import MunicipalityTable from '../components/dashboard/MunicipalityTable';
import {
  kpiSummary, alerts, fundLedgers, municipalityPerformance, spendForecast, executiveBriefing,
} from '../data/mockData';

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981',
  Ongoing:   '#3b82f6',
  Delayed:   '#f59e0b',
  Suspended: '#ef4444',
  Planned:   '#94a3b8',
};

const pieData = [
  { name: 'Completed', value: kpiSummary.completedProjects },
  { name: 'Ongoing',   value: kpiSummary.ongoingProjects },
  { name: 'Delayed',   value: kpiSummary.delayedProjects },
  { name: 'Suspended', value: kpiSummary.suspendedProjects },
  { name: 'Planned',   value: kpiSummary.plannedProjects },
];

const barData = municipalityPerformance.filter(m => m.totalProjects > 0).map(m => ({
  name: m.name.length > 10 ? m.name.slice(0, 10) + '…' : m.name,
  Planned: Math.round((m.avgAccomplishment + 8) * 1.15),
  Actual: m.avgAccomplishment,
}));

const fundBarData = fundLedgers.map(f => ({
  name: f.fundSource.length > 10 ? f.fundSource.slice(0, 10) + '…' : f.fundSource,
  Appropriation: +(f.appropriation / 1_000_000).toFixed(1),
  Obligation: +(f.obligation / 1_000_000).toFixed(1),
  Disbursement: +(f.disbursement / 1_000_000).toFixed(1),
}));

function PhpTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₱{p.value}M
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const utilizationPct = kpiSummary.budgetUtilizationRate;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Executive Dashboard"
        subtitle="Province of Quirino — Capital Projects Overview"
      />

      <main className="flex-1 p-6 space-y-6">
        {/* AI Briefing */}
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">AI Executive Briefing</p>
              <p
                className="text-sm text-blue-900 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: executiveBriefing.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                }}
              />
            </div>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Projects"
            value={kpiSummary.totalProjects}
            subtitle={`${kpiSummary.ongoingProjects} ongoing`}
            icon={<FolderKanban size={18} className="text-blue-600" />}
            iconBg="bg-blue-100"
            colorClass="text-blue-700"
            trend="neutral"
            trendLabel="FY 2025–2026"
          />
          <KPICard
            title="Budget Utilization"
            value={`${utilizationPct}%`}
            subtitle={`₱${(kpiSummary.totalDisbursed / 1_000_000).toFixed(1)}M of ₱${(kpiSummary.totalBudget / 1_000_000).toFixed(1)}M`}
            icon={<Wallet size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-100"
            colorClass="text-emerald-700"
            trend="up"
            trendLabel="+4.2% vs last quarter"
          />
          <KPICard
            title="Accomplishment Rate"
            value={`${kpiSummary.overallAccomplishment}%`}
            subtitle="Average across active projects"
            icon={<Target size={18} className="text-violet-600" />}
            iconBg="bg-violet-100"
            colorClass="text-violet-700"
            trend="down"
            trendLabel="−2.1% from target"
          />
          <KPICard
            title="At-Risk Projects"
            value={kpiSummary.atRiskProjects}
            subtitle="High + Critical risk"
            icon={<AlertTriangle size={18} className="text-red-600" />}
            iconBg="bg-red-100"
            colorClass="text-red-600"
            trend="up"
            trendLabel="Needs immediate action"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <KPICard
            title="Completed"
            value={kpiSummary.completedProjects}
            subtitle="Projects"
            icon={<CheckCircle size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-100"
            colorClass="text-emerald-700"
          />
          <KPICard
            title="Ongoing"
            value={kpiSummary.ongoingProjects}
            subtitle="Projects"
            icon={<TrendingUp size={18} className="text-blue-600" />}
            iconBg="bg-blue-100"
            colorClass="text-blue-700"
          />
          <KPICard
            title="Delayed"
            value={kpiSummary.delayedProjects}
            subtitle="Projects"
            icon={<AlertTriangle size={18} className="text-amber-600" />}
            iconBg="bg-amber-100"
            colorClass="text-amber-700"
          />
          <KPICard
            title="Suspended"
            value={kpiSummary.suspendedProjects}
            subtitle="Projects"
            icon={<BookOpen size={18} className="text-red-600" />}
            iconBg="bg-red-100"
            colorClass="text-red-700"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Project Status Pie */}
          <Card title="Project Status Mix" subtitle="By count, all municipalities">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} projects`, '']} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Municipality Comparison */}
          <Card title="Municipality Accomplishment" subtitle="Planned vs. actual physical progress (%)" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={12} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v: any) => [`${v}%`, '']} />
                <Legend iconSize={10} formatter={(v) => <span className="text-xs">{v}</span>} />
                <Bar dataKey="Planned" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Actual" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Spend Forecast + Fund Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card
            title="AI Spend Forecast"
            subtitle="Cumulative disbursement — actual vs. AI forecast (₱M)"
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={spendForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₱${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip content={<PhpTooltip />} />
                <Legend iconSize={10} formatter={v => <span className="text-xs">{v}</span>} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Actual"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 3 }}
                  name="AI Forecast"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Fund Utilization by Source" subtitle="Appropriation → Obligation → Disbursement (₱M)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fundBarData} layout="vertical" barSize={9} barGap={1}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} unit="M" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v: any) => [`₱${v}M`, '']} />
                <Legend iconSize={9} formatter={v => <span className="text-xs">{v}</span>} />
                <Bar dataKey="Appropriation" fill="#e2e8f0" radius={[0, 3, 3, 0]} />
                <Bar dataKey="Obligation"    fill="#93c5fd" radius={[0, 3, 3, 0]} />
                <Bar dataKey="Disbursement"  fill="#3b82f6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Municipality Table + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Province → Municipality View" subtitle="Drill-down summary" className="lg:col-span-2" noPadding>
            <div className="p-2">
              <MunicipalityTable />
            </div>
          </Card>
          <Card title="Risk & Alert Panel" subtitle={`${alerts.length} active alerts`}>
            <AlertPanel alerts={alerts} />
          </Card>
        </div>
      </main>
    </div>
  );
}
