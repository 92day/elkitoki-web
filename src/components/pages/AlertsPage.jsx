export default function AlertsPage({
  showAlertForm,
  setShowAlertForm,
  newAlert,
  setNewAlert,
  handleCreateAlert,
  alerts,
  handleResolveAlert,
  zones,
}) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">안전 알림</div>
        <button className="btn-primary react-btn-auto" onClick={() => setShowAlertForm((prev) => !prev)} type="button">
          + 수동 등록
        </button>
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
              <label className="form-label">발생 위치</label>
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
        <div className="panel-title">최근 미처리 알림</div>
        <div className="alert-list">
          {alerts.length === 0 && (
            <div className="loading">
              <div className="spinner"></div>
              미처리 알림이 없습니다.
            </div>
          )}

          {alerts.map((alert) => (
            <div key={alert.id} className={`alert-item level-${alert.level}`}>
              <div className="alert-dot"></div>
              <div className="alert-content-grow">
                <div className="alert-text">{alert.message}</div>
                <div className="alert-time">
                  {new Date(alert.created_at).toLocaleString('ko-KR')}
                  {' · '}
                  {alert.zone_name ? `${alert.zone_name} 구역` : '구역 미지정'}
                  {' · '}
                  {alert.source || '수동 입력'}
                </div>
              </div>
              <button className="alert-resolve-btn react-btn-auto" onClick={() => handleResolveAlert(alert.id)} type="button">해결</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
