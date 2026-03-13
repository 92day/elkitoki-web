export default function WorkersPage({
  showWorkerForm,
  setShowWorkerForm,
  newWorker,
  setNewWorker,
  handleCreateWorker,
  workers,
  ZONES,
  getZoneMeta,
  WORKER_STATUS_LABELS,
  handleUpdateWorkerStatus,
  handleDeleteWorker,
  workerRoleOptions,
}) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">인력 관리</div>
        <button className="btn-primary react-btn-auto" onClick={() => setShowWorkerForm((prev) => !prev)} type="button">
          + 작업자 등록
        </button>
      </div>

      {showWorkerForm && (
        <div className="panel">
          <div className="panel-title">새 작업자 등록</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">이름</label>
              <input className="form-input" value={newWorker.name} onChange={(event) => setNewWorker((prev) => ({ ...prev, name: event.target.value }))} placeholder="홍길동" />
            </div>
            <div className="form-group">
              <label className="form-label">직책</label>
              <select className="form-select" value={newWorker.role} onChange={(event) => setNewWorker((prev) => ({ ...prev, role: event.target.value }))}>
                <option value="">선택</option>
                {workerRoleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">연락처</label>
              <input className="form-input" value={newWorker.phone} onChange={(event) => setNewWorker((prev) => ({ ...prev, phone: event.target.value }))} placeholder="010-0000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">배치 구역</label>
              <select className="form-select" value={newWorker.zone_id} onChange={(event) => setNewWorker((prev) => ({ ...prev, zone_id: event.target.value }))}>
                <option value="">선택</option>
                {ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="button-row">
            <button className="btn-primary react-btn-auto" onClick={handleCreateWorker} type="button">등록</button>
            <button className="btn-sm react-btn-auto" onClick={() => setShowWorkerForm(false)} type="button">취소</button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">전체 작업자</div>
        <table className="worker-table">
          <thead>
            <tr>
              <th>이름 / 직책</th>
              <th>연락처</th>
              <th>배치 구역</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 && (
              <tr>
                <td colSpan="5" className="table-empty">등록된 작업자가 없습니다.</td>
              </tr>
            )}
            {workers.map((worker) => {
              const zone = getZoneMeta(worker.zone_id);
              return (
                <tr key={worker.id}>
                  <td>
                    <div className="worker-name">
                      <div className="mini-avatar">{(worker.name || '?').slice(0, 1)}</div>
                      <div>
                        <div>{worker.name}</div>
                        <div className="table-sub">{worker.role || '직책 미정'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{worker.phone || '-'}</td>
                  <td>{zone ? `${zone.name} · ${zone.description}` : '미배치'}</td>
                  <td><span className={`status-tag ${worker.status}`}>{WORKER_STATUS_LABELS[worker.status] || worker.status}</span></td>
                  <td>
                    <div className="table-action-stack">
                      <select className="form-select compact-select" value={worker.status} onChange={(event) => handleUpdateWorkerStatus(worker.id, event.target.value)}>
                        <option value="work">작업 중</option>
                        <option value="rest">휴식</option>
                        <option value="absent">미출근</option>
                      </select>
                      <button className="btn-danger-xs react-btn-auto" onClick={() => handleDeleteWorker(worker.id)} type="button">삭제</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
