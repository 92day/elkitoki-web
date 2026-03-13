function formatCallLogText(text) {
  if (!text) return '';
  return text.replace(/^\[작업자 호출\]\s*/, '');
}

export default function WorkerCallPage({
  callLogs,
  callingWorker,
  handleCallWorker,
  handleDeleteReport,
}) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">작업자 호출</div>
      </div>

      <div className="panel">
        <div className="panel-title">📟 작업자 호출</div>
        <div className="worker-call-grid">
          <button className="btn-primary worker-call-btn react-btn-auto" type="button" onClick={() => handleCallWorker('작업자 A')} disabled={callingWorker === '작업자 A'}>
            {callingWorker === '작업자 A' ? '호출 중...' : '작업자 A 호출'}
          </button>
          <button className="btn-primary worker-call-btn react-btn-auto" type="button" onClick={() => handleCallWorker('작업자 B')} disabled={callingWorker === '작업자 B'}>
            {callingWorker === '작업자 B' ? '호출 중...' : '작업자 B 호출'}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">📒 호출 로그</div>
        <div className="report-list-wrap">
          {callLogs.length === 0 && <div className="table-empty">저장된 호출 로그가 없습니다.</div>}
          {callLogs.map((report) => (
            <div className="report-item" key={report.id}>
              <div className="report-header">
                <div>
                  <div className="report-date">{new Date(report.created_at).toLocaleString('ko-KR')}</div>
                  <div className="report-author">작성자: {report.author_name || '구이일'} · 작업자 호출</div>
                </div>
                <button className="report-delete-btn react-btn-auto" onClick={() => handleDeleteReport(report.id)} type="button" aria-label="삭제">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 6h18"></path>
                    <path d="M8 6V4h8v2"></path>
                    <path d="M19 6l-1 14H6L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                  </svg>
                </button>
              </div>
              <div className="report-preview">{formatCallLogText(report.text_content)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
