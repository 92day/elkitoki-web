export default function ReportPage({
  sourceLanguage,
  targetLanguage,
  setSourceLanguage,
  setTargetLanguage,
  languages,
  sourceMeta,
  targetMeta,
  speech,
  recordSeconds,
  formatTimer,
  sourceText,
  translatedText,
  getSpeechErrorMessage,
  translating,
  savingReport,
  handleSaveWalkie,
  handleResetWalkie,
  handleSpeakTranslatedText,
  handlePressToTalkStart,
  handlePressToTalkEnd,
  todayReports = [],
  handleDeleteReport,
  handleDeleteTranslationReports,
}) {
  const helperText = speech.isListening
    ? '버튼을 누르고 있는 동안 음성을 인식합니다.'
    : '버튼을 누른 채로 말하고, 손을 떼면 자동 번역과 음성 재생이 시작됩니다.';

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">실시간 번역</div>
      </div>

      <div className="panel">
        <div className="panel-title">📻 음성 번역</div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">입력 언어</label>
            <div className="language-select-row">
              <select className="form-select" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>{language.label}</option>
                ))}
              </select>
              <div className="language-flag-badge">
                {sourceMeta.badge} <img className="language-flag-image" src={sourceMeta.flagPath} alt={`${sourceMeta.label} flag`} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">번역 언어</label>
            <div className="language-select-row">
              <select className="form-select" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>{language.label}</option>
                ))}
              </select>
              <div className="language-flag-badge">
                {targetMeta.badge} <img className="language-flag-image" src={targetMeta.flagPath} alt={`${targetMeta.label} flag`} />
              </div>
            </div>
          </div>
        </div>

        <div className="walkie-help-text">{helperText}</div>

        <div className="recorder-box recorder-box-spaced">
          <div className="walkie-language-row">
            <span><img className="walkie-inline-flag" src={sourceMeta.flagPath} alt={`${sourceMeta.label} flag`} /> 입력 언어: {sourceMeta.label}</span>
            <span><img className="walkie-inline-flag" src={targetMeta.flagPath} alt={`${targetMeta.label} flag`} /> 번역 언어: {targetMeta.label}</span>
          </div>

          <div className="walkie-main-row">
            <div className="walkie-text-stack">
              <div className={`stt-result walkie-result-compact ${sourceText ? 'filled' : ''}`}>{sourceText || '말하면 여기에 텍스트가 표시됩니다...'}</div>
              <div className={`stt-result walkie-result-compact walkie-translation-box ${translatedText ? 'filled' : ''}`}>
                {translating ? '번역 중...' : translatedText || '번역 결과가 여기에 표시됩니다...'}
              </div>
              {speech.error && <div className="walkie-error">{getSpeechErrorMessage(speech.error)}</div>}
            </div>

            <div className="walkie-mic-stack">
              <button
                className={`record-btn walkie-record-btn ${speech.isListening ? 'recording' : ''}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handlePressToTalkStart();
                }}
                onMouseUp={handlePressToTalkEnd}
                onMouseLeave={handlePressToTalkEnd}
                onTouchStart={(event) => {
                  event.preventDefault();
                  handlePressToTalkStart();
                }}
                onTouchEnd={(event) => {
                  event.preventDefault();
                  handlePressToTalkEnd();
                }}
                onTouchCancel={(event) => {
                  event.preventDefault();
                  handlePressToTalkEnd();
                }}
                onContextMenu={(event) => event.preventDefault()}
                onSelect={(event) => event.preventDefault()}
                type="button"
              >
                🎤
              </button>
              <div className="record-timer walkie-side-timer">{formatTimer(recordSeconds)}</div>
            </div>
          </div>

          <div className="walkie-action-row">
            <button
              className="btn-sm react-btn-auto"
              onClick={handleSpeakTranslatedText}
              disabled={!translatedText || translating}
              type="button"
            >
              음성 재생
            </button>
            <button className="btn-primary react-btn-auto" onClick={handleSaveWalkie} disabled={savingReport} type="button">{savingReport ? '저장 중...' : '저장'}</button>
            <button className="btn-sm react-btn-auto" onClick={handleResetWalkie} type="button">초기화</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head-row">
          <div className="panel-title">🗒️ 번역 로그</div>
          <button className="btn-sm react-btn-auto" onClick={handleDeleteTranslationReports} disabled={todayReports.length === 0} type="button">일괄삭제</button>
        </div>
        <div className="report-list-wrap">
          {todayReports.length === 0 && <div className="table-empty">번역 로그가 없습니다.</div>}

          {todayReports.map((report) => (
            <div className="report-item" key={report.id}>
              <div className="report-header">
                <div>
                  <div className="report-date">
                    {report.date || new Date(report.created_at).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="report-author">작성자: {report.author_name || '구이일'}</div>
                </div>
                <button
                  className="report-delete-btn react-btn-auto"
                  onClick={() => handleDeleteReport?.(report.id)}
                  type="button"
                  aria-label="삭제"
                >
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
              <div className="report-preview">번역: {report.translated_text || '번역 없음'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
