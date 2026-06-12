export type CropOption = {
  value: string;
  label: string;
  labelMr: string;
  labelHi: string;
  plantixSupported?: boolean;
};

// Raw API response types from /agrolens/analyze (unchanged)
export type PlantixImageFeedback = {
  focus: string;
  distance: string;
};

export type PlantixDiagnosis = {
  hosts: string[];
  peat_id: number;
  trigger: string;
  symptoms: string;
  eppo_code: string;
  common_name: string;
  pathogen_class: string;
  symptoms_short: string[];
  scientific_name: string;
  image_references: string[];
  treatment_organic: string;
  treatment_chemical: string;
  preventive_measures: string[];
  diagnosis_likelihood: "likely" | "possible" | "unlikely";
};

export type PlantixResponse = {
  crops: string[];
  errors: string[];
  crop_health: string;
  image_feedback: PlantixImageFeedback;
  plantix_trace_id: string;
  predicted_diagnoses: PlantixDiagnosis[];
};

export type AgroLensApiResponse = {
  id: number;
  userId: string;
  crop: string;
  latitude: number;
  longitude: number;
  imageGallery: boolean;
  uploadedImageUrl: string;
  plantixResponse: PlantixResponse;
  createdAt: string;
  updatedAt: string;
};

// ── NEW: one diagnosis = one tab ────────────────────────────────────────────
export type DiagnosisItem = {
  disease: string;
  diseaseMr: string;
  diseaseHi: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  treatmentOrganic: string;
  treatmentChemical: string;
  prevention: string;
  preventionMr: string;
  preventionHi: string;
  scientificName?: string;
  pathogenClass?: string;
  symptomsShort?: string[];
  symptomsFull?: string;
  isHealthy?: boolean;
};

// Normalized result used by the UI — now a list (1 = healthy, 1+ = diseases)
export type AnalysisResult = {
  diagnoses: DiagnosisItem[];
  uploadedImageUrl?: string;
  cropHealth?: string;
};

export type AgroLang = "mr" | "en" | "hi";
