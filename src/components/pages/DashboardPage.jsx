import { NOISE_STATUS_LABELS } from '../../constants/dashboard';

export default function DashboardPage({
  weather,
  weatherVisual,
  weatherTemp,
  weatherHumidity,
  weatherWind,
  weatherSunset,
  activeWorkers,
  alerts,
  ZONES,
  zoneCounts,
  zoneNoiseById,
}) {
  return (
    <div className="page active">
      <div className="weather-strip">
        <div className="weather-main">
          <div style={{ fontSize: 28 }}>{weatherVisual.icon}</div>
          <div>
            <div className="weather-temp">{weatherTemp}</div>
            <div className="weather-desc">
              {weather ? `${weatherVisual.desc} · 서울` : '날씨 정보를 불러오는 중입니다.'}
            </div>
          </div>
        </div>
        <div className="weather-divider"></div>
        <div className="weather-stat">습도 <span>{weatherHumidity}</span></div>
        <div className="weather-stat">풍속 <span>{weatherWind}</span></div>
        <div className="weather-stat">일몰 <span>{weatherSunset}</span></div>
      </div>

      <div className="kpi-grid kpi-grid-three">
        <div className="kpi-card ok">
          <div className="kpi-label">현장 인원</div>
          <div className="kpi-value">{activeWorkers.length || '0'}</div>
          <div className="kpi-delta">작업 중</div>
          <div className="kpi-icon">👷</div>
        </div>
        <div className="kpi-card warn">
          <div className="kpi-label">평균 공정률</div>
          <div className="kpi-value">67%</div>
          <div className="kpi-delta">전체 공종 평균</div>
          <div className="kpi-icon">📈</div>
        </div>
        <div className="kpi-card bad">
          <div className="kpi-label">미처리 알림</div>
          <div className="kpi-value">{alerts.length || '0'}</div>
          <div className="kpi-delta">즉시 확인 필요</div>
          <div className="kpi-icon">⚠️</div>
        </div>
      </div>

      <div className="split-grid dashboard-split-grid">
        <div className="panel">
          <div className="panel-title">구역 현황</div>
          <div className="dashboard-zone-overview">
            {ZONES.map((zone) => {
              const noise = zoneNoiseById?.[zone.id] || { decibel: null, peak: '--:--', status: 'safe' };
              const fillWidth = Math.min(100, Math.max(0, noise.decibel || 0));

              return (
                <div className={`dashboard-zone-card ${noise.status}`} key={zone.id}>
                  <div className="zone-noise-head">
                    <div>
                      <div className="zone-name">{zone.name}</div>
                      <div className="zone-sub">{zone.description} · {zone.task}</div>
                    </div>
                    <div className={`zone-noise-status ${noise.status}`}>{NOISE_STATUS_LABELS[noise.status]}</div>
                  </div>

                  <div className="dashboard-zone-metrics">
                    <div className="dashboard-zone-kpi">
                      <span className="dashboard-zone-kpi-label">인원</span>
                      <span className="dashboard-zone-kpi-value">{`${zoneCounts[zone.id] || 0}명`}</span>
                    </div>
                    <div className="dashboard-zone-kpi">
                      <span className="dashboard-zone-kpi-label">소음</span>
                      <span className="dashboard-zone-kpi-value">{noise.decibel == null ? '--dB' : `${noise.decibel}dB`}</span>
                    </div>
                  </div>

                  <div className="zone-noise-meter">
                    <div className="zone-noise-fill" style={{ width: `${fillWidth}%` }}></div>
                  </div>

                  <div className="zone-noise-meta">
                    <span>{`최고 측정 ${noise.peak}`}</span>
                    <span>{zone.risk === 'safe' ? '작업 안정' : (zone.risk === 'caution' ? '주의 구간' : '집중 관리')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">최근 알림</div>
          <div className="alert-list dashboard-alert-list">
            {alerts.length === 0 && (
              <div className="loading">
                <div className="spinner"></div>
                실시간 알림이 없습니다.
              </div>
            )}
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className={`alert-item level-${alert.level}`}>
                <div className="alert-dot"></div>
                <div>
                  <div className="alert-text">{alert.message}</div>
                  <div className="alert-time">
                    {new Date(alert.created_at).toLocaleTimeString('ko-KR', { hour12: false })}
                    {' · '}
                    {alert.source}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
