import clsx from 'clsx';
import {
  Map, MapPin, Route, Waves, TriangleAlert, Zap, CircleDot,
  Flame, BarChart3, Crosshair, SlidersHorizontal,
} from 'lucide-react';
import type { LayerState, FilterState } from './GISMapCanvas';
import { projects } from '../../data/mockData';

interface Props {
  layers: LayerState;
  onLayer: (key: keyof LayerState, value: boolean) => void;
  filters: FilterState;
  onFilter: (key: keyof FilterState, value: string) => void;
}

type LayerDef = { key: keyof LayerState; label: string; icon: React.ComponentType<any>; color: string };

const layerGroups: { title: string; items: LayerDef[] }[] = [
  {
    title: 'Base',
    items: [
      { key: 'adminBoundaries', label: 'Admin Boundaries', icon: Map,    color: 'text-green-500' },
      { key: 'projects',        label: 'Project Pins',     icon: MapPin,  color: 'text-slate-500' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { key: 'roads',     label: 'Roads & Bridges',       icon: Route,     color: 'text-gray-600' },
      { key: 'catchment', label: 'Beneficiary Catchment', icon: CircleDot, color: 'text-cyan-500' },
    ],
  },
  {
    title: 'Hazard Overlays',
    items: [
      { key: 'flood',     label: 'Flood Zones',    icon: Waves,         color: 'text-green-600' },
      { key: 'landslide', label: 'Landslide Zones', icon: TriangleAlert, color: 'text-amber-500' },
      { key: 'seismic',   label: 'Seismic / Fault', icon: Zap,          color: 'text-red-500' },
    ],
  },
  {
    title: 'Heatmaps',
    items: [
      { key: 'fundHeatmap',            label: 'Fund Density',      icon: Flame,    color: 'text-indigo-500' },
      { key: 'accomplishmentHeatmap',  label: 'Accomplishment Rate', icon: BarChart3, color: 'text-emerald-500' },
    ],
  },
  {
    title: 'AI Layers',
    items: [
      { key: 'geomismatch', label: 'Geotag Mismatch', icon: Crosshair, color: 'text-red-500' },
    ],
  },
];

const statusOptions = ['all', 'planned', 'ongoing', 'delayed', 'completed', 'suspended'];
const fundOptions   = ['all', 'NTA', '20% Dev Fund', 'SEF', 'LDRRMF', 'GAD', 'Provincial General Fund', 'Loan/Grant'];
const sectorOptions = ['all', ...Array.from(new Set(projects.map(p => p.sector)))];

const STATUS_DOT: Record<string, string> = {
  planned: 'bg-slate-400', ongoing: 'bg-green-500', delayed: 'bg-amber-500',
  completed: 'bg-emerald-500', suspended: 'bg-red-500',
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-8 h-4 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-green-500' : 'bg-slate-300'
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export default function GISFilterPanel({ layers, onLayer, filters, onFilter }: Props) {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin bg-white border-r border-slate-200">
      {/* Layer Controls */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Map Layers</p>
        {layerGroups.map(group => (
          <div key={group.title} className="mb-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{group.title}</p>
            <div className="space-y-1.5">
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => onLayer(item.key, !layers[item.key])}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={item.color} />
                      <span className="text-xs text-slate-700">{item.label}</span>
                    </div>
                    <Toggle checked={layers[item.key]} onChange={v => onLayer(item.key, v)} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Project Filters */}
      <div className="px-4 pt-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 mb-3">
          <SlidersHorizontal size={12} className="text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Filters</p>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Status</label>
            <select
              value={filters.status}
              onChange={e => onFilter('status', e.target.value)}
              className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Fund Source</label>
            <select
              value={filters.fund}
              onChange={e => onFilter('fund', e.target.value)}
              className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fundOptions.map(f => <option key={f} value={f}>{f === 'all' ? 'All Funds' : f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Sector</label>
            <select
              value={filters.sector}
              onChange={e => onFilter('sector', e.target.value)}
              className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sectorOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pt-3 pb-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Legend</p>
        <div className="space-y-1.5">
          {statusOptions.filter(s => s !== 'all').map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={clsx('w-3 h-3 rounded-full border-2 border-white shadow', STATUS_DOT[s])} />
              <span className="text-xs text-slate-600 capitalize">{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-1.5 rounded bg-slate-800" />
            <span className="text-xs text-slate-500">National Highway</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-1 rounded bg-indigo-500" />
            <span className="text-xs text-slate-500">Provincial Road</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-1 rounded bg-amber-700" style={{ borderTop: '2px dashed #a16207', height: 0 }} />
            <span className="text-xs text-slate-500">Farm-to-Market</span>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { color: 'bg-green-400/60', label: 'Flood Zone' },
            { color: 'bg-amber-300/60', label: 'Landslide Zone' },
            { color: 'bg-red-300/50', label: 'Seismic / Fault' },
            { color: 'bg-cyan-400/40', label: 'Catchment Area' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={clsx('w-8 h-3 rounded', l.color)} />
              <span className="text-xs text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <span className="text-xs text-slate-500">AI Mismatch (detected site)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500 ring-2 ring-violet-300" />
            <span className="text-xs text-slate-500">Ghost-flagged project</span>
          </div>
        </div>
      </div>
    </div>
  );
}
