import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "../types/maahi.types";
import { sendChatMessage } from "../api/maahiApi";
import { getLocation } from "../utils/location";
import { useTypingEffect } from "./useTypingEffect";
import { LOADING_MESSAGES } from "../constants/maahiConstants";

interface UseMaahiChatOptions {
  userId: string;
  token: string;
  lang?: string;
  initialMessages?: Message[];
  initialSessionId?: string;
}

export const useMaahiChat = ({
  userId,
  token,
  lang = "mr",
  initialMessages = [],
  initialSessionId = "",
}: UseMaahiChatOptions) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // ── Stable local ID generated once so the first save doesn't create a temp entry
  // that gets replaced by the real API sessionId later.
  const localSessionIdRef = useRef<string>(
    initialSessionId || `local-${Date.now()}`,
  );
  const [sessionId, setSessionId] = useState(initialSessionId);

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

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || isTyping) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: text.trim(),
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
            sessionId: sessionId || "",
            prompt: text.trim(),
            lat: location.lat,
            lon: location.lon,
          },
          lang,
        );

        const reply = data?.data?.reply || "माफ करा, उत्तर मिळाले नाही.";

        // Once we get the real API sessionId, lock it in for this session
        if (data?.data?.sessionId) {
          const apiSessionId = data.data.sessionId;
          setSessionId(apiSessionId);
          // Also update the stable ref so saves from this point use the API id
          localSessionIdRef.current = apiSessionId;
        }

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
      } catch {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: "नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.",
            timestamp: new Date(),
          },
        ]);
      }
    },
    [isLoading, isTyping, sessionId, token, userId, typeMessage],
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setSessionId("");
    localSessionIdRef.current = `local-${Date.now()}`;
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
    resetChat,
    // Expose only the ref value — never reactive state, which would cause re-renders and duplicate saves
    sessionId: localSessionIdRef.current,
    canSend: input.trim().length > 0 && !isLoading && !isTyping,
  };
};
