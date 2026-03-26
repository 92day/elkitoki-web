import { useMemo, useState } from 'react';
import { ALERT_LEVEL_LABELS, ALERT_STATUS_LABELS } from '../../constants/dashboard';

const STATUS_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'pending', label: ALERT_STATUS_LABELS.pending },
  { value: 'resolved', label: ALERT_STATUS_LABELS.resolved },
];

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'severity', label: '심각도순' },
  { value: 'oldest', label: '오래된순' },
];

const LEVEL_PRIORITY = { high: 3, mid: 2, medium: 2, low: 1 };

function formatAlertTime(value) {
  if (!value) return '--';
  return new Date(value).toLocaleString('ko-KR');
}

export default function AlertsPage({
  showAlertForm,
  setShowAlertForm,
  newAlert,
  setNewAlert,
  handleCreateAlert,
  alerts,
  handleUpdateAlertStatus,
  handleDeleteAlert,
  handleResolveAllAlerts,
  zones,
}) {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [zoneFilter, setZoneFilter] = useState('');
  const [sortMode, setSortMode] = useState('latest');

  const filteredAlerts = useMemo(() => {
    const nextAlerts = [...alerts].filter((alert) => {
      const status = alert.status || 'pending';
      const zoneId = String(alert.zone_id || '');
      const statusMatched = statusFilter === 'all' ? true : status === statusFilter;
      const zoneMatched = zoneFilter ? zoneId === zoneFilter : true;
      return statusMatched && zoneMatched;
    });

    nextAlerts.sort((left, right) => {
      if (sortMode === 'severity') {
        const levelGap = (LEVEL_PRIORITY[right.level] || 0) - (LEVEL_PRIORITY[left.level] || 0);
        if (levelGap !== 0) return levelGap;
      }

      const leftTime = new Date(left.created_at).getTime();
      const rightTime = new Date(right.created_at).getTime();
      if (sortMode === 'oldest') {
        return leftTime - rightTime;
      }
      return rightTime - leftTime;
    });

    return nextAlerts;
  }, [alerts, sortMode, statusFilter, zoneFilter]);

  const activeAlerts = alerts.filter((alert) => (alert.status || 'pending') !== 'resolved');

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">안전 알림</div>
        <div className="section-header-actions">
          <button className="btn-sm react-btn-auto" onClick={handleResolveAllAlerts} disabled={activeAlerts.length === 0} type="button">일괄 조치완료</button>
          <button className="btn-primary react-btn-auto" onClick={() => setShowAlertForm((prev) => !prev)} type="button">
            + 수동 등록
          </button>
        </div>
      </div>

      {showAlertForm && (
        <div className="panel">
          <div className="panel-title">위험 알림 수동 등록</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">위험 수준</label>
              <select className="form-select" value={newAlert.level} onChange={(event) => setNewAlert((prev) => ({ ...prev, level: event.target.value }))}>
                <option value="high">높음</option>
                <option value="mid">중간</option>
                <option value="low">낮음</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">위치</label>
              <input className="form-input" value={newAlert.source} onChange={(event) => setNewAlert((prev) => ({ ...prev, source: event.target.value }))} placeholder="예: 관리자 수동 입력" />
            </div>
            <div className="form-group">
              <label className="form-label">구역</label>
              <select className="form-select" value={newAlert.zone_id} onChange={(event) => setNewAlert((prev) => ({ ...prev, zone_id: event.target.value }))}>
                <option value="">선택 안 함</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group spaced-field">
            <label className="form-label">내용</label>
            <input className="form-input" value={newAlert.message} onChange={(event) => setNewAlert((prev) => ({ ...prev, message: event.target.value }))} placeholder="알림 내용을 입력해 주세요." />
          </div>
          <div className="button-row">
            <button className="btn-primary react-btn-auto" onClick={handleCreateAlert} type="button">등록</button>
            <button className="btn-sm react-btn-auto" onClick={() => setShowAlertForm(false)} type="button">취소</button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">알림 운영 현황</div>

        <div className="alerts-filter-row">
          <div className="form-group">
            <label className="form-label">상태</label>
            <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">구역</label>
            <select className="form-select" value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)}>
              <option value="">전체 구역</option>
              {zones.map((zone) => (
                <option key={zone.id} value={String(zone.id)}>{zone.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">정렬</label>
            <select className="form-select" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="alert-list">
          {filteredAlerts.length === 0 && (
            <div className="loading">
              <div className="spinner"></div>
              조건에 맞는 알림이 없습니다.
            </div>
          )}

          {filteredAlerts.map((alert) => {
            const status = alert.status || 'pending';
            const matchedZone = zones.find((zone) => zone.id === alert.zone_id);
            const zoneLabel = alert.zone_name || matchedZone?.name || '구역 미지정';

            return (
              <div key={alert.id} className={`alert-item level-${alert.level} status-${status}`}>
                <div className="alert-dot"></div>
                <div className="alert-content-grow">
                  <div className="alert-card-layout">
                    <div className="alert-main-column">
                      <div className="alert-head">
                        <div className="alert-level-row">
                          <span className={`alert-level-badge level-${alert.level}`}>{ALERT_LEVEL_LABELS[alert.level] || alert.level}</span>
                        </div>
                        <div className="alert-side-inline">
                          <div className="alert-inline-badges">
                            <div className="alert-zone-chip">{zoneLabel}</div>
                            <span className={`alert-status-badge status-${status}`}>{ALERT_STATUS_LABELS[status] || status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="alert-text">{alert.message}</div>
                      <div className="alert-time-stack">
                        <div className="alert-time">발생 시간 · {formatAlertTime(alert.created_at)}</div>
                        <div className="alert-time">처리 시간 · {formatAlertTime(alert.handled_at)}</div>
                      </div>
                    </div>
                    <div className="alert-actions-column">
                      <button className="btn-danger-xs react-btn-auto" onClick={() => handleDeleteAlert(alert.id)} type="button">삭제</button>
                      <button
                        className="alert-resolve-btn react-btn-auto"
                        onClick={() => handleUpdateAlertStatus(alert.id, status === 'resolved' ? 'pending' : 'resolved')}
                        type="button"
                      >
                        {status === 'resolved' ? '미처리로 변경' : '조치완료'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
