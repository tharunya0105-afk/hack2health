import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechRecognition Hook
 * Utilizes the browser's native Web Speech API (zero API key dependency, zero latency),
 * with support for alternating speakers, continuous streaming, interim text, and fallbacks.
 */
export function useSpeechRecognition({ onTranscriptComplete }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null); // 'autistic' | 'neurotypical'
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const activeSpeakerRef = useRef(activeSpeaker);
  activeSpeakerRef.current = activeSpeaker;

  const onTranscriptCompleteRef = useRef(onTranscriptComplete);
  onTranscriptCompleteRef.current = onTranscriptComplete;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        setInterimText(interim);

        if (final.trim() && onTranscriptCompleteRef.current) {
          const speaker = activeSpeakerRef.current || 'autistic';
          onTranscriptCompleteRef.current(final.trim(), speaker);
          setInterimText('');
        }
      };

      recognizer.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'no-speech') return; // Ignore harmless silence
        setError(event.error);
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const startListening = useCallback((speaker = 'autistic') => {
    setError(null);
    setActiveSpeaker(speaker);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // In case it was already running, restart
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
            setIsListening(true);
          }, 150);
        } catch (e) {
          setError(e.message);
        }
      }
    } else {
      setError('Web Speech API is not supported in this browser. Please use Chrome/Edge or manual input.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  // Manual submit helper (for typing or demo quick-utterance chips)
  const submitManualTranscript = useCallback((text, speaker) => {
    if (!text || !text.trim()) return;
    if (onTranscriptCompleteRef.current) {
      onTranscriptCompleteRef.current(text.trim(), speaker);
    }
  }, []);

  return {
    isSupported,
    isListening,
    activeSpeaker,
    interimText,
    error,
    startListening,
    stopListening,
    submitManualTranscript
  };
}
