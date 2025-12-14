export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  lightStatus?: 'green' | 'red'; // New: Traffic light system
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  length: number; // km
  limit: number; // km/h
  baseSpeed: number; // km/h
  currentSpeed: number; // km/h
  congested?: boolean;
}

export interface SimulationLog {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  metric?: string;
}

export interface SimulationMetrics {
  totalTime: number;
  pathChanges: number;
  distanceTraveled: number;
  currentConstraint: 'Satisfied' | 'Violated';
}

export enum Scenario {
  NORMAL = 'NORMAL',
  // Dynamic scenarios are now handled by the random event engine
  MANUAL = 'MANUAL' 
}