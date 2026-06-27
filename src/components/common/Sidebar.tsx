import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  Map,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/projects', label: 'Project Monitoring', icon: FolderKanban },
  { to: '/budget', label: 'Budget & Finance', icon: Wallet },
  { to: '/gis', label: 'GIS Mapping', icon: Map },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-900 text-white flex flex-col z-40 shadow-xl">
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <MapPin size={16} className="text-white" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Province of</span>
        </div>
        <h1 className="text-base font-bold leading-tight text-white">Quirino</h1>
        <p className="text-xs text-slate-400 mt-0.5">Project Monitoring & Executive Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">PG</div>
          <div>
            <p className="text-xs font-medium text-white">Provincial Governor</p>
            <p className="text-xs text-slate-400">Executive Office</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
