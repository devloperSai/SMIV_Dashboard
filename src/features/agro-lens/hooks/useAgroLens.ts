import { useState, useRef, useCallback } from "react";
import type { AnalysisResult, AgroLang } from "../types/agro.types";
import { analyzeCropImage } from "../api/agroApi";

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
      const res = await analyzeCropImage(imageFile, selectedCrop, lang);
      setResult(res);
    } catch (err) {
      setError(
        lang === "mr"
          ? "विश्लेषण अयशस्वी. पुन्हा प्रयत्न करा."
          : lang === "hi"
            ? "विश्लेषण विफल। पुनः प्रयास करें।"
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
