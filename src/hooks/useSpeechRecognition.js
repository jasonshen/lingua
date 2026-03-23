import { useState, useRef, useCallback } from "react";

const XI_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const onResultRef = useRef(null);

  const start = useCallback((onResult) => {
    onResultRef.current = onResult;
    chunksRef.current = [];

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm",
        });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          // Stop all tracks to release the mic
          stream.getTracks().forEach((t) => t.stop());

          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          if (blob.size < 1000) {
            // Too short, ignore
            setTranscribing(false);
            return;
          }

          setTranscribing(true);
          try {
            const formData = new FormData();
            formData.append("file", blob, "recording.webm");
            formData.append("model_id", "scribe_v2");
            formData.append("language_code", "eng");

            const resp = await fetch(
              "https://api.elevenlabs.io/v1/speech-to-text",
              {
                method: "POST",
                headers: { "xi-api-key": XI_API_KEY },
                body: formData,
              }
            );

            if (!resp.ok) {
              const err = await resp.text();
              console.error("Scribe error:", err);
              setTranscribing(false);
              return;
            }

            const data = await resp.json();
            const transcript = data.text?.trim();
            if (transcript && onResultRef.current) {
              onResultRef.current(transcript);
            }
          } catch (err) {
            console.error("Transcription failed:", err);
          } finally {
            setTranscribing(false);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // collect in 1s chunks
        setListening(true);
      })
      .catch((err) => {
        console.error("Mic access denied:", err);
        alert("Microphone access is required for dictation.");
      });
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    setListening(false);
  }, []);

  return { listening, transcribing, start, stop };
}
