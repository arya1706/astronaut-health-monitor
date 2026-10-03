import { HealthStatusType } from '../types/health';

export const evaluateSpO2 = (val: number): HealthStatusType => {
  if (val >= 95) return 'NORMAL';
  if (val >= 90) return 'WARNING';
  return 'CRITICAL';
};

export const evaluateHeartRate = (val: number): HealthStatusType => {
  if (val >= 60 && val <= 100) return 'NORMAL';
  if ((val >= 50 && val < 60) || (val > 100 && val <= 120)) return 'WARNING';
  return 'CRITICAL';
};

export const evaluateTemperature = (val: number): HealthStatusType => {
  if (val >= 36.1 && val <= 37.5) return 'NORMAL';
  if ((val >= 35.5 && val < 36.1) || (val > 37.5 && val <= 38.0)) return 'WARNING';
  return 'CRITICAL';
};

export const evaluateSleepDuration = (val: number): HealthStatusType => {
  if (val >= 5.0 && val <= 9.0) return 'NORMAL';
  if ((val >= 4.0 && val < 5.0) || (val > 9.0 && val <= 10.0)) return 'WARNING';
  return 'CRITICAL';
};

export const evaluateExerciseTime = (val: number): HealthStatusType => {
  if (val >= 20 && val <= 120) return 'NORMAL';
  if ((val >= 10 && val < 20) || (val > 120 && val <= 150)) return 'WARNING';
  return 'CRITICAL';
};

export const computeOverallHealth = (statuses: HealthStatusType[]): HealthStatusType => {
  if (statuses.includes('CRITICAL')) return 'CRITICAL';
  if (statuses.includes('WARNING')) return 'WARNING';
  return 'NORMAL';
};

export const formatMissionElapsed = (totalSeconds: number): string => {
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
};

export const formatTimeHHMMSS = (date: Date = new Date()): string => {
  return date.toTimeString().split(' ')[0];
};

export const getStatusColorClasses = (status: HealthStatusType) => {
  switch (status) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        text: 'text-red-400',
        badgeBg: 'bg-red-500/20',
        badgeText: 'text-red-300 border-red-500/40',
        glow: 'glow-critical',
        dot: 'bg-red-500',
      };
    case 'WARNING':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300 border-amber-500/40',
        glow: 'glow-warning',
        dot: 'bg-amber-500',
      };
    case 'NORMAL':
    default:
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/50',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300 border-emerald-500/40',
        glow: 'glow-normal',
        dot: 'bg-emerald-500',
      };
  }
};
