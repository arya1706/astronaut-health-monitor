import { useState, useEffect, useRef, useCallback } from 'react';
import {
  VitalMetric,
  TelemetryPoint,
  AlertEvent,
  HealthStatusType,
  SimulationSpeed,
} from '../types/health';
import {
  evaluateSpO2,
  evaluateHeartRate,
  evaluateTemperature,
  evaluateSleepDuration,
  evaluateExerciseTime,
  computeOverallHealth,
  formatTimeHHMMSS,
} from '../utils/healthLogic';

const INITIAL_VITAL_METRICS: Record<string, Omit<VitalMetric, 'history' | 'status' | 'trend'>> = {
  heartRate: {
    id: 'heartRate',
    name: 'Heart Rate',
    value: 76,
    unit: 'BPM',
    minNormal: 60,
    maxNormal: 100,
    warningMin: 50,
    warningMax: 120,
    icon: 'Activity',
    referenceRange: '60 – 100 BPM',
    description: 'Electrocardiogram telemetry from biometric suit sensors',
  },
  spo2: {
    id: 'spo2',
    name: 'Blood Oxygen (SpO₂)',
    value: 98,
    unit: '%',
    minNormal: 95,
    maxNormal: 100,
    warningMin: 90,
    warningMax: 94,
    icon: 'Droplets',
    referenceRange: '95 – 100 % (Critical <90%)',
    description: 'Pulse oximetry arterial oxygen saturation',
  },
  temperature: {
    id: 'temperature',
    name: 'Body Temperature',
    value: 36.7,
    unit: '°C',
    minNormal: 36.1,
    maxNormal: 37.5,
    warningMin: 35.5,
    warningMax: 38.0,
    icon: 'Thermometer',
    referenceRange: '36.1 – 37.5 °C',
    description: 'Core body temperature from suit dermal sensors',
  },
  sleepDuration: {
    id: 'sleepDuration',
    name: 'Sleep Duration',
    value: 7.4,
    unit: 'hrs',
    minNormal: 5.0,
    maxNormal: 9.0,
    warningMin: 4.0,
    warningMax: 10.0,
    icon: 'Moon',
    referenceRange: '5.0 – 9.0 hrs (Last 24h)',
    description: 'Rest phase duration recorded during orbital night',
  },
  exerciseTime: {
    id: 'exerciseTime',
    name: 'Exercise Time',
    value: 45,
    unit: 'min',
    minNormal: 20,
    maxNormal: 120,
    warningMin: 10,
    warningMax: 150,
    icon: 'Dumbbell',
    referenceRange: '20 – 120 min / day',
    description: 'Daily countermeasure treadmill & ARED exercise',
  },
};

const INITIAL_ALERTS: AlertEvent[] = [
  {
    id: 'init-alert-1',
    timestamp: '14:18:33',
    severity: 'INFO',
    title: 'Telemetry Stream Initialized',
    message: 'Bio-monitoring link established via ARES Orbital Relay.',
    value: 'NOMINAL',
    acknowledged: true,
  },
  {
    id: 'init-alert-2',
    timestamp: '14:21:08',
    severity: 'WARNING',
    title: 'Elevated Heart Rate Detected',
    message: 'Heart rate spiked to 104 BPM during exercise countermeasure phase.',
    value: '104 BPM',
    acknowledged: true,
  },
  {
    id: 'init-alert-3',
    timestamp: '14:27:42',
    severity: 'CRITICAL',
    title: 'Blood Oxygen Dip Warning',
    message: 'CRITICAL: Blood oxygen level below safe threshold (transient sensor recalibration).',
    value: '89%',
    acknowledged: true,
  },
];

export function useHealthSimulation() {
  const [metrics, setMetrics] = useState<Record<string, VitalMetric>>(() => {
    // Generate initial history points
    const hrHistory = [74, 75, 77, 76, 78, 75, 76, 77, 76];
    const spo2History = [98, 98, 97, 98, 98, 97, 98, 98, 98];
    const tempHistory = [36.6, 36.7, 36.6, 36.8, 36.7, 36.7, 36.6, 36.7, 36.7];

    return {
      heartRate: {
        ...INITIAL_VITAL_METRICS.heartRate,
        value: 76,
        status: evaluateHeartRate(76),
        trend: 'stable',
        history: hrHistory,
      },
      spo2: {
        ...INITIAL_VITAL_METRICS.spo2,
        value: 98,
        status: evaluateSpO2(98),
        trend: 'stable',
        history: spo2History,
      },
      temperature: {
        ...INITIAL_VITAL_METRICS.temperature,
        value: 36.7,
        status: evaluateTemperature(36.7),
        trend: 'stable',
        history: tempHistory,
      },
      sleepDuration: {
        ...INITIAL_VITAL_METRICS.sleepDuration,
        value: 7.4,
        status: evaluateSleepDuration(7.4),
        trend: 'stable',
        history: [7.2, 7.3, 7.4],
      },
      exerciseTime: {
        ...INITIAL_VITAL_METRICS.exerciseTime,
        value: 45,
        status: evaluateExerciseTime(45),
        trend: 'stable',
        history: [30, 40, 45],
      },
    };
  });

  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const time = new Date(now - i * 3000);
      points.push({
        timestamp: time.toISOString(),
        timeFormatted: formatTimeHHMMSS(time),
        heartRate: Math.round(74 + (Math.sin(i / 2) * 4) + (Math.random() * 2 - 1)),
        spo2: Math.min(100, Math.max(95, Math.round(98 + (Math.cos(i / 3) * 1)))),
        temperature: Number((36.6 + Math.sin(i / 4) * 0.2).toFixed(1)),
        respirationRate: Math.round(14 + Math.sin(i / 3) * 2),
      });
    }
    return points;
  });

  const [alerts, setAlerts] = useState<AlertEvent[]>(INITIAL_ALERTS);
  const [activeAlertBanner, setActiveAlertBanner] = useState<AlertEvent | null>(null);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<SimulationSpeed>(1);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);

  // Track previous statuses for alert triggering
  const prevStatusesRef = useRef<Record<string, HealthStatusType>>({
    heartRate: 'NORMAL',
    spo2: 'NORMAL',
    temperature: 'NORMAL',
    sleepDuration: 'NORMAL',
    exerciseTime: 'NORMAL',
  });

  // Calculate overall status dynamically
  const overallStatus: HealthStatusType = computeOverallHealth([
    metrics.heartRate.status,
    metrics.spo2.status,
    metrics.temperature.status,
    metrics.sleepDuration.status,
    metrics.exerciseTime.status,
  ]);

  // Tick seconds since last update
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Main simulation tick logic
  const stepSimulation = useCallback(() => {
    const timestampStr = formatTimeHHMMSS();
    const nowIso = new Date().toISOString();

    setMetrics((prev) => {
      // 1. Smooth variation for Heart Rate (random walk between 60 and 110 normally, occasionally 50-130)
      let hrDelta = (Math.random() * 4 - 2);
      // Small chance of natural drift wave
      if (Math.random() < 0.08) hrDelta += (Math.random() > 0.5 ? 8 : -8);
      let newHr = Math.round(Math.min(135, Math.max(45, prev.heartRate.value + hrDelta)));
      const hrStatus = evaluateHeartRate(newHr);
      const hrTrend = newHr > prev.heartRate.value ? 'up' : newHr < prev.heartRate.value ? 'down' : 'stable';
      const newHrHistory = [...prev.heartRate.history.slice(-19), newHr];

      // 2. Smooth variation for SpO2 (normally 95-100%, small chance of dropping)
      let spo2Delta = 0;
      const randVal = Math.random();
      if (randVal < 0.1) spo2Delta = -1;
      else if (randVal > 0.85) spo2Delta = 1;

      // Small chance of brief low oxygen anomaly naturally (~3% chance)
      if (Math.random() < 0.03 && prev.spo2.value >= 94) {
        spo2Delta = -6;
      }
      let newSpo2 = Math.min(100, Math.max(86, prev.spo2.value + spo2Delta));
      const spo2Status = evaluateSpO2(newSpo2);
      const spo2Trend = newSpo2 > prev.spo2.value ? 'up' : newSpo2 < prev.spo2.value ? 'down' : 'stable';
      const newSpo2History = [...prev.spo2.history.slice(-19), newSpo2];

      // 3. Smooth variation for Temperature (36.1 - 37.5°C normally)
      let tempDelta = (Math.random() * 0.2 - 0.1);
      let newTemp = Number(Math.min(39.0, Math.max(34.8, prev.temperature.value + tempDelta)).toFixed(1));
      const tempStatus = evaluateTemperature(newTemp);
      const tempTrend = newTemp > prev.temperature.value ? 'up' : newTemp < prev.temperature.value ? 'down' : 'stable';
      const newTempHistory = [...prev.temperature.history.slice(-19), newTemp];

      // 4. Sleep & Exercise minor telemetry syncs
      const newSleep = prev.sleepDuration.value;
      const newExercise = prev.exerciseTime.value;

      // Check for status crossings and trigger alerts
      const newAlertList: AlertEvent[] = [];

      // SpO2 Critical Check
      if (newSpo2 < 90 && (prevStatusesRef.current.spo2 !== 'CRITICAL' || prev.spo2.value >= 90)) {
        const critAlert: AlertEvent = {
          id: `alert-${Date.now()}-spo2`,
          timestamp: timestampStr,
          metricId: 'spo2',
          severity: 'CRITICAL',
          title: 'CRITICAL: Blood Oxygen Below Safe Threshold',
          message: `Arterial oxygen saturation dropped to dangerous levels (${newSpo2}%). Immediate suit O₂ boost recommended.`,
          value: `${newSpo2}%`,
          acknowledged: false,
        };
        newAlertList.push(critAlert);
        setActiveAlertBanner(critAlert);
      } else if (spo2Status === 'WARNING' && prevStatusesRef.current.spo2 === 'NORMAL') {
        newAlertList.push({
          id: `alert-${Date.now()}-spo2-warn`,
          timestamp: timestampStr,
          metricId: 'spo2',
          severity: 'WARNING',
          title: 'Blood Oxygen Warning Range',
          message: `Blood oxygen saturation is low (${newSpo2}%). Monitoring suit ventilation.`,
          value: `${newSpo2}%`,
          acknowledged: false,
        });
      }

      // Heart Rate Status Crossing Check
      if (hrStatus === 'CRITICAL' && prevStatusesRef.current.heartRate !== 'CRITICAL') {
        const hrAlert: AlertEvent = {
          id: `alert-${Date.now()}-hr-crit`,
          timestamp: timestampStr,
          metricId: 'heartRate',
          severity: 'CRITICAL',
          title: newHr > 120 ? 'CRITICAL: Tachycardia Spike' : 'CRITICAL: Bradycardia Dip',
          message: `Heart rate crossed critical limit (${newHr} BPM). Initiate astronaut rest directive.`,
          value: `${newHr} BPM`,
          acknowledged: false,
        };
        newAlertList.push(hrAlert);
        if (newSpo2 >= 90) setActiveAlertBanner(hrAlert);
      } else if (hrStatus === 'WARNING' && prevStatusesRef.current.heartRate === 'NORMAL') {
        newAlertList.push({
          id: `alert-${Date.now()}-hr-warn`,
          timestamp: timestampStr,
          metricId: 'heartRate',
          severity: 'WARNING',
          title: 'Abnormal Heart Rate Detected',
          message: `Heart rate drifted into warning threshold (${newHr} BPM).`,
          value: `${newHr} BPM`,
          acknowledged: false,
        });
      }

      // Temperature Crossing Check
      if (tempStatus === 'CRITICAL' && prevStatusesRef.current.temperature !== 'CRITICAL') {
        const tempAlert: AlertEvent = {
          id: `alert-${Date.now()}-temp-crit`,
          timestamp: timestampStr,
          metricId: 'temperature',
          severity: 'CRITICAL',
          title: newTemp > 38.0 ? 'CRITICAL: Thermal Hyperthermia' : 'CRITICAL: Thermal Hypothermia',
          message: `Core temperature reached extreme value (${newTemp}°C). Check suit thermal regulation unit.`,
          value: `${newTemp}°C`,
          acknowledged: false,
        };
        newAlertList.push(tempAlert);
        if (newSpo2 >= 90 && hrStatus !== 'CRITICAL') setActiveAlertBanner(tempAlert);
      } else if (tempStatus === 'WARNING' && prevStatusesRef.current.temperature === 'NORMAL') {
        newAlertList.push({
          id: `alert-${Date.now()}-temp-warn`,
          timestamp: timestampStr,
          metricId: 'temperature',
          severity: 'WARNING',
          title: 'Body Temperature Fluctuation',
          message: `Core temperature entered warning zone (${newTemp}°C).`,
          value: `${newTemp}°C`,
          acknowledged: false,
        });
      }

      // Update refs
      prevStatusesRef.current = {
        heartRate: hrStatus,
        spo2: spo2Status,
        temperature: tempStatus,
        sleepDuration: evaluateSleepDuration(newSleep),
        exerciseTime: evaluateExerciseTime(newExercise),
      };

      if (newAlertList.length > 0) {
        setAlerts((prevAlerts) => [...newAlertList, ...prevAlerts].slice(0, 20));
      }

      // Update Telemetry Chart history
      setTelemetryHistory((prevHistory) => {
        const nextPoint: TelemetryPoint = {
          timestamp: nowIso,
          timeFormatted: timestampStr,
          heartRate: newHr,
          spo2: newSpo2,
          temperature: newTemp,
          respirationRate: Math.round(14 + ((newHr - 75) / 10) + (Math.random() * 2 - 1)),
        };
        return [...prevHistory.slice(-25), nextPoint];
      });

      setLastUpdated(new Date());
      setSecondsSinceUpdate(0);

      return {
        heartRate: {
          ...prev.heartRate,
          value: newHr,
          status: hrStatus,
          trend: hrTrend,
          history: newHrHistory,
        },
        spo2: {
          ...prev.spo2,
          value: newSpo2,
          status: spo2Status,
          trend: spo2Trend,
          history: newSpo2History,
        },
        temperature: {
          ...prev.temperature,
          value: newTemp,
          status: tempStatus,
          trend: tempTrend,
          history: newTempHistory,
        },
        sleepDuration: {
          ...prev.sleepDuration,
          value: newSleep,
          status: evaluateSleepDuration(newSleep),
        },
        exerciseTime: {
          ...prev.exerciseTime,
          value: newExercise,
          status: evaluateExerciseTime(newExercise),
        },
      };
    });
  }, []);

  // Interval loop for simulation
  useEffect(() => {
    if (!isSimulationActive || simulationSpeed === 0) return;

    const intervalMs = Math.max(600, 3000 / simulationSpeed);
    const timer = setInterval(() => {
      stepSimulation();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulationActive, simulationSpeed, stepSimulation]);

  // Anomaly Injection Functions for manual evaluator testing
  const triggerAnomaly = useCallback((type: 'CRITICAL_O2' | 'TACHYCARDIA' | 'HYPOTHERMIA' | 'FEVER' | 'RESET') => {
    const timestampStr = formatTimeHHMMSS();
    const nowIso = new Date().toISOString();

    if (type === 'CRITICAL_O2') {
      const targetO2 = 88;
      const critAlert: AlertEvent = {
        id: `alert-${Date.now()}-spo2-manual`,
        timestamp: timestampStr,
        metricId: 'spo2',
        severity: 'CRITICAL',
        title: 'CRITICAL: Blood oxygen level below safe threshold',
        message: `Emergency oxygen drop triggered. Current saturation: ${targetO2}%.`,
        value: `${targetO2}%`,
        acknowledged: false,
      };

      setMetrics((prev) => ({
        ...prev,
        spo2: {
          ...prev.spo2,
          value: targetO2,
          status: 'CRITICAL',
          trend: 'down',
          history: [...prev.spo2.history.slice(-19), targetO2],
        },
      }));
      prevStatusesRef.current.spo2 = 'CRITICAL';
      setAlerts((prev) => [critAlert, ...prev].slice(0, 20));
      setActiveAlertBanner(critAlert);
    } else if (type === 'TACHYCARDIA') {
      const targetHr = 126;
      const hrAlert: AlertEvent = {
        id: `alert-${Date.now()}-hr-manual`,
        timestamp: timestampStr,
        metricId: 'heartRate',
        severity: 'CRITICAL',
        title: 'CRITICAL: Extreme Tachycardia Spike',
        message: `Heart rate exceeded emergency threshold (${targetHr} BPM).`,
        value: `${targetHr} BPM`,
        acknowledged: false,
      };

      setMetrics((prev) => ({
        ...prev,
        heartRate: {
          ...prev.heartRate,
          value: targetHr,
          status: 'CRITICAL',
          trend: 'up',
          history: [...prev.heartRate.history.slice(-19), targetHr],
        },
      }));
      prevStatusesRef.current.heartRate = 'CRITICAL';
      setAlerts((prev) => [hrAlert, ...prev].slice(0, 20));
      setActiveAlertBanner(hrAlert);
    } else if (type === 'HYPOTHERMIA') {
      const targetTemp = 35.2;
      const tempAlert: AlertEvent = {
        id: `alert-${Date.now()}-temp-manual`,
        timestamp: timestampStr,
        metricId: 'temperature',
        severity: 'CRITICAL',
        title: 'CRITICAL: Thermal System Drop',
        message: `Core temperature dropped to hypothermic level (${targetTemp}°C).`,
        value: `${targetTemp}°C`,
        acknowledged: false,
      };

      setMetrics((prev) => ({
        ...prev,
        temperature: {
          ...prev.temperature,
          value: targetTemp,
          status: 'CRITICAL',
          trend: 'down',
          history: [...prev.temperature.history.slice(-19), targetTemp],
        },
      }));
      prevStatusesRef.current.temperature = 'CRITICAL';
      setAlerts((prev) => [tempAlert, ...prev].slice(0, 20));
      setActiveAlertBanner(tempAlert);
    } else if (type === 'RESET') {
      setMetrics((prev) => ({
        ...prev,
        heartRate: { ...prev.heartRate, value: 76, status: 'NORMAL', trend: 'stable' },
        spo2: { ...prev.spo2, value: 98, status: 'NORMAL', trend: 'stable' },
        temperature: { ...prev.temperature, value: 36.7, status: 'NORMAL', trend: 'stable' },
      }));
      prevStatusesRef.current = {
        heartRate: 'NORMAL',
        spo2: 'NORMAL',
        temperature: 'NORMAL',
        sleepDuration: 'NORMAL',
        exerciseTime: 'NORMAL',
      };
      setActiveAlertBanner(null);
      setAlerts((prev) => [
        {
          id: `alert-${Date.now()}-reset`,
          timestamp: timestampStr,
          severity: 'INFO',
          title: 'Physiological Parameters Normalized',
          message: 'All vital signs returned to optimal orbital ranges.',
          value: 'NORMAL',
          acknowledged: true,
        },
        ...prev,
      ].slice(0, 20));
    }

    setLastUpdated(new Date());
    setSecondsSinceUpdate(0);
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    if (activeAlertBanner?.id === id) {
      setActiveAlertBanner(null);
    }
  }, [activeAlertBanner]);

  const dismissAlertBanner = useCallback(() => {
    setActiveAlertBanner(null);
  }, []);

  return {
    metrics,
    overallStatus,
    telemetryHistory,
    alerts,
    activeAlertBanner,
    isSimulationActive,
    setIsSimulationActive,
    simulationSpeed,
    setSimulationSpeed,
    lastUpdated,
    secondsSinceUpdate,
    stepSimulation,
    triggerAnomaly,
    acknowledgeAlert,
    dismissAlertBanner,
  };
}
