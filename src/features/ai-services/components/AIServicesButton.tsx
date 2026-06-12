// src/features/ai-services/components/AIServicesButton.tsx
// Formerly maha-ai/components/MahaAIButton.tsx
// InlineLogin has been moved to features/auth/components/InlineLogin.tsx

import { useEffect, useState, useRef } from "react";
import MahaModal from "../../maha-ai/components/MahaModal";
import { useLang } from "../../maha-ai/context/LangContext";
import { LangProvider } from "../../maha-ai/context/LangContext";
import { t, LANG_META, Lang } from "../../maha-ai/constants/mahaI18n";
import { AgroLensModal } from "@/features/agro-lens/components";
import { AuthUser } from "../../maha-ai/types/maha.types";
import InlineLogin from "../../auth/components/InlineLogin";

// ─── Flow steps ───────────────────────────────────────────────────────────────
type HubStep = "closed" | "lang" | "login" | "hub";

// ─── Main inner component ─────────────────────────────────────────────────────
const MahaAIButtonInner = () => {
  const { lang, setLang } = useLang();
  const s = t(lang);

  const [step, setStep] = useState<HubStep>("closed");
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState("");
  const [mahaModalOpen, setMahaModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleExiting, setBubbleExiting] = useState(false);
  const hubRef = useRef<HTMLDivElement>(null);

  const isOpen = step !== "closed";

  useEffect(() => {
    const savedUser = sessionStorage.getItem("maha_user");
    const savedToken = sessionStorage.getItem("maha_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setBubbleVisible(true), 1800);
    const t2 = setTimeout(() => {
      setBubbleExiting(true);
      setTimeout(() => {
        setBubbleVisible(false);
        setBubbleExiting(false);
      }, 400);
    }, 6500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (step === "closed") return;
    const handler = (e: MouseEvent) => {
      if (hubRef.current && !hubRef.current.contains(e.target as Node))
        closePanel();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [step]);

  const closePanel = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setStep("closed");
      setIsAnimatingOut(false);
    }, 260);
  };

  const handlePillClick = () => {
    if (step !== "closed") {
      closePanel();
      return;
    }
    setBubbleVisible(false);
    setStep("lang");
  };

  const handleLangSelect = (l: Lang) => {
    setLang(l);
    if (user && token) {
      setStep("hub");
    } else {
      setStep("login");
    }
  };

  const handleLoginSuccess = (u: AuthUser, tk: string) => {
    setUser(u);
    setToken(tk);
    sessionStorage.setItem("maha_user", JSON.stringify(u));
    sessionStorage.setItem("maha_token", tk);
    setStep("hub");
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    sessionStorage.removeItem("maha_user");
    sessionStorage.removeItem("maha_token");
    closePanel();
  };

  const openMahaChat = () => {
    closePanel();
    setTimeout(() => setMahaModalOpen(true), 220);
  };
  const openCropDetection = () => {
    closePanel();
    setTimeout(() => setCropModalOpen(true), 220);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes hub-breathe {
          0%,100% { box-shadow: 0 6px 28px rgba(245,166,35,0.50), 0 0 0 0 rgba(245,166,35,0.12); }
          50%      { box-shadow: 0 6px 28px rgba(245,166,35,0.50), 0 0 0 9px rgba(245,166,35,0.08), 0 0 0 18px rgba(245,166,35,0.04); }
        }
        @keyframes hub-wheat-sway { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        @keyframes hub-dot-pulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }

        @keyframes hub-backdrop-in  { from{opacity:0} to{opacity:1} }
        @keyframes hub-backdrop-out { from{opacity:1} to{opacity:0} }

        @keyframes hub-panel-in  { from{opacity:0;transform:translateY(18px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes hub-panel-out { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(12px) scale(0.96)} }

        @keyframes hub-lang-in  { from{opacity:0;transform:translateY(14px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes hub-lang-out { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(8px) scale(0.97)} }

        @keyframes hub-bubble-in  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hub-bubble-out { from{opacity:1} to{opacity:0;transform:translateY(-5px)} }

        @keyframes maha-spin { to{transform:rotate(360deg)} }

        .hub-pill {
          display: inline-flex; align-items: center; height: 58px;
          padding: 6px 22px 6px 7px; gap: 13px;
          background: linear-gradient(135deg, #F5A623 0%, #F7C04B 45%, #F5A623 100%);
          border-radius: 34px; border: none; cursor: pointer; min-width: 226px;
          animation: hub-breathe 3.6s ease-in-out infinite;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
          outline: none; position: relative; overflow: hidden;
          -webkit-tap-highlight-color: transparent; font-family: 'Poppins', sans-serif;
        }
        .hub-pill:hover {
          background: linear-gradient(135deg,#E8960F 0%,#F5A623 100%);
          transform: translateY(-5px) scale(1.035);
          box-shadow: 0 18px 44px rgba(245,166,35,0.58),0 4px 12px rgba(245,166,35,0.28);
          animation: none;
        }
        .hub-pill:active { transform: translateY(-2px) scale(1.01); }

        .hub-avatar { position:relative;width:44px;height:44px;min-width:44px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#1a2f45,#0D1B2A);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 2px 10px rgba(0,0,0,0.30),0 0 0 2px rgba(255,255,255,0.14) inset; }
        .hub-robot { display:inline-block;animation:hub-wheat-sway 2.8s ease-in-out infinite;transform-origin:bottom center; }
        .hub-dot   { position:absolute;bottom:1px;right:1px;width:11px;height:11px;border-radius:50%;background:#2ECC71;border:2px solid #F5A623;box-shadow:0 0 6px rgba(46,204,113,0.7);animation:hub-dot-pulse 2s ease-in-out infinite; }

        .hub-service-card { border:1.5px solid #F1F5F9;border-radius:16px;padding:16px 18px;cursor:default;transition:border-color 0.18s,box-shadow 0.18s,background 0.18s;background:#FAFAFA; }
        .hub-service-card:hover { border-color:#E2E8F0;box-shadow:0 4px 16px rgba(0,0,0,0.06);background:#fff; }
        .hub-service-btn { width:100%;height:40px;border:none;border-radius:12px;font-size:13px;font-weight:700;font-family:'Poppins',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.22s cubic-bezier(0.34,1.2,0.64,1);margin-top:13px; }
        .hub-service-btn:hover { transform:translateY(-2px); }
        .hub-service-btn:active { transform:translateY(0) scale(0.98); }

        .hub-bubble { position:absolute;bottom:calc(100% + 12px);right:0;background:#fff;border-radius:14px 14px 14px 4px;box-shadow:0 4px 24px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.04);padding:12px 16px;pointer-events:none;white-space:nowrap;font-family:'Poppins',sans-serif; }
        .hub-bubble[data-entering="true"] { animation:hub-bubble-in 0.38s ease both; }
        .hub-bubble[data-exiting="true"]  { animation:hub-bubble-out 0.35s ease both; }

        .hub-lang-btn { width:100%;display:flex;align-items:center;gap:11px;border-radius:13px;padding:11px 14px;cursor:pointer;transition:all 0.18s cubic-bezier(0.34,1.1,0.64,1);font-family:'Poppins',sans-serif;margin-bottom:8px; }
        .hub-lang-btn:hover { transform:translateX(4px); }
        .hub-lang-btn:active { transform:translateX(2px) scale(0.99); }

        @media(max-width:520px){
          .hub-container{bottom:16px!important;right:16px!important}
          .hub-lang-picker{width:calc(100vw - 32px)!important;right:0!important}
          .hub-login-panel{width:calc(100vw - 32px)!important;right:0!important}
          .hub-services-panel{width:calc(100vw - 32px)!important;right:0!important}
          .hub-pill{min-width:200px}
        }
      `}</style>

      {/* ── Global backdrop blur overlay ── */}
      {isOpen && (
        <div
          onClick={closePanel}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9990,
            background: "rgba(2, 10, 20, 0.38)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            animation: isAnimatingOut
              ? "hub-backdrop-out 0.26s ease forwards"
              : "hub-backdrop-in 0.30s ease both",
            transition: "opacity 0.26s ease",
          }}
        />
      )}

      <div
        ref={hubRef}
        className="hub-container"
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 9997,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {/* ── Bubble nudge ── */}
        {bubbleVisible && step === "closed" && (
          <div
            className="hub-bubble"
            data-entering={!bubbleExiting ? "true" : "false"}
            data-exiting={bubbleExiting ? "true" : "false"}
          >
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "#0D1B2A",
                marginBottom: 3,
              }}
            >
              🌾 MAHA AI Services
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#374151",
                marginBottom: 4,
                lineHeight: 1.5,
              }}
            >
              माही AI सेवा • 2 सेवा उपलब्ध
            </div>
            <div
              style={{ height: 1, background: "#E2E8F0", marginBottom: 4 }}
            />
            <div style={{ fontSize: 10.5, color: "#64748B", lineHeight: 1.5 }}>
              Chatbot · Crop Disease Detection
            </div>
          </div>
        )}

        {/* ── Step: language picker ── */}
        {step === "lang" && (
          <div
            className="hub-lang-picker"
            style={{
              position: "absolute",
              bottom: "calc(100% + 16px)",
              right: 0,
              width: 268,
              background: "#fff",
              borderRadius: 22,
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)",
              padding: "20px 18px 16px",
              zIndex: 9998,
              animation: isAnimatingOut
                ? "hub-lang-out 0.24s cubic-bezier(0.4,0,1,1) forwards"
                : "hub-lang-in 0.30s cubic-bezier(0.34,1.4,0.64,1) both",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg,#16A34A 0%,#14532D 100%)",
                borderRadius: 14,
                padding: "13px 15px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -10,
                  top: -10,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  backdropFilter: "blur(4px)",
                  flexShrink: 0,
                }}
              >
                🌐
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  भाषा निवडा
                </div>
                <div
                  style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)" }}
                >
                  Choose Language
                </div>
              </div>
            </div>
            {(Object.keys(LANG_META) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => handleLangSelect(l)}
                className="hub-lang-btn"
                style={{
                  background: lang === l ? "#F0FDF4" : "#F8FAFC",
                  border: `1.5px solid ${lang === l ? "#86EFAC" : "#E2E8F0"}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#F0FDF4";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#86EFAC";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    lang === l ? "#F0FDF4" : "#F8FAFC";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    lang === l ? "#86EFAC" : "#E2E8F0";
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    background: lang === l ? "#DCFCE7" : "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 19,
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                >
                  {LANG_META[l].flag}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#0F172A",
                    }}
                  >
                    {LANG_META[l].nativeLabel}
                  </div>
                  <div
                    style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 1 }}
                  >
                    {LANG_META[l].label}
                  </div>
                </div>
                {lang === l ? (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#22C55E,#15803D)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}
                    >
                      ✓
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "1.5px solid #E2E8F0",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Step: login panel ── */}
        {step === "login" && (
          <div
            className="hub-login-panel"
            style={{
              position: "absolute",
              bottom: "calc(100% + 16px)",
              right: 0,
              width: 400,
              maxHeight: 580,
              background: "#fff",
              borderRadius: 24,
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.22), 0 6px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)",
              overflow: "hidden",
              zIndex: 9998,
              display: "flex",
              flexDirection: "column",
              animation: isAnimatingOut
                ? "hub-panel-out 0.24s cubic-bezier(0.4,0,1,1) forwards"
                : "hub-panel-in 0.32s cubic-bezier(0.34,1.4,0.64,1) both",
            }}
          >
            <InlineLogin
              lang={lang}
              onSuccess={handleLoginSuccess}
              onBack={() => setStep("lang")}
            />
          </div>
        )}

        {/* ── Step: hub services panel ── */}
        {step === "hub" && (
          <div
            className="hub-services-panel"
            style={{
              position: "absolute",
              bottom: "calc(100% + 16px)",
              right: 0,
              width: 380,
              background: "#fff",
              borderRadius: 24,
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.22), 0 6px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)",
              overflow: "hidden",
              zIndex: 9998,
              animation: isAnimatingOut
                ? "hub-panel-out 0.24s cubic-bezier(0.4,0,1,1) forwards"
                : "hub-panel-in 0.32s cubic-bezier(0.34,1.4,0.64,1) both",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                background:
                  "linear-gradient(135deg,#F5A623 0%,#F7C04B 50%,#FBBF24 100%)",
                padding: "16px 20px 14px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -20,
                  top: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  bottom: -20,
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.07)",
                  pointerEvents: "none",
                }}
              />
              {/* Row 1: Robot icon + Title/Subtitle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    backdropFilter: "blur(4px)",
                    border: "2px solid rgba(255,255,255,0.35)",
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#0D1B2A",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.25,
                    }}
                  >
                    MAHA AI Services
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(13,27,42,0.60)",
                      marginTop: 2,
                    }}
                  >
                    माही AI सेवा · {s.smartVillage}
                  </div>
                </div>
              </div>
              {/* Row 2: User + Lang + Logout + Close */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {user && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(0,0,0,0.10)",
                      borderRadius: 20,
                      padding: "3px 9px 3px 5px",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#22C55E,#15803D)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: "rgba(13,27,42,0.75)",
                        maxWidth: 72,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.name?.split(" ")[0] || "User"}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setStep("lang")}
                  style={{
                    background: "rgba(0,0,0,0.10)",
                    border: "none",
                    borderRadius: 20,
                    padding: "4px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(13,27,42,0.75)",
                    fontFamily: "Poppins, sans-serif",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(0,0,0,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(0,0,0,0.10)";
                  }}
                >
                  <span style={{ fontSize: 14 }}>{LANG_META[lang].flag}</span>
                  {LANG_META[lang].nativeLabel}
                  <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "none",
                    borderRadius: 20,
                    padding: "4px 9px",
                    cursor: "pointer",
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#ef4444",
                    fontFamily: "Poppins, sans-serif",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(239,68,68,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(239,68,68,0.12)";
                  }}
                >
                  {lang === "hi" ? "बाहर" : lang === "mr" ? "बाहेर" : "Logout"}
                </button>
                <button
                  onClick={closePanel}
                  style={{
                    background: "rgba(0,0,0,0.10)",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                    color: "rgba(13,27,42,0.70)",
                    fontSize: 17,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s",
                    marginLeft: "auto",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(0,0,0,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(0,0,0,0.10)";
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Service cards */}
            <div
              style={{
                padding: "16px 16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 11,
              }}
            >
              {/* Maha AI Chat */}
              <div className="hub-service-card">
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
                      border: "1.5px solid #BBF7D0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    💬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#0F172A",
                        marginBottom: 3,
                      }}
                    >
                      {lang === "hi"
                        ? "माही AI सहायक"
                        : lang === "mr"
                          ? "माही AI सहाय्यक"
                          : "Maha AI Assistant"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        lineHeight: 1.55,
                      }}
                    >
                      {lang === "hi"
                        ? "हिंदी, मराठी या English में पूछें — खेती, स्वास्थ्य, सरकारी योजनाएं"
                        : lang === "mr"
                          ? "मराठी, हिंदी किंवा English मध्ये विचारा — शेती, आरोग्य, योजना"
                          : "Ask in Marathi, Hindi or English — farming, health, govt schemes"}
                    </div>
                  </div>
                </div>
                <button
                  className="hub-service-btn"
                  onClick={openMahaChat}
                  style={{
                    background: "linear-gradient(135deg,#0D1B2A,#1E3A5F)",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(13,27,42,0.22)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 8px 22px rgba(13,27,42,0.32)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 14px rgba(13,27,42,0.22)";
                  }}
                >
                  💬{" "}
                  {lang === "hi"
                    ? "चैट खोलें"
                    : lang === "mr"
                      ? "चॅट उघडा"
                      : "Open Chat"}
                </button>
              </div>

              {/* Crop Disease Detection */}
              <div className="hub-service-card">
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
                      border: "1.5px solid #BBF7D0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    🌿
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#0F172A",
                        marginBottom: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      {lang === "hi"
                        ? "अॅग्रो-लेन्स"
                        : lang === "mr"
                          ? "अॅग्रो-लेन्स"
                          : "Agro-Lens"}
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          background: "linear-gradient(135deg,#22C55E,#15803D)",
                          color: "#fff",
                          padding: "2px 7px",
                          borderRadius: 20,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        {lang === "hi" ? "नया" : lang === "mr" ? "नवीन" : "NEW"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        lineHeight: 1.55,
                      }}
                    >
                      {lang === "hi"
                        ? "फसल की फोटो अपलोड करें — तुरंत AI निदान और उपचार"
                        : lang === "mr"
                          ? "पिकाचा फोटो अपलोड करा — तात्काळ AI निदान व उपचार"
                          : "Upload crop photo for instant AI diagnosis & treatment"}
                    </div>
                  </div>
                </div>
                <button
                  className="hub-service-btn"
                  onClick={openCropDetection}
                  style={{
                    background: "linear-gradient(135deg,#22C55E,#15803D)",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(34,197,94,0.32)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 8px 22px rgba(34,197,94,0.44)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 14px rgba(34,197,94,0.32)";
                  }}
                >
                  🔬{" "}
                  {lang === "hi"
                    ? "फसल स्कैन करें"
                    : lang === "mr"
                      ? "पीक स्कॅन करा"
                      : "Scan with Agro-Lens"}
                </button>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingTop: 2,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 1.5,
                    background: "#E2E8F0",
                    borderRadius: 1,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "#94A3B8",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  सातनवरी स्मार्ट व्हिलेज · SATNAWARI
                </span>
                <span
                  style={{
                    width: 20,
                    height: 1.5,
                    background: "#E2E8F0",
                    borderRadius: 1,
                    display: "inline-block",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Hover tooltip ── */}
        <style>{`
          .hub-tooltip { position:absolute;bottom:calc(100% + 14px);right:0;width:420px;background:#fff;border-radius:14px;padding:14px 18px;pointer-events:none;opacity:0;transform:translateY(8px);transition:opacity 0.22s ease,transform 0.22s ease;z-index:9998;box-shadow:0 8px 32px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.06);display:flex;align-items:center;gap:14px; }
          .hub-pill-wrap:hover .hub-tooltip { opacity:1;transform:translateY(0); }
        `}</style>

        <div className="hub-pill-wrap" style={{ position: "relative" }}>
          <div className="hub-tooltip">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                flexShrink: 0,
                background: "linear-gradient(135deg,#22C55E,#15803D)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🌾
            </div>
            <div
              style={{
                width: 1,
                height: 36,
                background: "#E2E8F0",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: 3,
                }}
              >
                मी तुमचा स्मार्ट AI सहाय्यक — कोणताही प्रश्न विचारा किंवा पिकाचा
                फोटो द्या, लगेच उत्तर मिळेल.
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>
                I'm your smart AI assistant — ask any question or upload a crop
                photo, get an instant answer.
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -6,
                right: 36,
                width: 12,
                height: 12,
                background: "#fff",
                transform: "rotate(45deg)",
                borderRadius: 2,
                boxShadow: "2px 2px 4px rgba(0,0,0,0.06)",
              }}
            />
          </div>

          <button
            className="hub-pill"
            aria-label="MAHA AI Services उघडा"
            onClick={handlePillClick}
            style={{ zIndex: 9997, position: "relative" }}
          >
            <div className="hub-avatar">
              <span className="hub-robot">🤖</span>
              <span className="hub-dot" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0D1B2A",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                }}
              >
                MAHA AI Services
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(13,27,42,0.60)",
                  whiteSpace: "nowrap",
                }}
              >
                माही AI सेवा · 2 सेवा उपलब्ध
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#22C55E",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2.5px solid #fff",
                boxShadow: "0 2px 8px rgba(34,197,94,0.45)",
              }}
            >
              2
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AgroLensModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        lang={lang}
        userId={user?.id ?? ""}
      />
      <MahaModal
        isOpen={mahaModalOpen}
        onClose={() => setMahaModalOpen(false)}
      />
    </>
  );
};

const MahaAIButton = () => (
  <LangProvider>
    <MahaAIButtonInner />
  </LangProvider>
);

export default MahaAIButton;
