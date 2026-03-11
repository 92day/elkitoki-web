export default function DashboardPage({ weather, weatherVisual, weatherTemp, weatherHumidity, weatherWind, weatherSunset, activeWorkers, alerts, currentTemp, ZONES, zoneCounts }) {
    return (
      <div className="page active">
        <div className="weather-strip">
          <div className="weather-main">
            <div style={{ fontSize: 28 }}>{weatherVisual.icon}</div>
            <div>
              <div className="weather-temp">{weatherTemp}</div>
              <div className="weather-desc">{weather ? `${weatherVisual.desc} · 서울` : '날씨 로딩 중 · 서울'}</div>
            </div>
          </div>
          <div className="weather-divider"></div>
          <div className="weather-stat">💧 습도 <span>{weatherHumidity}</span></div>
          <div className="weather-stat">💨 풍속 <span>{weatherWind}</span></div>
          <div className="weather-stat">🌅 일몰 <span>{weatherSunset}</span></div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card ok"><div className="kpi-label">현장 인원</div><div className="kpi-value">{activeWorkers.length || '—'}</div><div className="kpi-delta">작업 중</div><div className="kpi-icon">👷</div></div>
          <div className="kpi-card warn"><div className="kpi-label">평균 공정률</div><div className="kpi-value">67%</div><div className="kpi-delta">전체 공종 평균</div><div className="kpi-icon">📈</div></div>
          <div className="kpi-card bad"><div className="kpi-label">미처리 알림</div><div className="kpi-value">{alerts.length || '—'}</div><div className="kpi-delta">즉시 확인 필요</div><div className="kpi-icon">⚠️</div></div>
          <div className="kpi-card info"><div className="kpi-label">현재 온도</div><div className="kpi-value">{currentTemp}</div><div className="kpi-delta">센서 실시간</div><div className="kpi-icon">🌡️</div></div>
        </div>

        <div className="split-grid">
          <div className="panel">
            <div className="panel-title">🗺️ 구역별 인원</div>
            <div className="zone-grid">
              {ZONES.map((zone) => (
                <div className={`zone ${zone.risk}`} key={zone.id}>
                  <div className="zone-name">{zone.name}</div>
                  <div className="zone-workers">{zoneCounts[zone.id] || 0}명</div>
                  <div className="zone-sub">{zone.task}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">⚠️ 최근 알림</div>
            <div className="alert-list">
              {alerts.length === 0 && <div className="loading"><div className="spinner"></div>표시할 알림이 없습니다.</div>}
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`alert-item level-${alert.level}`}>
                  <div className="alert-dot"></div>
                  <div>
                    <div className="alert-text">{alert.message}</div>
                    <div className="alert-time">{new Date(alert.created_at).toLocaleTimeString('ko-KR', { hour12: false })} · {alert.source}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}
