import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "error";

export interface UseVoiceRecorderReturn {
  recordingState: RecordingState;
  recordingSeconds: number;
  errorMsg: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ blob: Blob; mimeType: string } | null>;
  cancelRecording: () => void;
}

const getSupportedMimeType = (): string => {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
};

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveStopRef = useRef<
    ((result: { blob: Blob; mimeType: string } | null) => void) | null
  >(null);

  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    setErrorMsg("");
    setRecordingState("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const usedMime = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: usedMime });

        if (resolveStopRef.current) {
          resolveStopRef.current({ blob, mimeType: usedMime });
          resolveStopRef.current = null;
        }
        stopStream();
      };

      recorder.onerror = () => {
        setErrorMsg("Recording error. Please try again.");
        setRecordingState("error");
        clearTimer();
        if (resolveStopRef.current) {
          resolveStopRef.current(null);
          resolveStopRef.current = null;
        }
        stopStream();
      };

      recorder.start(250);
      setRecordingState("recording");
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => (s >= 59 ? 60 : s + 1));
      }, 1000);
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access."
          : "Could not access microphone. Please try again.";
      setErrorMsg(msg);
      setRecordingState("error");
    }
  }, []);

  const stopRecording = useCallback((): Promise<{
    blob: Blob;
    mimeType: string;
  } | null> => {
    clearTimer();
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      stopStream();
      setRecordingState("idle");
      return Promise.resolve(null);
    }

    setRecordingState("processing");

    return new Promise((resolve) => {
      resolveStopRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    clearTimer();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        stopStream();
      };
      recorder.stop();
    } else {
      stopStream();
    }
    if (resolveStopRef.current) {
      resolveStopRef.current(null);
      resolveStopRef.current = null;
    }
    setRecordingState("idle");
    setRecordingSeconds(0);
    setErrorMsg("");
  }, []);

  return {
    recordingState,
    recordingSeconds,
    errorMsg,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
