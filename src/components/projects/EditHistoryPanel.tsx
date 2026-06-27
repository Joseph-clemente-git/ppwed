import { useState } from 'react';
import { Clock, Filter, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
// import type { EditHistoryEntry } from '../../types';
import { editHistory } from '../../data/projectWorkflowData';

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Financial:  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Timeline:   { bg: 'bg-blue-100',    text: 'text-blue-700' },
  Scope:      { bg: 'bg-violet-100',  text: 'text-violet-700' },
  Personnel:  { bg: 'bg-amber-100',   text: 'text-amber-700' },
  Status:     { bg: 'bg-red-100',     text: 'text-red-700' },
};

export default function EditHistoryPanel({ projectId }: { projectId: string }) {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const entries = editHistory
    .filter(e => e.projectId === projectId)
    .filter(e => categoryFilter === 'all' || e.category === categoryFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const categories = ['all', 'Financial', 'Timeline', 'Scope', 'Personnel', 'Status'];

  if (editHistory.filter(e => e.projectId === projectId).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Clock size={28} className="mb-2 opacity-40" />
        <p className="text-sm">No edit history for this project yet.</p>
        <p className="text-xs mt-1">Changes will be tracked here automatically.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={13} className="text-slate-400" />
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={clsx(
                'text-[10px] font-semibold px-2 py-1 rounded-full transition-colors',
                categoryFilter === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {entries.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-6">No entries match the selected filter.</p>
      )}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
        <div className="space-y-4">
          {entries.map(entry => {
            const catStyle = CATEGORY_COLORS[entry.category] ?? { bg: 'bg-slate-100', text: 'text-slate-600' };
            return (
              <div key={entry.id} className="flex gap-4 relative">
                {/* Timeline dot */}
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shrink-0 z-10">
                  <Clock size={12} className="text-slate-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', catStyle.bg, catStyle.text)}>
                        {entry.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(entry.timestamp).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Field changed: <span className="text-slate-900">{entry.field}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs bg-slate-50 rounded-lg p-2">
                    <span className="text-red-500 line-through">{entry.oldValue}</span>
                    <ArrowRight size={12} className="text-slate-400 shrink-0" />
                    <span className="text-emerald-600 font-medium">{entry.newValue}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    <strong>{entry.user}</strong> ({entry.role}) — {entry.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
