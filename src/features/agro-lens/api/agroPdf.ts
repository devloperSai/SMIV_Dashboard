// src/features/agro-lens/api/agroPdf.ts
// Pure jsPDF native text — no html2canvas, no rasterisation.
// Layout mirrors the reference AgroLens PDF exactly.
// PDF is always generated in English regardless of the user's selected language.

import jsPDF from "jspdf";
import type { DiagnosisItem, AgroLang } from "../types/agro.types";

// ─── Labels (English only) ────────────────────────────────────────────────────

const PDF_LABELS = {
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
  preventiveMeasures: "Preventive Measures",
  date: "Date",
  id: "ID",
  noImage: "No image provided",
};

// ─── Colour palette (matches reference PDF) ───────────────────────────────────

const C = {
  black: "#1a1a1a",
  headingGreen: "#1a6b35",
  pathGreen: "#1a7a3c",
  treatGreen: "#1a7a3c",
  gray: "#555555",
  lightGray: "#888888",
  divider: "#cccccc",
  headerLine: "#1a1a1a",
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
  lang: AgroLang, // kept for call-site compatibility — ignored internally (PDF is always English)
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
  // PDF is always English — lang param is intentionally unused beyond this point
  const L = PDF_LABELS;
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
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();
  const ML = 45;
  const MR = 45;
  const CW = PW - ML - MR;
  const FOOTER_H = 30;

  let y = 0;

  // ── Pagination guard ────────────────────────────────────────────────────────
  const need = (h: number) => {
    if (y + h > PH - FOOTER_H - 10) {
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
    pdf.setFont("helvetica", style);
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

  // ── Section heading ──────────────────────────────────────────────────────────
  const sectionHead = (text: string) => {
    need(28);
    y += 10;
    setF("bold", 11.5, C.headingGreen);
    pdf.text(text, ML, y);
    y += 16;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════════════════════════
  setF("bold", 26, C.pathGreen);
  pdf.text(L.title, ML, 38);

  setF("normal", 9.5, C.gray);
  pdf.text(L.subtitle, ML, 52);

  setF("normal", 9, C.gray);
  pdf.text(`${L.date}: ${now}`, PW - MR, 34, { align: "right" });
  pdf.text(`${L.id}: #${repId}`, PW - MR, 46, { align: "right" });

  hline(60, ML, ML + CW, C.headerLine, 1.5);

  y = 80;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 1 — Device & Telemetry Records
  // ════════════════════════════════════════════════════════════════════════════
  sectionHead(L.s1);

  const col1x = ML;
  const col2x = ML + CW / 2;
  const rowH = 14;
  const LH = 9;

  setF("normal", LH, C.black);
  pdf.text(`${L.userUUID}: ${userId}`, col1x, y);
  pdf.text(`${L.latitude}: ${lat}`, col2x, y);
  y += rowH;

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
    // Always use English fields
    const disease = d.disease;
    const prevention = d.prevention;

    const likelihoodLabel =
      d.severity === "high"
        ? "very_likely"
        : d.severity === "medium"
          ? "possible"
          : "very_unlikely";

    need(30);
    const blockTop = y - 2;

    setF("bold", 10.5, C.pathGreen);
    pdf.text(`${L.pathology}: ${disease}`, ML + 14, y);

    const lText = `${L.likelihood}: ${likelihoodLabel}`;
    setF("normal", 10, C.pathGreen);
    pdf.text(lText, ML + CW, y, { align: "right" });

    y += 14;

    if (d.scientificName) {
      need(13);
      setF("normal", 8.5, C.gray);
      pdf.text(`${L.scientific}: ${d.scientificName}`, ML + 14, y);
      y += 13;
    }

    y += 4;

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
    if (prevention) {
      need(13);
      setF("bold", 9.5, C.black);
      pdf.text(`${L.preventiveMeasures}:`, ML + 14, y);
      y += 13;

      const items = prevention
        .split(/\n|\r|\d+\.\s+/)
        .map((s: string) => s.trim())
        .filter(Boolean);

      items.forEach((item: string) => {
        need(13);
        setF("normal", 9.5, C.black);
        pdf.text("\u2022", ML + 18, y);
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

    // ── Left accent bar ──────────────────────────────────────────────────────
    const blockBot = y + 2;
    pdf.setFillColor(C.pathGreen);
    pdf.rect(ML, blockTop, 3, blockBot - blockTop, "F");

    if (idx < diags.length - 1) {
      y += 8;
      hline(y, ML, ML + CW, C.divider, 0.4);
      y += 12;
    } else {
      y += 10;
    }
  });

  // ── Save file ───────────────────────────────────────────────────────────────
  pdf.save(`agrolens-${slugify(cropName)}-${slugify(diagnosis.disease)}.pdf`);
};
