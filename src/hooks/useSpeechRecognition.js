import { useEffect, useMemo, useRef, useState } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function useSpeechRecognition(language = 'ko-KR') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState('');
  const transcriptRef = useRef('');

  const recognition = useMemo(() => {
    if (!SpeechRecognition) {
      return null;
    }

    const instance = new SpeechRecognition();
    instance.lang = language;
    instance.continuous = false;
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
      setError(event.error || 'speech_error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    return () => {
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
