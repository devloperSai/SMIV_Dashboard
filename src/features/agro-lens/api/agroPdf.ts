// src/features/agro-lens/api/agroPdf.ts
// Pure jsPDF native text — no html2canvas, no rasterisation.
// Layout mirrors the reference AgroLens PDF exactly.
// Devanagari (Marathi/Hindi) support via runtime-loaded Noto Sans Devanagari font.

import jsPDF from "jspdf";
import type { DiagnosisItem, AgroLang } from "../types/agro.types";

// ─── Labels ──────────────────────────────────────────────────────────────────

const PDF_LABELS = {
  en: {
    title: "AgroLens",
    subtitle: "AI Diagnostic Vision",
    s1: "1. Device & Telemetry Records",
    userUUID: "User UUID",
    selectCrop: "Select Crop",
    latitude: "Latitude",
    longitude: "Longitude",
    s2: "2. Processed Diagnostic Frame Source",
    s3: "3. Core Analytical Findings Matrix",
    globalHealth: "Global Health Vector",
    optimalDistance: "Optimal Distance",
    inFocus: "In Focus",
    s4: "4. Analysis Diagnosis Result",
    pathology: "Pathology",
    likelihood: "Likelihood",
    scientific: "Scientific",
    symptoms: "Symptoms",
    organicTreatment: "Organic Treatment",
    chemicalTreatment: "Chemical Treatment",
    preventiveMeasures: "Preventive Measures likely",
    date: "Date",
    id: "ID",
    noImage: "No image provided",
  },
  mr: {
    title: "AgroLens",
    subtitle: "AI निदान दृष्टी",
    s1: "१. डिव्हाइस व टेलिमेट्री नोंदी",
    userUUID: "युजर UUID",
    selectCrop: "पीक निवडा",
    latitude: "अक्षांश",
    longitude: "रेखांश",
    s2: "२. प्रक्रिया केलेले निदान फ्रेम स्रोत",
    s3: "३. मुख्य विश्लेषणात्मक निष्कर्ष",
    globalHealth: "एकूण आरोग्य स्थिती",
    optimalDistance: "योग्य अंतर",
    inFocus: "फोकस",
    s4: "४. विश्लेषण निदान निकाल",
    pathology: "रोगकारक",
    likelihood: "शक्यता",
    scientific: "शास्त्रीय नाव",
    symptoms: "लक्षणे",
    organicTreatment: "सेंद्रिय उपचार",
    chemicalTreatment: "रासायनिक उपचार",
    preventiveMeasures: "प्रतिबंधक उपाय",
    date: "दिनांक",
    id: "ID",
    noImage: "फोटो उपलब्ध नाही",
  },
  hi: {
    title: "AgroLens",
    subtitle: "AI निदान दृष्टि",
    s1: "1. डिवाइस व टेलीमेट्री रिकॉर्ड्स",
    userUUID: "यूजर UUID",
    selectCrop: "फसल चुनें",
    latitude: "अक्षांश",
    longitude: "देशांतर",
    s2: "2. संसाधित निदान फ्रेम स्रोत",
    s3: "3. मुख्य विश्लेषणात्मक निष्कर्ष",
    globalHealth: "कुल स्वास्थ्य स्थिति",
    optimalDistance: "उपयुक्त दूरी",
    inFocus: "फोकस",
    s4: "4. विश्लेषण निदान परिणाम",
    pathology: "रोगजनक",
    likelihood: "संभावना",
    scientific: "वैज्ञानिक नाम",
    symptoms: "लक्षण",
    organicTreatment: "जैविक उपचार",
    chemicalTreatment: "रासायनिक उपचार",
    preventiveMeasures: "निवारक उपाय",
    date: "दिनांक",
    id: "ID",
    noImage: "फोटो उपलब्ध नहीं",
  },
};

// ─── Colour palette (matches reference PDF) ───────────────────────────────────

const C = {
  black: "#1a1a1a",
  headingGreen: "#1a6b35", // section heading green exactly as in reference
  pathGreen: "#1a7a3c", // "Pathology: Spider Mites" teal-green
  treatGreen: "#1a7a3c", // "Organic Treatment:" label colour
  gray: "#555555",
  lightGray: "#888888",
  divider: "#cccccc",
  headerLine: "#1a1a1a",
};

// ─── Devanagari font support ───────────────────────────────────────────────────
//
// jsPDF's built-in fonts (Helvetica/Times) only cover Latin characters.
// For Marathi/Hindi we embed Noto Sans Devanagari at runtime as a TTF.
// The file is fetched from /public/fonts so it is NOT bundled into the JS
// (only downloaded once, lazily, when mr/hi is selected).
//
// Place the font file at: public/fonts/NotoSansDevanagari-Regular.ttf
// (Google Fonts — Noto Sans Devanagari, OFL licensed)

const DEVANAGARI_FONT_URL = "/fonts/NotoSansDevanagari-Regular.ttf";
const DEVANAGARI_FONT_NAME = "NotoDevanagari";

// Module-level cache so we only fetch/convert the font once per session,
// even if the user downloads multiple PDFs.
let cachedDevanagariBase64: string | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 0x8000; // avoid call-stack issues with String.fromCharCode on large arrays
  let result = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    result += String.fromCharCode(...chunk);
  }
  return btoa(result);
};

/**
 * Fetches (and caches) the Noto Sans Devanagari font, then registers it
 * with the given jsPDF instance under the "NotoDevanagari" family for
 * both "normal" and "bold" styles (same glyphs — jsPDF needs a style
 * entry to allow setFont(..., "bold") without falling back/erroring).
 *
 * Returns true if the font was successfully registered, false otherwise
 * (caller should fall back to helvetica in that case).
 */
const registerDevanagariFont = async (pdf: jsPDF): Promise<boolean> => {
  try {
    if (!cachedDevanagariBase64) {
      const res = await fetch(DEVANAGARI_FONT_URL);
      if (!res.ok) {
        console.error(
          `[AgroLens PDF] Failed to load Devanagari font (HTTP ${res.status}) from ${DEVANAGARI_FONT_URL}`,
        );
        return false;
      }
      const buffer = await res.arrayBuffer();
      cachedDevanagariBase64 = arrayBufferToBase64(buffer);
    }

    const vfsName = "NotoSansDevanagari-Regular.ttf";
    pdf.addFileToVFS(vfsName, cachedDevanagariBase64);
    pdf.addFont(vfsName, DEVANAGARI_FONT_NAME, "normal");
    // Reuse same glyphs for "bold" — visually not bolder, but renders
    // correctly instead of falling back to Helvetica (which would show
    // boxes/missing glyphs for Devanagari text).
    pdf.addFont(vfsName, DEVANAGARI_FONT_NAME, "bold");
    pdf.addFont(vfsName, DEVANAGARI_FONT_NAME, "italic");

    return true;
  } catch (err) {
    console.error("[AgroLens PDF] Error registering Devanagari font:", err);
    return false;
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40) || "report";

const loadImageAsDataUrl = (src: string): Promise<string | null> =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    if (src.startsWith("data:")) return resolve(src);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext("2d")!.drawImage(img, 0, 0);
        resolve(c.toDataURL("image/jpeg", 0.92));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

// ─── Main export ──────────────────────────────────────────────────────────────

export const downloadDiagnosisPdf = async (
  diagnosis: DiagnosisItem,
  cropName: string,
  lang: AgroLang,
  uploadedImage: string | null,
  options?: {
    allDiagnoses?: DiagnosisItem[];
    userId?: string;
    latitude?: string;
    longitude?: string;
    reportId?: string;
    globalHealthVector?: string;
    optimalDistance?: string;
    inFocus?: string;
  },
): Promise<void> => {
  const L = PDF_LABELS[lang] ?? PDF_LABELS.en;
  const diags = options?.allDiagnoses ?? [diagnosis];
  const userId = options?.userId ?? "—";
  const lat = options?.latitude ?? "—";
  const lon = options?.longitude ?? "—";
  const repId = options?.reportId ?? String(Date.now()).slice(-4);
  const ghv =
    options?.globalHealthVector ??
    (diagnosis.isHealthy ? "healthy" : "unhealthy");
  const optDist = options?.optimalDistance ?? "good";
  const focus = options?.inFocus ?? "good";
  const now = new Date().toISOString();

  // ── Page setup ──────────────────────────────────────────────────────────────
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const PW = pdf.internal.pageSize.getWidth(); // 595.28 pt
  const PH = pdf.internal.pageSize.getHeight(); // 841.89 pt
  const ML = 45; // left margin
  const MR = 45; // right margin
  const CW = PW - ML - MR; // 505.28 pt usable width
  const FOOTER_H = 30;

  // ── Devanagari font registration (mr/hi only) ────────────────────────────────
  // If registration fails (e.g. font file missing from /public/fonts), we
  // silently fall back to helvetica — Latin labels/numbers still render fine,
  // only Devanagari glyphs would show as boxes.
  let useDevanagari = false;
  if (lang === "mr" || lang === "hi") {
    useDevanagari = await registerDevanagariFont(pdf);
    if (!useDevanagari) {
      console.warn(
        "[AgroLens PDF] Devanagari font unavailable — falling back to Helvetica. " +
          "Marathi/Hindi text may not render correctly.",
      );
    }
  }

  // Resolve the actual font family/style to use, given the requested style.
  // "bolditalic" isn't registered separately for Devanagari — fall back to bold.
  const resolveFont = (
    style: "normal" | "bold" | "italic",
  ): { family: string; style: "normal" | "bold" | "italic" } => {
    if (useDevanagari) {
      return { family: DEVANAGARI_FONT_NAME, style };
    }
    return { family: "helvetica", style };
  };

  let y = 0; // running cursor

  // ── Pagination guard ────────────────────────────────────────────────────────
  const need = (h: number) => {
    if (y + h > PH - FOOTER_H - 10) {
      addFooter();
      pdf.addPage();
      y = 36;
    }
  };

  // ── Primitive drawing helpers ────────────────────────────────────────────────
  const hline = (
    yy: number,
    x1 = ML,
    x2 = ML + CW,
    color = C.divider,
    lw = 0.5,
  ) => {
    pdf.setDrawColor(color);
    pdf.setLineWidth(lw);
    pdf.line(x1, yy, x2, yy);
  };

  const setF = (
    style: "normal" | "bold" | "italic",
    size: number,
    color: string,
  ) => {
    const { family, style: resolvedStyle } = resolveFont(style);
    pdf.setFont(family, resolvedStyle);
    pdf.setFontSize(size);
    pdf.setTextColor(color);
  };

  // Write wrapped text; returns how many pt were consumed
  const writeWrapped = (
    text: string,
    x: number,
    startY: number,
    maxW: number,
    size: number,
    style: "normal" | "bold" | "italic",
    color: string,
    lineH: number,
  ): number => {
    if (!text?.trim()) return 0;
    setF(style, size, color);
    const lines: string[] = pdf.splitTextToSize(text, maxW);
    let cy = startY;
    lines.forEach((line: string) => {
      need(lineH);
      pdf.text(line, x, cy);
      cy += lineH;
    });
    return lines.length * lineH;
  };

  // ── Section heading (bold green, like reference) ─────────────────────────────
  const sectionHead = (text: string) => {
    need(28);
    y += 10;
    setF("bold", 11.5, C.headingGreen);
    pdf.text(text, ML, y);
    y += 16;
  };

  // ── Footer (drawn on current page) ──────────────────────────────────────────
  const addFooter = () => {
    // no footer text needed — reference PDF has none; just preserve whitespace
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════════════════════════
  // "AgroLens" large bold green
  setF("bold", 26, C.pathGreen);
  pdf.text(L.title, ML, 38);

  // "AI Diagnostic Vision" small grey below
  setF("normal", 9.5, C.gray);
  pdf.text(L.subtitle, ML, 52);

  // Date + ID top-right, right-aligned
  setF("normal", 9, C.gray);
  pdf.text(`${L.date}: ${now}`, PW - MR, 34, { align: "right" });
  pdf.text(`${L.id}: #${repId}`, PW - MR, 46, { align: "right" });

  // Thick dark horizontal rule below header (full content width)
  hline(60, ML, ML + CW, C.headerLine, 1.5);

  y = 80;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 1 — Device & Telemetry Records
  // ════════════════════════════════════════════════════════════════════════════
  sectionHead(L.s1);

  // Two-column grid: left = UUID + Crop, right = Lat + Lon
  // Matches reference layout exactly
  const col1x = ML;
  const col2x = ML + CW / 2;
  const rowH = 14;
  const LH = 9; // font size for kv rows

  // Row 1
  setF("normal", LH, C.black);
  pdf.text(`${L.userUUID}: ${userId}`, col1x, y);
  pdf.text(`${L.latitude}: ${lat}`, col2x, y);
  y += rowH;

  // Row 2
  pdf.text(`${L.selectCrop}: ${cropName}`, col1x, y);
  pdf.text(`${L.longitude}: ${lon}`, col2x, y);
  y += rowH + 6;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 2 — Diagnostic Frame Image
  // ════════════════════════════════════════════════════════════════════════════
  sectionHead(L.s2);

  if (uploadedImage) {
    const imgData = await loadImageAsDataUrl(uploadedImage);
    if (imgData) {
      try {
        const props = pdf.getImageProperties(imgData);
        const maxW = 220;
        const maxH = 200;
        const aspect = props.width / props.height;
        let iw = maxW,
          ih = iw / aspect;
        if (ih > maxH) {
          ih = maxH;
          iw = ih * aspect;
        }
        need(ih + 14);
        const ix = ML + (CW - iw) / 2;
        pdf.addImage(imgData, "JPEG", ix, y, iw, ih);
        y += ih + 14;
      } catch {
        setF("normal", 9, C.lightGray);
        pdf.text(L.noImage, ML + CW / 2, y + 12, { align: "center" });
        y += 26;
      }
    }
  } else {
    // Dashed placeholder matching reference
    need(80);
    pdf.setDrawColor(C.divider);
    pdf.setLineWidth(0.5);
    pdf.rect(ML + (CW - 220) / 2, y, 220, 80, "S");
    setF("normal", 9, C.lightGray);
    pdf.text(L.noImage, ML + CW / 2, y + 44, { align: "center" });
    y += 94;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 3 — Core Analytical Findings Matrix
  // ════════════════════════════════════════════════════════════════════════════
  sectionHead(L.s3);

  setF("normal", 9.5, C.black);
  const kvH = 14;
  pdf.text(`${L.globalHealth}: ${ghv}`, ML, y);
  y += kvH;
  pdf.text(`${L.optimalDistance}: ${optDist}`, ML, y);
  y += kvH;
  pdf.text(`${L.inFocus}: ${focus}`, ML, y);
  y += kvH + 6;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 4 — Analysis Diagnosis Result
  // ════════════════════════════════════════════════════════════════════════════
  sectionHead(L.s4);

  diags.forEach((d, idx) => {
    const disease =
      lang === "mr" ? d.diseaseMr : lang === "hi" ? d.diseaseHi : d.disease;

    const likelihoodLabel =
      d.severity === "high"
        ? "very_likely"
        : d.severity === "medium"
          ? "possible"
          : "very_unlikely";

    // ── Disease block: left border bar ──────────────────────────────────────
    // We don't know height yet; draw bar at end.
    need(30);
    const blockTop = y - 2;

    // ── Header row: "Pathology: Spider Mites"  |  "Likelihood: possible" ────
    // Pathology label in green (left)
    setF("bold", 10.5, C.pathGreen);
    pdf.text(`${L.pathology}: ${disease}`, ML + 14, y);

    // Likelihood plain text in green (right-aligned) — matches reference style
    const lText = `${L.likelihood}: ${likelihoodLabel.replace(/_/g, "_")}`;
    setF("normal", 10, C.pathGreen);
    pdf.text(lText, ML + CW, y, { align: "right" });

    y += 14;

    // ── Scientific name ──────────────────────────────────────────────────────
    if (d.scientificName) {
      need(13);
      setF("normal", 8.5, C.gray);
      pdf.text(`${L.scientific}: ${d.scientificName}`, ML + 14, y);
      y += 13;
    }

    y += 4; // small gap before body content

    // ── Symptoms ────────────────────────────────────────────────────────────
    const sympText = d.symptomsFull ?? (d.symptomsShort ?? []).join(" ");
    if (sympText) {
      need(13);
      setF("bold", 9.5, C.black);
      pdf.text(`${L.symptoms}:`, ML + 14, y);
      y += 13;
      y += writeWrapped(
        sympText,
        ML + 14,
        y,
        CW - 18,
        9.5,
        "normal",
        C.black,
        13,
      );
      y += 8;
    }

    // ── Horizontal divider between symptoms and treatments (like reference) ──
    need(8);
    hline(y, ML + 14, ML + CW, C.divider, 0.4);
    y += 10;

    // ── Organic Treatment ────────────────────────────────────────────────────
    if (d.treatmentOrganic) {
      need(13);
      setF("bold", 9.5, C.treatGreen);
      pdf.text(`${L.organicTreatment}:`, ML + 14, y);
      y += 13;
      y += writeWrapped(
        d.treatmentOrganic,
        ML + 14,
        y,
        CW - 18,
        9.5,
        "normal",
        C.black,
        13,
      );
      y += 8;
    }

    // ── Chemical Treatment ───────────────────────────────────────────────────
    if (d.treatmentChemical) {
      need(13);
      setF("bold", 9.5, C.treatGreen);
      pdf.text(`${L.chemicalTreatment}:`, ML + 14, y);
      y += 13;
      y += writeWrapped(
        d.treatmentChemical,
        ML + 14,
        y,
        CW - 18,
        9.5,
        "normal",
        C.black,
        13,
      );
      y += 8;
    }

    // ── Preventive Measures ──────────────────────────────────────────────────
    const prevention =
      lang === "mr"
        ? d.preventionMr
        : lang === "hi"
          ? d.preventionHi
          : d.prevention;

    if (prevention) {
      need(13);
      setF("bold", 9.5, C.black);
      pdf.text(`${L.preventiveMeasures}:`, ML + 14, y);
      y += 13;

      // Split on newlines or numbered list markers
      const items = prevention
        .split(/\n|\r|\d+\.\s+/)
        .map((s: string) => s.trim())
        .filter(Boolean);

      items.forEach((item: string) => {
        need(13);
        setF("normal", 9.5, C.black);
        // Bullet dot
        pdf.text("\u2022", ML + 18, y);
        // Wrapped item text
        const wrapped: string[] = pdf.splitTextToSize(item, CW - 34);
        wrapped.forEach((line: string, li: number) => {
          need(13);
          setF("normal", 9.5, C.black);
          pdf.text(line, ML + 28, y);
          if (li < wrapped.length - 1) y += 13;
        });
        y += 13;
      });
      y += 4;
    }

    // ── Draw left accent bar (teal, 3 pt wide) — same as reference ───────────
    const blockBot = y + 2;
    pdf.setFillColor(C.pathGreen);
    pdf.rect(ML, blockTop, 3, blockBot - blockTop, "F");

    // ── Divider between disease blocks ───────────────────────────────────────
    if (idx < diags.length - 1) {
      y += 8;
      hline(y, ML, ML + CW, C.divider, 0.4);
      y += 12;
    } else {
      y += 10;
    }
  });

  // ── Save file ───────────────────────────────────────────────────────────────
  const dName =
    lang === "mr"
      ? diagnosis.diseaseMr
      : lang === "hi"
        ? diagnosis.diseaseHi
        : diagnosis.disease;

  pdf.save(`agrolens-${slugify(cropName)}-${slugify(dName)}.pdf`);
};
