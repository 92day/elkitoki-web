import { useEffect, useMemo, useRef, useState } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function useSpeechRecognition(language = 'ko-KR') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState('');
  const transcriptRef = useRef('');
  const shouldHoldRef = useRef(false);
  const manualStopRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  const recognition = useMemo(() => {
    if (!SpeechRecognition) {
      return null;
    }

    const instance = new SpeechRecognition();
    instance.lang = language;
    instance.continuous = true;
    instance.interimResults = true;
    return instance;
  }, [language]);

  useEffect(() => {
    if (!recognition) {
      return undefined;
    }

    recognition.onresult = (event) => {
      let nextFinal = transcriptRef.current;
      let interim = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const chunk = result[0]?.transcript || '';
        if (result.isFinal) {
          nextFinal = `${nextFinal} ${chunk}`.trim();
        } else {
          interim = `${interim} ${chunk}`.trim();
        }
      }

      transcriptRef.current = nextFinal;
      setFinalTranscript(nextFinal);
      setTranscript(`${nextFinal} ${interim}`.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') {
        return;
      }
      setError(event.error || 'speech_error');
    };

    recognition.onend = () => {
      if (shouldHoldRef.current && !manualStopRef.current) {
        restartTimeoutRef.current = window.setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
          } catch (_error) {
          }
        }, 120);
        return;
      }

      setIsListening(false);
    };

    return () => {
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
      recognition.abort();
    };
  }, [recognition]);

  const start = () => {
    if (!recognition) {
      setError('speech_not_supported');
      return;
    }
    if (isListening) {
      return;
    }

    shouldHoldRef.current = true;
    manualStopRef.current = false;
    setError('');
    setTranscript('');
    setFinalTranscript('');
    transcriptRef.current = '';
    setIsListening(true);
    recognition.start();
  };

  const stop = () => {
    if (!recognition) {
      return;
    }

    shouldHoldRef.current = false;
    manualStopRef.current = true;
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }

    try {
      recognition.stop();
    } catch (_error) {
    }
    setIsListening(false);
  };

  const clearFinalTranscript = () => {
    setFinalTranscript('');
    transcriptRef.current = '';
  };

  const reset = () => {
    shouldHoldRef.current = false;
    manualStopRef.current = false;
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
    setTranscript('');
    setFinalTranscript('');
    setError('');
    transcriptRef.current = '';
  };

  return {
    error,
    finalTranscript,
    isListening,
    isSupported: Boolean(SpeechRecognition),
    clearFinalTranscript,
    reset,
    start,
    stop,
    transcript,
  };
}
