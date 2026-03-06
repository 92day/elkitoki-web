import { useRef, useCallback } from 'react';

export function useSpeechRecognition({ onResult, onEnd, onError }) {
  const recognitionRef = useRef(null);

  const init = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      onResult(final || interim, !!final);
    };

    recognition.onend = onEnd;
    recognition.onerror = (event) => onError(event.error);

    recognitionRef.current = recognition;
    return true;
  }, [onResult, onEnd, onError]);

  const start = useCallback(() => {
    if (!recognitionRef.current) {
      const ok = init();
      if (!ok) return;
    }
    recognitionRef.current.start();
  }, [init]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { start, stop, init };
}
