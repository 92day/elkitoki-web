import { useEffect, useMemo, useState } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const LANGUAGES = [
  { code: 'ko', label: 'Korean', speech: 'ko-KR', voice: 'ko-KR' },
  { code: 'en', label: 'English', speech: 'en-US', voice: 'en-US' },
  { code: 'vi', label: 'Vietnamese', speech: 'vi-VN', voice: 'vi-VN' },
  { code: 'th', label: 'Thai', speech: 'th-TH', voice: 'th-TH' },
  { code: 'uz', label: 'Uzbek', speech: 'uz-UZ', voice: 'uz-UZ' },
  { code: 'mn', label: 'Mongolian', speech: 'mn-MN', voice: 'mn-MN' },
];

function getSpeechErrorMessage(error) {
  if (error === 'not-allowed') return 'Microphone permission was denied.';
  if (error === 'network') return 'A network error occurred during speech recognition.';
  if (error === 'speech_not_supported') return 'This browser does not support speech recognition.';
  if (error === 'no-speech') return 'No speech was detected. Please try again.';
  return error ? `Speech recognition error: ${error}` : '';
}

function isLegacyPlaceholder(report) {
  const combined = `${report.text_content || ''} ${report.translated_text || ''}`;
  return combined.includes('OPENAI_API_KEY');
}

export default function WalkieTalkiePage({ apiRequest, logMessage }) {
  const [sourceLanguage, setSourceLanguage] = useState('ko');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [reports, setReports] = useState([]);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);

  const sourceMeta = useMemo(
    () => LANGUAGES.find((item) => item.code === sourceLanguage) || LANGUAGES[0],
    [sourceLanguage]
  );
  const targetMeta = useMemo(
    () => LANGUAGES.find((item) => item.code === targetLanguage) || LANGUAGES[0],
    [targetLanguage]
  );
  const visibleReports = useMemo(() => reports.filter((report) => !isLegacyPlaceholder(report)), [reports]);

  const speech = useSpeechRecognition(sourceMeta.speech);

  const loadReports = async () => {
    try {
      const data = await apiRequest('/api/reports/');
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      logMessage(`Failed to load talk logs: ${err.message}`);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (speech.transcript) {
      setSourceText(speech.transcript);
    }
  }, [speech.transcript]);

  useEffect(() => {
    const message = getSpeechErrorMessage(speech.error);
    if (message) {
      logMessage(message);
    }
  }, [speech.error, logMessage]);

  const handleTranslate = async () => {
    const text = sourceText.trim();
    if (!text) {
      logMessage('Enter a message or start speech recognition first.');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setTranslatedText(text);
      logMessage('Source and target languages match, so the original text was copied.');
      return;
    }

    try {
      setTranslating(true);
      const data = await apiRequest('/api/translate', {
        method: 'POST',
        body: {
          text,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        },
      });
      setTranslatedText(data.translated_text || '');
      logMessage(`Translated to ${targetMeta.label}`);
    } catch (err) {
      logMessage(`Translation failed: ${err.message}`);
    } finally {
      setTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    logMessage('Source and target languages were swapped.');
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    logMessage('Walkie talkie input was cleared.');
  };

  const handleSave = async () => {
    const original = sourceText.trim();
    if (!original) {
      logMessage('There is no spoken message to save.');
      return;
    }

    try {
      setSaving(true);
      await apiRequest('/api/reports/', {
        method: 'POST',
        body: {
          text_content: original,
          translated_text: translatedText.trim(),
          source_language: sourceLanguage,
          target_language: targetLanguage,
          author_name: 'Site Manager',
        },
      });
      await loadReports();
      logMessage('Walkie talkie message saved as report.');
    } catch (err) {
      logMessage(`Failed to save talk log: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await apiRequest(`/api/reports/${reportId}`, { method: 'DELETE' });
      await loadReports();
      logMessage('Talk log deleted.');
    } catch (err) {
      logMessage(`Failed to delete talk log: ${err.message}`);
    }
  };

  const playTranslation = () => {
    const text = translatedText.trim();
    if (!text) {
      logMessage('There is no translated text to play.');
      return;
    }

    if (!window.speechSynthesis) {
      logMessage('This browser does not support speech playback.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetMeta.voice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    logMessage('Playing translated audio.');
  };

  return (
    <div className="page-grid walkie-layout">
      <section className="panel walkie-panel">
        <header className="panel-head">
          <h2>Walkie Talkie</h2>
          <span className="meta-text">Choose two languages, speak once, translate instantly, and save the message as a talk log.</span>
        </header>

        <div className="walkie-toolbar">
          <div className="translation-field">
            <label htmlFor="source-language">Speak Language</label>
            <select id="source-language" value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </div>

          <button type="button" className="btn-ghost compact walkie-swap" onClick={handleSwapLanguages}>
            Swap
          </button>

          <div className="translation-field">
            <label htmlFor="target-language">Translate To</label>
            <select id="target-language" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="broadcast-actions-row walkie-actions">
          <button type="button" className="btn-primary" onClick={speech.isListening ? speech.stop : speech.start}>
            {speech.isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          <button type="button" className="btn-primary" onClick={handleTranslate} disabled={translating}>
            {translating ? 'Translating...' : 'Translate'}
          </button>
          <button type="button" className="btn-ghost" onClick={playTranslation} disabled={!translatedText.trim()}>
            Play Audio
          </button>
          <button type="button" className="btn-ghost" onClick={handleClear}>
            Clear
          </button>
        </div>

        <div className="broadcast-card-grid walkie-card-grid">
          <section className="broadcast-card">
            <div className="translation-card-head">
              <h3>Recognized Text</h3>
              <span className={`live-chip ${speech.isListening ? 'active' : ''}`}>
                {speech.isListening ? 'LISTENING' : 'READY'}
              </span>
            </div>
            <textarea
              rows={7}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Speak or type the original message here."
            />
            <div className="translation-history-meta">
              <span>Source language: {sourceMeta.label}</span>
            </div>
            {speech.error && <div className="inline-note error">{getSpeechErrorMessage(speech.error)}</div>}
          </section>

          <section className="broadcast-card">
            <div className="translation-card-head">
              <h3>Translated Message</h3>
              <span className="lang-pill">{targetMeta.label}</span>
            </div>
            <textarea
              rows={7}
              value={translatedText}
              readOnly
              placeholder="The translated message will appear here."
            />
            <div className="translation-history-meta">
              <span>Target language: {targetMeta.label}</span>
            </div>
          </section>
        </div>

        <div className="broadcast-footer-actions walkie-save-row">
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Talk Log'}
          </button>
        </div>
      </section>

      <section className="panel translation-history-panel">
        <header className="panel-head">
          <h2>Saved Talk Logs</h2>
          <button type="button" className="btn-ghost compact" onClick={loadReports}>Refresh</button>
        </header>
        <div className="list-wrap translation-history-list">
          {visibleReports.length === 0 && <div className="empty">No saved talk logs</div>}
          {visibleReports.map((report) => (
            <article className="translation-history-item" key={report.id}>
              <div className="translation-history-meta">
                <span>{new Date(report.created_at).toLocaleString('en-US')}</span>
                <span>{report.source_language || '-'} to {report.target_language || '-'}</span>
              </div>
              <div className="translation-history-source">{report.text_content}</div>
              <div className="translation-history-target">{report.translated_text || 'No translated text saved'}</div>
              <div className="broadcast-log-meta">
                <span>Author: {report.author_name || 'Site Manager'}</span>
                <button type="button" className="btn-ghost compact" onClick={() => handleDelete(report.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
