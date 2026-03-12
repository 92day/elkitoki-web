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
}) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">워키토키</div>
      </div>

      <div className="panel">
        <div className="panel-title">📻 음성 번역</div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">말할 언어</label>
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

        <div className="recorder-box recorder-box-spaced">
          <div className="record-timer">{formatTimer(recordSeconds)}</div>
          <button className={`record-btn ${speech.isListening ? 'recording' : ''}`} onClick={speech.isListening ? speech.stop : speech.start} type="button">🎤</button>
          <div className="record-status">
            {speech.isListening ? '음성 인식 중입니다.' : '버튼을 눌러 음성 인식을 시작하세요'}
          </div>
          <div className="walkie-language-row">
            <span><img className="walkie-inline-flag" src={sourceMeta.flagPath} alt={`${sourceMeta.label} flag`} /> 말할 언어: {sourceMeta.label}</span>
            <span><img className="walkie-inline-flag" src={targetMeta.flagPath} alt={`${targetMeta.label} flag`} /> 번역 언어: {targetMeta.label}</span>
          </div>
          <div className={`stt-result ${sourceText ? 'filled' : ''}`}>{sourceText || '말하면 여기에 텍스트가 표시됩니다...'}</div>
          <div className={`stt-result walkie-translation-box ${translatedText ? 'filled' : ''}`}>{translatedText || '번역 결과가 여기에 표시됩니다...'}</div>
          {speech.error && <div className="walkie-error">{getSpeechErrorMessage(speech.error)}</div>}
          <div className="walkie-action-row">
            <button className="btn-primary react-btn-auto" onClick={handleTranslateWalkie} disabled={translating} type="button">{translating ? '번역 중...' : '번역하기'}</button>
            <button className="btn-sm react-btn-auto" onClick={handlePlayTranslatedText} type="button">음성 재생</button>
            <button className="btn-primary react-btn-auto" onClick={handleSaveWalkie} disabled={savingReport} type="button">{savingReport ? '저장 중...' : '저장'}</button>
            <button className="btn-sm react-btn-auto" onClick={handleResetWalkie} type="button">초기화</button>
          </div>
        </div>
      </div>
    </div>
  );
}
