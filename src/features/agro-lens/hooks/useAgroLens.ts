import { useState, useRef, useCallback } from "react";
import type { AnalysisResult, AgroLang } from "../types/agro.types";
import { analyzeCropImage } from "../api/agroApi";

// ---------------------------------------------------------------------------
// Geolocation helper — resolves with coords or (0, 0) if unavailable
// ---------------------------------------------------------------------------
const getLocation = (): Promise<{ lat: number; lon: number }> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 0, lon: 0 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      () => resolve({ lat: 0, lon: 0 }),
      { timeout: 5000 },
    );
  });

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useAgroLens = (lang: AgroLang = "mr") => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("karle");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setError("");
  }, []);

  const analyze = useCallback(async () => {
    if (!imageFile) return;

    setAnalyzing(true);
    setError("");

    try {
      // Attempt to get the user's current location for the API payload.
      // This is non-blocking — analysis proceeds even if location is denied.
      const { lat, lon } = await getLocation();

      const res = await analyzeCropImage(
        imageFile,
        selectedCrop,
        lang,
        /* userId */ "",
        lat,
        lon,
      );

      setResult(res);
    } catch (err) {
      console.error("[AgroLens] analyze error:", err);
      setError(
        lang === "mr"
          ? "विश्लेषण अयशस्वी. कृपया पुन्हा प्रयत्न करा."
          : lang === "hi"
            ? "विश्लेषण विफल। कृपया पुनः प्रयास करें।"
            : "Analysis failed. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  }, [imageFile, selectedCrop, lang]);

  const reset = useCallback(() => {
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
