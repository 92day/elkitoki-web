const WORKER_NAME_BY_KEY = {
  A: '이레드',
  B: '김그린',
};

function formatCallLogText(text) {
  if (!text) return '';
  return text
    .replace(/^\[작업자 호출\]\s*/, '')
    .replace(/^\[작업자 요청\]\s*/, '')
    .replace(/작업자\s*A/g, WORKER_NAME_BY_KEY.A)
    .replace(/작업자\s*B/g, WORKER_NAME_BY_KEY.B)
    .replace(/\bA(?=\s*(호출|요청))/g, WORKER_NAME_BY_KEY.A)
    .replace(/\bB(?=\s*(호출|요청))/g, WORKER_NAME_BY_KEY.B);
}

function getCallLogType(text) {
  if ((text || '').startsWith('[작업자 요청]')) return '작업자 요청';
  return '작업자 호출';
}

export default function WorkerCallPage({
  callLogs,
  callingWorker,
  handleCallWorker,
  handleDeleteReport,
  handleDeleteWorkerCallLogs,
}) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">작업자 호출</div>
      </div>

      <div className="panel">
        <div className="panel-title">📟 작업자 호출</div>
        <div className="worker-call-grid">
          <button className="btn-primary worker-call-btn react-btn-auto" type="button" onClick={() => handleCallWorker('A')} disabled={callingWorker === 'A'}>
            {callingWorker === 'A' ? '호출 중...' : WORKER_NAME_BY_KEY.A + ' 호출'}
          </button>
          <button className="btn-primary worker-call-btn react-btn-auto" type="button" onClick={() => handleCallWorker('B')} disabled={callingWorker === 'B'}>
            {callingWorker === 'B' ? '호출 중...' : WORKER_NAME_BY_KEY.B + ' 호출'}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head-row">
          <div className="panel-title">📒 호출 로그</div>
          <button className="btn-sm react-btn-auto" onClick={handleDeleteWorkerCallLogs} disabled={callLogs.length === 0} type="button">일괄삭제</button>
        </div>
        <div className="report-list-wrap">
          {callLogs.length === 0 && <div className="table-empty">저장된 호출 로그가 없습니다.</div>}
          {callLogs.map((report) => (
            <div className="report-item" key={report.id}>
              <div className="report-header">
                <div>
                  <div className="report-date">{new Date(report.created_at).toLocaleString('ko-KR')}</div>
                  <div className="report-author">작성자: {report.author_name || '구이일'} · {getCallLogType(report.text_content)}</div>
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

