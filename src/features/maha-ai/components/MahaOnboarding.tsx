import { useState, useEffect, useRef } from "react";
import { useLang } from "../context/LangContext";
import { t } from "../constants/mahaI18n";

interface MahaOnboardingProps {
  onDone: () => void;
}

export const MahaOnboarding = ({ onDone }: MahaOnboardingProps) => {
  const { lang } = useLang();
  const s = t(lang);

  const ONBOARDING_SLIDES = [
    {
      emoji: "🤖",
      bg: "#EFF6FF",
      accent: "#3B82F6",
      title: s.slide1Title,
      sub: s.slide1Sub,
      body: s.slide1Body,
      list: null as string[] | null,
    },
    {
      emoji: "🌾",
      bg: "#F0FDF4",
      accent: "#16A34A",
      title: s.slide2Title,
      sub: s.slide2Sub,
      body: s.slide2Body,
      list: null as string[] | null,
    },
    {
      emoji: "💬",
      bg: "#FFFBEB",
      accent: "#F59E0B",
      title: s.slide3Title,
      sub: s.slide3Sub,
      body: null as string | null,
      list: s.slide3List,
    },
    {
      emoji: "📱",
      bg: "#F5F3FF",
      accent: "#8B5CF6",
      title: s.slide4Title,
      sub: s.slide4Sub,
      body: null as string | null,
      list: s.slide4List,
    },
    {
      emoji: "🔒",
      bg: "#FDF4FF",
      accent: "#EC4899",
      title: s.slide5Title,
      sub: s.slide5Sub,
      body: s.slide5Body,
      list: null as string[] | null,
    },
  ];

  const [slide, setSlide] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = (nextSlide?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAnimDir("right");
      setSlide((s) => (s < ONBOARDING_SLIDES.length - 1 ? s + 1 : s));
    }, 4200);
    if (nextSlide !== undefined) {
      setAnimDir(nextSlide > slide ? "right" : "left");
      setSlide(nextSlide);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const current = ONBOARDING_SLIDES[slide];
  const isLast = slide === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    setAnimDir("right");
    setSlide((s) => s + 1);
    resetTimer();
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        fontFamily: "Poppins, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Left side ── */}
      <div
        style={{
          width: "38%",
          flexShrink: 0,
          background: "linear-gradient(160deg,#16A34A 0%,#14532D 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          position: "relative",
          overflow: "hidden",
        }}
        className="maha-ob-left"
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -40,
            bottom: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 28,
            background: current.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            marginBottom: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
            transition: "background 0.5s ease",
          }}
        >
          {current.emoji}
        </div>

        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            textAlign: "center",
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          MAHA AI
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.70)",
            fontSize: 12,
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          {s.onboardingVillage}
        </div>

        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 4,
            height: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "rgba(255,255,255,0.85)",
              borderRadius: 4,
              width: `${((slide + 1) / ONBOARDING_SLIDES.length) * 100}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 11,
            marginTop: 8,
          }}
        >
          {slide + 1} / {ONBOARDING_SLIDES.length}
        </div>

        <style>{`
          @media (max-width: 600px) {
            .maha-ob-left { display: none !important; }
          }
        `}</style>
      </div>

      {/* ── Right: content panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg,#22C55E,#3B82F6,#8B5CF6)",
            flexShrink: 0,
          }}
        />

        <div
          style={{
            padding: "22px 28px 16px",
            flexShrink: 0,
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            {s.onboardingWelcome}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#22C55E",
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            {s.onboardingVillage}
          </div>
        </div>

        <div
          key={slide}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "20px 28px",
            overflow: "hidden",
            animation: "maha-fade-up 0.35s ease both",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: current.bg,
                borderRadius: 12,
                padding: "8px 14px",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{current.emoji}</span>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: current.accent,
                    lineHeight: 1.2,
                  }}
                >
                  {current.title}
                </div>
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>
                  {current.sub}
                </div>
              </div>
            </div>
          </div>

          {current.body && (
            <div
              style={{
                fontSize: 13.5,
                color: "#374151",
                lineHeight: 1.7,
                background: "#F8FAFC",
                borderRadius: 14,
                padding: "14px 16px",
                borderLeft: `3px solid ${current.accent}`,
              }}
            >
              {current.body}
            </div>
          )}

          {current.list && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {current.list.map((item, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12.5,
                    color: "#374151",
                    lineHeight: 1.6,
                    background: "#F8FAFC",
                    borderRadius: 12,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid #F1F5F9",
                    animation: `maha-fade-up 0.3s ease ${i * 0.06}s both`,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            padding: "0 0 14px",
            flexShrink: 0,
          }}
        >
          {ONBOARDING_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => resetTimer(i)}
              style={{
                width: i === slide ? 24 : 7,
                height: 7,
                borderRadius: 4,
                background: i === slide ? current.accent : "#E2E8F0",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        <div
          style={{
            padding: "0 28px 24px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            onClick={handleNext}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#22C55E,#15803D)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "Poppins, sans-serif",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(34,197,94,0.30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 10px 28px rgba(34,197,94,0.40)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 20px rgba(34,197,94,0.30)";
            }}
          >
            {isLast ? s.onboardingStart : s.onboardingNext}
          </button>
          <button
            onClick={onDone}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              color: "#94A3B8",
              fontSize: 12,
              fontFamily: "Poppins, sans-serif",
              cursor: "pointer",
              padding: "4px 0",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#64748B";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
            }}
          >
            {s.onboardingSkip}
          </button>
        </div>
      </div>
    </div>
  );
};
