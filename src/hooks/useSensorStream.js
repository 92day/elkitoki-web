import { useEffect, useState } from 'react';

export default function useSensorStream(wsBase, setSensors, setSensorLog) {
  const [wsConnected, setWsConnected] = useState(false);

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
            setSensors((prev) => ({ ...prev, [nextSensor.type]: { value: nextSensor.value, unit: nextSensor.unit || '' } }));
            setSensorLog((prev) => [
              {
                id: `${Date.now()}-${nextSensor.type}`,
                text: `[${new Date().toLocaleTimeString('ko-KR', { hour12: false })}] ${nextSensor.type}: ${nextSensor.value}${nextSensor.unit || ''}`,
              },
              ...prev,
            ].slice(0, 40));
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
