import { useState } from 'react';

export default function DailyWorkLogPage({
  todaySummary,
  todayReports,
  manualLogText,
  setManualLogText,
  handleCreateManualLog,
  handleDeleteReport,
  handleDeleteDailyReports,
  savingManualLog,
  handleGenerateSummary,
  generatingSummary,
}) {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const summaryText = todaySummary?.summary_text || '저장된 오늘 요약이 없습니다. 버튼을 눌러 소통 로그를 요약해 보세요.';
  const summaryUpdatedAt = todaySummary?.updated_at
    ? new Date(todaySummary.updated_at).toLocaleString('ko-KR')
    : null;

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">오늘의 작업일지</div>
      </div>

      <div className="panel">
        <div className="panel-title">🧠 오늘의 요약 (AI)</div>
        <button className="summary-preview-card react-btn-auto" type="button" onClick={() => setShowSummaryModal(true)}>
          <div className="summary-preview-text">{summaryText}</div>
          <div className="summary-preview-hint">클릭해서 크게 보기</div>
        </button>
        <div className="button-row" style={{ marginTop: 12 }}>
          <button className="btn-primary react-btn-auto" onClick={handleGenerateSummary} disabled={generatingSummary} type="button">
            {generatingSummary ? '요약 생성 중...' : '요약 생성'}
          </button>
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
        <div className="panel-head-row">
          <div className="panel-title">🗒️ 소통 로그</div>
          <button className="btn-sm react-btn-auto" onClick={handleDeleteDailyReports} disabled={todayReports.length === 0} type="button">일괄삭제</button>
        </div>
        <div className="report-list-wrap">
          {todayReports.length === 0 && <div className="table-empty">오늘 저장된 소통 로그가 없습니다.</div>}
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
              <div className="report-preview">{report.text_content}</div>
            </div>
          ))}
        </div>
      </div>

      {showSummaryModal && (
        <div className="photo-modal-overlay" onClick={() => setShowSummaryModal(false)}>
          <div className="summary-modal-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="photo-modal-head-react">
              <div>
                <div className="section-title">오늘의 요약 전체 보기</div>
                <div className="table-sub">{summaryUpdatedAt ? `최근 생성: ${summaryUpdatedAt}` : '아직 생성된 요약이 없습니다.'}</div>
              </div>
              <button className="photo-modal-close-react react-btn-auto" type="button" onClick={() => setShowSummaryModal(false)}>
                닫기
              </button>
            </div>
            <div className="summary-modal-body">{summaryText}</div>
          </div>
        </div>
      )}
    </div>
  );
}
