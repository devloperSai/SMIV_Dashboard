import { useRef, useState } from "react";
import { useAgroLens } from "../hooks/useAgroLens";
import { CROP_OPTIONS } from "../constants/agroConstants";
import type { AgroLang } from "../types/agro.types";

interface AgroLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: AgroLang;
}

const SEVERITY_STYLE = {
  low: {
    bg: "#F0FDF4",
    text: "#16A34A",
    border: "#BBF7D0",
    dot: "#22C55E",
    label: "LOW",
  },
  medium: {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    dot: "#F59E0B",
    label: "MEDIUM",
  },
  high: {
    bg: "#FEF2F2",
    text: "#DC2626",
    border: "#FECACA",
    dot: "#EF4444",
    label: "HIGH",
  },
};

const UI = {
  mr: {
    title: "अॅग्रो लेन्स",
    subtitle: "कृत्रिम बुद्धिमत्ता (AI) पीक तपासणी",
    uploadLabel: "फोटो अपलोड करा",
    uploadHint: "JPG, PNG, WEBP समर्थित",
    cropLabel: "पीक निवडा",
    analyzeBtn: "विश्लेषण करा",
    analyzingBtn: "विश्लेषण होत आहे...",
    changeBtn: "बदला",
    rescanBtn: "पुन्हा स्कॅन करा",
    treatmentLabel: "उपचार",
    preventionLabel: "प्रतिबंध",
    confidenceLabel: "AI निश्चितता",
  },
  en: {
    title: "Agro Lens",
    subtitle: "AI-powered Crop Disease Detection",
    uploadLabel: "Upload Photo",
    uploadHint: "Supports JPG, PNG, WEBP",
    cropLabel: "Select Crop",
    analyzeBtn: "Analyze Crop",
    analyzingBtn: "Analyzing...",
    changeBtn: "Change",
    rescanBtn: "Scan Another Crop",
    treatmentLabel: "Treatment",
    preventionLabel: "Prevention",
    confidenceLabel: "AI Confidence",
  },
  hi: {
    title: "एग्रो लेंस",
    subtitle: "AI आधारित फसल रोग पहचान",
    uploadLabel: "फोटो अपलोड करें",
    uploadHint: "JPG, PNG, WEBP समर्थित",
    cropLabel: "फसल चुनें",
    analyzeBtn: "विश्लेषण करें",
    analyzingBtn: "विश्लेषण हो रहा है...",
    changeBtn: "बदलें",
    rescanBtn: "दूसरी फसल स्कैन करें",
    treatmentLabel: "उपचार",
    preventionLabel: "रोकथाम",
    confidenceLabel: "AI निश्चितता",
  },
};

export const AgroLensModal = ({
  isOpen,
  onClose,
  lang = "mr",
}: AgroLensModalProps) => {
  const s = UI[lang];
  const [dragOver, setDragOver] = useState(false);

  const {
    image,
    fileName,
    selectedCrop,
    setSelectedCrop,
    analyzing,
    result,
    error,
    fileRef,
    handleFile,
    analyze,
    reset,
  } = useAgroLens(lang);

  if (!isOpen) return null;

  const getCropLabel = (val: string) => {
    const opt = CROP_OPTIONS.find((c) => c.value === val);
    if (!opt) return val;
    return lang === "mr"
      ? opt.labelMr
      : lang === "hi"
        ? opt.labelHi
        : opt.label;
  };

  const getDisease = () =>
    lang === "mr"
      ? result?.diseaseMr
      : lang === "hi"
        ? result?.diseaseHi
        : result?.disease;
  const getTreatment = () =>
    lang === "mr"
      ? result?.treatmentMr
      : lang === "hi"
        ? result?.treatmentHi
        : result?.treatment;
  const getPrevention = () =>
    lang === "mr"
      ? result?.preventionMr
      : lang === "hi"
        ? result?.preventionHi
        : result?.prevention;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes agro-modal-in {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes agro-scan-line {
          0%   { top: 0; opacity: 0.9; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes agro-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes agro-result-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes agro-fade-bd {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .agro-modal-scroll::-webkit-scrollbar { width: 4px; }
        .agro-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .agro-modal-scroll::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2,6,23,0.60)",
          zIndex: 9998,
          backdropFilter: "blur(6px)",
          animation: "agro-fade-bd 0.25s ease both",
        }}
      />

      {/* Modal — same sizing as MahaModal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          maxWidth: 480,
          height: "84vh",
          maxHeight: 720,
          minHeight: 540,
          background: "#fff",
          borderRadius: 28,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)",
          animation: "agro-modal-in 0.32s cubic-bezier(0.34,1.4,0.64,1) both",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #14532D 0%, #166534 50%, #15803D 100%)",
            borderRadius: "28px 28px 0 0",
            padding: "18px 20px 16px",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
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
              background: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  backdropFilter: "blur(4px)",
                  border: "1.5px solid rgba(255,255,255,0.22)",
                }}
              >
                🌿
              </div>
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 11,
                    marginTop: 1,
                  }}
                >
                  {s.subtitle}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                color: "#fff",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.28)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.15)";
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className="agro-modal-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "18px 20px 20px" }}
        >
          {/* Upload Zone */}
          {!image ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#22C55E" : "#BBF7D0"}`,
                borderRadius: 16,
                background: dragOver ? "#F0FDF4" : "#F8FFFE",
                padding: "36px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                userSelect: "none",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "#DCFCE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  margin: "0 auto 14px",
                }}
              >
                📷
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#0F172A",
                  marginBottom: 6,
                }}
              >
                {s.uploadLabel}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                {s.uploadHint}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg,#22C55E,#15803D)",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "8px 20px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(34,197,94,0.28)",
                }}
              >
                📂 {s.uploadLabel}
              </div>
            </div>
          ) : (
            <div
              style={{
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                marginBottom: 14,
              }}
            >
              <img
                src={image}
                alt="Crop"
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {analyzing && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: 3,
                      top: 0,
                      background:
                        "linear-gradient(90deg, transparent, #22C55E, transparent)",
                      animation: "agro-scan-line 1.4s ease-in-out infinite",
                      boxShadow: "0 0 12px #22C55E",
                    }}
                  />
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: "3px solid rgba(255,255,255,0.2)",
                      borderTopColor: "#22C55E",
                      borderRadius: "50%",
                      animation: "agro-spin 0.8s linear infinite",
                    }}
                  />
                  <div
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {s.analyzingBtn}
                  </div>
                </div>
              )}
              {!analyzing && (
                <button
                  onClick={reset}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "rgba(0,0,0,0.55)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  ✕ {s.changeBtn}
                </button>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
                  padding: "20px 14px 10px",
                }}
              >
                <div style={{ color: "#fff", fontSize: 11, opacity: 0.85 }}>
                  📁 {fileName}
                </div>
              </div>
            </div>
          )}

          {/* Crop Selector */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 10.5,
                fontWeight: 700,
                color: "#64748B",
                marginBottom: 7,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {s.cropLabel}
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 15,
                  pointerEvents: "none",
                }}
              >
                🌾
              </span>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 12,
                  border: "1.5px solid #22C55E",
                  background: "#F8FFFE",
                  padding: "0 36px 0 42px",
                  fontSize: 13.5,
                  fontFamily: "Poppins, sans-serif",
                  color: "#0F172A",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                  boxSizing: "border-box",
                }}
              >
                {CROP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {lang === "mr"
                      ? opt.labelMr
                      : lang === "hi"
                        ? opt.labelHi
                        : opt.label}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 11,
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              >
                ▼
              </span>
            </div>
          </div>

          {/* Analyze Button */}
          {image && !result && (
            <button
              onClick={analyze}
              disabled={analyzing}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 14,
                border: "none",
                background: analyzing
                  ? "#CBD5E1"
                  : "linear-gradient(135deg,#22C55E,#15803D)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "Poppins, sans-serif",
                cursor: analyzing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: analyzing
                  ? "none"
                  : "0 6px 20px rgba(34,197,94,0.32)",
                transition: "all 0.2s ease",
                marginBottom: 14,
              }}
            >
              {analyzing ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2.5px solid rgba(255,255,255,0.35)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "agro-spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  {s.analyzingBtn}
                </>
              ) : (
                <>🔬 {s.analyzeBtn}</>
              )}
            </button>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "#EF4444",
                marginBottom: 12,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={{ animation: "agro-result-in 0.35s ease both" }}>
              {/* Disease Badge */}
              <div
                style={{
                  background: SEVERITY_STYLE[result.severity].bg,
                  border: `1.5px solid ${SEVERITY_STYLE[result.severity].border}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 28 }}>🦠</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#0F172A",
                      marginBottom: 4,
                    }}
                  >
                    {getDisease()}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: SEVERITY_STYLE[result.severity].bg,
                        border: `1px solid ${SEVERITY_STYLE[result.severity].border}`,
                        borderRadius: 20,
                        padding: "2px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: SEVERITY_STYLE[result.severity].text,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: SEVERITY_STYLE[result.severity].dot,
                          display: "inline-block",
                        }}
                      />
                      {SEVERITY_STYLE[result.severity].label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        fontWeight: 600,
                      }}
                    >
                      {result.confidence}% {s.confidenceLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 6,
                  }}
                >
                  <span>{s.confidenceLabel}</span>
                  <span style={{ color: "#22C55E" }}>{result.confidence}%</span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "#F1F5F9",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${result.confidence}%`,
                      background: "linear-gradient(90deg,#22C55E,#15803D)",
                      borderRadius: 10,
                      transition: "width 0.8s cubic-bezier(0.34,1.2,0.64,1)",
                    }}
                  />
                </div>
              </div>

              {/* Treatment & Prevention */}
              {[
                {
                  icon: "💊",
                  label: s.treatmentLabel,
                  text: getTreatment(),
                  color: "#FFFBEB",
                  border: "#FDE68A",
                },
                {
                  icon: "🛡️",
                  label: s.preventionLabel,
                  text: getPrevention(),
                  color: "#F0FDF4",
                  border: "#BBF7D0",
                },
              ].map(({ icon, label, text, color, border }) => (
                <div
                  key={label}
                  style={{
                    background: color,
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#374151",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {text}
                  </p>
                </div>
              ))}

              {/* Re-scan */}
              <button
                onClick={reset}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  border: "1.5px solid #E2E8F0",
                  background: "#F8FAFC",
                  color: "#64748B",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "Poppins, sans-serif",
                  cursor: "pointer",
                  marginTop: 4,
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
                🔄 {s.rescanBtn}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </>
  );
};

export default AgroLensModal;
