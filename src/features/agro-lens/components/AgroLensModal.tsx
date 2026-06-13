import { useRef, useState, useEffect } from "react";
import { useAgroLens } from "../hooks/useAgroLens";
import { CROP_OPTIONS } from "../constants/agroConstants";
import { downloadDiagnosisPdf } from "../api/agroPdf";
import type {
  AgroLang,
  AnalysisResult,
  DiagnosisItem,
} from "../types/agro.types";

interface AgroLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: AgroLang;
  userId?: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const SEVERITY = {
  low: {
    bg: "#F0FDF4",
    text: "#15803D",
    border: "#BBF7D0",
    dot: "#22C55E",
    badgeBg: "#DCFCE7",
    label: "LOW RISK",
  },
  medium: {
    bg: "#FFFBEB",
    text: "#B45309",
    border: "#FDE68A",
    dot: "#F59E0B",
    badgeBg: "#FEF3C7",
    label: "MODERATE",
  },
  high: {
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FECACA",
    dot: "#EF4444",
    badgeBg: "#FEE2E2",
    label: "HIGH RISK",
  },
};

const PATHOGEN_ICON: Record<string, string> = {
  mite: "🕷️",
  fungus: "🍄",
  bacteria: "🦠",
  virus: "🔬",
  insect: "🐛",
  nematode: "〰️",
  deficiency: "🌿",
};

const cardBase: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: "11px 13px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 9.5,
  fontWeight: 800,
  color: "#94A3B8",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: 7,
};

// ─── i18n ─────────────────────────────────────────────────────────────────────

const UI = {
  mr: {
    title: "अॅग्रो लेन्स",
    subtitle: "AI पीक रोग निदान",
    featureDesc:
      "पिकाच्या किंवा पानाच्या स्पष्ट फोटोवरून आमचे AI काही सेकंदात रोग ओळखते, तीव्रता सांगते आणि सेंद्रिय व रासायनिक उपचारांसह प्रतिबंधक उपाय सुचवते.",
    tip1: "पिकाचा / पानाचा स्पष्ट फोटो अपलोड करा",
    tip2: "तुमचे पीक निवडा",
    tip3: "तात्काळ निदान, उपचार व प्रतिबंध मिळवा",
    howItWorks: "हे कसे काम करते",
    uploadLabel: "फोटो अपलोड करा",
    uploadHint: "JPG, PNG, WEBP समर्थित",
    cropLabel: "पीक निवडा",
    analyzeBtn: "विश्लेषण करा",
    analyzingBtn: "विश्लेषण होत आहे...",
    changeBtn: "बदला",
    rescanBtn: "पुन्हा स्कॅन करा",
    confidenceLabel: "AI निश्चितता",
    diagnosisLabel: "निदान",
    healthLabel: "पिकाची स्थिती",
    symptomsLabel: "लक्षणे",
    organicLabel: "सेंद्रिय उपाय",
    chemicalLabel: "रासायनिक उपाय",
    preventionLabel: "प्रतिबंधक उपाय",
    focusLabel: "फोकस",
    distanceLabel: "अंतर",
    readMoreLabel: "अधिक वाचा",
    readLessLabel: "कमी करा",
    healthyLabel: "निरोगी",
    unhealthyLabel: "आजारी",
    poweredBy: "Plantix AI द्वारे",
    multipleIssuesLabel: "संभाव्य समस्या आढळल्या",
    noTreatmentLabel: "माहिती उपलब्ध नाही",
    healthyHeading: "तुमचे पीक निरोगी दिसत आहे!",
    downloadPdf: "रिपोर्ट डाउनलोड करा",
    generatingPdf: "तयार होत आहे...",
  },
  en: {
    title: "Agro Lens",
    subtitle: "AI Crop Disease Diagnosis",
    featureDesc:
      "Snap a clear photo of the affected leaf or plant — our AI identifies the disease, judges severity, and gives you organic & chemical treatment plus prevention tips in seconds.",
    tip1: "Upload a clear photo of your crop or leaf",
    tip2: "Select your crop type",
    tip3: "Get instant diagnosis, treatment & prevention",
    howItWorks: "How it works",
    uploadLabel: "Upload Photo",
    uploadHint: "Supports JPG, PNG, WEBP",
    cropLabel: "Select Crop",
    analyzeBtn: "Analyze Crop",
    analyzingBtn: "Analyzing...",
    changeBtn: "Change",
    rescanBtn: "Scan Another Crop",
    confidenceLabel: "AI Confidence",
    diagnosisLabel: "Diagnosis",
    healthLabel: "Crop Health",
    symptomsLabel: "Symptoms",
    organicLabel: "Organic Treatment",
    chemicalLabel: "Chemical Treatment",
    preventionLabel: "Preventive Measures",
    focusLabel: "Focus",
    distanceLabel: "Distance",
    readMoreLabel: "Read more",
    readLessLabel: "Show less",
    healthyLabel: "Healthy",
    unhealthyLabel: "Unhealthy",
    poweredBy: "Powered by Plantix AI",
    multipleIssuesLabel: "Possible issues detected",
    noTreatmentLabel: "No data available",
    healthyHeading: "Your crop looks healthy!",
    downloadPdf: "Download Report",
    generatingPdf: "Generating...",
  },
  hi: {
    title: "एग्रो लेंस",
    subtitle: "AI फसल रोग निदान",
    featureDesc:
      "प्रभावित पत्ती या पौधे की स्पष्ट फोटो लें — हमारा AI कुछ ही सेकंड में रोग पहचानता है, गंभीरता बताता है और जैविक व रासायनिक उपचार के साथ बचाव के उपाय सुझाता है।",
    tip1: "फसल या पत्ती की स्पष्ट फोटो अपलोड करें",
    tip2: "अपनी फसल चुनें",
    tip3: "तुरंत निदान, उपचार और बचाव पाएं",
    howItWorks: "यह कैसे काम करता है",
    uploadLabel: "फोटो अपलोड करें",
    uploadHint: "JPG, PNG, WEBP समर्थित",
    cropLabel: "फसल चुनें",
    analyzeBtn: "विश्लेषण करें",
    analyzingBtn: "विश्लेषण हो रहा है...",
    changeBtn: "बदलें",
    rescanBtn: "दूसरी फसल स्कैन करें",
    confidenceLabel: "AI निश्चितता",
    diagnosisLabel: "निदान",
    healthLabel: "फसल स्वास्थ्य",
    symptomsLabel: "लक्षण",
    organicLabel: "जैविक उपचार",
    chemicalLabel: "रासायनिक उपचार",
    preventionLabel: "निवारक उपाय",
    focusLabel: "फोकस",
    distanceLabel: "दूरी",
    readMoreLabel: "और पढ़ें",
    readLessLabel: "कमी करें",
    healthyLabel: "स्वस्थ",
    unhealthyLabel: "अस्वस्थ",
    poweredBy: "Plantix AI द्वारा",
    multipleIssuesLabel: "संभावित समस्याएं मिलीं",
    noTreatmentLabel: "जानकारी उपलब्ध नहीं",
    healthyHeading: "आपकी फसल स्वस्थ दिख रही है!",
    downloadPdf: "रिपोर्ट डाउनलोड करें",
    generatingPdf: "तैयार हो रहा है...",
  },
};

// ─── Searchable Crop Picker ───────────────────────────────────────────────────

interface CropPickerProps {
  lang: AgroLang;
  selectedCrop: string;
  onSelect: (value: string) => void;
  label: string;
}

const CropPicker = ({
  lang,
  selectedCrop,
  onSelect,
  label,
}: CropPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const getLabel = (opt: (typeof CROP_OPTIONS)[0]) =>
    lang === "mr" ? opt.labelMr : lang === "hi" ? opt.labelHi : opt.label;

  const selected = CROP_OPTIONS.find((o) => o.value === selectedCrop);
  const selectedLabel = selected ? getLabel(selected) : "";

  const filtered =
    query.trim() === ""
      ? CROP_OPTIONS
      : CROP_OPTIONS.filter((o) => {
          const q = query.toLowerCase();
          return (
            o.label.toLowerCase().includes(q) ||
            o.labelMr.includes(query) ||
            o.labelHi.includes(query) ||
            o.value.replace(/_/g, " ").includes(q)
          );
        });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const el = listRef.current?.querySelector("[data-selected='true']");
        el?.scrollIntoView({ block: "nearest" });
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
    setQuery("");
  };

  const placeholder =
    lang === "mr"
      ? "पीक शोधा..."
      : lang === "hi"
        ? "फसल खोजें..."
        : "Search crops...";

  return (
    <div ref={wrapperRef} style={{ marginBottom: 12, position: "relative" }}>
      <label
        style={{
          display: "block",
          fontSize: 10.5,
          fontWeight: 700,
          color: "#64748B",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </label>

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 12,
          border: "1.5px solid #22C55E",
          background: "#F8FFFE",
          padding: "0 36px 0 42px",
          fontSize: 13.5,
          fontFamily: "Poppins, sans-serif",
          color: "#0F172A",
          cursor: "pointer",
          outline: "none",
          boxSizing: "border-box",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: open ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
          transition: "box-shadow 0.2s",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 14,
            fontSize: 15,
            pointerEvents: "none",
          }}
        >
          🌾
        </span>
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedLabel}
        </span>
        <span
          style={{
            position: "absolute",
            right: 14,
            fontSize: 11,
            color: "#94A3B8",
            pointerEvents: "none",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: 14,
            border: "1.5px solid #BBF7D0",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
            zIndex: 10000,
            overflow: "hidden",
            animation:
              "agro-dropdown-in 0.18s cubic-bezier(0.34,1.3,0.64,1) both",
          }}
        >
          <div
            style={{
              padding: "10px 12px 8px",
              borderBottom: "1px solid #F1F5F9",
              position: "sticky",
              top: 0,
              background: "#fff",
              zIndex: 1,
            }}
          >
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  pointerEvents: "none",
                  opacity: 0.5,
                }}
              >
                🔍
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  height: 36,
                  borderRadius: 9,
                  border: "1.5px solid #E2E8F0",
                  background: "#F8FAFC",
                  padding: "0 12px 0 34px",
                  fontSize: 13,
                  fontFamily: "Poppins, sans-serif",
                  color: "#0F172A",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1.5px solid #22C55E";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1.5px solid #E2E8F0";
                  e.currentTarget.style.background = "#F8FAFC";
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#94A3B8",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#94A3B8",
                marginTop: 5,
                paddingLeft: 2,
              }}
            >
              {filtered.length}{" "}
              {lang === "mr" ? "पिके" : lang === "hi" ? "फसलें" : "crops"}
              {query && ` · "${query}"`}
            </div>
          </div>
          <div
            ref={listRef}
            style={{ maxHeight: 200, overflowY: "auto", padding: "4px 0" }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontSize: 12.5,
                  color: "#94A3B8",
                }}
              >
                {lang === "mr"
                  ? "पीक सापडले नाही"
                  : lang === "hi"
                    ? "फसल नहीं मिली"
                    : "No crops found"}
              </div>
            ) : (
              filtered.map((opt) => {
                const isActive = opt.value === selectedCrop;
                const primary = getLabel(opt);
                const secondary = lang !== "en" ? opt.label : "";
                return (
                  <button
                    key={opt.value}
                    data-selected={isActive}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      border: "none",
                      background: isActive ? "#F0FDF4" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontFamily: "Poppins, sans-serif",
                      textAlign: "left",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#15803D" : "#0F172A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {primary}
                      </div>
                      {secondary && (
                        <div
                          style={{
                            fontSize: 10.5,
                            color: "#94A3B8",
                            marginTop: 1,
                          }}
                        >
                          {secondary}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <span
                        style={{
                          fontSize: 14,
                          color: "#22C55E",
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Health pill ──────────────────────────────────────────────────────────────

const HealthPill = ({
  isHealthy,
  severity,
  label,
}: {
  isHealthy: boolean;
  severity: "low" | "medium" | "high";
  label: string;
}) => (
  <div
    style={{
      background: isHealthy
        ? "#DCFCE7"
        : severity === "high"
          ? "#FEE2E2"
          : "#FEF3C7",
      border: `1px solid ${isHealthy ? "#BBF7D0" : severity === "high" ? "#FECACA" : "#FDE68A"}`,
      borderRadius: 20,
      padding: "4px 11px",
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexShrink: 0,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: isHealthy
          ? "#22C55E"
          : severity === "high"
            ? "#EF4444"
            : "#F59E0B",
        display: "inline-block",
      }}
    />
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 800,
        color: isHealthy
          ? "#15803D"
          : severity === "high"
            ? "#B91C1C"
            : "#B45309",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  </div>
);

// ─── Result Panel ─────────────────────────────────────────────────────────────

interface ResultPanelProps {
  result: AnalysisResult;
  lang: AgroLang;
  cropName: string;
  uploadedImage: string | null;
  onRescan: () => void;
  userId?: string;
  latitude?: string;
  longitude?: string;
  reportId?: string;
}

const ResultPanel = ({
  result,
  lang,
  cropName,
  uploadedImage,
  onRescan,
  userId,
  latitude,
  longitude,
  reportId,
}: ResultPanelProps) => {
  const s = UI[lang];
  const [activeIdx, setActiveIdx] = useState(0);
  const [symptomsExpanded, setSymptomsExpanded] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [rightTab, setRightTab] = useState<"info" | "prevention">("info");

  const diagnoses = result.diagnoses;
  const active: DiagnosisItem = diagnoses[activeIdx] ?? diagnoses[0];
  const sev = SEVERITY[active.severity];
  const isHealthy = !!active.isHealthy;

  const disease =
    lang === "mr"
      ? active.diseaseMr
      : lang === "hi"
        ? active.diseaseHi
        : active.disease;
  const prevention =
    lang === "mr"
      ? active.preventionMr
      : lang === "hi"
        ? active.preventionHi
        : active.prevention;

  const pathogenIcon = active.pathogenClass
    ? (PATHOGEN_ICON[active.pathogenClass.toLowerCase()] ?? "🔬")
    : "🔬";

  const preventionItems = active.prevention
    ? prevention.split(/\d+\.\s+/).filter(Boolean)
    : [];

  const switchTab = (i: number) => {
    setActiveIdx(i);
    setSymptomsExpanded(false);
    setRightTab("info");
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      await downloadDiagnosisPdf(active, cropName, lang, uploadedImage, {
        allDiagnoses: diagnoses,
        userId,
        latitude,
        longitude,
        reportId,
        globalHealthVector:
          result.cropHealth ?? (active.isHealthy ? "healthy" : "unhealthy"),
        optimalDistance: (result as any).optimalDistance ?? "good",
        inFocus: (result as any).inFocus ?? "good",
      });
    } catch (err) {
      console.error("[AgroLens] PDF generation failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        animation: "agro-result-in 0.32s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* ── Top bar: thumbnail + crop name + download + health pill ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: diagnoses.length > 1 ? 8 : 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          {uploadedImage && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                overflow: "hidden",
                flexShrink: 0,
                border: "1.5px solid #E2E8F0",
              }}
            >
              <img
                src={uploadedImage}
                alt="crop"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {s.healthLabel}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0F172A",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {cropName}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {lang === "en" && (
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: downloadingPdf ? "#F1F5F9" : "#fff",
                border: "1.5px solid #E2E8F0",
                borderRadius: 20,
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 700,
                color: downloadingPdf ? "#94A3B8" : "#15803D",
                fontFamily: "Poppins, sans-serif",
                cursor: downloadingPdf ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!downloadingPdf) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#BBF7D0";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#F0FDF4";
                }
              }}
              onMouseLeave={(e) => {
                if (!downloadingPdf) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#E2E8F0";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#fff";
                }
              }}
            >
              {downloadingPdf ? (
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(21,128,61,0.25)",
                    borderTopColor: "#15803D",
                    borderRadius: "50%",
                    animation: "agro-spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
              ) : (
                <span style={{ fontSize: 12 }}>📄</span>
              )}
              {downloadingPdf ? s.generatingPdf : s.downloadPdf}
            </button>
          )}

          <HealthPill
            isHealthy={isHealthy}
            severity={active.severity}
            label={isHealthy ? s.healthyLabel.toUpperCase() : sev.label}
          />
        </div>
      </div>

      {/* ── Diagnosis tabs (only if multiple) ── */}
      {diagnoses.length > 1 && (
        <>
          <div style={{ ...sectionLabel, marginBottom: 6 }}>
            {s.multipleIssuesLabel}
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              marginBottom: 12,
              paddingBottom: 2,
              flexShrink: 0,
            }}
          >
            {diagnoses.map((d, i) => {
              const dSev = SEVERITY[d.severity];
              const label =
                lang === "mr"
                  ? d.diseaseMr
                  : lang === "hi"
                    ? d.diseaseHi
                    : d.disease;
              const isActive = i === activeIdx;
              return (
                <button
                  key={i}
                  onClick={() => switchTab(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    borderRadius: 20,
                    border: `1.5px solid ${isActive ? dSev.dot : "#E2E8F0"}`,
                    background: isActive ? dSev.bg : "#fff",
                    color: isActive ? dSev.text : "#64748B",
                    fontSize: 11.5,
                    fontWeight: isActive ? 700 : 600,
                    fontFamily: "Poppins, sans-serif",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: dSev.dot,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Main content ── */}
      {isHealthy ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 10,
            ...cardBase,
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
          }}
        >
          <div style={{ fontSize: 42 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#15803D" }}>
            {s.healthyHeading}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "#475569",
              maxWidth: 360,
              lineHeight: 1.65,
            }}
          >
            {prevention}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
              padding: "5px 8px",
              fontSize: 10,
              fontWeight: 800,
              color: sev.text,
              background: "#fff",
              border: `1px solid ${sev.border}`,
              borderRadius: 10,
            }}
          >
            {s.confidenceLabel}: {active.confidence}%
          </div>
        </div>
      ) : (
        <div
          className="agro-cols"
          style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}
        >
          {/* ── Left column ── */}
          <div
            className="agro-col-left"
            style={{
              width: "36%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflowY: "auto",
            }}
          >
            {uploadedImage && (
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #E2E8F0",
                  flexShrink: 0,
                }}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded crop"
                  style={{
                    width: "100%",
                    height: 130,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            )}

            {/* Confidence */}
            <div style={cardBase}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ ...sectionLabel, marginBottom: 0 }}>
                  {s.confidenceLabel}
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 800, color: sev.text }}
                >
                  {active.confidence}%
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  background: "#E2E8F0",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${active.confidence}%`,
                    borderRadius: 10,
                    background:
                      active.severity === "high"
                        ? "linear-gradient(90deg,#EF4444,#B91C1C)"
                        : active.severity === "medium"
                          ? "linear-gradient(90deg,#F59E0B,#B45309)"
                          : "linear-gradient(90deg,#22C55E,#15803D)",
                    transition: "width 0.8s cubic-bezier(0.34,1.2,0.64,1)",
                  }}
                />
              </div>
            </div>

            {/* Pathogen + photo quality */}
            <div style={cardBase}>
              <div style={sectionLabel}>{s.diagnosisLabel}</div>
              {active.pathogenClass && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "#F1F5F9",
                    borderRadius: 8,
                    padding: "3px 10px",
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: 8,
                  }}
                >
                  <span>{pathogenIcon}</span>
                  <span style={{ textTransform: "capitalize" }}>
                    {active.pathogenClass}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: 20,
                    padding: "3px 9px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#15803D",
                  }}
                >
                  📷 {s.focusLabel}:{" "}
                  {lang === "mr" ? "चांगले" : lang === "hi" ? "अच्छा" : "Good"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: 20,
                    padding: "3px 9px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#15803D",
                  }}
                >
                  📐 {s.distanceLabel}:{" "}
                  {lang === "mr" ? "चांगले" : lang === "hi" ? "अच्छा" : "Good"}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 9.5,
                color: "#CBD5E1",
                fontWeight: 600,
                textAlign: "center",
                marginTop: "auto",
                paddingTop: 4,
              }}
            >
              {s.poweredBy}
            </div>
          </div>

          {/* ── Right column ── */}
          <div
            className="agro-col-right"
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {/* ── Right column tab switcher ── */}
            {preventionItems.length > 0 && (
              <div
                style={{
                  display: "flex",
                  borderBottom: "1.5px solid #E2E8F0",
                  marginBottom: 12,
                  flexShrink: 0,
                  gap: 0,
                }}
              >
                {(
                  [
                    {
                      key: "info",
                      label:
                        lang === "mr"
                          ? "माहिती"
                          : lang === "hi"
                            ? "जानकारी"
                            : "Info",
                    },
                    {
                      key: "prevention",
                      label:
                        lang === "mr"
                          ? "प्रतिबंध"
                          : lang === "hi"
                            ? "बचाव"
                            : "Prevention",
                    },
                  ] as const
                ).map((tab) => {
                  const isActive = rightTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setRightTab(tab.key)}
                      style={{
                        padding: "6px 14px 8px",
                        background: "none",
                        border: "none",
                        outline: "none",
                        borderBottom: isActive
                          ? "2px solid #15803D"
                          : "2px solid transparent",
                        marginBottom: "-1.5px",
                        color: isActive ? "#15803D" : "#94A3B8",
                        fontSize: 11.5,
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: "Poppins, sans-serif",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        flexShrink: 0,
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Tab content ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {rightTab === "info" ? (
                <>
                  {/* Disease name */}
                  <div style={cardBase}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={sectionLabel}>{s.diagnosisLabel}</div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#0F172A",
                            lineHeight: 1.3,
                          }}
                        >
                          {disease}
                        </div>
                        {active.scientificName && (
                          <div
                            style={{
                              fontSize: 11,
                              fontStyle: "italic",
                              color: "#94A3B8",
                              marginTop: 2,
                            }}
                          >
                            {active.scientificName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {(active.symptomsShort?.length || active.symptomsFull) && (
                    <div style={cardBase}>
                      <div style={sectionLabel}>{s.symptomsLabel}</div>
                      {active.symptomsShort &&
                        active.symptomsShort.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              marginBottom: symptomsExpanded ? 8 : 0,
                            }}
                          >
                            {active.symptomsShort.map((sym, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: "#F59E0B",
                                    marginTop: 6,
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: "#374151",
                                    lineHeight: 1.55,
                                  }}
                                >
                                  {sym}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      {symptomsExpanded && active.symptomsFull && (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#64748B",
                            lineHeight: 1.7,
                            marginTop: 6,
                            padding: "9px 11px",
                            background: "#F8FAFC",
                            borderRadius: 8,
                            borderLeft: "3px solid #E2E8F0",
                            animation: "agro-result-in 0.2s ease both",
                          }}
                        >
                          {active.symptomsFull}
                        </div>
                      )}
                      {active.symptomsFull && (
                        <button
                          onClick={() => setSymptomsExpanded((p) => !p)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "6px 0 0",
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "#22C55E",
                            cursor: "pointer",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {symptomsExpanded
                            ? `↑ ${s.readLessLabel}`
                            : `↓ ${s.readMoreLabel}`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Treatment */}
                  <div>
                    <div style={sectionLabel}>
                      {lang === "mr"
                        ? "उपचार"
                        : lang === "hi"
                          ? "उपचार"
                          : "Treatment"}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          ...cardBase,
                          background: "#FAFFF7",
                          border: "1px solid #D1FAE5",
                          borderTop: "3px solid #22C55E",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 13 }}>🌿</span>
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: "#15803D",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {s.organicLabel}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11.5,
                            color: "#374151",
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {active.treatmentOrganic || s.noTreatmentLabel}
                        </p>
                      </div>
                      <div
                        style={{
                          ...cardBase,
                          background: "#F8FAFF",
                          border: "1px solid #DBEAFE",
                          borderTop: "3px solid #3B82F6",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 13 }}>⚗️</span>
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: "#1D4ED8",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {s.chemicalLabel}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11.5,
                            color: "#374151",
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {active.treatmentChemical || s.noTreatmentLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ── Prevention tab ── */
                <div style={{ padding: "0" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {preventionItems.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#374151",
                            flexShrink: 0,
                            minWidth: 20,
                          }}
                        >
                          {i + 1}.
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#374151",
                            lineHeight: 1.65,
                          }}
                        >
                          {item.trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Rescan button ── */}
      <button
        onClick={onRescan}
        style={{
          width: "100%",
          height: 42,
          borderRadius: 12,
          border: "1.5px solid #E2E8F0",
          background: "#F8FAFC",
          color: "#64748B",
          fontSize: 12.5,
          fontWeight: 600,
          fontFamily: "Poppins, sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          transition: "all 0.15s",
          marginTop: 12,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#F0FDF4";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#BBF7D0";
          (e.currentTarget as HTMLButtonElement).style.color = "#15803D";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0";
          (e.currentTarget as HTMLButtonElement).style.color = "#64748B";
        }}
      >
        <span style={{ fontSize: 14 }}>↺</span> {s.rescanBtn}
      </button>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

export const AgroLensModal = ({
  isOpen,
  onClose,
  lang = "mr",
  userId = "",
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
  } = useAgroLens(lang, userId);

  if (!isOpen) return null;

  const cropOption = CROP_OPTIONS.find((o) => o.value === selectedCrop);
  const cropDisplayName = cropOption
    ? lang === "mr"
      ? cropOption.labelMr
      : lang === "hi"
        ? cropOption.labelHi
        : cropOption.label
    : selectedCrop;

  const TIPS = [
    { icon: "📷", text: s.tip1 },
    { icon: "🌾", text: s.tip2 },
    { icon: "🔬", text: s.tip3 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes agro-dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes agro-modal-in {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
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
        .agro-modal-scroll::-webkit-scrollbar,
        .agro-col-left::-webkit-scrollbar,
        .agro-col-right::-webkit-scrollbar { width: 4px; }
        .agro-modal-scroll::-webkit-scrollbar-track,
        .agro-col-left::-webkit-scrollbar-track,
        .agro-col-right::-webkit-scrollbar-track { background: transparent; }
        .agro-modal-scroll::-webkit-scrollbar-thumb,
        .agro-col-left::-webkit-scrollbar-thumb,
        .agro-col-right::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
        .agro-modal-shell button:focus { outline: none; }
        .agro-modal-shell button:focus-visible { outline: none; }

        @media (max-width: 720px) {
          .agro-modal-shell {
            width: 96vw !important;
            height: 92vh !important;
            max-width: none !important;
            max-height: none !important;
          }
          .agro-cols { flex-direction: column !important; }
          .agro-col-left, .agro-col-right { width: 100% !important; }
          .agro-col-right { overflow-y: visible !important; }
        }
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

      {/* Modal shell */}
      <div
        className="agro-modal-shell"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "92vw",
          maxWidth: 900,
          height: "82vh",
          maxHeight: 620,
          minHeight: 480,
          background: "#F8FAFC",
          borderRadius: 26,
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
        {/* ── Header ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #14532D 0%, #166534 50%, #15803D 100%)",
            borderRadius: "26px 26px 0 0",
            padding: result ? "14px 20px" : "18px 22px 16px",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
            transition: "padding 0.2s ease",
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
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                  backdropFilter: "blur(4px)",
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  flexShrink: 0,
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
                    color: "rgba(255,255,255,0.60)",
                    fontSize: 11,
                    marginTop: 1,
                  }}
                >
                  {s.subtitle}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {result && (
                <button
                  onClick={reset}
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    borderRadius: 20,
                    padding: "4px 11px",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 10.5,
                    fontWeight: 600,
                    fontFamily: "Poppins, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  ← {lang === "mr" ? "मागे" : lang === "hi" ? "वापस" : "Back"}
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
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

          {/* Feature description — only in input mode */}
          {!result && (
            <div
              style={{
                marginTop: 12,
                fontSize: 11.5,
                color: "rgba(255,255,255,0.80)",
                lineHeight: 1.65,
                maxWidth: 640,
              }}
            >
              {s.featureDesc}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div
          className="agro-modal-scroll"
          style={{
            flex: 1,
            overflowY: result ? "hidden" : "auto",
            padding: "16px 20px 18px",
            display: "flex",
          }}
        >
          {result ? (
            <ResultPanel
              result={result}
              lang={lang}
              cropName={cropDisplayName}
              uploadedImage={image}
              onRescan={reset}
              userId={userId}
            />
          ) : (
            <div
              className="agro-cols"
              style={{ display: "flex", gap: 18, width: "100%" }}
            >
              {/* ── Left: upload zone / preview ── */}
              <div
                className="agro-col-left"
                style={{ width: "44%", flexShrink: 0, display: "flex" }}
              >
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
                      flex: 1,
                      border: `2px dashed ${dragOver ? "#22C55E" : "#BBF7D0"}`,
                      borderRadius: 16,
                      background: dragOver ? "#F0FDF4" : "#fff",
                      padding: "24px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      userSelect: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: "#DCFCE7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        margin: "0 auto 12px",
                      }}
                    >
                      📷
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13.5,
                        color: "#0F172A",
                        marginBottom: 5,
                      }}
                    >
                      {s.uploadLabel}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#94A3B8",
                        marginBottom: 14,
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
                        padding: "7px 18px",
                        fontSize: 12,
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
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
                      flex: 1,
                      minHeight: 220,
                    }}
                  >
                    <img
                      src={image}
                      alt="Crop"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        position: "absolute",
                        inset: 0,
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
                            animation:
                              "agro-scan-line 1.4s ease-in-out infinite",
                            boxShadow: "0 0 12px #22C55E",
                          }}
                        />
                        <div
                          style={{
                            width: 30,
                            height: 30,
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
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.55))",
                        padding: "18px 14px 9px",
                      }}
                    >
                      <div
                        style={{ color: "#fff", fontSize: 10.5, opacity: 0.85 }}
                      >
                        📁 {fileName}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: crop picker, analyze, tips ── */}
              <div
                className="agro-col-right"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CropPicker
                  lang={lang}
                  selectedCrop={selectedCrop}
                  onSelect={setSelectedCrop}
                  label={s.cropLabel}
                />

                {image && (
                  <button
                    onClick={analyze}
                    disabled={analyzing}
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 14,
                      border: "none",
                      background: analyzing
                        ? "#CBD5E1"
                        : "linear-gradient(135deg,#22C55E,#15803D)",
                      color: "#fff",
                      fontSize: 13.5,
                      fontWeight: 700,
                      fontFamily: "Poppins, sans-serif",
                      cursor: analyzing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: analyzing
                        ? "none"
                        : "0 6px 20px rgba(34,197,94,0.30)",
                      transition: "all 0.2s ease",
                      marginBottom: 12,
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

                {error && (
                  <div
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#EF4444",
                      marginBottom: 10,
                    }}
                  >
                    ⚠️ {error}
                  </div>
                )}

                {/* "How it works" tips card */}
                <div
                  style={{
                    ...cardBase,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 12,
                    background: "#FAFFF7",
                    border: "1px solid #D1FAE5",
                  }}
                >
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      color: "#15803D",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {s.howItWorks}
                  </div>
                  {TIPS.map((tip, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 9,
                          background: "#fff",
                          border: "1px solid #BBF7D0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {tip.icon}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#374151",
                          lineHeight: 1.5,
                        }}
                      >
                        {tip.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
