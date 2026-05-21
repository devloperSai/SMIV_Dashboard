import { useEffect, useState } from "react";
import MaahiModal from "./MaahiModal";
import { useLang } from "../context/LangContext";
import { LangProvider } from "../context/LangContext";
import { t, LANG_META, Lang } from "../constants/maahiI18n";

const MaahiAIButtonInner = () => {
  const { lang, setLang } = useLang();
  const s = t(lang);

  const [showBubble, setShowBubble] = useState(false);
  const [bubblePhase, setBubblePhase] = useState<
    "hidden" | "in" | "visible" | "out"
  >("hidden");
  const [modalOpen, setModalOpen] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setShowBubble(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setBubblePhase("in")),
      );
    }, 1500);
    const t2 = setTimeout(() => setBubblePhase("visible"), 1950);
    const t3 = setTimeout(() => setBubblePhase("out"), 7500);
    const t4 = setTimeout(() => setShowBubble(false), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleMouseEnter = () => {
    setShowBubble(true);
    setBubblePhase("in");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setBubblePhase("visible")),
    );
  };

  const handleMouseLeave = () => {
    setBubblePhase("out");
    setTimeout(() => {
      setBubblePhase("hidden");
      setShowBubble(false);
    }, 400);
  };

  const bubbleOpacity =
    bubblePhase === "hidden" ? 0 : bubblePhase === "out" ? 0 : 1;
  const bubbleTranslate =
    bubblePhase === "hidden" || bubblePhase === "out"
      ? "translateY(10px)"
      : "translateY(0)";
  const bubbleTransition =
    bubblePhase === "in"
      ? "opacity 0.4s cubic-bezier(0.34,1.56,0.64,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1)"
      : "opacity 0.35s ease, transform 0.35s ease";

  const handleOpen = () => {
    setShowLangPicker(false);
    setModalOpen(true);
  };

  const handleLangSelect = (l: Lang) => {
    setLang(l);
    setShowLangPicker(false);
    setModalOpen(true);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes maahi-breathe {
          0%,100% { box-shadow: 0 6px 28px rgba(245,166,35,0.50), 0 0 0 0px rgba(245,166,35,0.12); }
          50%      { box-shadow: 0 6px 28px rgba(245,166,35,0.50), 0 0 0 8px rgba(245,166,35,0.10), 0 0 0 16px rgba(245,166,35,0.05); }
        }
        @keyframes maahi-dot-pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.7; }
        }
        @keyframes maahi-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes maahi-wheat-sway {
          0%,100% { transform: rotate(-5deg); }
          50%      { transform: rotate(5deg); }
        }
        @keyframes maahi-slide-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes maahi-lang-in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .maahi-pill {
          font-family: 'Sora', sans-serif;
          display: inline-flex;
          align-items: center;
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 9997;
          height: 60px;
          padding: 7px 24px 7px 8px;
          gap: 14px;
          background: linear-gradient(135deg, #F5A623 0%, #F7B84B 40%, #F5A623 100%);
          background-size: 200% auto;
          border-radius: 36px;
          border: none;
          cursor: pointer;
          min-width: 228px;
          animation: maahi-breathe 3.5s ease-in-out infinite;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
          outline: none;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
        }
        .maahi-pill::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 36px;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.30) 50%, transparent 70%);
          background-size: 200% auto;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .maahi-pill:hover::before {
          opacity: 1;
          animation: maahi-shimmer 1.4s linear infinite;
        }
        .maahi-pill:hover {
          background: linear-gradient(135deg, #E8960F 0%, #F5A623 100%);
          transform: translateY(-5px) scale(1.04);
          box-shadow: 0 16px 44px rgba(245,166,35,0.60), 0 4px 12px rgba(245,166,35,0.30);
          animation: none;
        }
        .maahi-pill:active { transform: translateY(-2px) scale(1.02); }

        .maahi-avatar-pill {
          position: relative;
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #1a2f45, #0D1B2A);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.15) inset;
        }

        .maahi-wheat {
          display: inline-block;
          animation: maahi-wheat-sway 2.8s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .maahi-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #2ECC71;
          border: 2.5px solid #F5A623;
          box-shadow: 0 0 8px rgba(46,204,113,0.6);
          animation: maahi-dot-pulse 2s ease-in-out infinite;
        }

        .maahi-text { display: flex; flex-direction: column; gap: 2px; }
        .maahi-t1 {
          font-size: 15px;
          font-weight: 700;
          color: #0D1B2A;
          line-height: 1.15;
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .maahi-t2 {
          font-size: 11px;
          font-weight: 500;
          color: rgba(13,27,42,0.60);
          line-height: 1.2;
          white-space: nowrap;
        }

        .maahi-bubble {
          font-family: 'Sora', sans-serif;
          position: fixed;
          bottom: 108px;
          right: 32px;
          z-index: 9997;
          background: #ffffff;
          border-radius: 16px 16px 16px 4px;
          box-shadow: 0 4px 28px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
          padding: 14px 18px;
          pointer-events: none;
          white-space: nowrap;
          animation: maahi-slide-up 0.4s ease both;
        }
        .maahi-bubble-l1 { font-size: 13px; font-weight: 700; color: #0D1B2A; margin: 0 0 5px; line-height: 1.4; }
        .maahi-bubble-l2 { font-size: 11px; color: #64748B; margin: 0; line-height: 1.4; }
        .maahi-bubble-tail {
          position: absolute;
          bottom: -8px;
          right: 20px;
          left: unset;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: none;
          border-top: 8px solid #ffffff;
        }

        .maahi-lang-picker {
          font-family: 'Sora', sans-serif;
          position: fixed;
          bottom: 108px;
          right: 32px;
          z-index: 9998;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
          padding: 18px 16px 14px;
          min-width: 220px;
          animation: maahi-lang-in 0.28s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        .maahi-lang-title {
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .maahi-lang-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
          margin-bottom: 7px;
          transition: all 0.15s ease;
          font-family: 'Sora', sans-serif;
        }
        .maahi-lang-btn:hover {
          background: #F0FDF4;
          border-color: #86EFAC;
          transform: translateX(3px);
        }
        .maahi-lang-btn:last-child { margin-bottom: 0; }
        .maahi-lang-flag { font-size: 20px; }
        .maahi-lang-labels { display: flex; flex-direction: column; flex: 1; }
        .maahi-lang-native { font-size: 13px; font-weight: 700; color: #0F172A; line-height: 1.2; }
        .maahi-lang-sub { font-size: 10px; color: #94A3B8; }
        .maahi-lang-check { font-size: 14px; color: #22C55E; }
        .maahi-lang-tail {
          position: absolute;
          bottom: -8px;
          right: 24px;
          left: unset;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: none;
          border-top: 8px solid #ffffff;
        }

        @media (max-width: 480px) {
          .maahi-pill { bottom: 16px; right: 16px; left: unset; min-width: 200px; }
          .maahi-bubble { bottom: 90px; right: 16px; left: unset; }
          .maahi-lang-picker { bottom: 90px; right: 16px; left: unset; }
        }
      `}</style>

      {/* Language picker popup */}
      {showLangPicker && (
        <>
          {/* backdrop */}
          <div
            onClick={() => setShowLangPicker(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9997,
            }}
          />
          <div className="maahi-lang-picker">
            <div className="maahi-lang-title">
              <span
                style={{
                  width: 14,
                  height: 2,
                  background: "#22C55E",
                  borderRadius: 1,
                  display: "inline-block",
                }}
              />
              {s.langPickerTitle}
            </div>
            {(Object.keys(LANG_META) as Lang[]).map((l) => (
              <button
                key={l}
                className="maahi-lang-btn"
                onClick={() => handleLangSelect(l)}
              >
                <span className="maahi-lang-flag">{LANG_META[l].flag}</span>
                <div className="maahi-lang-labels">
                  <span className="maahi-lang-native">
                    {LANG_META[l].nativeLabel}
                  </span>
                  <span className="maahi-lang-sub">{LANG_META[l].label}</span>
                </div>
                {lang === l && <span className="maahi-lang-check">✓</span>}
              </button>
            ))}
            <div className="maahi-lang-tail" />
          </div>
        </>
      )}

      {/* Speech bubble */}
      {showBubble && !showLangPicker && (
        <div
          className="maahi-bubble"
          role="status"
          aria-live="polite"
          style={{
            opacity: bubbleOpacity,
            transform: bubbleTranslate,
            transition: bubbleTransition,
          }}
        >
          <p className="maahi-bubble-l1">{s.bubbleLine1}</p>
          <p className="maahi-bubble-l2">{s.bubbleLine2}</p>
          <div className="maahi-bubble-tail" />
        </div>
      )}

      <button
        className="maahi-pill"
        aria-label="Open Maahi AI assistant"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setShowLangPicker((v) => !v)}
      >
        <div className="maahi-avatar-pill">
          <span className="maahi-wheat">🌾</span>
          <span className="maahi-dot" />
        </div>
        <div className="maahi-text">
          <span className="maahi-t1">{s.btnTitle}</span>
          <span className="maahi-t2">{s.btnSub}</span>
        </div>
      </button>

      <MaahiModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

const MaahiAIButton = () => (
  <LangProvider>
    <MaahiAIButtonInner />
  </LangProvider>
);

export default MaahiAIButton;
