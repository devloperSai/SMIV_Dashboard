export type CropOption = {
  value: string;
  label: string;
  labelMr: string;
  labelHi: string;
};

export type AnalysisResult = {
  disease: string;
  diseaseMr: string;
  diseaseHi: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  treatment: string;
  treatmentMr: string;
  treatmentHi: string;
  prevention: string;
  preventionMr: string;
  preventionHi: string;
};

export type AgroLang = "mr" | "en" | "hi";
