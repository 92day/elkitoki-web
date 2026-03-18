import { useEffect, useRef, useState } from 'react';

const ZONE_SOUND_FIELDS = {
  1: 'soundA',
  2: 'soundB',
  3: 'soundC',
};

const NOISE_STALE_MS = 4000;

function classifyNoiseStatus(score) {
  if (score == null) return 'safe';
  if (score >= 70) return 'danger';
  if (score >= 40) return 'caution';
  return 'safe';
}

function formatPeakTime(dateValue) {
  if (!dateValue) return '--:--';
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

function coerceNoiseScore(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  if (value <= 0) return 30;
  if (value <= 100) return Math.max(30, Math.min(100, Math.round(value)));
  const rawScore = 1 + Math.pow(Math.min(value, 1023) / 1023, 0.58) * 69;
  const scaled = 30 + rawScore;
  return Math.round(scaled);
}

function buildZoneNoiseById(sensorState, now = new Date()) {
  const next = {};

  Object.entries(ZONE_SOUND_FIELDS).forEach(([zoneId, fieldName]) => {
    const cached = sensorState[fieldName];
    const updatedAt = cached?.updatedAt ? new Date(cached.updatedAt) : null;
    const isFresh = updatedAt && !Number.isNaN(updatedAt.getTime()) && now - updatedAt <= NOISE_STALE_MS;
    const score = isFresh ? coerceNoiseScore(cached?.value) : null;

    next[zoneId] = {
      score,
      peak: isFresh ? formatPeakTime(updatedAt) : '--:--',
      status: classifyNoiseStatus(score),
      updatedAt: isFresh ? cached?.updatedAt : null,
    };
  });

  return next;
}

export default function useSensorStream(wsBase, setSensors, setSensorLog, onSensorEvent) {
  const [wsConnected, setWsConnected] = useState(false);
  const sensorEventRef = useRef(onSensorEvent);

  useEffect(() => {
    sensorEventRef.current = onSensorEvent;
  }, [onSensorEvent]);

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      socket = new WebSocket(`${wsBase}/api/sensors/ws`);
      socket.onopen = () => setWsConnected(true);
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'sensor' && payload.data) {
            const nextSensor = payload.data;
            const timestamp = nextSensor.timestamp || new Date().toISOString();

            setSensors((prev) => {
              if (nextSensor.kind === 'status') {
                const next = { ...prev };
                Object.entries(nextSensor).forEach(([key, value]) => {
                  if (['kind', 'device', 'timestamp'].includes(key)) return;
                  next[key] = {
                    value,
                    updatedAt: timestamp,
                    device: nextSensor.device,
                  };
                });
                next.zoneNoiseById = buildZoneNoiseById(next, new Date(timestamp));
                return next;
              }

              if (nextSensor.kind === 'event') {
                const next = {
                  ...prev,
                  [`event:${nextSensor.eventType}`]: {
                    value: nextSensor,
                    updatedAt: timestamp,
                    device: nextSensor.device,
                  },
                };
                next.zoneNoiseById = buildZoneNoiseById(next, new Date(timestamp));
                return next;
              }

              return prev;
            });

            setSensorLog((prev) => [
              {
                id: `${Date.now()}-${nextSensor.kind || 'sensor'}`,
                text: `[${new Date().toLocaleTimeString('ko-KR', { hour12: false })}] ${nextSensor.kind || 'sensor'}: ${nextSensor.device || 'unknown'}`,
              },
              ...prev,
            ].slice(0, 40));

            if (typeof sensorEventRef.current === 'function') {
              sensorEventRef.current(nextSensor);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      socket.onclose = () => {
        setWsConnected(false);
        if (!cancelled) reconnectTimer = window.setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (socket && socket.readyState < 2) socket.close();
    };
  }, [wsBase, setSensors, setSensorLog]);

  return wsConnected;
}

