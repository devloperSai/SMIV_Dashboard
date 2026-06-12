// src/features/agro-lens/hooks/useAgroLens.ts
import { useState, useRef, useCallback } from "react";
import type { AnalysisResult, AgroLang } from "../types/agro.types";
import { analyzeCropImage } from "../api/agroApi";
import { CROP_OPTIONS } from "../constants/agroConstants";

const getLocation = (): Promise<{ lat: number; lon: number }> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: 0, lon: 0 });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      () => resolve({ lat: 0, lon: 0 }),
      { timeout: 5000 },
    );
  });

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/tiff",
]);

export const useAgroLens = (lang: AgroLang = "mr", userId: string = "") => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>(
    CROP_OPTIONS[0].value,
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      console.log(
        `[AgroLens] File selected: "${file.name}" | type: ${file.type || "unknown"} | size: ${(file.size / 1024).toFixed(1)} KB`,
      );

      if (!file.type.startsWith("image/")) {
        console.warn(
          `[AgroLens] Rejected non-image file: "${file.name}" (${file.type})`,
        );
        setError(
          lang === "mr"
            ? "फक्त प्रतिमा फाइल्स (JPG, PNG, WEBP) स्वीकारल्या जातात."
            : lang === "hi"
              ? "केवल छवि फ़ाइलें (JPG, PNG, WEBP) स्वीकार की जाती हैं।"
              : "Only image files (JPG, PNG, WEBP) are accepted.",
        );
        return;
      }

      if (file.type && !ACCEPTED_MIME.has(file.type.toLowerCase())) {
        console.warn(
          `[AgroLens] Unusual MIME type "${file.type}" — agroApi will re-encode to JPEG`,
        );
      }

      setFileName(file.name);
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
      setResult(null);
      setError("");
    },
    [lang],
  );

  const analyze = useCallback(async () => {
    if (!imageFile) return;

    const cropMeta = CROP_OPTIONS.find((c) => c.value === selectedCrop);

    setAnalyzing(true);
    setError("");

    try {
      const { lat, lon } = await getLocation();
      console.log(`[AgroLens] Location: lat=${lat}, lon=${lon}`);

      const res = await analyzeCropImage(
        imageFile,
        selectedCrop,
        lang,
        userId,
        lat,
        lon,
      );
      setResult(res);
    } catch (err) {
      console.error("[AgroLens] analyze() caught error:", err);
      const msg = err instanceof Error ? err.message : "";

      // ── File format error ─────────────────────────────────────────────────
      if (msg === "file_type_error") {
        console.warn("[AgroLens] Showing file_type_error to user");
        setError(
          lang === "mr"
            ? "अयोग्य फोटो स्वरूप. कृपया JPG, PNG किंवा WEBP फोटो वापरा."
            : lang === "hi"
              ? "अमान्य फ़ोटो प्रारूप। कृपया JPG, PNG या WEBP फ़ोटो उपयोग करें।"
              : "Invalid photo format. Please use a JPG, PNG, or WEBP image.",
        );
        return;
      }

      // ── Crop not supported (Plantix returned 400 for this crop) ───────────
      if (msg.startsWith("crop_not_supported:")) {
        const crop = msg.split(":")[1] || selectedCrop;

        const cropLabel =
          lang === "mr"
            ? (cropMeta?.labelMr ?? crop)
            : lang === "hi"
              ? (cropMeta?.labelHi ?? crop)
              : (cropMeta?.label ?? crop);

        console.warn(
          `[AgroLens] ❌ Plantix rejected crop "${crop}" (HTTP 400) — showing error to user`,
        );

        setError(
          lang === "mr"
            ? `"${cropLabel}" पीक सध्या AI विश्लेषणासाठी उपलब्ध नाही. कृपया दुसरे पीक निवडा.`
            : lang === "hi"
              ? `"${cropLabel}" फसल अभी AI विश्लेषण के लिए उपलब्ध नहीं है। कृपया दूसरी फसल चुनें।`
              : `"${cropLabel}" is not yet available for AI analysis. Please select another crop.`,
        );
        return;
      }

      // ── Generic / network / server error ──────────────────────────────────
      console.error("[AgroLens] Generic error shown to user:", msg);
      setError(
        lang === "mr"
          ? "विश्लेषण अयशस्वी. कृपया स्पष्ट फोटो घ्या किंवा दुसरे पीक निवडा."
          : lang === "hi"
            ? "विश्लेषण विफल। कृपया स्पष्ट फोटो लें या दूसरी फसल चुनें।"
            : "Analysis failed. Please try with a clearer photo or different crop.",
      );
    } finally {
      setAnalyzing(false);
    }
  }, [imageFile, selectedCrop, lang, userId]);

  const reset = useCallback(() => {
    console.log("[AgroLens] Reset — clearing image, result and error state");
    setImage(null);
    setFileName("");
    setImageFile(null);
    setResult(null);
    setError("");
  }, []);

  return {
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
  };
};
