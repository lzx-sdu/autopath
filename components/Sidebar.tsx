import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, BarChart3, FileText, Car } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Car className="text-brand-500 w-8 h-8" />
        <div>
          <h1 className="font-bold text-white tracking-tight">AutoPath AI</h1>
          <p className="text-xs text-slate-500">DQN-RLPSO Planner</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/" className={navClass}>
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/simulation" className={navClass}>
          <PlayCircle size={20} />
          <span>Live Simulation</span>
        </NavLink>
        <NavLink to="/analysis" className={navClass}>
          <BarChart3 size={20} />
          <span>Analysis</span>
        </NavLink>
        <NavLink to="/theory" className={navClass}>
          <FileText size={20} />
          <span>Theory & Constraints</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">System Status</p>
          <div className="flex justify-between">
            <span>VANET:</span>
            <span className="text-green-400">Connected</span>
          </div>
          <div className="flex justify-between">
            <span>Algorithm:</span>
            <span className="text-brand-400">DQN-RLPSO</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;