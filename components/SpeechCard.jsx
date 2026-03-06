import { useState, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { DANGER_KEYWORDS, LANGUAGES, API_BASE_URL } from '../constants/languages';

export default function SpeechCard({ targetLang, onDangerDetected, onNewHistory }) {
  const [isRecording, setIsRecording]     = useState(false);
  const [originalText, setOriginalText]   = useState('—');
  const [translatedText, setTranslatedText] = useState('—');
  const [status, setStatus]               = useState('마이크 버튼을 눌러 한국어로 말하세요.');
  const [statusType, setStatusType]       = useState('idle'); // 'idle' | 'active' | 'success' | 'error'

  const setMsg = (msg, type = 'idle') => { setStatus(msg); setStatusType(type); };

  // ── STT 이벤트 핸들러 ────────────────────────────────────
  const handleResult = useCallback((text) => {
    setOriginalText(text);
  }, []);

  const handleEnd = useCallback(() => {
    setIsRecording(false);
    setOriginalText((prev) => {
      const text = prev.trim();
      if (text && text !== '...') {
        const isDanger = DANGER_KEYWORDS.some((kw) => text.includes(kw));
        onDangerDetected(isDanger);
        setMsg('✅ 인식 완료. 번역하기를 누르세요.', 'success');
      } else {
        setMsg('인식된 텍스트가 없습니다. 다시 시도해주세요.', 'error');
      }
      return text;
    });
  }, [onDangerDetected]);

  const handleError = useCallback((errorCode) => {
    setIsRecording(false);
    setMsg(`오류: ${errorCode}. 마이크 권한을 확인하세요.`, 'error');
  }, []);

  const { start } = useSpeechRecognition({
    onResult: handleResult,
    onEnd: handleEnd,
    onError: handleError,
  });

  // ── 녹음 시작 ────────────────────────────────────────────
  const handleRecord = () => {
    setIsRecording(true);
    setOriginalText('...');
    setTranslatedText('—');
    onDangerDetected(false);
    setMsg('🎙️ 음성을 인식하는 중...', 'active');
    start();
  };

  // ── 번역 요청 ────────────────────────────────────────────
  const handleTranslate = async () => {
    if (!originalText || originalText === '—') return;
    setMsg('🌐 번역 중...', 'active');
    setTranslatedText('...');

    try {
      const res = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText, target_lang: targetLang }),
      });

      const data = await res.json();

      if (data.detail) {
        setMsg(`번역 오류: ${data.detail}`, 'error');
        setTranslatedText('—');
        return;
      }

      setTranslatedText(data.translated);
      setMsg('✅ 번역 완료!', 'success');

      const langName = LANGUAGES.find((l) => l.code === targetLang)?.name || targetLang;
      onNewHistory({ original: data.original, translated: data.translated, langName });

    } catch (err) {
      setMsg('네트워크 오류: 파이썬 서버가 켜져 있는지 확인하세요.', 'error');
      setTranslatedText('—');
    }
  };

  // ── TTS 재생 ─────────────────────────────────────────────
  const handleSpeak = () => {
    if (!translatedText || translatedText === '—') return;
    const ttsCode = LANGUAGES.find((l) => l.code === targetLang)?.ttsCode || targetLang;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = ttsCode;
    utterance.rate = 0.9;
    utterance.onstart = () => setMsg('🔊 TTS 재생 중...', 'active');
    utterance.onend   = () => setMsg('✅ 재생 완료.', 'success');
    window.speechSynthesis.speak(utterance);
  };

  // ── 버튼 상태 계산 ───────────────────────────────────────
  const canTranslate = !isRecording && originalText !== '—' && originalText !== '...';
  const canSpeak     = !isRecording && translatedText !== '—' && translatedText !== '...';

  const statusColor = {
    idle: '#64748b', active: '#f6c90e', success: '#22c55e', error: '#ef4444'
  }[statusType];

  return (
    <div className="card">
      <h2>🎙️ 음성 입력 → 번역</h2>

      <div className="btn-group">
        <button
          className={`btn-record ${isRecording ? 'recording' : ''}`}
          onClick={handleRecord}
          disabled={isRecording}
        >
          {isRecording ? '🔴 녹음 중...' : '🎤 음성 녹음 시작'}
        </button>

        <button className="btn-translate" onClick={handleTranslate} disabled={!canTranslate}>
          🌐 번역하기
        </button>

        <button className="btn-speak" onClick={handleSpeak} disabled={!canSpeak}>
          🔊 TTS 재생
        </button>
      </div>

      <div className="status" style={{ color: statusColor }}>{status}</div>

      <div style={{ marginTop: '1.5rem' }}>
        <small style={{ color: '#64748b' }}>📝 인식된 한국어 텍스트</small>
        <div className="text-box">{originalText}</div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <small style={{ color: '#64748b' }}>🌐 번역 결과</small>
        <div className="text-box translated">{translatedText}</div>
      </div>
    </div>
  );
}
