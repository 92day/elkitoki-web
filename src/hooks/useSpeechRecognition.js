import { useEffect, useMemo, useState } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function useSpeechRecognition(language = 'ko-KR') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

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
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(event.error || 'speech_error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
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

    setError('');
    setTranscript('');
    setIsListening(true);
    recognition.start();
  };

  const stop = () => {
    if (!recognition) {
      return;
    }

    recognition.stop();
    setIsListening(false);
  };

  return {
    error,
    isListening,
    isSupported: Boolean(SpeechRecognition),
    start,
    stop,
    transcript,
  };
}
