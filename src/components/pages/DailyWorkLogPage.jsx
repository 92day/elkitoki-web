export default function DailyWorkLogPage({
  todaySummary,
  todayReports,
  manualLogText,
  setManualLogText,
  handleCreateManualLog,
  handleDeleteReport,
  savingManualLog,
}) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">오늘의 작업일지</div>
      </div>

      <div className="panel">
        <div className="panel-title">🧠 오늘의 요약 (AI)</div>
        <div className="report-preview" style={{ minHeight: 120, whiteSpace: 'pre-wrap' }}>
          {todaySummary?.summary_text || '저장된 오늘 요약이 없습니다. AI 요약 브랜치에서 자동 요약 생성 기능을 연결할 예정입니다.'}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">✍️ 수동 입력</div>
        <div className="form-group spaced-field">
          <label className="form-label">작업 메모</label>
          <textarea
            className="form-input"
            value={manualLogText}
            onChange={(event) => setManualLogText(event.target.value)}
            placeholder="오늘 작업 지시사항이나 메모를 입력해 주세요."
            rows={4}
          />
        </div>
        <div className="button-row">
          <button className="btn-primary react-btn-auto" onClick={handleCreateManualLog} disabled={savingManualLog} type="button">
            {savingManualLog ? '저장 중...' : '수동 기록 저장'}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">🗒️ 번역 로그</div>
        <div className="report-list-wrap">
          {todayReports.length === 0 && <div className="table-empty">오늘 저장된 대화 기록이 없습니다.</div>}
          {todayReports.map((report) => (
            <div className="report-item" key={report.id}>
              <div className="report-header">
                <div>
                  <div className="report-date">{new Date(report.created_at).toLocaleString('ko-KR')}</div>
                  <div className="report-author">작성자: {report.author_name || '구이일'} · {report.entry_type === 'manual' ? '수동 입력' : '번역 기록'}</div>
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
              <div className="report-preview">원문: {report.text_content}</div>
              {report.translated_text && <div className="report-preview">번역: {report.translated_text}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
