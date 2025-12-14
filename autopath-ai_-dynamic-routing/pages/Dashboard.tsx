import React from 'react';
import { Target, ShieldCheck, Activity, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Project Overview</h2>
        <p className="text-slate-400 text-lg">
          Dynamic Path Planning for Autonomous Vehicles Based on Real-Time Congestion Avoidance (DQN-RLPSO)
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Real-time Response</h3>
          <p className="text-slate-400 text-sm">
            Real-time updates of road network weights (9x9 grid) based on VANET data, effectively addressing 40% of delays caused by sudden congestion.
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 mb-4">
            <Target size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Multi-Constraint Synergy</h3>
          <p className="text-slate-400 text-sm">
            Optimization goals include: Path integrity, loop-free, reasonable travel time, and <strong className="text-green-400">stability soft constraint</strong> mechanisms.
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-4">
            <Activity size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">DQN-RLPSO Algorithm</h3>
          <p className="text-slate-400 text-sm">
            Combines DQN's decision-making capability with RLPSO's global search advantage to achieve dynamic optimality in complex environments.
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Safety & Experience</h3>
          <p className="text-slate-400 text-sm">
            By introducing a penalty function mechanism, it maximizes efficiency while minimizing passenger dizziness caused by frequent lane changes and sudden stops.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Core Pain Points Resolved</h3>
          <ul className="space-y-4 text-slate-300">
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
              <span>
                <strong className="text-white">Conflict 1:</strong> Real-time avoidance vs. Path stability. Frequent path changes degrade passenger experience.
                <br/><span className="text-xs text-slate-500">Solution: Introduce Cost + Penalty soft constraints, changing lanes only when benefits are significant.</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
              <span>
                <strong className="text-white">Conflict 2:</strong> Multi-constraints vs. Real-time algorithms. Traditional algorithms struggle to handle complex constraints in milliseconds.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Expected Outcomes</h3>
          <ul className="space-y-4 text-slate-300">
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <span>Reduce travel delays caused by sudden congestion by <strong className="text-white">over 20%</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <span>Establish a standardized four-dimensional evaluation system of "Efficiency-Experience-Safety-Constraints".</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;