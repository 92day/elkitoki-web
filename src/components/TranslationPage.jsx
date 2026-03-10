import { useEffect, useMemo, useState } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const TRANSLATION_LANGUAGES = [
  { code: 'vi', label: 'Vietnamese', voice: 'vi-VN' },
  { code: 'en', label: 'English', voice: 'en-US' },
  { code: 'uz', label: 'Uzbek', voice: 'uz-UZ' },
  { code: 'th', label: 'Thai', voice: 'th-TH' },
  { code: 'mn', label: 'Mongolian', voice: 'mn-MN' },
];

const DANGER_KEYWORDS = [
  'danger',
  'evacuate',
  'retreat',
  'stop',
  'careful',
  'fall',
  'collision',
  'fire',
  '\uC704\uD5D8',
  '\uB300\uD53C',
  '\uD6C4\uD1F4',
  '\uC815\uC9C0',
  '\uC870\uC2EC',
  '\uB099\uD558',
  '\uCDA9\uB3CC',
  '\uD654\uC7AC',
];

function getSpeechErrorMessage(error) {
  if (error === 'not-allowed') return 'Microphone permission was denied.';
  if (error === 'network') return 'A network error occurred during speech recognition.';
  if (error === 'speech_not_supported') return 'This browser does not support speech recognition.';
  if (error === 'no-speech') return 'No speech was detected. Please try again.';
  return error ? `Speech recognition error: ${error}` : '';
}

export default function TranslationPage({ apiRequest, logMessage }) {
  const speech = useSpeechRecognition('ko-KR');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [translationInput, setTranslationInput] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translationHistory, setTranslationHistory] = useState([]);
  const [translating, setTranslating] = useState(false);
  const selectedLanguage = useMemo(
    () => TRANSLATION_LANGUAGES.find((item) => item.code === targetLanguage) || TRANSLATION_LANGUAGES[0],
    [targetLanguage]
  );
  const dangerDetected = useMemo(
    () => DANGER_KEYWORDS.some((keyword) => translationInput.toLowerCase().includes(keyword.toLowerCase())),
    [translationInput]
  );

  const loadHistory = async () => {
    try {
      const data = await apiRequest('/api/translations?limit=20');
      setTranslationHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      logMessage(`Failed to load translation history: ${err.message}`);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (speech.transcript) {
      setTranslationInput(speech.transcript);
    }
  }, [speech.transcript]);

  useEffect(() => {
    const message = getSpeechErrorMessage(speech.error);
    if (message) {
      logMessage(message);
    }
  }, [speech.error]);

  const handleTranslate = async () => {
    const text = translationInput.trim();
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
      await loadHistory();
      logMessage(`Translated to ${selectedLanguage.label}`);
    } catch (err) {
      logMessage(`Translation failed: ${err.message}`);
    } finally {
      setTranslating(false);
    }
  };

  const playTranslation = () => {
    if (!translatedText.trim()) {
      logMessage('There is no translated text to play.');
      return;
    }

    if (!window.speechSynthesis) {
      logMessage('This browser does not support speech playback.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = selectedLanguage.voice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    logMessage('Playing translated audio');
  };

  const applyHistory = (item) => {
    setTargetLanguage(item.target_language);
    setTranslationInput(item.source_text);
    setTranslatedText(item.translated_text);
    logMessage('Loaded translation history item');
  };

  return (
    <div className="page-grid translation-layout">
      <section className="panel translation-panel">
        <header className="panel-head">
          <h2>Voice Translation</h2>
          <span className="meta-text">Convert Korean speech to text, then translate it in real time.</span>
        </header>

        {dangerDetected && (
          <div className="danger-banner">
            <strong>Danger keyword detected</strong>
            <span>This message is suitable for immediate vest vibration and LED warning delivery.</span>
          </div>
        )}

        <div className="translation-toolbar">
          <div className="translation-field">
            <label htmlFor="target-language">Target Language</label>
            <select id="target-language" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {TRANSLATION_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </div>
          <div className="translation-actions">
            <button type="button" className="btn-primary" onClick={speech.isListening ? speech.stop : speech.start}>
              {speech.isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setTranslationInput('')}>
              Clear Input
            </button>
          </div>
        </div>

        <div className="translation-stack">
          <div className="translation-card">
            <div className="translation-card-head">
              <h3>Source Text</h3>
              <span className={`live-chip ${speech.isListening ? 'active' : ''}`}>
                {speech.isListening ? 'LISTENING' : 'READY'}
              </span>
            </div>
            <textarea
              rows={6}
              placeholder="Example: Danger, move back now."
              value={translationInput}
              onChange={(e) => setTranslationInput(e.target.value)}
            />
            {speech.error && <div className="inline-note error">{getSpeechErrorMessage(speech.error)}</div>}
          </div>

          <div className="translation-card">
            <div className="translation-card-head">
              <h3>Translated Text</h3>
              <span className="lang-pill">{selectedLanguage.label}</span>
            </div>
            <textarea rows={6} value={translatedText} readOnly placeholder="The translated result will appear here." />
            <div className="translation-actions split">
              <button type="button" className="btn-primary" onClick={handleTranslate} disabled={translating}>
                {translating ? 'Translating...' : 'Translate'}
              </button>
              <button type="button" className="btn-ghost" onClick={playTranslation} disabled={!translatedText.trim()}>
                Play Audio
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel translation-history-panel">
        <header className="panel-head">
          <h2>Recent Translation History</h2>
          <button type="button" className="btn-ghost compact" onClick={loadHistory}>Refresh</button>
        </header>
        <div className="list-wrap translation-history-list">
          {translationHistory.length === 0 && <div className="empty">No saved translation history</div>}
          {translationHistory.map((item) => (
            <article className="translation-history-item" key={item.id}>
              <div className="translation-history-meta">
                <span>{new Date(item.created_at).toLocaleString('en-US')}</span>
                <span>{item.source_language} to {item.target_language}</span>
              </div>
              <div className="translation-history-source">{item.source_text}</div>
              <div className="translation-history-target">{item.translated_text}</div>
              <button type="button" className="btn-ghost compact" onClick={() => applyHistory(item)}>
                Load Again
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
