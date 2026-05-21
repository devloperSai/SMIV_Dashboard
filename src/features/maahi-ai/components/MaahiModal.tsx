import { useState, useEffect } from "react";
import { Screen, AuthUser } from "../types/maahi.types";
import { MaahiLogin } from "./MaahiLogin";
import { deleteChatSession } from "../api/maahiApi";
import { MaahiOnboarding } from "./MaahiOnboarding";
import { MaahiChat } from "./MaahiChat";
import { Message } from "../types/maahi.types";
import { useLang } from "../context/LangContext";
import { t } from "../constants/maahiI18n";

interface MaahiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  messages?: Message[];
}

const SESSION_USER_KEY = "maahi_user";
const SESSION_TOKEN_KEY = "maahi_token";
const ONBOARDING_DONE_KEY = "maahi_onboarding_done";
const CHAT_HISTORY_KEY = "maahi_chat_history";

export const MaahiModal = ({ isOpen, onClose }: MaahiModalProps) => {
  const { lang } = useLang();
  const s = t(lang);

  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  const loadChatHistory = () => {
    try {
      const raw = localStorage.getItem(CHAT_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<
          ChatSession & {
            timestamp: string;
            messages?: Array<{ timestamp: string } & Record<string, unknown>>;
          }
        >;
        setChatHistory(
          parsed.map((s) => ({
            ...s,
            timestamp: new Date(s.timestamp),
            messages: s.messages?.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          })),
        );
      }
    } catch {
      setChatHistory([]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const savedUser = sessionStorage.getItem(SESSION_USER_KEY);
    const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setScreen("chat");
      loadChatHistory();
    } else {
      setScreen("login");
    }
  }, [isOpen]);

  const handleLoginSuccess = (u: AuthUser, tk: string) => {
    setUser(u);
    setToken(tk);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(u));
    sessionStorage.setItem(SESSION_TOKEN_KEY, tk);
    loadChatHistory();
    const seen = localStorage.getItem(ONBOARDING_DONE_KEY);
    setScreen(seen ? "chat" : "onboarding");
  };

  const handleOnboardingDone = () => {
    localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    setScreen("chat");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    setUser(null);
    setToken("");
    setScreen("login");
    setChatHistory([]);
    setActiveSessionId(null);
  };

  const handleSaveSession = (session: ChatSession) => {
    setChatHistory((prev) => {
      const exists = prev.findIndex((s) => s.id === session.id);
      let updated: ChatSession[];
      if (exists >= 0) {
        updated = prev.map((s) => (s.id === session.id ? session : s));
      } else {
        updated = [session, ...prev];
      }
      const trimmed = updated.slice(0, 30);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
      return trimmed;
    });
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  const handleDeleteSession = async (
    e: React.MouseEvent,
    sessionId: string,
  ) => {
    e.stopPropagation();
    setDeletingId(sessionId);
    try {
      deleteChatSession(token, sessionId);
    } catch {
      /* silent */
    }

    setChatHistory((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });

    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }

    setDeletingId(null);
    setDeleteToast(s.sidebarDeleted);
    setTimeout(() => setDeleteToast(null), 2200);
  };

  if (!isOpen) return null;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "~";
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // Find active session for restoration
  const activeSession = chatHistory.find((s) => s.id === activeSessionId);
  const restoredMessages = activeSession?.messages ?? null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        @keyframes maahi-spin { to { transform: rotate(360deg); } }
        @keyframes maahi-blink { 50% { opacity: 0; } }
        @keyframes maahi-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
        @keyframes maahi-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes maahi-modal-enter {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes maahi-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes maahi-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes maahi-msg-in-right {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes maahi-msg-in-left {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes maahi-scale-in {
          from { opacity: 0; transform: scale(0.90); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes maahi-slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes maahi-history-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .maahi-modal {
          animation: maahi-modal-enter 0.32s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        .maahi-bd { animation: maahi-fade 0.25s ease both; }
        .maahi-modal ::-webkit-scrollbar { width: 4px; }
        .maahi-modal ::-webkit-scrollbar-track { background: transparent; }
        .maahi-modal ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }

        .maahi-history-item {
          animation: maahi-history-in 0.25s ease both;
        }
        .maahi-history-item:hover .maahi-history-preview {
          color: rgba(255,255,255,0.65);
        }

        .maahi-history-row:hover .maahi-delete-btn {
          opacity: 1 !important;
        }

        @keyframes maahi-toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .maahi-modal {
            width: 100vw !important;
            height: 100dvh !important;
            max-width: 100vw !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="maahi-bd"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2,6,23,0.60)",
          zIndex: 9998,
          backdropFilter: "blur(6px)",
        }}
      />

      <div
        className="maahi-modal"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          maxWidth: 1140,
          height: "84vh",
          maxHeight: 780,
          minHeight: 580,
          background: "#fff",
          borderRadius: 28,
          zIndex: 9999,
          display: "flex",
          overflow: "hidden",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* ── Left: Chat History Sidebar (only in chat screen) ── */}
        {screen === "chat" && (
          <div
            style={{
              width: 240,
              flexShrink: 0,
              background: "linear-gradient(180deg, #166534 0%, #14532D 100%)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
            className="maahi-left-panel"
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: "22px 16px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
              }}
            >
              {/* Logo row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    background:
                      "linear-gradient(135deg,#22C55E 0%,#15803D 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  🌾
                </div>
                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      fontFamily: "Poppins,sans-serif",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.sidebarBrand}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.40)",
                      fontSize: 10,
                      fontFamily: "Poppins,sans-serif",
                    }}
                  >
                    {s.sidebarBrandSub}
                  </div>
                </div>
              </div>

              {/* New chat button */}
              <button
                onClick={handleNewChat}
                style={{
                  width: "100%",
                  height: 38,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 12,
                  fontFamily: "Poppins,sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(34,197,94,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(34,197,94,0.35)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(255,255,255,0.12)";
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
                {s.sidebarNewChat}
              </button>
            </div>

            {/* History list */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px 10px",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.1) transparent",
              }}
            >
              {chatHistory.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 10,
                    padding: "20px 0",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    💬
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.30)",
                      fontSize: 11,
                      fontFamily: "Poppins,sans-serif",
                      textAlign: "center",
                      lineHeight: 1.6,
                    }}
                  >
                    {s.sidebarEmptyLine1}
                    <br />
                    {s.sidebarEmptyLine2}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.28)",
                      fontFamily: "Poppins,sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      padding: "4px 6px 8px",
                    }}
                  >
                    {s.sidebarHistoryLabel}
                  </div>
                  {chatHistory.map((session, idx) => (
                    <div
                      key={session.id}
                      className="maahi-history-item maahi-history-row"
                      style={{
                        position: "relative",
                        marginBottom: 3,
                        animationDelay: `${idx * 0.04}s`,
                      }}
                    >
                      <button
                        onClick={() => handleSelectSession(session.id)}
                        style={{
                          width: "100%",
                          background:
                            activeSessionId === session.id
                              ? "rgba(34,197,94,0.12)"
                              : "transparent",
                          border:
                            activeSessionId === session.id
                              ? "1px solid rgba(34,197,94,0.20)"
                              : "1px solid transparent",
                          borderRadius: 10,
                          padding: "9px 34px 9px 10px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (activeSessionId !== session.id) {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "rgba(255,255,255,0.05)";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "rgba(255,255,255,0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeSessionId !== session.id) {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "transparent";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "transparent";
                          }
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 6,
                            marginBottom: 3,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11.5,
                              fontWeight: 600,
                              color:
                                activeSessionId === session.id
                                  ? "#4ADE80"
                                  : "rgba(255,255,255,0.80)",
                              fontFamily: "Poppins,sans-serif",
                              lineHeight: 1.3,
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {session.title}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: "rgba(255,255,255,0.25)",
                              fontFamily: "Poppins,sans-serif",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            {formatTime(session.timestamp)}
                          </div>
                        </div>

                        <div
                          className="maahi-history-preview"
                          style={{
                            fontSize: 10.5,
                            color: "rgba(255,255,255,0.35)",
                            fontFamily: "Poppins,sans-serif",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            transition: "color 0.15s",
                          }}
                        >
                          {session.preview}
                        </div>

                        <div style={{ marginTop: 5 }}>
                          <span
                            style={{
                              fontSize: 9,
                              color: "rgba(255,255,255,0.20)",
                              fontFamily: "Poppins,sans-serif",
                            }}
                          >
                            {s.sidebarMsgCount.replace(
                              "{n}",
                              String(session.messageCount),
                            )}
                          </span>
                        </div>
                      </button>

                      {/* Trash button */}
                      <button
                        className="maahi-delete-btn"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        disabled={deletingId === session.id}
                        title={s.sidebarDeleted}
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: 6,
                          transform: "translateY(-50%)",
                          width: 24,
                          height: 24,
                          borderRadius: 7,
                          border: "none",
                          background: "rgba(239,68,68,0.0)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition:
                            "opacity 0.18s ease, background 0.18s ease",
                          padding: 0,
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(239,68,68,0.18)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(239,68,68,0.0)";
                        }}
                      >
                        {deletingId === session.id ? (
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              border: "1.5px solid rgba(239,68,68,0.5)",
                              borderTopColor: "#EF4444",
                              borderRadius: "50%",
                              animation: "maahi-spin 0.8s linear infinite",
                              display: "inline-block",
                            }}
                          />
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 11v6M14 11v6"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Delete toast */}
            {deleteToast && (
              <div
                style={{
                  position: "absolute",
                  bottom: 70,
                  left: 10,
                  right: 10,
                  background: "rgba(15,23,42,0.92)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 10,
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  zIndex: 10,
                  animation: "maahi-toast-in 0.25s ease both",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                }}
              >
                <span style={{ fontSize: 14 }}>🗑️</span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "rgba(255,255,255,0.80)",
                    fontFamily: "Poppins,sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {deleteToast}
                </span>
              </div>
            )}

            {/* Bottom user badge */}
            {user && (
              <div
                style={{
                  padding: "12px 14px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#22C55E,#15803D)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: "#fff",
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: "Poppins,sans-serif",
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.80)",
                      fontFamily: "Poppins,sans-serif",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name?.split(" ")[0] || "User"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 1,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#4ADE80",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 9.5,
                        color: "rgba(255,255,255,0.30)",
                        fontFamily: "Poppins,sans-serif",
                      }}
                    >
                      {s.sidebarOnline}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <style>{`
              @media (max-width: 700px) {
                .maahi-left-panel { display: none !important; }
              }
            `}</style>
          </div>
        )}

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {screen === "login" && (
            <MaahiLogin onSuccess={handleLoginSuccess} onClose={onClose} />
          )}
          {screen === "onboarding" && (
            <MaahiOnboarding onDone={handleOnboardingDone} />
          )}
          {screen === "chat" && user && (
            <MaahiChat
              key={activeSessionId ?? "new"}
              user={user}
              token={token}
              onClose={onClose}
              onLogout={handleLogout}
              onSaveSession={handleSaveSession}
              activeSessionId={activeSessionId}
              restoredMessages={restoredMessages}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MaahiModal;
