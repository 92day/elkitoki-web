import { useEffect, useMemo, useState } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const LANGUAGES = [
  { code: 'vi', label: 'Vietnamese', voice: 'vi-VN' },
  { code: 'en', label: 'English', voice: 'en-US' },
  { code: 'uz', label: 'Uzbek', voice: 'uz-UZ' },
  { code: 'th', label: 'Thai', voice: 'th-TH' },
  { code: 'mn', label: 'Mongolian', voice: 'mn-MN' },
];

function getSpeechErrorMessage(error) {
  if (error === 'not-allowed') return 'Microphone permission was denied.';
  if (error === 'network') return 'A network error occurred during speech recognition.';
  if (error === 'speech_not_supported') return 'This browser does not support speech recognition.';
  if (error === 'no-speech') return 'No speech was detected. Please try again.';
  return error ? `Speech recognition error: ${error}` : '';
}

export default function CommandReportPage({ apiRequest, logMessage }) {
  const speech = useSpeechRecognition('ko-KR');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [reports, setReports] = useState([]);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedLanguage = useMemo(
    () => LANGUAGES.find((item) => item.code === targetLanguage) || LANGUAGES[0],
    [targetLanguage]
  );

  const loadReports = async () => {
    try {
      const data = await apiRequest('/api/reports/');
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      logMessage(`Failed to load reports: ${err.message}`);
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

    try {
      setTranslating(true);
      const data = await apiRequest('/api/translate', {
        method: 'POST',
        body: {
          text,
          source_language: 'ko',
          target_language: targetLanguage,
        },
      });
      setTranslatedText(data.translated_text || '');
      logMessage(`Translated to ${selectedLanguage.label}`);
    } catch (err) {
      logMessage(`Translation failed: ${err.message}`);
    } finally {
      setTranslating(false);
    }
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
          source_language: 'ko',
          target_language: targetLanguage,
          author_name: 'Site Manager',
        },
      });
      await loadReports();
      logMessage('Voice command saved as report');
    } catch (err) {
      logMessage(`Failed to save report: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await apiRequest(`/api/reports/${reportId}`, { method: 'DELETE' });
      await loadReports();
      logMessage('Report deleted');
    } catch (err) {
      logMessage(`Failed to delete report: ${err.message}`);
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
    utterance.lang = selectedLanguage.voice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    logMessage('Playing translated audio');
  };

  return (
    <div className="page-grid command-report-layout">
      <section className="panel command-report-panel">
        <header className="panel-head">
          <h2>Voice Command Report</h2>
          <span className="meta-text">Speak once, translate it, and save the supervisor instruction as a report.</span>
        </header>

        <div className="command-report-controls">
          <div className="translation-field">
            <label htmlFor="command-language">Target Language</label>
            <select id="command-language" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </div>
          <div className="broadcast-actions-row">
            <button type="button" className="btn-primary" onClick={speech.isListening ? speech.stop : speech.start}>
              {speech.isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setSourceText(''); setTranslatedText(''); }}>
              Clear
            </button>
          </div>
        </div>

        <div className="broadcast-card-grid">
          <section className="broadcast-card">
            <div className="translation-card-head">
              <h3>Spoken Korean Text</h3>
              <span className={`live-chip ${speech.isListening ? 'active' : ''}`}>{speech.isListening ? 'LISTENING' : 'READY'}</span>
            </div>
            <textarea rows={6} value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Speak or type the supervisor instruction." />
            {speech.error && <div className="inline-note error">{getSpeechErrorMessage(speech.error)}</div>}
          </section>

          <section className="broadcast-card">
            <div className="translation-card-head">
              <h3>Translated Instruction</h3>
              <span className="lang-pill">{selectedLanguage.label}</span>
            </div>
            <textarea rows={6} readOnly value={translatedText} placeholder="The translated result will appear here." />
            <div className="broadcast-actions-row">
              <button type="button" className="btn-primary" onClick={handleTranslate} disabled={translating}>
                {translating ? 'Translating...' : 'Translate'}
              </button>
              <button type="button" className="btn-ghost" onClick={playTranslation} disabled={!translatedText.trim()}>
                Play Audio
              </button>
            </div>
          </section>
        </div>

        <div className="broadcast-footer-actions command-report-save-row">
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save As Report'}
          </button>
        </div>
      </section>

      <section className="panel translation-history-panel">
        <header className="panel-head">
          <h2>Saved Command Reports</h2>
          <button type="button" className="btn-ghost compact" onClick={loadReports}>Refresh</button>
        </header>
        <div className="list-wrap translation-history-list">
          {reports.length === 0 && <div className="empty">No saved command reports</div>}
          {reports.map((report) => (
            <article className="translation-history-item" key={report.id}>
              <div className="translation-history-meta">
                <span>{new Date(report.created_at).toLocaleString('en-US')}</span>
                <span>{report.source_language || 'ko'} to {report.target_language || '-'}</span>
              </div>
              <div className="translation-history-source">{report.text_content}</div>
              <div className="translation-history-target">{report.translated_text || 'No translation saved'}</div>
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
