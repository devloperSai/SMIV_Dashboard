import { useEffect, useRef, useState, useCallback } from "react";
import { AuthUser, Message } from "../types/maahi.types";
import { useMaahiChat } from "../hooks/useMaahiChat";
import { MaahiAvatar } from "./MaahiAvatar";
import { SuggestionChips } from "./SuggestionChips";
import { ChatSession } from "./MaahiModal";
import { useLang } from "../context/LangContext";
import { t, LANG_META } from "../constants/maahiI18n";

interface MaahiChatProps {
  user: AuthUser;
  token: string;
  onClose: () => void;
  onLogout: () => void;
  onSaveSession: (session: ChatSession) => void;
  activeSessionId: string | null;

  // make optional
  restoredMessages?: Message[] | null;
}

export const MaahiChat = ({
  user,
  token,
  onClose,
  onLogout,
  onSaveSession,
  activeSessionId,

  // default fallback
  restoredMessages = null,
}: MaahiChatProps) => {
  const { lang } = useLang();
  const s = t(lang);

  // Derived from i18n so they update when lang changes
  const LOADING_MESSAGES = [s.loading1, s.loading2, s.loading3, s.loading4];
  const AWARENESS_CARDS = [
    {
      emoji: "🤖",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      title: s.card1Title,
      body: s.card1Body,
    },
    {
      emoji: "🌾",
      bg: "#F0FDF4",
      border: "#BBF7D0",
      title: s.card2Title,
      body: s.card2Body,
    },
    {
      emoji: "💡",
      bg: "#FFFBEB",
      border: "#FDE68A",
      title: s.card3Title,
      body: s.card3Body,
    },
    {
      emoji: "🔐",
      bg: "#FDF4FF",
      border: "#E9D5FF",
      title: s.card4Title,
      body: s.card4Body,
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
    resetChat,
    canSend,
    sessionId,
  } = useMaahiChat({
    userId: user.id,
    token,
    lang: LANG_META[lang].acceptHeader,
    initialMessages: restoredMessages ?? [],
    initialSessionId:
      activeSessionId && !activeSessionId.startsWith("local-")
        ? activeSessionId
        : "",
  });

  const [awarenessIdx, setAwarenessIdx] = useState(0);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string>(sessionId);
  sessionIdRef.current = sessionId; // kept current every render without being a dep
  const [isAwarenessHovered, setIsAwarenessHovered] = useState(false);

  // Auto-cycle awareness cards
  useEffect(() => {
    const t = setInterval(
      () => setAwarenessIdx((i) => (i + 1) % AWARENESS_CARDS.length),
      3200,
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, typingText]);

  // Auto-save — only after AI reply so sessionIdRef already holds the API id.
  // Removing sessionId from deps prevents a second save when local-xxx → api-id.
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "ai") return;
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
                animation: "maahi-pulse 2s ease infinite",
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

        {/* User chip */}
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
              animation: "maahi-fade-up 0.4s ease both",
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

            {/* ── Awareness Cards — improved layout & animation ── */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94A3B8",
                  marginBottom: 14,
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

              {/* Card grid — animated intelligent interaction */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {AWARENESS_CARDS.map((card, i) => {
                  const isActive = i === awarenessIdx;

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => {
                        setIsAwarenessHovered(true);
                        setAwarenessIdx(i);
                      }}
                      onMouseLeave={() => {
                        setIsAwarenessHovered(false);
                      }}
                      onClick={() => setAwarenessIdx(i)}
                      style={{
                        background: isActive ? "#FFFFFF" : card.bg,
                        border: `1.5px solid ${
                          isActive ? card.border : "rgba(255,255,255,0)"
                        }`,
                        borderRadius: 18,
                        padding: "16px 14px",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",

                        transform: isActive
                          ? "translateY(-10px) scale(1.03)"
                          : "translateY(0px) scale(1)",

                        transition:
                          "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, background 0.3s ease, border-color 0.3s ease",

                        boxShadow: isActive
                          ? "0 18px 40px rgba(34,197,94,0.18), 0 6px 18px rgba(0,0,0,0.08)"
                          : "0 3px 10px rgba(0,0,0,0.04)",

                        zIndex: isActive ? 5 : 1,
                      }}
                    >
                      {/* Animated top glow */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: isActive ? 4 : 0,
                          background: card.border,
                          transition: "all 0.35s ease",
                          opacity: isActive ? 1 : 0,
                        }}
                      />

                      {/* Floating gradient glow */}
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            top: -40,
                            right: -40,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: `${card.border}20`,
                            filter: "blur(20px)",
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Emoji */}
                      <div
                        style={{
                          fontSize: 28,
                          marginBottom: 12,
                          display: "inline-block",

                          transform: isActive
                            ? "translateY(-2px) scale(1.16)"
                            : "scale(1)",

                          transition:
                            "transform 0.38s cubic-bezier(0.34,1.56,0.64,1)",
                        }}
                      >
                        {card.emoji}
                      </div>

                      {/* Title */}
                      <div
                        style={{
                          fontSize: 12.8,
                          fontWeight: 700,
                          color: isActive ? "#0F172A" : "#374151",
                          marginBottom: 7,
                          lineHeight: 1.35,
                          transition: "color 0.25s ease",
                        }}
                      >
                        {card.title}
                      </div>

                      {/* Body */}
                      <div
                        style={{
                          fontSize: 11,
                          color: isActive ? "#475569" : "#94A3B8",
                          lineHeight: 1.65,
                          transition: "color 0.25s ease",
                        }}
                      >
                        {card.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 12,
                }}
              >
                {AWARENESS_CARDS.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => setAwarenessIdx(i)}
                    style={{
                      width: i === awarenessIdx ? 22 : 7,
                      height: 7,
                      borderRadius: 10,
                      background: i === awarenessIdx ? card.border : "#CBD5E1",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "all 0.35s cubic-bezier(0.34,1.2,0.64,1)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Suggestion chips */}
            <SuggestionChips onSelect={sendMessage} />

            {/* CTA */}
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
                    animation: "maahi-msg-in-right 0.3s ease both",
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
                      <div
                        style={{
                          fontSize: 13.5,
                          color: "#fff",
                          lineHeight: 1.6,
                        }}
                      >
                        {msg.text}
                      </div>
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
                    animation: "maahi-msg-in-left 0.3s ease both",
                  }}
                >
                  <MaahiAvatar size={30} />
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

            {/* Loading bubble */}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  animation: "maahi-msg-in-left 0.3s ease both",
                }}
              >
                <MaahiAvatar size={30} />
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
                          animation: `maahi-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
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

            {/* Typing bubble */}
            {isTyping && typingText && (
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  animation: "maahi-msg-in-left 0.2s ease both",
                }}
              >
                <MaahiAvatar size={30} />
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
                        animation: "maahi-blink 0.8s step-end infinite",
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

      {/* ── Input bar ── */}
      <div
        style={{
          background: "#fff",
          borderTop: "1px solid #F1F5F9",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
          padding: "10px 14px 12px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
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
            <span
              style={{
                fontSize: 18,
                marginRight: 8,
                flexShrink: 0,
                opacity: 0.7,
              }}
            >
              🎙️
            </span>
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
        </div>
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "#CBD5E1" }}>{s.inputHint}</span>
        </div>
      </div>

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
            animation: "maahi-fade 0.2s ease both",
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
                "maahi-scale-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
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
    </div>
  );
};
