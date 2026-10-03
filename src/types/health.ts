export type HealthStatusType = 'NORMAL' | 'WARNING' | 'CRITICAL';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface VitalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  minNormal: number;
  maxNormal: number;
  warningMin?: number;
  warningMax?: number;
  status: HealthStatusType;
  trend: TrendDirection;
  icon: string;
  history: number[];
  referenceRange: string;
  description: string;
}

export interface TelemetryPoint {
  timestamp: string;
  timeFormatted: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  respirationRate: number;
}

export interface AlertEvent {
  id: string;
  timestamp: string;
  metricId?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  value: string;
  acknowledged?: boolean;
}

export interface MissionDetails {
  appName: string;
  astronautName: string;
  astronautRole: string;
  missionName: string;
  missionDay: number;
  totalMissionDays: number;
  location: string;
  status: string;
  startTimestamp: number;
}

export interface SubsystemStatus {
  id: string;
  name: string;
  status: 'ONLINE' | 'WARNING' | 'DEGRADED';
  metrics: string;
  category: string;
}

export type SimulationSpeed = 1 | 2 | 5 | 0; // 0 is paused
