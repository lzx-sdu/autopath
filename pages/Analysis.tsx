import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Analysis: React.FC = () => {
  // Data simulated from the proposal's expected outcomes (Matched to Paper Table 2)
  const timeComparisonData = [
    { name: 'Normal', Traditional: 18.2, Proposed: 13.1 },
    { name: 'Peak', Traditional: 35.7, Proposed: 25.6 },
    { name: 'Extreme', Traditional: 52.3, Proposed: 30.1 },
  ];

  const satisfactionData = [
    { name: 'Scenario A', 'Path Changes': 0, 'User Satisfaction': 95 },
    { name: 'Scenario B', 'Path Changes': 1, 'User Satisfaction': 88 },
    { name: 'Scenario C', 'Path Changes': 3, 'User Satisfaction': 45 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto h-screen pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Performance Analysis</h2>
        <p className="text-slate-400">
          Comparative analysis of the DQN-RLPSO algorithm against traditional static planning methods (A* Baseline).
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Travel Time Reduction */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Total Travel Time (minutes)</h3>
          {/* Explicit height and width style to prevent Recharts resize warning */}
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={timeComparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Legend />
                <Bar dataKey="Traditional" fill="#64748b" name="Static A* (Baseline)" />
                <Bar dataKey="Proposed" fill="#0ea5e9" name="Dynamic DQN-RLPSO" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            The proposed algorithm demonstrates a <strong className="text-green-400">28.2%</strong> average reduction in travel time during congestion events by dynamically rerouting while respecting constraints.
          </p>
        </div>

        {/* User Experience / Constraints */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">User Experience vs. Path Changes</h3>
          <div style={{ width: '100%', height: 300 }}>
             <ResponsiveContainer>
              <LineChart data={satisfactionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="User Satisfaction" stroke="#22c55e" strokeWidth={2} />
                <Line type="step" dataKey="Path Changes" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            Soft constraints prevent excessive rerouting. Data shows satisfaction drops significantly when path changes exceed acceptable limits.
          </p>
        </div>
      </div>

      {/* Constraints Table */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Multi-Constraint System Evaluation</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-100 uppercase font-bold">
              <tr>
                <th className="p-3">Metric</th>
                <th className="p-3">Constraint Formula</th>
                <th className="p-3">Threshold</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td className="p-3">Path Integrity</td>
                <td className="p-3 font-mono">A ∈ P(t), B ∈ P(t)</td>
                <td className="p-3">Continuous</td>
                <td className="p-3 text-green-400">Satisfied</td>
              </tr>
              <tr>
                <td className="p-3">Reasonable Time</td>
                <td className="p-3 font-mono">d_ij / v_lim ≤ t_ij ≤ d_ij / v_min</td>
                <td className="p-3">v_min = 5km/h</td>
                <td className="p-3 text-green-400">Satisfied</td>
              </tr>
              <tr>
                <td className="p-3">Loop Free</td>
                <td className="p-3 font-mono">m ≠ n ⇒ v_m ≠ v_n</td>
                <td className="p-3">0 Loops</td>
                <td className="p-3 text-green-400">Satisfied</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-400 font-bold">Switching Cost</td>
                <td className="p-3 font-mono text-blue-400 font-bold">T_new + Penalty &lt; T_old</td>
                <td className="p-3">Penalty = 1.5m, Improv &gt; 20%</td>
                <td className="p-3 text-green-400">Satisfied (Soft)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analysis;