import { useEffect, useState } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { getSpeechErrorMessage } from '../../utils/dashboard';

const WORKER_NAME_BY_KEY = {
  A: '이레드',
  B: '김그린',
};

const RED_PATTERN = /(이레드|레드)(야|아|님|씨)?/;
const GREEN_PATTERN = /(김그린|그린)(야|아|님|씨)?/;

function formatCallLogText(text) {
  if (!text) return '';
  return text
    .replace(/^\[작업자 호출\]\s*/, '')
    .replace(/^\[작업자 요청\]\s*/, '')
    .replace(/작업자\s*A/g, WORKER_NAME_BY_KEY.A)
    .replace(/작업자\s*B/g, WORKER_NAME_BY_KEY.B)
    .replace(/\bA(?=\s*(호출|요청))/g, WORKER_NAME_BY_KEY.A)
    .replace(/\bB(?=\s*(호출|요청))/g, WORKER_NAME_BY_KEY.B);
}

function getCallLogType(text) {
  if ((text || '').startsWith('[작업자 요청]')) return '작업자 요청';
  return '작업자 호출';
}

function parseVoiceWorkerCommand(text) {
  const normalized = (text || '').replace(/\s+/g, '').trim();
  if (!normalized) return null;

  const hasRed = RED_PATTERN.test(normalized);
  const hasGreen = GREEN_PATTERN.test(normalized);

  if (hasRed && hasGreen) return null;
  if (hasRed) return 'A';
  if (hasGreen) return 'B';
  return null;
}

export default function WorkerCallPage({
  callLogs,
  callingWorker,
  handleCallWorker,
  handleDeleteReport,
  handleDeleteWorkerCallLogs,
}) {
  const speech = useSpeechRecognition('ko-KR');
  const [voiceStatus, setVoiceStatus] = useState('음성 명령으로 이레드 또는 김그린을 호출할 수 있습니다.');

  useEffect(() => {
    const errorMessage = getSpeechErrorMessage(speech.error);
    if (errorMessage) {
      setVoiceStatus(errorMessage);
    }
  }, [speech.error]);

  useEffect(() => {
    if (!speech.finalTranscript) return;

    const finalText = speech.finalTranscript.trim();
    speech.clearFinalTranscript();
    if (!finalText) return;

    const workerKey = parseVoiceWorkerCommand(finalText);
    if (!workerKey) {
      setVoiceStatus(`명령을 인식하지 못했습니다: ${finalText}`);
      return;
    }

    const workerName = WORKER_NAME_BY_KEY[workerKey];
    setVoiceStatus(`음성 명령 인식: ${finalText} -> ${workerName} 호출`);
    void handleCallWorker(workerKey);
  }, [handleCallWorker, speech]);

  function handleVoiceStart(event) {
    event.preventDefault();
    if (!speech.isSupported) {
      setVoiceStatus('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    speech.reset();
    setVoiceStatus('듣는 중입니다. 예: 레드야, 김그린님, 그린씨');
    speech.start();
  }

  function handleVoiceEnd() {
    if (!speech.isListening) return;
    speech.stop();
    setVoiceStatus('음성 인식을 중지했습니다. 인식 결과를 확인하는 중입니다.');
  }

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">작업자 호출</div>
      </div>

      <div className="panel">
        <div className="panel-title">📟 작업자 호출</div>
        <div className="worker-call-grid">
          <button className="btn-primary worker-call-btn react-btn-auto" type="button" onClick={() => handleCallWorker('A')} disabled={callingWorker === 'A'}>
            {callingWorker === 'A' ? '호출 중...' : WORKER_NAME_BY_KEY.A + ' 호출'}
          </button>
          <button className="btn-primary worker-call-btn react-btn-auto" type="button" onClick={() => handleCallWorker('B')} disabled={callingWorker === 'B'}>
            {callingWorker === 'B' ? '호출 중...' : WORKER_NAME_BY_KEY.B + ' 호출'}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">🎤 음성 호출</div>
        <div className="walkie-help-text">예: 이레드 호출, 레드야, 레드님, 김그린 호출, 그린아, 그린씨</div>
        <div className="recorder-box recorder-box-spaced">
          <div className="walkie-main-row">
            <div className="walkie-text-stack">
              <div className={`stt-result walkie-result-compact ${speech.transcript ? 'filled' : ''}`}>
                {speech.transcript || '음성 인식 결과가 여기에 표시됩니다...'}
              </div>
              <div className="walkie-help-text">{voiceStatus}</div>
            </div>
            <div className="walkie-mic-stack">
              <button
                className={`record-btn walkie-record-btn ${speech.isListening ? 'recording' : ''}`}
                onPointerDown={handleVoiceStart}
                onPointerUp={handleVoiceEnd}
                onPointerLeave={handleVoiceEnd}
                onPointerCancel={handleVoiceEnd}
                type="button"
              >
                🎤
              </button>
              <div className="record-timer walkie-side-timer">{speech.isListening ? '듣는 중' : '대기'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head-row">
          <div className="panel-title">📒 호출 로그</div>
          <button className="btn-sm react-btn-auto" onClick={handleDeleteWorkerCallLogs} disabled={callLogs.length === 0} type="button">일괄삭제</button>
        </div>
        <div className="report-list-wrap">
          {callLogs.length === 0 && <div className="table-empty">저장된 호출 로그가 없습니다.</div>}
          {callLogs.map((report) => (
            <div className="report-item" key={report.id}>
              <div className="report-header">
                <div>
                  <div className="report-date">{new Date(report.created_at).toLocaleString('ko-KR')}</div>
                  <div className="report-author">작성자: {report.author_name || '구이일'} · {getCallLogType(report.text_content)}</div>
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
              <div className="report-preview">{formatCallLogText(report.text_content)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
