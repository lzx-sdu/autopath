import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Zap, MapPin, Navigation, Siren, MousePointerClick, Settings, Scale, Activity } from 'lucide-react';
import { NODES, INITIAL_EDGES } from '../constants';
import { Edge, SimulationLog, SimulationMetrics, Node } from '../types';

// *****************************************************************************
// ALGORITHM 1: IMPROVED A* (Global Path Planning)
// Reference: Paper Section 2.3.1
// Description: Calculates the optimal path considering dynamic weights, turn penalties, and road levels.
// *****************************************************************************
const findBestPath = (startId: string, endId: string, currentEdges: Edge[], nodes: Node[]): { path: string[], time: number } | null => {
  // [A* Component 1] Heuristic Function h(n)
  // Logic: Manhattan distance estimated time (Paper Eq. 7)
  const heuristic = (id: string) => {
    const n = nodes.find(node => node.id === id);
    const target = nodes.find(node => node.id === endId);
    if (!n || !target) return 0;
    
    // Simple calc: Pixel dist / 100 to km, assume avg highway 60km/h (1km/min)
    const dx = Math.abs(n.x - target.x);
    const dy = Math.abs(n.y - target.y);
    const distKm = (dx + dy) / 100;
    return distKm; // Rough estimate in minutes
  };

  // Initialize A* data structures
  const openSet = new Set<string>([startId]);
  const cameFrom: Record<string, string> = {}; // For path backtracking
  
  // gScore: Actual cost from start
  const gScore: Record<string, number> = {};
  nodes.forEach(n => gScore[n.id] = Infinity);
  gScore[startId] = 0;

  // fScore: gScore + hScore
  const fScore: Record<string, number> = {};
  nodes.forEach(n => fScore[n.id] = Infinity);
  fScore[startId] = heuristic(startId);

  // Helper: Determine if connection is horizontal or vertical
  const getDirection = (fromId: string, toId: string) => {
      const n1 = nodes.find(n => n.id === fromId);
      const n2 = nodes.find(n => n.id === toId);
      if (!n1 || !n2) return 'none';
      if (Math.abs(n1.x - n2.x) > Math.abs(n1.y - n2.y)) return 'horizontal';
      return 'vertical';
  };

  while (openSet.size > 0) {
    // Find node with lowest fScore in openSet
    let current = Array.from(openSet).reduce((a, b) => (fScore[a] < fScore[b] ? a : b));

    if (current === endId) {
      // Reconstruct path
      const totalPath = [current];
      while (current in cameFrom) {
        current = cameFrom[current];
        totalPath.unshift(current);
      }
      return { path: totalPath, time: gScore[endId] };
    }

    openSet.delete(current);

    // Get neighbors
    const neighbors = currentEdges.filter(e => e.source === current || e.target === current);

    for (const edge of neighbors) {
      const neighborId = edge.source === current ? edge.target : edge.source;
      
      // [A* Component 2] Dynamic Weight Calculation w_ij (Paper Eq. 1 & 6)
      // Logic: Integrates Real Speed, Traffic Lights, Turn Penalty, and Road Level.
      const targetNode = nodes.find(n => n.id === neighborId);
      
      // A. Base travel time = Length / Real-time speed
      const speed = Math.max(0.1, edge.currentSpeed);
      const baseTime = (edge.length / speed) * 60; // minutes

      // B. Traffic light penalty
      const lightPenalty = targetNode?.lightStatus === 'red' ? 0.5 : 0; // Red light penalty 0.5 min

      // C. Turn penalty (K_turn): Add cost if direction changes (Paper: 0.15 min)
      let turnPenalty = 0;
      const prevId = cameFrom[current];
      if (prevId) {
          const prevDir = getDirection(prevId, current);
          const currDir = getDirection(current, neighborId);
          if (prevDir !== currDir) {
              turnPenalty = 0.15; 
          }
      }

      // D. Road level preference (K_level): Prefer highways (limit 60)
      // Paper: Lower coefficient for highways, higher for local roads
      const roadLevelFactor = edge.limit >= 60 ? 1.0 : 1.2; 

      // Comprehensive cost calculation
      const tentativeGScore = gScore[current] + (baseTime + lightPenalty + turnPenalty) * roadLevelFactor;

      if (tentativeGScore < gScore[neighborId]) {
        cameFrom[neighborId] = current;
        gScore[neighborId] = tentativeGScore;
        fScore[neighborId] = gScore[neighborId] + heuristic(neighborId);
        openSet.add(neighborId);
      }
    }
  }

  return null; // Unreachable
};

const Simulation: React.FC = () => {
  // --- State Management ---
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [nodes, setNodes] = useState<Node[]>(NODES);
  
  // Default start 1 (Top-left), End 81 (Bottom-right)
  const [startNode, setStartNode] = useState<string>('1');
  const [endNode, setEndNode] = useState<string>('81');
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [carNodeIndex, setCarNodeIndex] = useState(0); 
  const [progressBetweenNodes, setProgressBetweenNodes] = useState(0); 
  const [isWaitingForLight, setIsWaitingForLight] = useState(false); // New: Waiting for red light status
  
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  
  // --- New Constraint Params: Penalty Weight ---
  const [penaltyWeight, setPenaltyWeight] = useState<number>(1.5); // Default 1.5 min penalty

  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    totalTime: 0,
    pathChanges: 0,
    distanceTraveled: 0,
    currentConstraint: 'Satisfied'
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setLogs(prev => [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), message, type }, ...prev].slice(100));
  };

  // *****************************************************************************
  // ALGORITHM 2: DYNAMIC ENVIRONMENT ENGINE
  // Reference: Paper Section 4.2
  // Description: Simulates traffic flux, congestion updates, and signal light changes.
  // *****************************************************************************
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        // A. Random traffic light toggle (Frequency increased to 30% to prevent deadlocks)
        setNodes(prev => prev.map(n => {
            if (Math.random() > 0.7) { 
                return { ...n, lightStatus: n.lightStatus === 'green' ? 'red' : 'green' };
            }
            return n;
        }));

        // B. Global Traffic Flux (Gaussian Noise Simulation)
        setEdges(prev => prev.map(e => {
            if (e.congested) return e; 

            const flux = (Math.random() - 0.5) * 15; 
            let newSpeed = e.baseSpeed + flux;
            newSpeed = Math.max(5, Math.min(e.limit, newSpeed));
            
            if (Math.random() > 0.95) newSpeed = Math.max(5, e.baseSpeed * 0.2);

            return { ...e, currentSpeed: Math.floor(newSpeed) };
        }));

    }, 1500); 

    return () => clearInterval(interval);
  }, [isPlaying]);

  // *****************************************************************************
  // ALGORITHM 3: DQN-RLPSO DECISION AGENT & SOFT CONSTRAINT MECHANISM
  // Reference: Paper Section 2.2.2 (DQN Decision) & 3.2 (Soft Constraint)
  // Description: Handles the "Decision-Planning" loop. DQN decides *when* to reroute,
  // RLPSO/A* plans *where* to go. The Soft Constraint logic (Penalty) filters out oscillation.
  // *****************************************************************************
  useEffect(() => {
    // Initial Planning
    if (!isPlaying) {
        const result = findBestPath(startNode, endNode, edges, nodes);
        if (result) {
            setCurrentPath(result.path);
            setEstimatedTime(result.time);
            setCarNodeIndex(0);
            setProgressBetweenNodes(0);
        }
        return;
    }

    // Real-time re-planning logic
    const currentNode = currentPath[carNodeIndex];
    if (currentNode && currentNode !== endNode) {
         const newRouteFromHere = findBestPath(currentNode, endNode, edges, nodes);
         
         if (newRouteFromHere) {
             const oldPathStr = currentPath.slice(carNodeIndex).join(',');
             const newPathStr = newRouteFromHere.path.join(',');
             
             if (oldPathStr !== newPathStr) {
                 // --- Core Soft Constraint Logic (Penalty-based) ---
                 // Formula: Net Benefit = (T_old - T_new) - Penalty
                 const oldRemainingTime = Math.max(0.1, estimatedTime - metrics.totalTime);
                 const newRemainingTime = newRouteFromHere.time;
                 const rawTimeSaved = oldRemainingTime - newRemainingTime;
                 
                 // Net Benefit Calculation
                 const netBenefit = rawTimeSaved - penaltyWeight;
                 const relativeImprovement = rawTimeSaved / oldRemainingTime;

                 // Decision Threshold: Net Benefit > 0 && Relative Improvement > 20%
                 // This effectively suppresses "Path Oscillation" (Paper Section 3.2.3)
                 const shouldReroute = netBenefit > 0 && relativeImprovement > 0.2;

                 if (shouldReroute) {
                    const fullNewPath = [...currentPath.slice(0, carNodeIndex), ...newRouteFromHere.path];
                    
                    addLog(`DQN-RLPSO: Triggered Reroute | Saved: ${rawTimeSaved.toFixed(1)}m | Net Benefit: ${netBenefit.toFixed(1)}m`, 'success');
                    setCurrentPath(fullNewPath);
                    setMetrics(m => ({ ...m, pathChanges: m.pathChanges + 1 }));
                    setEstimatedTime(metrics.totalTime + newRemainingTime);
                 }
             }
         }
    }
  }, [edges, isPlaying, nodes, penaltyWeight, startNode, endNode]);

  // --- 3. Vehicle Movement Loop ---
  useEffect(() => {
    if (!isPlaying) return;

    const tickRate = 50; 
    const timer = setInterval(() => {
        if (carNodeIndex >= currentPath.length - 1) {
            setIsPlaying(false);
            addLog(`Destination Reached! Total Time: ${metrics.totalTime.toFixed(1)} min`, 'success');
            return;
        }

        const u = currentPath[carNodeIndex];
        const v = currentPath[carNodeIndex + 1];
        
        const edge = edges.find(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
        
        if (!edge) {
            setIsPlaying(false);
            addLog("Error: Path connectivity lost", 'error');
            return;
        }

        const speed = edge.currentSpeed; 
        const length = edge.length;
        const step = (speed / length) * 0.005; 

        const targetNodeObj = nodes.find(n => n.id === v);
        
        // --- Red Light Logic Optimization ---
        // If red light ahead and close to intersection (> 85%), stop moving
        if (targetNodeObj?.lightStatus === 'red' && progressBetweenNodes > 0.85) {
             setIsWaitingForLight(true); // Set waiting status
             setMetrics(m => ({ ...m, totalTime: m.totalTime + 0.05 })); 
             return; 
        }
        
        setIsWaitingForLight(false); // Normal driving, clear waiting status

        let newProgress = progressBetweenNodes + step;

        if (newProgress >= 1) {
            setCarNodeIndex(prev => prev + 1);
            setProgressBetweenNodes(0);
        } else {
            setProgressBetweenNodes(newProgress);
        }

        setMetrics(m => ({
            ...m,
            totalTime: m.totalTime + 0.02, 
            distanceTraveled: m.distanceTraveled + (step * length)
        }));

    }, tickRate);

    return () => clearInterval(timer);
  }, [isPlaying, carNodeIndex, progressBetweenNodes, currentPath, edges, nodes]);

  // --- Interaction Handling ---
  const handleNodeClick = (id: string) => {
      if (selectionMode === 'start') {
          setStartNode(id);
          setSelectionMode(null);
          addLog(`Start set to: Node ${id}`);
          handleReset();
      } else if (selectionMode === 'end') {
          setEndNode(id);
          setSelectionMode(null);
          addLog(`End set to: Node ${id}`);
          handleReset();
      }
  };

  const triggerCongestion = (edgeId: string, speed: number, reason: string) => {
      setEdges(prev => prev.map(e => {
          if (e.id === edgeId) {
              return { ...e, currentSpeed: speed, congested: true };
          }
          return e;
      }));
      addLog(`VANET Alert: ${reason} (Edge ${edgeId}), Speed dropped to ${speed}km/h`, 'error');
  };

  const handleReset = () => {
      setIsPlaying(false);
      setCarNodeIndex(0);
      setProgressBetweenNodes(0);
      setIsWaitingForLight(false);
      setMetrics({ totalTime: 0, pathChanges: 0, distanceTraveled: 0, currentConstraint: 'Satisfied' });
      setEdges(INITIAL_EDGES); 
      addLog("Simulation reset");
  };

  // --- Drawing & Rendering ---
  const getCarCoords = () => {
      if (currentPath.length === 0) return { x: 0, y: 0 };
      const uId = currentPath[carNodeIndex];
      const vId = currentPath[carNodeIndex + 1] || uId;
      
      const u = nodes.find(n => n.id === uId)!;
      const v = nodes.find(n => n.id === vId)!;

      return {
          x: u.x + (v.x - u.x) * progressBetweenNodes,
          y: u.y + (v.y - u.y) * progressBetweenNodes
      };
  };

  const carCoords = getCarCoords();

  const getEdgeColor = (edge: Edge, isPath: boolean) => {
      if (isPath) return '#3b82f6'; 
      const ratio = edge.currentSpeed / edge.baseSpeed;
      if (ratio > 0.7) return '#22c55e'; 
      if (ratio > 0.3) return '#eab308'; 
      return '#ef4444'; 
  };

  return (
    <div className="flex h-screen pt-4 pb-4 pr-4 bg-slate-950">
        <div className="flex-1 flex flex-col gap-4">
            
            {/* Top Control Bar */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center shadow-lg">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Navigation className="text-brand-500" />
                        Smart Dynamic Grid Simulation (9x9 Grid)
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Route: <span className="text-white font-mono bg-slate-700 px-1 rounded">{startNode}</span> → <span className="text-white font-mono bg-slate-700 px-1 rounded">{endNode}</span>
                        <span className="mx-2 text-slate-600">|</span>
                        Est. Time: <span className="text-brand-400 font-mono">{estimatedTime.toFixed(1)} min</span>
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => setSelectionMode(selectionMode === 'start' ? null : 'start')}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${selectionMode === 'start' ? 'bg-green-500/20 border-green-500 text-green-400 animate-pulse' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                    >
                        <MapPin size={14} className="inline mr-1" /> Set Start
                    </button>
                    <button 
                        onClick={() => setSelectionMode(selectionMode === 'end' ? null : 'end')}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${selectionMode === 'end' ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                    >
                        <MapPin size={14} className="inline mr-1" /> Set End
                    </button>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            if (!isPlaying && carNodeIndex === 0) addLog("Simulation started...", 'info');
                            setIsPlaying(!isPlaying);
                        }}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-lg transition transform active:scale-95 ${isPlaying ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-brand-600 hover:bg-brand-500 text-white'}`}
                    >
                        <Play size={18} fill="currentColor" />
                        {isPlaying ? 'Pause' : 'Start'}
                    </button>
                    <button 
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-inner group">
                {(selectionMode) && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-bounce shadow-lg">
                        <MousePointerClick size={16} /> Click map to select node
                    </div>
                )}

                <svg width="100%" height="100%" viewBox="0 0 800 600" className="w-full h-full select-none cursor-crosshair">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {edges.map(edge => {
                        const start = nodes.find(n => n.id === edge.source)!;
                        const end = nodes.find(n => n.id === edge.target)!;
                        
                        let isPath = false;
                        for(let i=0; i<currentPath.length-1; i++) {
                            if ((currentPath[i] === edge.source && currentPath[i+1] === edge.target) || 
                                (currentPath[i] === edge.target && currentPath[i+1] === edge.source)) {
                                isPath = true;
                            }
                        }

                        const strokeColor = getEdgeColor(edge, isPath);
                        const strokeWidth = isPath ? 4 : 2;
                        const opacity = isPath ? 1 : 0.4;

                        return (
                            <line 
                                key={edge.id}
                                x1={start.x} y1={start.y} 
                                x2={end.x} y2={end.y} 
                                stroke={strokeColor} 
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                opacity={opacity}
                                className="transition-colors duration-700"
                            />
                        );
                    })}

                    {nodes.map(node => {
                        const isStart = node.id === startNode;
                        const isEnd = node.id === endNode;
                        const isSelected = isStart || isEnd;
                        
                        let fill = '#1e293b';
                        if (isStart) fill = '#22c55e';
                        else if (isEnd) fill = '#ef4444';
                        
                        // Traffic light visualization
                        const isRed = node.lightStatus === 'red';

                        return (
                            <g 
                                key={node.id} 
                                onClick={() => handleNodeClick(node.id)}
                                className="cursor-pointer hover:opacity-100 transition-opacity"
                                style={{ opacity: isSelected ? 1 : 0.8 }}
                            >
                                {/* Transparent hit area to fix selection issues */}
                                <circle 
                                    cx={node.x} cy={node.y} r={20} 
                                    fill="transparent" 
                                />

                                {/* Traffic Light Ring */}
                                {isPlaying && (
                                    <circle 
                                        cx={node.x} cy={node.y} r={isSelected ? 10 : 6}
                                        fill="none"
                                        stroke={isRed ? '#ef4444' : '#22c55e'}
                                        strokeWidth="2"
                                        className="transition-colors duration-300"
                                    />
                                )}
                                <circle 
                                    cx={node.x} cy={node.y} r={isSelected ? 6 : 3} 
                                    fill={fill}
                                />
                                {(isSelected || parseInt(node.id) % 10 === 1) && (
                                    <text x={node.x} y={node.y - 12} textAnchor="middle" fill="#94a3b8" className="text-[10px] font-mono pointer-events-none">
                                        {node.id}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {currentPath.length > 0 && (
                        <motion.g 
                            animate={{ x: carCoords.x, y: carCoords.y }}
                            transition={{ type: "tween", ease: "linear", duration: 0.05 }}
                            className="pointer-events-none" /* Prevent vehicle from blocking click events */
                        >
                            <circle r="6" fill="#3b82f6" stroke="white" strokeWidth="2" filter="url(#glow)" />
                            
                            {/* Waiting for red light bubble */}
                            {isWaitingForLight && (
                                <g transform="translate(0, -20)">
                                    <rect x="-35" y="-10" width="70" height="20" rx="4" fill="#ef4444" />
                                    <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                                        WAITING 🚦
                                    </text>
                                    <polygon points="-4,10 4,10 0,16" fill="#ef4444" />
                                </g>
                            )}
                        </motion.g>
                    )}
                </svg>

                <div className="absolute bottom-4 left-4 bg-slate-900/90 p-3 rounded-lg text-xs space-y-2 border border-slate-700 shadow-lg backdrop-blur z-10">
                    <div className="font-bold text-slate-400 mb-1 border-b border-slate-700 pb-1">Legend</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 bg-green-500 rounded"></div> Free Flow (&gt;70%)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 bg-yellow-500 rounded"></div> Sluggish (30-70%)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 bg-red-500 rounded"></div> Congested (&lt;30%)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-green-500"></div> Green (Go)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-red-500"></div> Red (Stop)</div>
                </div>
            </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex flex-col gap-4">
            
            {/* Soft Constraint Settings */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Settings size={16} className="text-brand-400" />
                    Constraint Settings (Penalty Mode)
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Stability Penalty Weight</span>
                            <span className="text-white font-mono">{penaltyWeight.toFixed(1)} min</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="5" 
                            step="0.1"
                            value={penaltyWeight}
                            onChange={(e) => setPenaltyWeight(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1 flex items-start gap-1">
                            <Scale size={10} className="mt-0.5" />
                            Logic: Reroute only if (TimeSaved - Penalty &gt; 0) AND (Improvement &gt; 20%).
                        </p>
                    </div>
                </div>
            </div>

            {/* Real-time Dashboard */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
                <h3 className="text-white font-semibold mb-3 text-sm flex items-center justify-between">
                    <span>Performance Monitor</span>
                    {isPlaying && <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase">ELAPSED TIME</div>
                        <div className="text-xl font-mono text-white">{metrics.totalTime.toFixed(1)} <span className="text-xs">min</span></div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase">REROUTES</div>
                        <div className="text-xl font-mono text-blue-400">
                            {metrics.pathChanges} 
                        </div>
                    </div>
                    
                    {/* New: Algorithm Activity Indicator */}
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 col-span-2 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Activity size={16} className={isPlaying ? "text-green-400" : "text-slate-600"} />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-slate-500">ALGORITHM STATUS</span>
                                <span className="text-xs font-mono font-bold text-green-400">
                                    {isPlaying ? 'ACTIVE SCANNING' : 'IDLE'}
                                </span>
                            </div>
                         </div>
                         {isPlaying && (
                             <div className="flex gap-0.5 items-end h-4">
                                <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-brand-500 rounded-sm" />
                                <motion.div animate={{ height: [6, 16, 6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="w-1 bg-brand-500 rounded-sm" />
                                <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-brand-500 rounded-sm" />
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* Random Event Generator */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Zap size={16} className="text-amber-500" />
                    Random Event Generator
                </h3>
                <div className="space-y-2">
                    <button 
                        onClick={() => {
                            const validEdges = edges.filter(e => !e.congested);
                            const randomEdge = validEdges[Math.floor(Math.random() * validEdges.length)];
                            if (randomEdge) triggerCongestion(randomEdge.id, 2, "Sudden Accident");
                        }}
                        className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 rounded text-xs text-red-200 font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Siren size={14} className="text-red-400" /> Trigger Random Accident
                    </button>
                </div>
            </div>

            {/* Decision Log */}
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-inner min-h-[150px]">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Algorithm Decision Log (DQN-RLPSO)</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[10px] scrollbar-thin scrollbar-thumb-slate-700">
                    {logs.map(log => (
                        <div key={log.id} className="flex gap-2 animate-fadeIn border-l-2 border-slate-800 pl-2">
                            <span className="text-slate-600 shrink-0">{log.timestamp.split(' ')[0]}</span>
                            <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-400' : log.type === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default Simulation;