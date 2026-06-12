import { useState, useEffect, useCallback } from "react";
import { Screen, AuthUser } from "../types/maha.types";
import { MahaLogin } from "@/features/auth/components";
import {
  deleteChatSession,
  fetchChatSessions,
  fetchSessionMessages,
  ApiChatSession,
} from "../api/mahaApi";
import { MahaOnboarding } from "./MahaOnboarding";
import { MahaChat } from "./MahaChat";
import { Message } from "../types/maha.types";
import { useLang } from "../context/LangContext";
import { t } from "../constants/mahaI18n";

interface MahaModalProps {
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

const SESSION_USER_KEY = "maha_user";
const SESSION_TOKEN_KEY = "maha_token";
const ONBOARDING_DONE_KEY = "maha_onboarding_done";

// ─── Helper: map API session list → ChatSession[] ────────────────────────────

const mapApiSessions = (raw: ApiChatSession[]): ChatSession[] =>
  raw.map((s) => ({
    id: s.sessionId,
    title: s.title,
    preview: "",
    timestamp: new Date(s.createdAt),
    messageCount: parseInt(s.message_count, 10) || 0,
    messages: undefined,
  }));

// ─── Chat area states ─────────────────────────────────────────────────────────

type ChatAreaState =
  | { kind: "new" } // fresh blank chat
  | { kind: "loading"; sessionId: string } // fetching messages
  | { kind: "ready"; sessionId: string; messages: Message[] }; // messages loaded — mount MahaChat

export const MahaModal = ({ isOpen, onClose }: MahaModalProps) => {
  const { lang } = useLang();
  const s = t(lang);

  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // newChatKey forces MahaChat to remount when the user explicitly starts a new chat
  const [newChatKey, setNewChatKey] = useState(0);

  // Single state machine for the chat area — avoids the async timing gap
  // between setting activeSessionId and fetching messages.
  const [chatArea, setChatArea] = useState<ChatAreaState>({ kind: "new" });

  // ── Load session list from API ──────────────────────────────────────────────

  const loadChatHistory = useCallback(
    async (tk: string, uid: string) => {
      setHistoryLoading(true);
      try {
        const sessions = await fetchChatSessions(tk, uid, lang);
        setChatHistory(mapApiSessions(sessions));
      } catch {
        setChatHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    },
    [lang],
  );

  // ── On modal open: restore auth from sessionStorage ────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const savedUser = sessionStorage.getItem(SESSION_USER_KEY);
    const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (savedUser && savedToken) {
      const parsedUser: AuthUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      setScreen("chat");
      loadChatHistory(savedToken, parsedUser.id);
    } else {
      setScreen("login");
    }
  }, [isOpen]);

  // ── Auth handlers ───────────────────────────────────────────────────────────

  const handleLoginSuccess = (u: AuthUser, tk: string) => {
    setUser(u);
    setToken(tk);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(u));
    sessionStorage.setItem(SESSION_TOKEN_KEY, tk);
    loadChatHistory(tk, u.id);
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
    setChatArea({ kind: "new" });
  };

  // ── Session management ──────────────────────────────────────────────────────

  /**
   * Called by MahaChat after each AI reply — keeps sidebar title/count fresh.
   * Also does a silent API refresh so the server-generated title appears.
   */
  const handleSaveSession = useCallback(
    (session: ChatSession) => {
      setChatHistory((prev) => {
        const exists = prev.findIndex((s) => s.id === session.id);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = {
            ...updated[exists],
            title: session.title,
            preview: session.preview,
            messageCount: session.messageCount,
          };
          return updated;
        }
        return [session, ...prev].slice(0, 30);
      });

      // Silent refresh to pick up server-generated title
      if (token && user) {
        fetchChatSessions(token, user.id, lang)
          .then((sessions) => setChatHistory(mapApiSessions(sessions)))
          .catch(() => {
            /* keep optimistic state */
          });
      }
    },
    [token, user, lang],
  );

  /**
   * Selecting a previous session:
   * 1. Immediately enter "loading" state — sidebar highlights, chat area shows spinner
   * 2. Fetch messages from API
   * 3. Transition to "ready" — MahaChat mounts with full history AND correct sessionId
   *    so the user can continue the conversation seamlessly
   */
  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      // Already showing this session — do nothing
      if (chatArea.kind !== "new" && chatArea.sessionId === sessionId) return;

      // Step 1: show loading immediately
      setChatArea({ kind: "loading", sessionId });

      // Step 2: fetch messages
      const msgs = await fetchSessionMessages(token, sessionId, lang);

      // Step 3: mount MahaChat with loaded messages + correct sessionId
      setChatArea({ kind: "ready", sessionId, messages: msgs });
    },
    [chatArea, token, lang],
  );

  /** New chat — reset to blank state so MahaChat starts fresh with empty sessionId */
  const handleNewChat = () => {
    setChatArea({ kind: "new" });
    setNewChatKey((k) => k + 1);
  };

  const handleDeleteSession = async (
    e: React.MouseEvent,
    sessionId: string,
  ) => {
    e.stopPropagation();
    setDeletingId(sessionId);

    deleteChatSession(token, sessionId).catch(() => {
      /* silent */
    });

    setChatHistory((prev) => prev.filter((s) => s.id !== sessionId));

    // If the deleted session is currently open, go back to blank new chat
    if (chatArea.kind !== "new" && chatArea.sessionId === sessionId) {
      setChatArea({ kind: "new" });
      setNewChatKey((k) => k + 1);
    }

    setDeletingId(null);
    setDeleteToast(s.sidebarDeleted);
    setTimeout(() => setDeleteToast(null), 2200);
  };

  if (!isOpen) return null;

  const activeSessionId = chatArea.kind === "new" ? null : chatArea.sessionId;

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

  // ── Derive the MahaChat key and props from chatArea ────────────────────────
  // Key changes only when we actually have data ready (or user hits new chat).
  // This prevents a premature mount before messages are loaded.
  const mahaChatKey =
    chatArea.kind === "ready"
      ? `session-${chatArea.sessionId}`
      : `new-${newChatKey}`;

  const mahaChatInitialMessages =
    chatArea.kind === "ready" ? chatArea.messages : [];

  // The sessionId to hand into useMahaChat so continuing a restored session
  // sends the correct sessionId to the chat API from the first new message.
  const mahaChatInitialSessionId =
    chatArea.kind === "ready" ? chatArea.sessionId : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        @keyframes maha-spin { to { transform: rotate(360deg); } }
        @keyframes maha-blink { 50% { opacity: 0; } }
        @keyframes maha-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
        @keyframes maha-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes maha-modal-enter {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes maha-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes maha-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes maha-msg-in-right {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes maha-msg-in-left {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes maha-scale-in {
          from { opacity: 0; transform: scale(0.90); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes maha-slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes maha-history-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .maha-modal {
          animation: maha-modal-enter 0.32s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        .maha-bd { animation: maha-fade 0.25s ease both; }
        .maha-modal ::-webkit-scrollbar { width: 4px; }
        .maha-modal ::-webkit-scrollbar-track { background: transparent; }
        .maha-modal ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }

        .maha-history-item {
          animation: maha-history-in 0.25s ease both;
        }
        .maha-history-item:hover .maha-history-preview {
          color: rgba(255,255,255,0.65);
        }

        .maha-history-row:hover .maha-delete-btn {
          opacity: 1 !important;
        }

        @keyframes maha-toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .maha-modal {
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
        className="maha-bd"
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
        className="maha-modal"
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
            className="maha-left-panel"
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
              {historyLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      border: "2px solid rgba(255,255,255,0.15)",
                      borderTopColor: "rgba(255,255,255,0.60)",
                      borderRadius: "50%",
                      animation: "maha-spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.30)",
                      fontFamily: "Poppins,sans-serif",
                    }}
                  >
                    {lang === "hi"
                      ? "लोड हो रहा है..."
                      : lang === "mr"
                        ? "लोड होत आहे..."
                        : "Loading..."}
                  </span>
                </div>
              ) : chatHistory.length === 0 ? (
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
                  {chatHistory.map((session, idx) => {
                    const isActive = activeSessionId === session.id;
                    const isBeingLoaded =
                      chatArea.kind === "loading" &&
                      chatArea.sessionId === session.id;
                    return (
                      <div
                        key={session.id}
                        className="maha-history-item maha-history-row"
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
                            background: isActive
                              ? "rgba(34,197,94,0.12)"
                              : "transparent",
                            border: isActive
                              ? "1px solid rgba(34,197,94,0.20)"
                              : "1px solid transparent",
                            borderRadius: 10,
                            padding: "9px 34px 9px 10px",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.background = "rgba(255,255,255,0.05)";
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.borderColor = "rgba(255,255,255,0.08)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
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
                                color: isActive
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
                              {isBeingLoaded ? (
                                <span
                                  style={{
                                    width: 10,
                                    height: 10,
                                    border: "1.5px solid rgba(255,255,255,0.2)",
                                    borderTopColor: "rgba(255,255,255,0.7)",
                                    borderRadius: "50%",
                                    animation: "maha-spin 0.8s linear infinite",
                                    display: "inline-block",
                                  }}
                                />
                              ) : (
                                formatTime(session.timestamp)
                              )}
                            </div>
                          </div>

                          <div
                            className="maha-history-preview"
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
                            {isBeingLoaded
                              ? lang === "hi"
                                ? "संदेश लोड हो रहे हैं..."
                                : lang === "mr"
                                  ? "संदेश लोड होत आहेत..."
                                  : "Loading messages..."
                              : session.preview ||
                                s.sidebarMsgCount.replace(
                                  "{n}",
                                  String(session.messageCount),
                                )}
                          </div>
                        </button>

                        {/* Trash button */}
                        <button
                          className="maha-delete-btn"
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
                                animation: "maha-spin 0.8s linear infinite",
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
                    );
                  })}
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
                  animation: "maha-toast-in 0.25s ease both",
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
                .maha-left-panel { display: none !important; }
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
            <MahaLogin onSuccess={handleLoginSuccess} onClose={onClose} />
          )}
          {screen === "onboarding" && (
            <MahaOnboarding onDone={handleOnboardingDone} />
          )}
          {screen === "chat" && user && (
            <>
              {/* Session messages loading overlay — shown between click and mount */}
              {chatArea.kind === "loading" && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    background:
                      "linear-gradient(180deg,#F0FDF4 0%,#F8FAFC 100%)",
                    fontFamily: "Poppins,sans-serif",
                    animation: "maha-fade 0.2s ease both",
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      border: "3px solid #BBF7D0",
                      borderTopColor: "#16A34A",
                      borderRadius: "50%",
                      animation: "maha-spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: "#64748B",
                      fontWeight: 500,
                    }}
                  >
                    {lang === "hi"
                      ? "पुरानी बातचीत लोड हो रही है..."
                      : lang === "mr"
                        ? "जुना संवाद लोड होत आहे..."
                        : "Loading conversation..."}
                  </span>
                </div>
              )}

              {/* MahaChat — only mounts when state is "new" or "ready" (never "loading") */}
              {chatArea.kind !== "loading" && (
                <MahaChat
                  key={mahaChatKey}
                  user={user}
                  token={token}
                  onClose={onClose}
                  onLogout={handleLogout}
                  onSaveSession={handleSaveSession}
                  activeSessionId={mahaChatInitialSessionId}
                  restoredMessages={mahaChatInitialMessages}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MahaModal;
