import { NOISE_STATUS_LABELS } from '../../constants/dashboard';

export default function ZonesPage({ ZONES, zoneCounts, zoneNoiseById }) {
  return (
    <div className="page active">
      <div className="section-title">구역 현황</div>

      <div className="panel">
        <div className="panel-title">구역별 작업 현황</div>
        <div className="zone-grid zone-grid-wide">
          {ZONES.map((zone) => (
            <div className={`zone ${zone.risk}`} key={zone.id}>
              <div className="zone-name">{zone.name}</div>
              <div className="zone-workers">{`${zoneCounts[zone.id] || 0}명`}</div>
              <div className="zone-sub">{zone.description} · {zone.task}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">구역별 소음 데시벨</div>
        <div className="zone-noise-grid">
          {ZONES.map((zone) => {
            const noise = zoneNoiseById?.[zone.id] || { decibel: null, peak: '--:--', status: 'safe' };
            const fillWidth = Math.min(100, Math.max(0, noise.decibel || 0));

            return (
              <div className={`zone-noise-card ${noise.status}`} key={`noise-${zone.id}`}>
                <div className="zone-noise-head">
                  <div>
                    <div className="zone-name">{zone.name}</div>
                    <div className="zone-sub">{zone.description} · {zone.task}</div>
                  </div>
                  <div className={`zone-noise-status ${noise.status}`}>{NOISE_STATUS_LABELS[noise.status]}</div>
                </div>

                <div className="zone-noise-reading">
                  <span className="zone-noise-value">{noise.decibel == null ? '--' : noise.decibel}</span>
                  <span className="zone-noise-unit">dB</span>
                </div>

                <div className="zone-noise-meter">
                  <div className="zone-noise-fill" style={{ width: `${fillWidth}%` }}></div>
                </div>

                <div className="zone-noise-meta">
                  <span>{`상주 인원 ${zoneCounts[zone.id] || 0}명`}</span>
                  <span>{`최고 측정 ${noise.peak}`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
