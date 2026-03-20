export default function SensorsPage({ sensors, sensorLog }) {
    const sensorCards = [
      { key: 'temperature', icon: '🌡️', label: '온도', unit: '°C', limit: 40 },
      { key: 'humidity', icon: '💧', label: '습도', unit: '%', limit: 90 },
      { key: 'dust', icon: '🌫️', label: '미세먼지', unit: 'µg/m³', limit: 150 },
      { key: 'gas', icon: '☁️', label: '가스', unit: 'ppm', limit: 50 },
    ];
    return (
      <div className="page active">
        <div className="section-title">센서 실시간 현황</div>
        <div className="sensor-grid">
          {sensorCards.map((sensor) => {
            const value = sensors[sensor.key]?.value;
            const isDanger = typeof value === 'number' ? value > sensor.limit : false;
            return <div className="sensor-card" key={sensor.key}><div className="sensor-icon">{sensor.icon}</div><div className="sensor-label">{sensor.label}</div><div className="sensor-value">{typeof value === 'number' ? value.toFixed(1) : '—'}</div><div className="sensor-unit">{sensor.unit}</div><div className={`sensor-status ${isDanger ? 'bad' : 'ok'}`}>{isDanger ? '주의' : '정상'}</div></div>;
          })}
        </div>
        <div className="panel"><div className="panel-title">📡 수신 로그</div><div className="sensor-log-list">{sensorLog.length === 0 && <span className="table-sub">대기 중...</span>}{sensorLog.map((entry) => <span key={entry.id}>{entry.text}</span>)}</div></div>
      </div>
    );
}
