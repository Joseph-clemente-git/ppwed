import { municipalityPerformance } from '../../data/mockData';
import clsx from 'clsx';

function ProgressBar({ value, color = 'bg-blue-500' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-700 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function MunicipalityTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Municipality</th>
            <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Projects</th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">Accomplishment</th>
            <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">At Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {municipalityPerformance.map(m => (
            <tr key={m.municipalityId} className="hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-3 font-medium text-slate-800">{m.name}</td>
              <td className="py-2.5 px-3 text-center text-slate-600">{m.totalProjects}</td>
              <td className="py-2.5 px-3 text-right text-slate-600">
                {m.totalBudget > 0 ? `₱${(m.totalBudget / 1_000_000).toFixed(1)}M` : '—'}
              </td>
              <td className="py-2.5 px-3">
                {m.totalProjects > 0 ? (
                  <ProgressBar
                    value={m.avgAccomplishment}
                    color={m.avgAccomplishment >= 70 ? 'bg-emerald-500' : m.avgAccomplishment >= 40 ? 'bg-amber-500' : 'bg-red-500'}
                  />
                ) : (
                  <span className="text-xs text-slate-400">No projects</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-center">
                {m.atRisk > 0 ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                    {m.atRisk}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
