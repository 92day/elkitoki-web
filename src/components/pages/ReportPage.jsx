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
  handleTranslateWalkie,
  handlePlayTranslatedText,
  savingReport,
  handleSaveWalkie,
  handleResetWalkie,
  visibleReports,
  handleDeleteReport,
}) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">{'\uc6cc\ud0a4\ud1a0\ud0a4'}</div>
      </div>

      <div className="panel">
        <div className="panel-title">{'\ud83d\udcfb \uc74c\uc131 \ubc88\uc5ed'}</div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">{'\ub9d0\ud560 \uc5b8\uc5b4'}</label>
            <div className="language-select-row">
              <select
                className="form-select"
                value={sourceLanguage}
                onChange={(event) => setSourceLanguage(event.target.value)}
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
              <div className="language-flag-badge">
                {sourceMeta.badge}{' '}
                <img
                  className="language-flag-image"
                  src={sourceMeta.flagPath}
                  alt={`${sourceMeta.label} flag`}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{'\ubc88\uc5ed \uc5b8\uc5b4'}</label>
            <div className="language-select-row">
              <select
                className="form-select"
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
              <div className="language-flag-badge">
                {targetMeta.badge}{' '}
                <img
                  className="language-flag-image"
                  src={targetMeta.flagPath}
                  alt={`${targetMeta.label} flag`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="recorder-box recorder-box-spaced">
          <div className="record-timer">{formatTimer(recordSeconds)}</div>
          <button
            className={`record-btn ${speech.isListening ? 'recording' : ''}`}
            onClick={speech.isListening ? speech.stop : speech.start}
            type="button"
          >
            {'\ud83c\udfa4'}
          </button>

          <div className="record-status">
            {speech.isListening
              ? '\uc74c\uc131 \uc778\uc2dd \uc911\uc785\ub2c8\ub2e4.'
              : '\ubc84\ud2bc\uc744 \ub20c\ub7ec \uc74c\uc131 \uc778\uc2dd\uc744 \uc2dc\uc791\ud558\uc138\uc694'}
          </div>

          <div className="walkie-language-row">
            <span>
              <img
                className="walkie-inline-flag"
                src={sourceMeta.flagPath}
                alt={`${sourceMeta.label} flag`}
              />{' '}
              {'\ub9d0\ud560 \uc5b8\uc5b4:'} {sourceMeta.label}
            </span>
            <span>
              <img
                className="walkie-inline-flag"
                src={targetMeta.flagPath}
                alt={`${targetMeta.label} flag`}
              />{' '}
              {'\ubc88\uc5ed \uc5b8\uc5b4:'} {targetMeta.label}
            </span>
          </div>

          <div className={`stt-result ${sourceText ? 'filled' : ''}`}>
            {sourceText || '\ub9d0\ud558\uba74 \uc5ec\uae30\uc5d0 \ud14d\uc2a4\ud2b8\uac00 \ud45c\uc2dc\ub429\ub2c8\ub2e4...'}
          </div>

          <div className={`stt-result walkie-translation-box ${translatedText ? 'filled' : ''}`}>
            {translatedText || '\ubc88\uc5ed \uacb0\uacfc\uac00 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4...'}
          </div>

          {speech.error && (
            <div className="walkie-error">{getSpeechErrorMessage(speech.error)}</div>
          )}

          <div className="walkie-action-row">
            <button
              className="btn-primary react-btn-auto"
              onClick={handleTranslateWalkie}
              disabled={translating}
              type="button"
            >
              {translating ? '\ubc88\uc5ed \uc911...' : '\ubc88\uc5ed\ud558\uae30'}
            </button>
            <button
              className="btn-sm react-btn-auto"
              onClick={handlePlayTranslatedText}
              type="button"
            >
              {'\uc74c\uc131 \uc7ac\uc0dd'}
            </button>
            <button
              className="btn-primary react-btn-auto"
              onClick={handleSaveWalkie}
              disabled={savingReport}
              type="button"
            >
              {savingReport ? '\uc800\uc7a5 \uc911...' : '\uc800\uc7a5'}
            </button>
            <button
              className="btn-sm react-btn-auto"
              onClick={handleResetWalkie}
              type="button"
            >
              {'\ucd08\uae30\ud654'}
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">{'\ud83d\uddd2\ufe0f \uc791\uc5c5 \uc9c0\uc2dc \uc790\ub3d9 \uae30\ub85d'}</div>
        <div className="report-list-wrap">
          {visibleReports.length === 0 && (
            <div className="table-empty">{'\uc791\uc5c5 \uc9c0\uc2dc \uc790\ub3d9 \uae30\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.'}</div>
          )}

          {visibleReports.map((report) => (
            <div className="report-item" key={report.id}>
              <div className="report-header">
                <div>
                  <div className="report-date">
                    {report.date || new Date(report.created_at).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="report-author">
                    {'\uc791\uc131\uc790:'} {report.author_name || '\uad6c\uc774\uc77c'}
                  </div>
                </div>
                <button
                  className="report-delete-btn react-btn-auto"
                  onClick={() => handleDeleteReport(report.id)}
                  type="button"
                  aria-label={'\uc0ad\uc81c'}
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
              <div className="report-preview">{'\uc6d0\ubb38:'} {report.text_content}</div>
              <div className="report-preview">{'\ubc88\uc5ed:'} {report.translated_text || '\ubc88\uc5ed \uc5c6\uc74c'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
