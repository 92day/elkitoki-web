import { useEffect, useMemo, useState } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const LANGUAGES = [
  { code: 'vi', label: 'Vietnamese', voice: 'vi-VN' },
  { code: 'en', label: 'English', voice: 'en-US' },
  { code: 'uz', label: 'Uzbek', voice: 'uz-UZ' },
  { code: 'th', label: 'Thai', voice: 'th-TH' },
  { code: 'mn', label: 'Mongolian', voice: 'mn-MN' },
];

const QUICK_COMMANDS = [
  'Danger. Move back immediately.',
  'Stop work now.',
  'Wear your safety helmet.',
  'Move to the evacuation route.',
  'Crane swing area. Keep clear.',
  'Gas risk detected. Exit the zone.',
];

const SIGNAL_TYPES = [
  { id: 'vibration', label: 'Vibration' },
  { id: 'led', label: 'LED Flash' },
  { id: 'left', label: 'Left Motor' },
  { id: 'right', label: 'Right Motor' },
  { id: 'front', label: 'Front Motor' },
  { id: 'rear', label: 'Rear Motor' },
];

function getSpeechErrorMessage(error) {
  if (error === 'not-allowed') return 'Microphone permission was denied.';
  if (error === 'network') return 'A network error occurred during speech recognition.';
  if (error === 'speech_not_supported') return 'This browser does not support speech recognition.';
  if (error === 'no-speech') return 'No speech was detected. Please try again.';
  return error ? `Speech recognition error: ${error}` : '';
}

export default function BroadcastPage({ apiRequest, logMessage, zones, workers }) {
  const speech = useSpeechRecognition('ko-KR');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [targetZone, setTargetZone] = useState('all');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sending, setSending] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeSignals, setActiveSignals] = useState(['vibration', 'led']);
  const [dispatchLog, setDispatchLog] = useState([]);

  const selectedLanguage = useMemo(
    () => LANGUAGES.find((item) => item.code === targetLanguage) || LANGUAGES[0],
    [targetLanguage]
  );

  const targetWorkers = useMemo(() => {
    if (targetZone === 'all') {
      return workers.filter((worker) => worker.status === 'work').length;
    }
    return workers.filter((worker) => String(worker.zone_id) === targetZone && worker.status === 'work').length;
  }, [targetZone, workers]);

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

  const toggleSignal = (signalId) => {
    setActiveSignals((prev) => (
      prev.includes(signalId)
        ? prev.filter((item) => item !== signalId)
        : [...prev, signalId]
    ));
  };

  const handleTranslate = async () => {
    const text = sourceText.trim();
    if (!text) {
      logMessage('Enter a command or start speech recognition first.');
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
      logMessage(`Command translated to ${selectedLanguage.label}`);
    } catch (err) {
      logMessage(`Translation failed: ${err.message}`);
    } finally {
      setTranslating(false);
    }
  };

  const handleSend = async () => {
    const original = sourceText.trim();
    if (!original) {
      logMessage('There is no command to send.');
      return;
    }

    const translated = translatedText.trim() || original;
    const zoneLabel = targetZone === 'all'
      ? 'All Zones'
      : (zones.find((zone) => String(zone.id) === targetZone)?.name || 'Unknown Zone');
    const signalLabel = activeSignals.length > 0 ? activeSignals.join(', ') : 'none';

    try {
      setSending(true);
      await apiRequest('/api/alerts/', {
        method: 'POST',
        body: {
          level: 'high',
          source: 'Broadcast Console',
          message: `[${zoneLabel}] ${original} | ${selectedLanguage.label}: ${translated} | Signals: ${signalLabel}`,
        },
      });

      const entry = {
        id: Date.now(),
        zoneLabel,
        original,
        translated,
        language: selectedLanguage.label,
        signals: signalLabel,
        workerCount: targetWorkers,
        createdAt: new Date().toLocaleString('en-US'),
      };
      setDispatchLog((prev) => [entry, ...prev].slice(0, 8));
      logMessage('Broadcast command sent');
    } catch (err) {
      logMessage(`Failed to send command: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const playAudio = () => {
    const text = translatedText.trim();
    if (!text) {
      logMessage('There is no translated audio to play.');
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
    logMessage('Playing broadcast audio');
  };

  return (
    <div className="page-grid broadcast-layout">
      <section className="panel broadcast-panel">
        <header className="panel-head">
          <h2>Live Broadcast</h2>
          <span className="meta-text">Translate a supervisor command and dispatch it as an immediate worker alert.</span>
        </header>

        <div className="broadcast-summary-grid">
          <article className="broadcast-stat">
            <span>Target Zone</span>
            <strong>{targetZone === 'all' ? 'All Zones' : zones.find((zone) => String(zone.id) === targetZone)?.name || 'Unknown Zone'}</strong>
          </article>
          <article className="broadcast-stat">
            <span>Workers Reached</span>
            <strong>{targetWorkers}</strong>
          </article>
          <article className="broadcast-stat">
            <span>Signal Modes</span>
            <strong>{activeSignals.length}</strong>
          </article>
        </div>

        <div className="broadcast-controls">
          <div className="broadcast-field">
            <label htmlFor="broadcast-zone">Target Zone</label>
            <select id="broadcast-zone" value={targetZone} onChange={(e) => setTargetZone(e.target.value)}>
              <option value="all">All Zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>
          <div className="broadcast-field">
            <label htmlFor="broadcast-language">Target Language</label>
            <select id="broadcast-language" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="broadcast-quick-list">
          {QUICK_COMMANDS.map((command) => (
            <button key={command} type="button" className="quick-command" onClick={() => setSourceText(command)}>
              {command}
            </button>
          ))}
        </div>

        <div className="broadcast-card-grid">
          <section className="broadcast-card">
            <div className="translation-card-head">
              <h3>Supervisor Command</h3>
              <span className={`live-chip ${speech.isListening ? 'active' : ''}`}>{speech.isListening ? 'LISTENING' : 'READY'}</span>
            </div>
            <textarea rows={6} placeholder="Speak or type the immediate safety command here." value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
            {speech.error && <div className="inline-note error">{getSpeechErrorMessage(speech.error)}</div>}
            <div className="broadcast-actions-row">
              <button type="button" className="btn-primary" onClick={speech.isListening ? speech.stop : speech.start}>
                {speech.isListening ? 'Stop Listening' : 'Start Listening'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setSourceText('')}>Clear</button>
            </div>
          </section>

          <section className="broadcast-card">
            <div className="translation-card-head">
              <h3>Worker Output</h3>
              <span className="lang-pill">{selectedLanguage.label}</span>
            </div>
            <textarea rows={6} readOnly placeholder="Translated command will appear here." value={translatedText} />
            <div className="broadcast-actions-row">
              <button type="button" className="btn-primary" onClick={handleTranslate} disabled={translating}>
                {translating ? 'Translating...' : 'Translate'}
              </button>
              <button type="button" className="btn-ghost" onClick={playAudio} disabled={!translatedText.trim()}>
                Play Audio
              </button>
            </div>
          </section>
        </div>

        <section className="broadcast-signal-panel">
          <div className="translation-card-head">
            <h3>Vest Signal Pattern</h3>
            <span className="meta-text">Select the haptic and visual cues to send with the command.</span>
          </div>
          <div className="signal-chip-list">
            {SIGNAL_TYPES.map((signal) => (
              <button key={signal.id} type="button" className={`signal-chip ${activeSignals.includes(signal.id) ? 'active' : ''}`} onClick={() => toggleSignal(signal.id)}>
                {signal.label}
              </button>
            ))}
          </div>
          <div className="broadcast-footer-actions">
            <button type="button" className="btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : 'Send Command Now'}
            </button>
          </div>
        </section>
      </section>

      <section className="panel broadcast-log-panel">
        <header className="panel-head">
          <h2>Dispatch Feed</h2>
          <span className="meta-text">Latest supervisor commands delivered to the field.</span>
        </header>
        <div className="list-wrap">
          {dispatchLog.length === 0 && <div className="empty">No commands sent yet</div>}
          {dispatchLog.map((item) => (
            <article key={item.id} className="broadcast-log-item">
              <div className="broadcast-log-meta">
                <span>{item.createdAt}</span>
                <span>{item.zoneLabel}</span>
              </div>
              <div className="broadcast-log-primary">{item.original}</div>
              <div className="broadcast-log-secondary">{item.language}: {item.translated}</div>
              <div className="broadcast-log-meta">
                <span>Signals: {item.signals}</span>
                <span>Workers: {item.workerCount}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
