import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "../types/maha.types";
import { sendChatMessage, sendVoiceChatMessage } from "../api/mahaApi";
import { getLocation } from "../utils/location";
import { useTypingEffect } from "./useTypingEffect";
import { LOADING_MESSAGES } from "../constants/mahaConstants";

// ─── Session ID rules (confirmed with senior + API contract) ──────────────────
//
//  NEW chat  → send sessionId: null   (JS null → JSON null)
//             Server sees null → creates a brand new session → returns UUID
//
//  CONTINUE  → send sessionId: "<uuid-returned-by-server>"
//             Server loads existing context → appends → returns same UUID
//
//  RESTORE   → initialSessionId = known UUID from session history
//             Same as CONTINUE from the very first message
//
// ─────────────────────────────────────────────────────────────────────────────

interface UseMahaChatOptions {
  userId: string;
  token: string;
  lang?: string;
  initialMessages?: Message[];
  // null / "" → new chat; real UUID → restore existing session
  initialSessionId?: string | null;
}

export const useMahaChat = ({
  userId,
  token,
  lang = "mr",
  initialMessages = [],
  initialSessionId = null,
}: UseMahaChatOptions) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // sessionIdRef: null → new session (API), UUID string → existing session
  // We use a ref (not state) so sendMessage/sendVoiceMessage always read the
  // latest value without needing it in their dependency arrays.
  const sessionIdRef = useRef<string | null>(
    initialSessionId || null, // coerce "" → null
  );

  // inflightRef: prevents double-fire from rapid clicks or React async batching
  const inflightRef = useRef(false);

  // localSessionIdRef is exposed upward for sidebar tracking.
  // Uses "new-<ts>" as placeholder until server assigns real UUID.
  const localSessionIdRef = useRef<string>(
    initialSessionId && initialSessionId.length > 0
      ? initialSessionId
      : `new-${Date.now()}`,
  );

  const [isChatStarted, setIsChatStarted] = useState(
    initialMessages.length > 0,
  );

  const { typingText, isTyping, typeMessage } = useTypingEffect();

  useEffect(() => {
    if (!isLoading) return;
    const t = setInterval(
      () => setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length),
      2000,
    );
    return () => clearInterval(t);
  }, [isLoading]);

  // ── Shared post-response handler ──────────────────────────────────────────
  const handleApiResponse = useCallback(
    (
      data: { data?: { reply?: string; sessionId?: string } | null },
      _userMsg: Message,
    ) => {
      const reply = data?.data?.reply?.trim() || "माफ करा, उत्तर मिळाले नाही.";

      // Capture the server-assigned UUID — all future messages in this
      // conversation must send this exact value.
      if (data?.data?.sessionId) {
        sessionIdRef.current = data.data.sessionId;
        localSessionIdRef.current = data.data.sessionId;
      }

      inflightRef.current = false;
      setIsLoading(false);

      typeMessage(reply, () => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: reply,
            timestamp: new Date(),
          },
        ]);
      });
    },
    [typeMessage],
  );

  // ── Send text message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      // Guard: no text, or already waiting for a response, or inflight
      if (!trimmed || isLoading || isTyping || inflightRef.current) return;

      inflightRef.current = true; // block any concurrent calls immediately

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setIsChatStarted(true);

      const location = await getLocation();

      try {
        const data = await sendChatMessage(
          token,
          {
            userId,
            sessionId: sessionIdRef.current, // null = new, UUID = continue
            prompt: trimmed,
            lat: location.lat,
            lon: location.lon,
          },
          lang,
        );

        handleApiResponse(data, userMsg);
      } catch (err) {
        inflightRef.current = false;
        setIsLoading(false);
        const errMsg = err instanceof Error ? err.message : "नेटवर्क त्रुटी.";
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: `⚠️ ${errMsg} — कृपया पुन्हा प्रयत्न करा.`,
            timestamp: new Date(),
          },
        ]);
      }
    },
    [isLoading, isTyping, token, userId, lang, handleApiResponse],
  );

  // ── Send voice message ────────────────────────────────────────────────────
  const sendVoiceMessage = useCallback(
    async (audioBlob: Blob, mimeType: string, transcriptHint?: string) => {
      if (isLoading || isTyping || inflightRef.current) return;

      inflightRef.current = true;

      const placeholderText = transcriptHint || "🎙️ Voice message";
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: placeholderText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setIsChatStarted(true);

      const location = await getLocation();

      try {
        const data = await sendVoiceChatMessage(
          token,
          {
            userId,
            sessionId: sessionIdRef.current, // null = new, UUID = continue
            audioBlob,
            mimeType,
            lat: location.lat,
            lon: location.lon,
          },
          lang,
        );

        // Replace placeholder with actual transcript if server returns it
        const transcript: string | undefined = (data as any)?.data?.transcript;
        if (transcript) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === userMsg.id ? { ...m, text: transcript } : m,
            ),
          );
        }

        handleApiResponse(data, userMsg);
      } catch (err) {
        inflightRef.current = false;
        setIsLoading(false);
        const errMsg = err instanceof Error ? err.message : "नेटवर्क त्रुटी.";
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: `⚠️ ${errMsg} — कृपया पुन्हा प्रयत्न करा.`,
            timestamp: new Date(),
          },
        ]);
      }
    },
    [isLoading, isTyping, token, userId, lang, handleApiResponse],
  );

  // ── Reset / New Chat ──────────────────────────────────────────────────────
  // Per senior: send null on next message so server creates a fresh session.
  const resetChat = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = null; // null = new session
    localSessionIdRef.current = `new-${Date.now()}`; // sidebar placeholder
    inflightRef.current = false;
    setIsChatStarted(false);
    setInput("");
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    isChatStarted,
    setIsChatStarted,
    loadingMsgIdx,
    typingText,
    isTyping,
    sendMessage,
    sendVoiceMessage,
    resetChat,
    sessionId: localSessionIdRef.current,
    canSend: input.trim().length > 0 && !isLoading && !isTyping,
  };
};
