import { AGRO_API_BASE, AGRO_API_KEY } from "../constants/agroConstants";
import type {
  AnalysisResult,
  AgroLensApiResponse,
  PlantixDiagnosis,
} from "../types/agro.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps diagnosis_likelihood to a UI severity level.
 * "likely"   → high   (confident positive diagnosis)
 * "possible" → medium
 * "unlikely" → low
 */
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

/**
 * Derives a 0-100 confidence score from diagnosis_likelihood.
 * The API doesn't expose a numeric score directly, so we use
 * sensible defaults that can be replaced if the API adds one later.
 */
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

/**
 * Joins an array of preventive measures into a single readable string.
 */
const joinMeasures = (measures: string[]): string =>
  measures.map((m, i) => `${i + 1}. ${m}`).join(" ");

/**
 * Normalises the raw Plantix API response into the AnalysisResult shape
 * expected by the UI.  The API already returns localised text (Marathi)
 * in `common_name`, `trigger`, `symptoms`, `treatment_organic`,
 * `treatment_chemical`, and `preventive_measures` when the
 * Accept-Language header is set to "mr".  For the other two languages
 * (en, hi) the same fields come back in those languages respectively.
 *
 * Since we make separate requests per language we store the primary-language
 * result; the *Mr / *Hi variants are filled with the same value here and
 * can be extended to multi-language fetches if needed.
 */
const normalise = (
  apiData: AgroLensApiResponse,
  lang: string,
): AnalysisResult => {
  const { plantixResponse, uploadedImageUrl } = apiData;
  const diagnoses = plantixResponse?.predicted_diagnoses ?? [];

  // Use the top diagnosis (first = highest likelihood from Plantix)
  const top: PlantixDiagnosis | undefined = diagnoses[0];

  if (!top) {
    // Healthy crop — no diagnosis found
    const healthyMsg =
      lang === "mr"
        ? "पिकाची स्थिती चांगली आहे"
        : lang === "hi"
          ? "फसल स्वस्थ है"
          : "Crop appears healthy";
    return {
      disease: healthyMsg,
      diseaseMr: "पिकाची स्थिती चांगली आहे",
      diseaseHi: "फसल स्वस्थ है",
      confidence: 95,
      severity: "low",
      treatment: "No treatment required.",
      treatmentMr: "कोणत्याही उपचाराची आवश्यकता नाही.",
      treatmentHi: "किसी उपचार की आवश्यकता नहीं है।",
      prevention: "Continue regular monitoring of your crop.",
      preventionMr: "आपल्या पिकाचे नियमित निरीक्षण सुरू ठेवा.",
      preventionHi: "अपनी फसल की नियमित निगरानी जारी रखें।",
      uploadedImageUrl,
      cropHealth: plantixResponse?.crop_health,
    };
  }

  // The API already returns text in the requested language.
  // We populate all three language fields from the same response;
  // if multi-language support is added later, simply make three requests.
  const disease = top.common_name || top.scientific_name;
  const treatment = [top.treatment_organic, top.treatment_chemical]
    .filter(Boolean)
    .join(" ");
  const prevention = joinMeasures(top.preventive_measures ?? []);

  return {
    disease,
    diseaseMr: disease,
    diseaseHi: disease,
    confidence: likelihoodToConfidence(top.diagnosis_likelihood),
    severity: likelihoodToSeverity(top.diagnosis_likelihood),
    treatment,
    treatmentMr: treatment,
    treatmentHi: treatment,
    prevention,
    preventionMr: prevention,
    preventionHi: prevention,
    scientificName: top.scientific_name,
    pathogenClass: top.pathogen_class,
    symptomsShort: top.symptoms_short,
    imageReferences: top.image_references,
    uploadedImageUrl,
    cropHealth: plantixResponse?.crop_health,
  };
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
  const formData = new FormData();

  // File field — must be named "image" per the API spec
  formData.append("image", imageFile);

  // Body fields per the API documentation
  formData.append("crop", cropType);
  formData.append("application_used_image_gallery", "true");
  formData.append("application_end_user_id", userId);
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));

  const res = await fetch(`${AGRO_API_BASE}/agrolens/analyze`, {
    method: "POST",
    headers: {
      "x-api-key": AGRO_API_KEY,
      "Accept-Language": lang,
      // Note: Do NOT set Content-Type manually when using FormData —
      // the browser must set it with the correct boundary automatically.
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Analysis failed (${res.status}): ${errorText}`);
  }

  const json = await res.json();

  // The API wraps the result — handle both wrapped ({ data: ... }) and
  // unwrapped (direct object) shapes defensively.
  const apiData: AgroLensApiResponse = json?.data ?? json;

  return normalise(apiData, lang);
};
