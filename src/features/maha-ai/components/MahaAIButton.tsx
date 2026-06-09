import { useEffect, useState, useRef } from "react";
import MahaModal from "./MahaModal";
import { useLang } from "../context/LangContext";
import { LangProvider } from "../context/LangContext";
import { t, LANG_META, Lang } from "../constants/mahaI18n";
import { AgroLensModal } from "@/features/agro-lens/components";

// ─── AI Hub Button (inner) ────────────────────────────────────────────────────

const MahaAIButtonInner = () => {
  const { lang, setLang } = useLang();
  const s = t(lang);

  // Flow: pill click → language picker → hub panel (both services in chosen lang)
  type HubStep = "closed" | "lang" | "hub";
  const [step, setStep] = useState<HubStep>("closed");
  const [mahaModalOpen, setMahaModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleExiting, setBubbleExiting] = useState(false);
  const hubRef = useRef<HTMLDivElement>(null);

  const hubOpen = step === "hub";
  const showLangPicker = step === "lang";

  // Initial bubble
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
      if (hubRef.current && !hubRef.current.contains(e.target as Node)) {
        setStep("closed");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [step]);

  // Step 1: pill click → show language picker
  const handlePillClick = () => {
    setStep((prev) => (prev === "closed" ? "lang" : "closed"));
    setBubbleVisible(false);
  };

  // Step 2: language selected → show hub panel in that language
  const handleLangSelect = (l: Lang) => {
    setLang(l);
    setStep("hub");
  };

  // Service actions from hub panel
  const openMahaChat = () => {
    setStep("closed");
    setMahaModalOpen(true);
  };

  const openCropDetection = () => {
    setStep("closed");
    setCropModalOpen(true);
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
        @keyframes hub-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes hub-wheat-sway {
          0%,100% { transform: rotate(-5deg); }
          50%      { transform: rotate(5deg); }
        }
        @keyframes hub-panel-in {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hub-panel-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(10px) scale(0.97); }
        }
        @keyframes hub-bubble-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hub-bubble-out {
          from { opacity: 1; }
          to   { opacity: 0; transform: translateY(-5px); }
        }
        @keyframes hub-card-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hub-dot-pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes hub-lang-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .hub-pill {
          display: inline-flex;
          align-items: center;
          height: 58px;
          padding: 6px 22px 6px 7px;
          gap: 13px;
          background: linear-gradient(135deg, #F5A623 0%, #F7C04B 45%, #F5A623 100%);
          background-size: 200% auto;
          border-radius: 34px;
          border: none;
          cursor: pointer;
          min-width: 226px;
          animation: hub-breathe 3.6s ease-in-out infinite;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
          outline: none;
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          font-family: 'Poppins', sans-serif;
        }
        .hub-pill::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 34px;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.32) 50%, transparent 70%);
          background-size: 200% auto;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .hub-pill:hover::before { opacity: 1; animation: hub-shimmer 1.4s linear infinite; }
        .hub-pill:hover {
          background: linear-gradient(135deg, #E8960F 0%, #F5A623 100%);
          transform: translateY(-5px) scale(1.035);
          box-shadow: 0 18px 44px rgba(245,166,35,0.58), 0 4px 12px rgba(245,166,35,0.28);
          animation: none;
        }
        .hub-pill:active { transform: translateY(-2px) scale(1.01); }

        .hub-avatar {
          position: relative;
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #1a2f45, #0D1B2A);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.30), 0 0 0 2px rgba(255,255,255,0.14) inset;
        }
        .hub-wheat { display: inline-block; animation: hub-wheat-sway 2.8s ease-in-out infinite; transform-origin: bottom center; }
        .hub-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #2ECC71;
          border: 2px solid #F5A623;
          box-shadow: 0 0 6px rgba(46,204,113,0.7);
          animation: hub-dot-pulse 2s ease-in-out infinite;
        }

        .hub-panel {
          position: absolute;
          bottom: calc(100% + 14px);
          right: 0;
          width: 340px;
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
        }
        .hub-panel[data-open="true"] { animation: hub-panel-in 0.28s cubic-bezier(0.34,1.4,0.64,1) both; }

        .hub-service-card {
          border: 1.5px solid #F1F5F9;
          border-radius: 16px;
          padding: 14px 16px;
          cursor: default;
          transition: border-color 0.18s, box-shadow 0.18s;
          background: #FAFAFA;
        }
        .hub-service-card:hover {
          border-color: #E2E8F0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          background: #fff;
        }

        .hub-service-btn {
          width: 100%;
          height: 38px;
          border: none;
          border-radius: 11px;
          font-size: 12.5px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.18s cubic-bezier(0.34,1.2,0.64,1);
          margin-top: 12px;
        }
        .hub-service-btn:hover { transform: translateY(-1px); }
        .hub-service-btn:active { transform: translateY(0); }

        .hub-lang-picker {
          position: absolute;
          bottom: calc(100% + 14px);
          right: 0;
          width: 230px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
          padding: 18px 16px 14px;
          animation: hub-lang-in 0.28s cubic-bezier(0.34,1.4,0.64,1) both;
          font-family: 'Poppins', sans-serif;
        }

        .hub-bubble {
          position: absolute;
          bottom: calc(100% + 12px);
          right: 0;
          background: #fff;
          border-radius: 14px 14px 14px 4px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
          padding: 12px 16px;
          pointer-events: none;
          white-space: nowrap;
          font-family: 'Poppins', sans-serif;
        }
        .hub-bubble[data-entering="true"] { animation: hub-bubble-in 0.38s ease both; }
        .hub-bubble[data-exiting="true"] { animation: hub-bubble-out 0.35s ease both; }

        @media (max-width: 480px) {
          .hub-container { bottom: 16px !important; right: 16px !important; }
          .hub-panel { width: calc(100vw - 32px); right: 0; }
          .hub-pill { min-width: 200px; }
        }
      `}</style>

      {/* ── Floating container ── */}
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
        {/* Speech bubble (initial nudge) */}
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

        {/* Hub Panel */}
        {hubOpen && (
          <div className="hub-panel" data-open="true">
            {/* Panel header */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, #F5A623 0%, #F7C04B 50%, #FBBF24 100%)",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -20,
                  top: -20,
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    background: "rgba(0,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    backdropFilter: "blur(4px)",
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
                    }}
                  >
                    MAHA AI Services
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(13,27,42,0.60)" }}>
                    माही AI सेवा · {s.smartVillage}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Language badge — click to go back to lang picker */}
                <button
                  onClick={() => setStep("lang")}
                  title="Change language"
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
                  onClick={() => setStep("closed")}
                  style={{
                    background: "rgba(0,0,0,0.10)",
                    border: "none",
                    borderRadius: "50%",
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    color: "rgba(13,27,42,0.70)",
                    fontSize: 17,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s",
                    flexShrink: 0,
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
                padding: "14px 14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Maha AI Chat */}
              <div
                className="hub-service-card"
                style={{ animationDelay: "0.05s" }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 11 }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
                      border: "1.5px solid #BBF7D0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    💬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13.5,
                        color: "#0F172A",
                        marginBottom: 2,
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
                        fontSize: 11.5,
                        color: "#64748B",
                        lineHeight: 1.5,
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
                    boxShadow: "0 4px 12px rgba(13,27,42,0.22)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 8px 20px rgba(13,27,42,0.32)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 12px rgba(13,27,42,0.22)";
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
              <div
                className="hub-service-card"
                style={{ animationDelay: "0.10s" }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 11 }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
                      border: "1.5px solid #BBF7D0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    🌿
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13.5,
                        color: "#0F172A",
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {lang === "hi"
                        ? "फसल रोग पहचान"
                        : lang === "mr"
                          ? "पीक रोग ओळख"
                          : "Crop Disease Detection"}
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
                        fontSize: 11.5,
                        color: "#64748B",
                        lineHeight: 1.5,
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
                    boxShadow: "0 4px 12px rgba(34,197,94,0.30)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 8px 20px rgba(34,197,94,0.42)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 12px rgba(34,197,94,0.30)";
                  }}
                >
                  🔬{" "}
                  {lang === "hi"
                    ? "फसल स्कैन करें"
                    : lang === "mr"
                      ? "पीक स्कॅन करा"
                      : "Scan Crop"}
                </button>
              </div>

              {/* Footer tag */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  paddingTop: 2,
                }}
              >
                <span
                  style={{
                    width: 16,
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
                    width: 16,
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

        {/* Step 1: Language picker — shown on first pill click */}
        {showLangPicker && (
          <>
            <div
              onClick={() => setStep("closed")}
              style={{ position: "fixed", inset: 0, zIndex: 9996 }}
            />
            <div className="hub-lang-picker" style={{ zIndex: 9997 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: 2,
                  letterSpacing: "-0.01em",
                }}
              >
                🌐 भाषा निवडा / Choose Language
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "#94A3B8",
                  marginBottom: 14,
                }}
              >
                {lang === "hi"
                  ? "AI Hub की भाषा चुनें"
                  : lang === "mr"
                    ? "AI Hub साठी भाषा निवडा"
                    : "Select language for AI Hub"}
              </div>
              {(Object.keys(LANG_META) as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLangSelect(l)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: lang === l ? "#F0FDF4" : "#F8FAFC",
                    border: `1.5px solid ${lang === l ? "#86EFAC" : "#E2E8F0"}`,
                    borderRadius: 12,
                    padding: "9px 12px",
                    cursor: "pointer",
                    marginBottom: 7,
                    transition: "all 0.15s",
                    fontFamily: "Poppins, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#F0FDF4";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#86EFAC";
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateX(3px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      lang === l ? "#F0FDF4" : "#F8FAFC";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      lang === l ? "#86EFAC" : "#E2E8F0";
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateX(0)";
                  }}
                >
                  <span style={{ fontSize: 20 }}>{LANG_META[l].flag}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0F172A",
                      }}
                    >
                      {LANG_META[l].nativeLabel}
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>
                      {LANG_META[l].label}
                    </div>
                  </div>
                  {lang === l && (
                    <span style={{ fontSize: 14, color: "#22C55E" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Hover tooltip — shown on mouse-over of the pill */}
        <style>{`
          .hub-tooltip {
            position: absolute;
            bottom: calc(100% + 14px);
            right: 0;
            width: 420px;
            background: #ffffff;
            border-radius: 14px;
            padding: 14px 18px;
            pointer-events: none;
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.22s ease, transform 0.22s ease;
            z-index: 9998;
            box-shadow: 0 8px 32px rgba(0,0,0,0.13), 0 0 0 1px rgba(0,0,0,0.06);
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .hub-pill-wrap:hover .hub-tooltip { opacity: 1; transform: translateY(0); }
        `}</style>

        <div className="hub-pill-wrap" style={{ position: "relative" }}>
          <div className="hub-tooltip">
            {/* Icon */}
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

            {/* Vertical divider */}
            <div
              style={{
                width: 1,
                height: 36,
                background: "#E2E8F0",
                flexShrink: 0,
              }}
            />

            {/* Text block */}
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

            {/* Tooltip arrow */}
            <div
              style={{
                position: "absolute",
                bottom: -6,
                right: 36,
                width: 12,
                height: 12,
                background: "#ffffff",
                transform: "rotate(45deg)",
                borderRadius: 2,
                boxShadow: "2px 2px 4px rgba(0,0,0,0.06)",
              }}
            />
          </div>

          {/* The main pill button */}
          <button
            className="hub-pill"
            aria-label="MAHA AI Services उघडा"
            onClick={handlePillClick}
          >
            <div className="hub-avatar">
              <span className="hub-wheat">🌾</span>
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
            {/* Badge showing service count */}
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

      {/* Agro Lens Modal */}
      <AgroLensModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        lang={lang}
      />

      {/* Maha AI Modal */}
      <MahaModal
        isOpen={mahaModalOpen}
        onClose={() => setMahaModalOpen(false)}
      />
    </>
  );
};

// ─── Export (wrapped with LangProvider) ──────────────────────────────────────

const MahaAIButton = () => (
  <LangProvider>
    <MahaAIButtonInner />
  </LangProvider>
);

export default MahaAIButton;
