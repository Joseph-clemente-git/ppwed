import { useState } from 'react';
import { CheckCircle, Circle, Paperclip, Lock, Unlock } from 'lucide-react';
import clsx from 'clsx';
import type { ClosureItem } from '../../types';
import { closureChecklists } from '../../data/projectWorkflowData';

const CATEGORY_ICONS: Record<string, string> = {
  Inspection:    '🔍',
  Financial:     '💰',
  Documentation: '📄',
};

const CATEGORY_ORDER: ClosureItem['category'][] = ['Inspection', 'Documentation', 'Financial'];

interface Props {
  projectId: string;
}

export default function ClosureChecklist({ projectId }: Props) {
  const initialItems = closureChecklists[projectId];
  const [items, setItems] = useState<ClosureItem[]>(initialItems ?? []);

  if (!initialItems) {
    return (
      <div className="flex flex-col items-center py-10 text-slate-400">
        <Lock size={28} className="mb-2 opacity-40" />
        <p className="text-sm">Closure checklist not yet initialized.</p>
        <p className="text-xs mt-1">Generated when project reaches final stage.</p>
      </div>
    );
  }

  function toggle(id: string) {
    setItems(prev => prev.map(item =>
      item.id !== id ? item : {
        ...item,
        completed: !item.completed,
        completedBy: !item.completed ? 'Current User (Demo)' : undefined,
        completedAt: !item.completed ? new Date().toISOString().split('T')[0] : undefined,
      }
    ));
  }

  const requiredItems = items.filter(i => i.required);
  const requiredDone  = requiredItems.filter(i => i.completed).length;
  const allDone       = requiredItems.every(i => i.completed);
  const pct           = requiredItems.length > 0 ? Math.round((requiredDone / requiredItems.length) * 100) : 0;

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    items: items.filter(i => i.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-5">
      {/* Progress summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-700">Closure Progress (required items)</p>
          <span className={clsx('text-xs font-bold', allDone ? 'text-emerald-600' : 'text-slate-600')}>
            {requiredDone}/{requiredItems.length} — {pct}%
          </span>
        </div>
        <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', allDone ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500')}
            style={{ width: `${pct}%` }}
          />
        </div>
        {allDone ? (
          <div className="flex items-center gap-1.5 mt-2">
            <Unlock size={12} className="text-emerald-600" />
            <p className="text-xs text-emerald-600 font-semibold">All required items complete — project can be marked Completed</p>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-2">
            <Lock size={12} className="text-amber-500" />
            <p className="text-xs text-amber-600">Complete all required items to unlock the "Mark Completed" action</p>
          </div>
        )}
      </div>

      {/* Checklist by category */}
      {grouped.map(({ category, items: catItems }) => (
        <div key={category}>
          <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-2">
            <span>{CATEGORY_ICONS[category]}</span>
            <span>{category}</span>
          </p>
          <div className="space-y-2">
            {catItems.map(item => (
              <div
                key={item.id}
                className={clsx(
                  'border rounded-xl p-3 transition-colors',
                  item.completed ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggle(item.id)}
                    className="shrink-0 mt-0.5"
                  >
                    {item.completed
                      ? <CheckCircle size={18} className="text-emerald-500" />
                      : <Circle size={18} className="text-slate-300 hover:text-slate-400" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={clsx('text-xs font-medium', item.completed ? 'text-slate-500 line-through' : 'text-slate-800')}>
                        {item.label}
                      </p>
                      {item.required && (
                        <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">REQUIRED</span>
                      )}
                    </div>
                    {item.completed && (
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-emerald-600">
                          ✓ {item.completedBy} · {item.completedAt}
                        </p>
                        {item.attachmentName && (
                          <button className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                            <Paperclip size={9} /> {item.attachmentName}
                          </button>
                        )}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-slate-500 mt-1 italic">{item.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Mark complete button */}
      <button
        disabled={!allDone}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
          allDone
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        )}
      >
        <CheckCircle size={16} />
        Mark Project as Completed
      </button>
    </div>
  );
}
