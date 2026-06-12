import { AGRO_API_BASE, AGRO_API_KEY } from "../constants/agroConstants";
import type {
  AnalysisResult,
  AgroLensApiResponse,
  PlantixDiagnosis,
  DiagnosisItem,
} from "../types/agro.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const likelihoodToSeverity = (
  likelihood: string,
): "low" | "medium" | "high" => {
  switch (likelihood) {
    case "likely":
      return "high";
    case "possible":
      return "medium";
    default:
      return "low";
  }
};

const likelihoodToConfidence = (likelihood: string): number => {
  switch (likelihood) {
    case "likely":
      return 88;
    case "possible":
      return 60;
    default:
      return 35;
  }
};

const joinMeasures = (measures: string[]): string =>
  measures.map((m, i) => `${i + 1}. ${m}`).join(" ");

const HEALTHY_TEXT = {
  disease: {
    en: "Crop appears healthy",
    mr: "पिकाची स्थिती चांगली आहे",
    hi: "फसल स्वस्थ है",
  },
  prevention: {
    en: "Continue regular monitoring of your crop.",
    mr: "आपल्या पिकाचे नियमित निरीक्षण सुरू ठेवा.",
    hi: "अपनी फसल की नियमित निगरानी जारी रखें।",
  },
};

const buildHealthyDiagnosis = (): DiagnosisItem => ({
  disease: HEALTHY_TEXT.disease.en,
  diseaseMr: HEALTHY_TEXT.disease.mr,
  diseaseHi: HEALTHY_TEXT.disease.hi,
  confidence: 95,
  severity: "low",
  treatmentOrganic: "",
  treatmentChemical: "",
  prevention: HEALTHY_TEXT.prevention.en,
  preventionMr: HEALTHY_TEXT.prevention.mr,
  preventionHi: HEALTHY_TEXT.prevention.hi,
  isHealthy: true,
});

const mapDiagnosis = (d: PlantixDiagnosis): DiagnosisItem => {
  const disease = d.common_name || d.scientific_name;
  const prevention = joinMeasures(d.preventive_measures ?? []);

  return {
    disease,
    diseaseMr: disease,
    diseaseHi: disease,
    confidence: likelihoodToConfidence(d.diagnosis_likelihood),
    severity: likelihoodToSeverity(d.diagnosis_likelihood),
    treatmentOrganic: d.treatment_organic || "",
    treatmentChemical: d.treatment_chemical || "",
    prevention,
    preventionMr: prevention,
    preventionHi: prevention,
    scientificName: d.scientific_name,
    pathogenClass: d.pathogen_class,
    symptomsShort: d.symptoms_short,
    symptomsFull: d.symptoms,
  };
};

const normalise = (apiData: AgroLensApiResponse): AnalysisResult => {
  const { plantixResponse, uploadedImageUrl } = apiData;
  const rawDiagnoses = plantixResponse?.predicted_diagnoses ?? [];

  const diagnoses: DiagnosisItem[] =
    rawDiagnoses.length > 0
      ? rawDiagnoses.map(mapDiagnosis)
      : [buildHealthyDiagnosis()];

  return {
    diagnoses,
    uploadedImageUrl,
    cropHealth: plantixResponse?.crop_health,
  };
};

// ---------------------------------------------------------------------------
// Image normalisation — guarantee JPG/PNG reaches the API
// ---------------------------------------------------------------------------
/**
 * The AgroLens/Plantix API only accepts JPG/JPEG/PNG.
 * Any other format (WEBP, HEIC, BMP, blank-MIME drag-drops, etc.) is
 * re-encoded to JPEG at 92% quality via an off-screen canvas before upload.
 * If the file is already JPEG or PNG it is returned untouched.
 */
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

const normaliseImageFile = (file: File): Promise<File> => {
  if (ACCEPTED_TYPES.has(file.type.toLowerCase())) {
    console.log(`[AgroLens] File format OK: ${file.type} (${file.name})`);
    return Promise.resolve(file);
  }

  console.warn(
    `[AgroLens] Non-standard MIME "${file.type || "unknown"}" on "${file.name}" — re-encoding to JPEG`,
  );

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas toBlob returned null"));
              return;
            }
            const safeName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
            const reEncoded = new File([blob], safeName, {
              type: "image/jpeg",
            });
            console.log(
              `[AgroLens] Re-encoded "${file.name}" → "${safeName}" (${(reEncoded.size / 1024).toFixed(1)} KB)`,
            );
            resolve(reEncoded);
          },
          "image/jpeg",
          0.92,
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Image failed to load for re-encoding: ${file.name}`));
    };

    img.src = url;
  });
};

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------
/**
 * ERROR TAXONOMY — what this backend actually returns:
 *
 * ┌─ Our backend returns HTTP 500 when …
 * │
 * ├─ A) Plantix returns 400 for the crop slug
 * │      → backend leaks raw Axios error:
 * │        { message: "Request failed with status code 400" }
 * │      → MEANING: crop is not in Plantix's model
 * │
 * ├─ B) File type rejected by backend before reaching Plantix
 * │      → { message: "Unsupported file type. Only JPG, JPEG, and PNG are allowed." }
 * │      → MEANING: send a valid image file
 * │
 * └─ C) Everything else — infra timeout, auth, unexpected server error
 *
 * Cotton working = our auth, file upload, and request structure are all correct.
 * Banana/grape failing = Pattern A (Plantix model doesn't include these crops).
 */

/** Pattern B — server explicitly rejected the file format. */
const classifyAsFileError = (lowerMsg: string): boolean =>
  lowerMsg.includes("unsupported file") ||
  lowerMsg.includes("file type") ||
  lowerMsg.includes("file format") ||
  lowerMsg.includes("only jpg") ||
  lowerMsg.includes("only jpeg") ||
  lowerMsg.includes("only png") ||
  lowerMsg.includes("image type") ||
  lowerMsg.includes("invalid image");

/**
 * Pattern A — backend forwarded a raw Axios 400 from Plantix.
 * Plantix returns HTTP 400 when the crop slug is not in its disease model.
 *
 * Key pattern to catch: "request failed with status code 400"
 * This is an Axios error string — it means Plantix said 400, not us.
 */
const classifyAsCropRejection = (
  status: number,
  lowerMsg: string,
  cropType: string,
): boolean => {
  if (status !== 500) return false;

  // Primary pattern: Axios-wrapped Plantix 400 (confirmed from banana/grape logs)
  if (lowerMsg.includes("status code 400")) return true;

  // Explicit crop rejection phrases (Plantix future API versions)
  if (lowerMsg.includes("crop not supported")) return true;
  if (lowerMsg.includes("not a supported crop")) return true;
  if (lowerMsg.includes("crop is not supported")) return true;

  // Crop slug appears with a rejection phrase
  const slug = cropType.toLowerCase();
  if (lowerMsg.includes(slug) && lowerMsg.includes("not supported"))
    return true;
  if (lowerMsg.includes(`crop: ${slug}`)) return true;

  return false;
};

// ---------------------------------------------------------------------------
// Main API call
// ---------------------------------------------------------------------------

export const analyzeCropImage = async (
  imageFile: File,
  cropType: string,
  lang: string = "mr",
  userId: string = "",
  latitude: number = 0,
  longitude: number = 0,
): Promise<AnalysisResult> => {
  console.log(
    `[AgroLens] Starting analysis — crop: ${cropType}, user: ${userId || "guest"}, lang: ${lang}`,
  );

  // ── Step 1: Normalise file to JPG/PNG ─────────────────────────────────────
  let safeFile: File;
  try {
    safeFile = await normaliseImageFile(imageFile);
  } catch (convErr) {
    console.error("[AgroLens] Image re-encoding failed:", convErr);
    throw new Error("file_type_error");
  }

  // ── Step 2: Build multipart payload ───────────────────────────────────────
  const formData = new FormData();
  formData.append("image", safeFile);
  formData.append("crop", cropType);
  formData.append("application_used_image_gallery", "true");
  formData.append("application_end_user_id", userId);
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));

  console.log(
    `[AgroLens] Sending → crop=${cropType}, file=${safeFile.name} (${safeFile.type}, ${(safeFile.size / 1024).toFixed(1)} KB), lat=${latitude}, lon=${longitude}`,
  );

  // ── Step 3: POST to backend ────────────────────────────────────────────────
  // Do NOT manually set Content-Type — browser must add the multipart boundary.
  const res = await fetch(`${AGRO_API_BASE}/agrolens/analyze`, {
    method: "POST",
    headers: {
      "x-api-key": AGRO_API_KEY,
      "Accept-Language": lang,
    },
    body: formData,
  });

  // ── Step 4: Error handling ─────────────────────────────────────────────────
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    let parsedMessage = errorText;
    let errorJson: any = null;

    try {
      errorJson = JSON.parse(errorText);
      parsedMessage =
        errorJson?.message ??
        errorJson?.error ??
        errorJson?.detail ??
        errorText;
    } catch {
      // Not JSON — use raw text as-is
    }

    // Keep full error log for senior review
    console.error(
      `[AgroLens API Error] Status: ${res.status} | Crop: ${cropType} | Message: "${parsedMessage}"`,
      {
        errorJson,
        safeFile: {
          name: safeFile.name,
          type: safeFile.type,
          size: safeFile.size,
        },
      },
    );

    const lowerMsg = parsedMessage.toLowerCase().trim();

    // B) File format rejected — check first (more specific than crop rejection)
    if (classifyAsFileError(lowerMsg)) {
      console.warn(
        `[AgroLens] ❌ File format rejected by server — file: ${safeFile.name} (${safeFile.type})`,
      );
      throw new Error("file_type_error");
    }

    // A) Crop slug not in Plantix model (backend leaks Axios 400 error)
    if (classifyAsCropRejection(res.status, lowerMsg, cropType)) {
      console.warn(
        `[AgroLens] ❌ Crop not supported by Plantix model: "${cropType}"`,
        `\n  → Server msg: "${parsedMessage}"`,
        `\n  → Add plantixSupported: false to this crop in agroConstants.ts to suppress future network calls`,
      );
      throw new Error(`crop_not_supported:${cropType}`);
    }

    // C) Unexpected error — log everything for senior debugging
    console.error(
      `[AgroLens] ❌ Unclassified API error — Status: ${res.status}`,
      `\n  → parsedMessage: "${parsedMessage}"`,
      `\n  → crop: ${cropType}, file: ${safeFile.name}`,
      `\n  → full errorJson:`,
      errorJson,
    );
    throw new Error(`Analysis failed (${res.status}): ${parsedMessage}`);
  }

  // ── Step 5: Parse and normalise ───────────────────────────────────────────
  const json = await res.json();
  console.log(
    `[AgroLens] ✅ Raw API response received for crop: ${cropType}`,
    json,
  );

  const apiData: AgroLensApiResponse =
    json?.plantixResponse !== undefined ? json : (json?.data ?? json);

  const analysisResult = normalise(apiData);
  console.log(
    `[AgroLens] ✅ Normalised result — ${analysisResult.diagnoses.length} diagnosis(es), top: "${analysisResult.diagnoses[0]?.disease}"`,
  );

  return analysisResult;
};
