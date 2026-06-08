import { useEffect, useRef, useState, useCallback } from "react";
import { AuthUser, Message } from "../types/maha.types";
import { useMahaChat } from "../hooks/useMahaChat";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { MahaAvatar } from "./MahaAvatar";
import { SuggestionChips } from "./SuggestionChips";
import { ChatSession } from "./MahaModal";
import { useLang } from "../context/LangContext";
import { t, LANG_META } from "../constants/mahaI18n";

interface MahaChatProps {
  user: AuthUser;
  token: string;
  onClose: () => void;
  onLogout: () => void;
  onSaveSession: (session: ChatSession) => void;
  activeSessionId: string | null;
  restoredMessages?: Message[] | null;
}

export const MahaChat = ({
  user,
  token,
  onClose,
  onLogout,
  onSaveSession,
  activeSessionId,
  restoredMessages = null,
}: MahaChatProps) => {
  const { lang } = useLang();
  const s = t(lang);

  const LOADING_MESSAGES = [s.loading1, s.loading2, s.loading3, s.loading4];

  const AWARENESS_CARDS = [
    {
      emoji: "🤖",
      bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      border: "#3B82F6",
      accentLight: "#EFF6FF",
      tag:
        lang === "mr"
          ? "What is MAHA AI?"
          : lang === "hi"
            ? "MAHA AI क्या है?"
            : "What is MAHA AI?",
      title: s.card1Title,
      body:
        lang === "mr"
          ? "MAHA हा एक स्मार्ट AI सहाय्यक आहे — म्हणजे एक असा डिजिटल मित्र जो तुमचे प्रश्न समजतो आणि लगेच उत्तर देतो. याला इंटरनेट असलेला कोणताही स्मार्टफोन पुरे आहे."
          : lang === "hi"
            ? "MAHA एक स्मार्ट AI सहायक है — एक डिजिटल दोस्त जो आपके सवाल समझता है और तुरंत जवाब देता है।"
            : "MAHA is a smart AI assistant — a digital friend who understands your questions and answers instantly. All you need is any smartphone with internet.",
      list: null as string[] | null,
    },
    {
      emoji: "🌾",
      bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
      border: "#16A34A",
      accentLight: "#F0FDF4",
      tag:
        lang === "mr"
          ? "Artificial Intelligence"
          : lang === "hi"
            ? "कृत्रिम बुद्धिमत्ता"
            : "Artificial Intelligence",
      title: s.card2Title,
      body:
        lang === "mr"
          ? '"कृत्रिम बुद्धिमत्ता" — एक संगणक प्रणाली जी माणसासारखा विचार करते. जसे अनुभवी शेतकरी किंवा डॉक्टर तुमच्या प्रश्नाचे उत्तर देतो — तसेच MAHA AI देते!'
          : lang === "hi"
            ? '"कृत्रिम बुद्धिमत्ता" — एक कंप्यूटर जो इंसान की तरह सोचता है। जैसे अनुभवी किसान सलाह देता है — वैसे ही MAHA देती है!'
            : '"Artificial Intelligence" — a computer system that thinks like a human. Just like an experienced farmer or doctor answers your questions — that\'s what MAHA AI does!',
      list: null,
    },
    {
      emoji: "💬",
      bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      border: "#F59E0B",
      accentLight: "#FFFBEB",
      tag:
        lang === "mr"
          ? "MAHA कशात मदत करते?"
          : lang === "hi"
            ? "MAHA किसमें मदद करती है?"
            : "How does MAHA help?",
      title:
        lang === "mr"
          ? "MAHA कशात मदत करते?"
          : lang === "hi"
            ? "MAHA किसमें मदद करती है?"
            : "MAHA helps with…",
      body: null,
      list:
        lang === "hi"
          ? [
              "🌾 खेती सलाह व फसल जानकारी",
              "🌦️ मौसम व वर्षा का अनुमान",
              "💰 बाजार भाव व सरकारी योजनाएं",
              "🐄 पशु स्वास्थ्य व पशुपालन",
              "🏥 स्वास्थ्य व प्राथमिक चिकित्सा",
              "📚 शिक्षा व छात्रवृत्ति",
            ]
          : lang === "en"
            ? [
                "🌾 Farming advice & crop info",
                "🌦️ Weather & rainfall forecast",
                "💰 Market prices & govt schemes",
                "🐄 Animal health & husbandry",
                "🏥 Health & first aid",
                "📚 Education & scholarships",
              ]
            : [
                "🌾 शेती सल्ला व पीक माहिती",
                "🌦️ हवामान व पाऊस अंदाज",
                "💰 बाजारभाव व सरकारी योजना",
                "🐄 पशु आरोग्य व पशुपालन",
                "🏥 आरोग्य व प्रथमोपचार",
                "📚 शिक्षण व शिष्यवृत्ती",
              ],
    },
    {
      emoji: "📱",
      bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
      border: "#8B5CF6",
      accentLight: "#F5F3FF",
      tag:
        lang === "mr"
          ? "कसे वापरायचे?"
          : lang === "hi"
            ? "कैसे उपयोग करें?"
            : "How to use?",
      title:
        lang === "mr"
          ? "कसे वापरायचे?"
          : lang === "hi"
            ? "कैसे उपयोग करें?"
            : "How to use MAHA?",
      body: null,
      list:
        lang === "hi"
          ? [
              "1️⃣ नीचे चैट बॉक्स में सवाल लिखें",
              "2️⃣ हिंदी, मराठी या English — सभी चलते हैं",
              "3️⃣ Send बटन दबाएं",
              "4️⃣ MAHA तुरंत जवाब देगी",
              "5️⃣ पुरानी बातचीत History में देखें",
            ]
          : lang === "en"
            ? [
                "1️⃣ Type your question in the chat box",
                "2️⃣ Marathi, Hindi or English — all work",
                "3️⃣ Press the Send button",
                "4️⃣ MAHA will answer instantly",
                "5️⃣ View past chats in History",
              ]
            : [
                "1️⃣ खाली चॅट बॉक्समध्ये प्रश्न लिहा",
                "2️⃣ मराठी किंवा English — दोन्ही चालतात",
                "3️⃣ Send बटण दाबा",
                "4️⃣ MAHA लगेच उत्तर देईल",
                "5️⃣ जुने संवाद History मध्ये पाहता येतात",
              ],
    },
    {
      emoji: "🔒",
      bg: "linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%)",
      border: "#EC4899",
      accentLight: "#FDF4FF",
      tag:
        lang === "mr"
          ? "सुरक्षित व विश्वासू"
          : lang === "hi"
            ? "सुरक्षित और भरोसेमंद"
            : "Safe & Trustworthy",
      title: s.card4Title,
      body:
        lang === "mr"
          ? "MAHA तुमची माहिती सुरक्षित ठेवते. MAHA AI सर्वोत्तम माहिती देण्याचा प्रयत्न करते — पण आजारपण, कायदा किंवा महत्त्वाच्या निर्णयांसाठी नेहमी तज्ज्ञांचा सल्ला घ्या."
          : lang === "hi"
            ? "MAHA आपकी जानकारी सुरक्षित रखती है। बीमारी, कानून या महत्वपूर्ण निर्णयों के लिए हमेशा विशेषज्ञ से सलाह लें।"
            : "MAHA keeps your information safe. MAHA AI tries to give the best information — but for illness, legal, or important decisions, always consult an expert.",
      list: null,
    },
  ];

  const {
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
    canSend,
    sessionId,
  } = useMahaChat({
    userId: user.id,
    token,
    lang: LANG_META[lang].acceptHeader,
    initialMessages: restoredMessages ?? [],
    // null  → new chat (server creates session and returns UUID)
    // UUID  → restore existing session (server loads context)
    initialSessionId: activeSessionId || null,
  });

  // ── Voice recorder ────────────────────────────────────────────────────────
  const {
    recordingState,
    recordingSeconds,
    errorMsg: voiceErrorMsg,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const isRecording = recordingState === "recording";
  const isVoiceProcessing = recordingState === "processing";
  // Only block the mic button during the brief recorder states (requesting/recording/processing).
  // isLoading (API call in flight) is intentionally NOT included — the recorder resets to
  // idle before sendVoiceMessage awaits the API, so the mic is available again immediately.
  const isVoiceBusy =
    isRecording || isVoiceProcessing || recordingState === "requesting";

  // Format seconds as mm:ss
  const fmtSecs = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Auto-stop after 60 seconds
  useEffect(() => {
    if (recordingSeconds >= 60) {
      handleStopAndSend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingSeconds]);

  const handleStartRecording = async () => {
    if (isLoading || isTyping || isVoiceBusy) return;
    await startRecording();
  };

  const handleStopAndSend = async () => {
    const result = await stopRecording();
    if (result && result.blob.size > 0) {
      await sendVoiceMessage(result.blob, result.mimeType);
    }
  };

  const handleCancelRecording = () => {
    cancelRecording();
  };

  // ── Onboarding popup state ──
  // Only show for first-time users; once dismissed/seen it's stored in localStorage.
  const AWARENESS_SEEN_KEY = "maha_awareness_seen";
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(AWARENESS_SEEN_KEY),
  );
  const [onboardingExiting, setOnboardingExiting] = useState(false);
  const [obIdx, setObIdx] = useState(0);
  const [obHovered, setObHovered] = useState(false);
  const [obHoveredIdx, setObHoveredIdx] = useState<number | null>(null);
  const obTouchStartX = useRef<number>(0);
  const obAutoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const obGoTo = useCallback((idx: number) => setObIdx(idx), []);
  const obNext = useCallback(
    () => setObIdx((i) => (i + 1) % AWARENESS_CARDS.length),
    [AWARENESS_CARDS.length],
  );
  const obPrev = useCallback(
    () =>
      setObIdx(
        (i) => (i - 1 + AWARENESS_CARDS.length) % AWARENESS_CARDS.length,
      ),
    [AWARENESS_CARDS.length],
  );

  useEffect(() => {
    if (!showOnboarding || obHovered) {
      if (obAutoRef.current) clearInterval(obAutoRef.current);
      return;
    }
    obAutoRef.current = setInterval(() => {
      setObIdx((i) => (i + 1) % AWARENESS_CARDS.length);
    }, 3600);
    return () => {
      if (obAutoRef.current) clearInterval(obAutoRef.current);
    };
  }, [showOnboarding, obHovered, AWARENESS_CARDS.length]);

  const closeOnboarding = (startChat: boolean) => {
    localStorage.setItem(AWARENESS_SEEN_KEY, "true");
    setOnboardingExiting(true);
    setTimeout(() => {
      setShowOnboarding(false);
      setOnboardingExiting(false);
      if (startChat) setIsChatStarted(true);
    }, 320);
  };

  // ── Main carousel state ──
  const [awarenessIdx, setAwarenessIdx] = useState(0);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string>(sessionId);
  sessionIdRef.current = sessionId;
  const [isAwarenessHovered, setIsAwarenessHovered] = useState(false);
  const cfAutoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number>(0);
  const [cfHoveredIdx, setCfHoveredIdx] = useState<number | null>(null);

  const suggestionsRef = useRef<HTMLDivElement>(null);

  const cfGoTo = useCallback((idx: number) => setAwarenessIdx(idx), []);
  const cfNext = useCallback(
    () => setAwarenessIdx((i) => (i + 1) % AWARENESS_CARDS.length),
    [AWARENESS_CARDS.length],
  );
  const cfPrev = useCallback(
    () =>
      setAwarenessIdx(
        (i) => (i - 1 + AWARENESS_CARDS.length) % AWARENESS_CARDS.length,
      ),
    [AWARENESS_CARDS.length],
  );

  useEffect(() => {
    if (isAwarenessHovered) {
      if (cfAutoRef.current) clearInterval(cfAutoRef.current);
      return;
    }
    cfAutoRef.current = setInterval(() => {
      setAwarenessIdx((i) => (i + 1) % AWARENESS_CARDS.length);
    }, 3600);
    return () => {
      if (cfAutoRef.current) clearInterval(cfAutoRef.current);
    };
  }, [isAwarenessHovered, AWARENESS_CARDS.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, typingText]);

  useEffect(() => {
    if (!showOnboarding && !isChatStarted) {
      setTimeout(() => {
        suggestionsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [showOnboarding, isChatStarted]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "ai") return;
    // Only persist once we have a real API-assigned session UUID.
    // The local- prefix means the first API response hasn't come back yet.
    // "new-" prefix = placeholder before server returns the real UUID
    if (sessionIdRef.current.startsWith("new-")) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title =
        firstUserMsg?.text?.slice(0, 40) ||
        "संवाद " + new Date().toLocaleDateString("mr-IN");
      const preview = lastMsg.text?.slice(0, 60) || "";
      onSaveSession({
        id: sessionIdRef.current,
        title,
        preview,
        timestamp: new Date(),
        messageCount: messages.length,
        messages: messages,
      });
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [messages]);

  const confirmNewChat = () => {
    setShowNewChatDialog(false);
    resetChat();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Voice error toast (auto-dismiss after 3 s)
  // ─────────────────────────────────────────────────────────────────────────────
  const [voiceToast, setVoiceToast] = useState("");
  const voiceToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!voiceErrorMsg) return;
    setVoiceToast(voiceErrorMsg);
    if (voiceToastTimer.current) clearTimeout(voiceToastTimer.current);
    voiceToastTimer.current = setTimeout(() => setVoiceToast(""), 3000);
  }, [voiceErrorMsg]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Mic button label helpers
  // ─────────────────────────────────────────────────────────────────────────────
  const micLabel =
    lang === "hi"
      ? isRecording
        ? "भेजने के लिए रोकें"
        : "बोलकर पूछें"
      : lang === "mr"
        ? isRecording
          ? "थांबवा व पाठवा"
          : "आवाजाने विचारा"
        : isRecording
          ? "Stop & Send"
          : "Ask by voice";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(180deg, #F0FDF4 0%, #F8FAFC 100%)",
        position: "relative",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{`
        @keyframes maha-cf-glow {
          0%,100% { box-shadow: 0 8px 32px var(--cf-color, rgba(34,197,94,0.20)), 0 2px 8px rgba(0,0,0,0.06); }
          50%      { box-shadow: 0 14px 44px var(--cf-color, rgba(34,197,94,0.30)), 0 4px 16px rgba(0,0,0,0.09); }
        }
        @keyframes maha-onboard-in {
          from { opacity: 0; transform: scale(0.93) translateY(18px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes maha-onboard-out {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(0.94) translateY(12px); }
        }
        @keyframes maha-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes maha-backdrop-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        /* ── Voice recording animations ── */
        @keyframes maha-mic-pulse {
          0%,100% {
            box-shadow: 0 0 0 0 rgba(239,68,68,0.55), 0 4px 14px rgba(239,68,68,0.38);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239,68,68,0), 0 4px 20px rgba(239,68,68,0.55);
          }
        }
        @keyframes maha-mic-ring {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes maha-waveform {
          0%,100% { height: 6px;  }
          50%      { height: 18px; }
        }
        @keyframes maha-voice-toast-in {
          from { opacity: 0; transform: translateY(6px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes maha-voice-toast-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes maha-recording-bar-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      {/* ── App Bar ── */}
      <div
        style={{
          height: 68,
          background: "#fff",
          boxShadow: "0 1px 0 #E2E8F0, 0 4px 20px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "linear-gradient(135deg,#22C55E 0%,#15803D 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(34,197,94,0.30)",
          }}
        >
          🌾
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {s.chatTitle}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 3,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#22C55E",
                display: "inline-block",
                boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
                animation: "maha-pulse 2s ease infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#64748B",
                letterSpacing: "0.01em",
              }}
            >
              {s.chatOnline}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 20,
            padding: "4px 10px 4px 6px",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#22C55E,#15803D)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#15803D",
              maxWidth: 70,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name?.split(" ")[0] || "User"}
          </span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setShowNewChatDialog(true)}
            title={s.sidebarNewChat}
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              cursor: "pointer",
              color: "#64748B",
              fontSize: 13,
              padding: "6px 10px",
              borderRadius: 10,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#F0FDF4";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#BBF7D0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#F8FAFC";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#E2E8F0";
            }}
          >
            ✏️ <span style={{ fontSize: 11 }}>{s.chatNewBtn}</span>
          </button>
        )}

        <button
          onClick={onLogout}
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            cursor: "pointer",
            color: "#EF4444",
            fontSize: 11,
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            padding: "6px 11px",
            borderRadius: 10,
            flexShrink: 0,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2";
          }}
        >
          {s.chatLogout}
        </button>

        <button
          onClick={onClose}
          style={{
            background: "#F1F5F9",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            color: "#64748B",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#E2E8F0";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#F1F5F9";
          }}
        >
          ×
        </button>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 18px 10px",
          scrollbarWidth: "thin",
          scrollbarColor: "#D1D5DB transparent",
        }}
      >
        {!isChatStarted ? (
          /* ── Welcome / Home screen ── */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              animation: "maha-fade-up 0.4s ease both",
            }}
          >
            {/* Hero banner */}
            <div
              style={{
                background:
                  "linear-gradient(135deg,#16A34A 0%,#15803D 60%,#166534 100%)",
                borderRadius: 22,
                padding: "20px 22px",
                boxShadow:
                  "0 8px 24px rgba(22,163,74,0.28), 0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                gap: 16,
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -20,
                  top: -20,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 30,
                  bottom: -30,
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }}
              />
              <div
                style={{
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: 16,
                  padding: 12,
                  fontSize: 28,
                  width: 54,
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  backdropFilter: "blur(4px)",
                }}
              >
                🌾
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 20,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.welcomeGreeting}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.75",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {s.welcomeSub}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.90)",
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    marginTop: 8,
                  }}
                >
                  {s.welcomeBody}
                </div>
              </div>
            </div>

            {/* Awareness Cards carousel */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94A3B8",
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 16,
                      height: 2,
                      background: "#22C55E",
                      borderRadius: 1,
                      display: "inline-block",
                    }}
                  />
                  {s.awarenessLabel}
                </div>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <button
                    onClick={cfPrev}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1.5px solid #E2E8F0",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#64748B",
                      transition: "all 0.2s",
                      padding: 0,
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        AWARENESS_CARDS[awarenessIdx].border;
                      (e.currentTarget as HTMLButtonElement).style.color =
                        AWARENESS_CARDS[awarenessIdx].border;
                      (e.currentTarget as HTMLButtonElement).style.background =
                        `${AWARENESS_CARDS[awarenessIdx].border}10`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#E2E8F0";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#64748B";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#fff";
                    }}
                  >
                    ‹
                  </button>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#CBD5E1",
                      fontWeight: 700,
                      minWidth: 28,
                      textAlign: "center",
                    }}
                  >
                    {awarenessIdx + 1}/{AWARENESS_CARDS.length}
                  </span>
                  <button
                    onClick={cfNext}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1.5px solid #E2E8F0",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#64748B",
                      transition: "all 0.2s",
                      padding: 0,
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        AWARENESS_CARDS[awarenessIdx].border;
                      (e.currentTarget as HTMLButtonElement).style.color =
                        AWARENESS_CARDS[awarenessIdx].border;
                      (e.currentTarget as HTMLButtonElement).style.background =
                        `${AWARENESS_CARDS[awarenessIdx].border}10`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#E2E8F0";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#64748B";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#fff";
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Coverflow Viewport */}
              <div
                style={{
                  position: "relative",
                  height: 325,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setIsAwarenessHovered(true)}
                onMouseLeave={() => {
                  setIsAwarenessHovered(false);
                  setCfHoveredIdx(null);
                }}
                onTouchStart={(e) => {
                  touchStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  if (Math.abs(dx) > 36) {
                    dx < 0 ? cfNext() : cfPrev();
                  }
                }}
              >
                {AWARENESS_CARDS.map((card, i) => {
                  const total = AWARENESS_CARDS.length;
                  const activeIdx =
                    cfHoveredIdx !== null ? cfHoveredIdx : awarenessIdx;
                  let offset = i - activeIdx;
                  if (offset > total / 2) offset -= total;
                  if (offset < -total / 2) offset += total;
                  const absOffset = Math.abs(offset);
                  if (absOffset > 2) return null;
                  const isCenter = offset === 0;
                  const isAdj = absOffset === 1;
                  const scale = isCenter ? 1 : isAdj ? 0.8 : 0.65;
                  const opacity = isCenter ? 1 : isAdj ? 0.58 : 0.3;
                  const blur = isCenter ? 0 : isAdj ? 1.5 : 3.5;
                  const zIndex = isCenter ? 10 : isAdj ? 5 : 2;
                  const CARD_W = 420;
                  const adjPx = CARD_W * 0.8 * 0.5 + 26;
                  const farPx = adjPx + CARD_W * 0.65 * 0.5 + 10;
                  const translatePx =
                    offset === 0
                      ? 0
                      : offset === 1
                        ? adjPx
                        : offset === -1
                          ? -adjPx
                          : offset === 2
                            ? farPx
                            : -farPx;

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        cfGoTo(i);
                        setCfHoveredIdx(null);
                      }}
                      onMouseEnter={() => setCfHoveredIdx(i)}
                      onMouseLeave={() => setCfHoveredIdx(null)}
                      style={{
                        position: "absolute",
                        width: CARD_W,
                        cursor: isCenter ? "default" : "pointer",
                        transform: `translateX(${translatePx}px) scale(${scale})`,
                        opacity,
                        filter: blur > 0 ? `blur(${blur}px)` : "none",
                        zIndex,
                        transition:
                          "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s cubic-bezier(0.22,1,0.36,1), filter 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s cubic-bezier(0.22,1,0.36,1)",
                        transformOrigin: "center center",
                        borderRadius: 22,
                        boxShadow: isCenter
                          ? `0 12px 40px ${card.border}35, 0 3px 12px rgba(0,0,0,0.09), 0 0 0 1.5px ${card.border}28`
                          : isAdj
                            ? "0 4px 14px rgba(0,0,0,0.07)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          background: card.bg,
                          borderRadius: 22,
                          padding: "16px 20px 14px",
                          border: `1.5px solid ${card.border}22`,
                          position: "relative",
                          overflow: "hidden",
                          height: 295,
                          boxSizing: "border-box" as const,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: card.border,
                            borderRadius: "22px 22px 0 0",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            right: 40,
                            top: -24,
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            background: `${card.border}07`,
                            pointerEvents: "none",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                            marginTop: 3,
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background: `${card.border}18`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                              flexShrink: 0,
                              border: `1.5px solid ${card.border}28`,
                            }}
                          >
                            {card.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexWrap: "nowrap" as const,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: "#0F172A",
                                  lineHeight: 1.25,
                                  letterSpacing: "-0.02em",
                                  whiteSpace: "nowrap" as const,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  flex: 1,
                                }}
                              >
                                {card.title}
                              </div>
                              <div
                                style={{
                                  background: `${card.border}15`,
                                  border: `1px solid ${card.border}30`,
                                  borderRadius: 20,
                                  padding: "3px 10px",
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  color: card.border,
                                  letterSpacing: "0.04em",
                                  whiteSpace: "nowrap" as const,
                                  flexShrink: 0,
                                }}
                              >
                                {card.tag}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            height: 1,
                            background: `${card.border}15`,
                            marginBottom: 8,
                            flexShrink: 0,
                            borderRadius: 1,
                          }}
                        />
                        {card.body && (
                          <div
                            style={{
                              fontSize: 13.5,
                              color: "#475569",
                              lineHeight: 1.6,
                              flex: 1,
                              overflowY: "auto",
                              scrollbarWidth: "none",
                            }}
                          >
                            {card.body}
                          </div>
                        )}
                        {card.list && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "5px 8px",
                              flex: 1,
                              alignContent: "start" as const,
                            }}
                          >
                            {card.list.map((item: string, li: number) => (
                              <div
                                key={li}
                                style={{
                                  fontSize: 12.5,
                                  color: "#374151",
                                  lineHeight: 1.5,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  background: "rgba(255,255,255,0.65)",
                                  borderRadius: 8,
                                  padding: "5px 8px",
                                  border: `1px solid ${card.border}15`,
                                }}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "12%",
                    background:
                      "linear-gradient(to right, #F0FDF4 30%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 20,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "12%",
                    background:
                      "linear-gradient(to left, #F8FAFC 30%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 20,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 5,
                  marginTop: 12,
                  alignItems: "center",
                }}
              >
                {AWARENESS_CARDS.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => cfGoTo(i)}
                    style={{
                      width: i === awarenessIdx ? 22 : 7,
                      height: 7,
                      borderRadius: 10,
                      background:
                        i === awarenessIdx
                          ? AWARENESS_CARDS[awarenessIdx].border
                          : "#E2E8F0",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div ref={suggestionsRef}>
              <SuggestionChips onSelect={sendMessage} />
            </div>

            <button
              onClick={() => setIsChatStarted(true)}
              style={{
                width: "100%",
                height: 52,
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg,#22C55E,#15803D)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 6px 20px rgba(22,163,74,0.35)",
                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 10px 28px rgba(22,163,74,0.42)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 6px 20px rgba(22,163,74,0.35)";
              }}
            >
              {s.startChatBtn}
            </button>
            <div style={{ height: 4 }} />
          </div>
        ) : (
          /* ── Message list ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
              <span
                style={{
                  fontSize: 11,
                  color: "#94A3B8",
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 20,
                  padding: "3px 12px",
                }}
              >
                {s.todayLabel}
              </span>
            </div>

            {messages.map((msg) =>
              msg.role === "user" ? (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    animation: "maha-msg-in-right 0.3s ease both",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "74%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 3,
                    }}
                  >
                    <div
                      style={{
                        background: "linear-gradient(135deg,#22C55E,#15803D)",
                        borderRadius: "18px 4px 18px 18px",
                        padding: "11px 15px",
                        boxShadow: "0 3px 10px rgba(22,163,74,0.22)",
                      }}
                    >
                      {/* Voice message indicator */}
                      {msg.text === "🎙️ Voice message" ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 15 }}>🎙️</span>
                          <div
                            style={{
                              display: "flex",
                              gap: 3,
                              alignItems: "flex-end",
                            }}
                          >
                            {[0, 1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                style={{
                                  width: 3,
                                  background: "rgba(255,255,255,0.85)",
                                  borderRadius: 2,
                                  height: `${8 + (i % 3) * 6}px`,
                                }}
                              />
                            ))}
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.85)",
                            }}
                          >
                            Voice message
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: 13.5,
                            color: "#fff",
                            lineHeight: 1.6,
                          }}
                        >
                          {msg.text}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94A3B8",
                        paddingRight: 4,
                      }}
                    >
                      {msg.timestamp.toLocaleTimeString("mr-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    gap: 9,
                    alignItems: "flex-start",
                    animation: "maha-msg-in-left 0.3s ease both",
                  }}
                >
                  <MahaAvatar size={30} />
                  <div
                    style={{
                      maxWidth: "74%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                    }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: "4px 18px 18px 18px",
                        padding: "11px 15px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        border: "1px solid #F1F5F9",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13.5,
                          color: "#1A1A1A",
                          lineHeight: 1.65,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#94A3B8", paddingLeft: 4 }}
                    >
                      {msg.timestamp.toLocaleTimeString("mr-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ),
            )}

            {isLoading && (
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  animation: "maha-msg-in-left 0.3s ease both",
                }}
              >
                <MahaAvatar size={30} />
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "4px 18px 18px 18px",
                    padding: "12px 16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#22C55E",
                          animation: `maha-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "#64748B" }}>
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </span>
                </div>
              </div>
            )}

            {isTyping && typingText && (
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  animation: "maha-msg-in-left 0.2s ease both",
                }}
              >
                <MahaAvatar size={30} />
                <div
                  style={{
                    maxWidth: "74%",
                    background: "#fff",
                    borderRadius: "4px 18px 18px 18px",
                    padding: "11px 15px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "#1A1A1A",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {typingText}
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 14,
                        background: "#22C55E",
                        marginLeft: 2,
                        borderRadius: 1,
                        animation: "maha-blink 0.8s step-end infinite",
                        verticalAlign: "text-bottom",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          ── INPUT BAR (with integrated voice recording) ──
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          background: "#fff",
          borderTop: "1px solid #F1F5F9",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
          padding: isRecording ? "0 14px 12px" : "10px 14px 12px",
          flexShrink: 0,
          transition: "padding 0.25s ease",
        }}
      >
        {/* ── Recording status bar (shown while recording) ── */}
        {isRecording && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 4px 10px",
              animation: "maha-recording-bar-in 0.25s ease both",
            }}
          >
            {/* Left: mic icon + waveform + timer */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Pulsing red mic dot */}
              <div
                style={{
                  position: "relative",
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* outer ring animation */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.18)",
                    animation: "maha-mic-ring 1.4s ease-out infinite",
                  }}
                />
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#EF4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "maha-mic-pulse 1.6s ease-in-out infinite",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {/* mic SVG */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="9"
                      y="2"
                      width="6"
                      height="12"
                      rx="3"
                      fill="#fff"
                    />
                    <path
                      d="M5 11a7 7 0 0014 0"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="12"
                      y1="18"
                      x2="12"
                      y2="22"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="9"
                      y1="22"
                      x2="15"
                      y2="22"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Animated waveform bars */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 3,
                  height: 22,
                }}
              >
                {[0.4, 0.8, 1, 0.65, 0.9, 0.5, 0.75].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 3,
                      borderRadius: 2,
                      background: "#EF4444",
                      animationName: "maha-waveform",
                      animationDuration: `${0.55 + i * 0.07}s`,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDelay: `${i * 0.08}s`,
                      animationDirection: "alternate",
                      height: `${Math.round(h * 18)}px`,
                    }}
                  />
                ))}
              </div>

              {/* Timer */}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#EF4444",
                  fontFamily: "Poppins, sans-serif",
                  letterSpacing: "0.04em",
                  minWidth: 38,
                }}
              >
                {fmtSecs(recordingSeconds)}
              </span>

              {/* max duration hint */}
              <span
                style={{
                  fontSize: 10,
                  color: "#94A3B8",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                / 01:00
              </span>
            </div>

            {/* Right: Cancel button */}
            <button
              onClick={handleCancelRecording}
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
                color: "#EF4444",
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#FEE2E2";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#FEF2F2";
              }}
            >
              ✕{" "}
              {lang === "hi"
                ? "रद्द करें"
                : lang === "mr"
                  ? "रद्द करा"
                  : "Cancel"}
            </button>
          </div>
        )}

        {/* ── Main input row ── */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          {/* Text input box — hidden while recording */}
          {!isRecording && (
            <div
              style={{
                flex: 1,
                background: inputFocused ? "#fff" : "#F8FAFC",
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                minHeight: 46,
                border: `1.5px solid ${inputFocused ? "#22C55E" : "#E2E8F0"}`,
                transition: "all 0.2s ease",
                boxShadow: inputFocused
                  ? "0 0 0 3px rgba(34,197,94,0.12)"
                  : "none",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={s.inputPlaceholder}
                disabled={isLoading || isTyping}
                rows={1}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: 13.5,
                  fontFamily: "Poppins, sans-serif",
                  color: "#1A1A1A",
                  lineHeight: 1.5,
                  padding: "10px 0",
                  maxHeight: 80,
                  scrollbarWidth: "none",
                }}
              />
            </div>
          )}

          {/* ── Mic / Stop button ── */}
          <button
            onClick={isRecording ? handleStopAndSend : handleStartRecording}
            disabled={isVoiceBusy}
            title={micLabel}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              border: "none",
              background: isRecording
                ? "linear-gradient(135deg,#EF4444,#DC2626)"
                : isVoiceProcessing || recordingState === "requesting"
                  ? "#E2E8F0"
                  : "linear-gradient(135deg,#F8FAFC,#E2E8F0)",
              cursor: isVoiceBusy ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: isRecording
                ? "0 4px 14px rgba(239,68,68,0.40)"
                : "0 2px 8px rgba(0,0,0,0.08)",
              animation: isRecording
                ? "maha-mic-pulse 1.6s ease-in-out infinite"
                : "none",
              position: "relative",
            }}
          >
            {isVoiceProcessing || recordingState === "requesting" ? (
              /* Spinner while requesting permission or processing */
              <span
                style={{
                  width: 17,
                  height: 17,
                  border: "2.5px solid #CBD5E1",
                  borderTopColor: "#64748B",
                  borderRadius: "50%",
                  animation: "maha-spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
            ) : isRecording ? (
              /* Stop icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="5" width="14" height="14" rx="2" fill="#fff" />
              </svg>
            ) : (
              /* Mic icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="#64748B" />
                <path
                  d="M5 11a7 7 0 0014 0"
                  stroke="#64748B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="18"
                  x2="12"
                  y2="22"
                  stroke="#64748B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="9"
                  y1="22"
                  x2="15"
                  y2="22"
                  stroke="#64748B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          {/* ── Send button (hidden while recording) ── */}
          {!isRecording && (
            <button
              onClick={() => sendMessage(input)}
              disabled={!canSend}
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                border: "none",
                background: canSend
                  ? "linear-gradient(135deg,#22C55E,#15803D)"
                  : "#E2E8F0",
                cursor: canSend ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: canSend ? "0 4px 14px rgba(22,163,74,0.38)" : "none",
                transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                transform: canSend ? "scale(1)" : "scale(0.95)",
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke={canSend ? "#fff" : "#CBD5E1"}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {/* ── While recording: Send button replaces send ── */}
          {isRecording && (
            <button
              onClick={handleStopAndSend}
              style={{
                height: 46,
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg,#22C55E,#15803D)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "0 16px",
                flexShrink: 0,
                boxShadow: "0 4px 14px rgba(22,163,74,0.38)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 8px 20px rgba(22,163,74,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 14px rgba(22,163,74,0.38)";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {lang === "hi" ? "भेजें" : lang === "mr" ? "पाठवा" : "Send"}
            </button>
          )}
        </div>

        {/* Input hint / voice hint */}
        <div style={{ textAlign: "center", marginTop: 6, minHeight: 16 }}>
          {isRecording ? (
            <span
              style={{
                fontSize: 10,
                color: "#EF4444",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
              }}
            >
              {lang === "hi"
                ? "🔴 रिकॉर्डिंग हो रही है — भेजने के लिए Send दबाएं"
                : lang === "mr"
                  ? "🔴 रेकॉर्डिंग सुरू — पाठवण्यासाठी Send दाबा"
                  : "🔴 Recording — press Send or stop when done"}
            </span>
          ) : (
            <span style={{ fontSize: 10, color: "#CBD5E1" }}>
              {s.inputHint}
            </span>
          )}
        </div>
      </div>

      {/* ── Voice error toast ── */}
      {voiceToast && (
        <div
          style={{
            position: "absolute",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15,23,42,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: 12,
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 50,
            animation: "maha-voice-toast-in 0.25s ease both",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            maxWidth: "calc(100% - 40px)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>🎙️</span>
          <span
            style={{
              fontSize: 11.5,
              color: "#fff",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
            }}
          >
            {voiceToast}
          </span>
        </div>
      )}

      {/* ── New chat confirmation dialog ── */}
      {showNewChatDialog && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
            animation: "maha-fade 0.2s ease both",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "28px 26px",
              width: "100%",
              maxWidth: 320,
              boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
              animation:
                "maha-scale-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <div
              style={{ fontSize: 32, textAlign: "center", marginBottom: 14 }}
            >
              ✏️
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0F172A",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {s.newChatTitle}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "#64748B",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: 22,
              }}
            >
              {s.newChatBody}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowNewChatDialog(false)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "1.5px solid #E2E8F0",
                  background: "#fff",
                  color: "#64748B",
                  fontSize: 13,
                  fontFamily: "Poppins, sans-serif",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#fff";
                }}
              >
                {s.newChatCancel}
              </button>
              <button
                onClick={confirmNewChat}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#22C55E,#15803D)",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "Poppins, sans-serif",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(22,163,74,0.30)",
                  transition: "all 0.15s",
                }}
              >
                {s.newChatConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Onboarding overlay ── */}
      {showOnboarding && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10, 26, 18, 0.60)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px 16px",
            animation: onboardingExiting
              ? "maha-backdrop-out 0.32s ease forwards"
              : "maha-backdrop-in 0.3s ease both",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 28,
              width: "100%",
              maxWidth: 500,
              maxHeight: "92vh",
              overflowY: "auto",
              scrollbarWidth: "none",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.08)",
              animation: onboardingExiting
                ? "maha-onboard-out 0.32s cubic-bezier(0.4,0,1,1) forwards"
                : "maha-onboard-in 0.45s cubic-bezier(0.22,1,0.36,1) both",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                background:
                  "linear-gradient(135deg,#16A34A 0%,#15803D 60%,#166534 100%)",
                borderRadius: "28px 28px 0 0",
                padding: "22px 24px 20px",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -24,
                  top: -24,
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 20,
                  bottom: -36,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 15,
                    background: "rgba(255,255,255,0.20)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                  }}
                >
                  🌾
                </div>
                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 18,
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {lang === "hi"
                      ? "MAHA AI के बारे में जानें"
                      : lang === "mr"
                        ? "MAHA AI बद्दल जाणून घ्या"
                        : "Learn About MAHA AI"}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.72)",
                      fontSize: 12,
                      marginTop: 3,
                      lineHeight: 1.4,
                    }}
                  >
                    {lang === "hi"
                      ? "शुरू करने से पहले एक नज़र डालें"
                      : lang === "mr"
                        ? "सुरू करण्यापूर्वी एक नजर टाका"
                        : "A quick look before you begin"}
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                  }}
                >
                  {obIdx + 1} / {AWARENESS_CARDS.length}
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  height: 3,
                  background: "rgba(255,255,255,0.20)",
                  borderRadius: 10,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${((obIdx + 1) / AWARENESS_CARDS.length) * 100}%`,
                    background: "#fff",
                    borderRadius: 10,
                    transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)",
                    boxShadow: "0 0 8px rgba(255,255,255,0.5)",
                  }}
                />
              </div>
            </div>

            {/* Carousel body */}
            <div style={{ padding: "20px 20px 0", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 2,
                      background: "#22C55E",
                      borderRadius: 1,
                      display: "inline-block",
                    }}
                  />
                  {s.awarenessLabel}
                </div>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <button
                    onClick={obPrev}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1.5px solid #E2E8F0",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#64748B",
                      transition: "all 0.2s",
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={obNext}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1.5px solid #E2E8F0",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#64748B",
                      transition: "all 0.2s",
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Coverflow viewport */}
              <div
                style={{
                  position: "relative",
                  height: 270,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setObHovered(true)}
                onMouseLeave={() => {
                  setObHovered(false);
                  setObHoveredIdx(null);
                }}
                onTouchStart={(e) => {
                  obTouchStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const dx =
                    e.changedTouches[0].clientX - obTouchStartX.current;
                  if (Math.abs(dx) > 36) {
                    dx < 0 ? obNext() : obPrev();
                  }
                }}
              >
                {AWARENESS_CARDS.map((card, i) => {
                  const total = AWARENESS_CARDS.length;
                  const resolvedIdx =
                    obHoveredIdx !== null ? obHoveredIdx : obIdx;
                  let offset = i - resolvedIdx;
                  if (offset > total / 2) offset -= total;
                  if (offset < -total / 2) offset += total;
                  const absOffset = Math.abs(offset);
                  if (absOffset > 2) return null;
                  const isCenter = offset === 0;
                  const isAdj = absOffset === 1;
                  const scale = isCenter ? 1 : isAdj ? 0.78 : 0.62;
                  const opacity = isCenter ? 1 : isAdj ? 0.5 : 0.25;
                  const blur = isCenter ? 0 : isAdj ? 2 : 4;
                  const zIndex = isCenter ? 10 : isAdj ? 5 : 2;
                  const CARD_W = 380;
                  const adjPx = CARD_W * 0.78 * 0.5 + 22;
                  const farPx = adjPx + CARD_W * 0.62 * 0.5 + 8;
                  const translatePx =
                    offset === 0
                      ? 0
                      : offset === 1
                        ? adjPx
                        : offset === -1
                          ? -adjPx
                          : offset === 2
                            ? farPx
                            : -farPx;

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        obGoTo(i);
                        setObHoveredIdx(null);
                      }}
                      onMouseEnter={() => setObHoveredIdx(i)}
                      onMouseLeave={() => setObHoveredIdx(null)}
                      style={{
                        position: "absolute",
                        width: CARD_W,
                        cursor: isCenter ? "default" : "pointer",
                        transform: `translateX(${translatePx}px) scale(${scale})`,
                        opacity,
                        filter: blur > 0 ? `blur(${blur}px)` : "none",
                        zIndex,
                        transition:
                          "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s cubic-bezier(0.22,1,0.36,1), filter 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s cubic-bezier(0.22,1,0.36,1)",
                        transformOrigin: "center center",
                        borderRadius: 20,
                        boxShadow: isCenter
                          ? `0 10px 36px ${card.border}30, 0 3px 10px rgba(0,0,0,0.08), 0 0 0 1.5px ${card.border}22`
                          : isAdj
                            ? "0 3px 12px rgba(0,0,0,0.06)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          background: card.bg,
                          borderRadius: 20,
                          padding: "14px 18px 12px",
                          border: `1.5px solid ${card.border}22`,
                          position: "relative",
                          overflow: "hidden",
                          height: 240,
                          boxSizing: "border-box" as const,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: card.border,
                            borderRadius: "20px 20px 0 0",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                            marginTop: 2,
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 11,
                              background: `${card.border}18`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 18,
                              flexShrink: 0,
                              border: `1.5px solid ${card.border}28`,
                            }}
                          >
                            {card.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: "#0F172A",
                                lineHeight: 1.2,
                                letterSpacing: "-0.02em",
                                whiteSpace: "nowrap" as const,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {card.title}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            height: 1,
                            background: `${card.border}15`,
                            marginBottom: 8,
                            flexShrink: 0,
                          }}
                        />
                        {card.body && (
                          <div
                            style={{
                              fontSize: 13.5,
                              color: "#475569",
                              lineHeight: 1.6,
                              flex: 1,
                              overflowY: "auto",
                              scrollbarWidth: "none",
                            }}
                          >
                            {card.body}
                          </div>
                        )}
                        {card.list && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "4px 7px",
                              flex: 1,
                              alignContent: "start" as const,
                            }}
                          >
                            {card.list.map((item: string, li: number) => (
                              <div
                                key={li}
                                style={{
                                  fontSize: 12.5,
                                  color: "#374151",
                                  lineHeight: 1.5,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "rgba(255,255,255,0.65)",
                                  borderRadius: 7,
                                  padding: "5px 8px",
                                  border: `1px solid ${card.border}15`,
                                }}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "10%",
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.98) 20%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 20,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "10%",
                    background:
                      "linear-gradient(to left, rgba(255,255,255,0.98) 20%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 20,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 5,
                  marginTop: 12,
                  alignItems: "center",
                }}
              >
                {AWARENESS_CARDS.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => obGoTo(i)}
                    style={{
                      width: i === obIdx ? 20 : 6,
                      height: 6,
                      borderRadius: 10,
                      background:
                        i === obIdx ? AWARENESS_CARDS[obIdx].border : "#E2E8F0",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ padding: "20px 20px 24px", flexShrink: 0 }}>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#94A3B8",
                  marginBottom: 14,
                  letterSpacing: "0.01em",
                }}
              >
                {lang === "hi"
                  ? "सभी कार्ड देखें या सीधे शुरू करें"
                  : lang === "mr"
                    ? "सर्व कार्ड पाहा किंवा थेट सुरू करा"
                    : "Browse all cards or jump straight in"}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => closeOnboarding(false)}
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 15,
                    border: "1.5px solid #E2E8F0",
                    background: "#F8FAFC",
                    color: "#64748B",
                    fontSize: 13.5,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.18s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#F1F5F9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#F8FAFC";
                  }}
                >
                  <span style={{ fontSize: 15 }}>⏭</span>
                  {lang === "hi" ? "छोड़ें" : lang === "mr" ? "वगळा" : "Skip"}
                </button>
                <button
                  onClick={() => closeOnboarding(false)}
                  style={{
                    flex: 2,
                    height: 50,
                    borderRadius: 15,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #15803D 100%)",
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 6px 22px rgba(22,163,74,0.40)",
                    transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  <span style={{ fontSize: 16 }}>🚀</span>
                  {lang === "hi"
                    ? "अभी शुरू करें"
                    : lang === "mr"
                      ? "आत्ता सुरू करा"
                      : "Start Now"}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ marginLeft: 2 }}
                  >
                    <path
                      d="M5 12H19M13 6l6 6-6 6"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
