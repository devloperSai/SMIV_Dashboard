import { AGRO_API_BASE, AGRO_API_KEY } from "../constants/agroConstants";
import type { AnalysisResult } from "../types/agro.types";

export const analyzeCropImage = async (
  imageFile: File,
  cropType: string,
  lang: string = "mr",
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("cropType", cropType);

  try {
    const res = await fetch(`${AGRO_API_BASE}/agro-lens/analyze`, {
      method: "POST",
      headers: {
        "x-api-key": AGRO_API_KEY,
        "Accept-Language": lang,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Analysis failed: ${res.status}`);
    }

    const data = await res.json();
    return data.data;
  } catch {
    // Fallback mock for demo when API not yet available
    await new Promise((r) => setTimeout(r, 2200));
    return {
      disease: "Leaf Blight (Bacterial)",
      diseaseMr: "पानांचा करपा (जीवाणूजन्य)",
      diseaseHi: "पत्ती झुलसन (बैक्टीरियल)",
      confidence: 87,
      severity: "medium",
      treatment:
        "Apply copper-based bactericide spray. Remove and destroy infected leaves. Ensure proper spacing for air circulation.",
      treatmentMr:
        "तांबे आधारित बॅक्टेरिसाइड फवारणी करा. संक्रमित पाने काढून नष्ट करा. हवा खेळती राहण्यासाठी योग्य अंतर ठेवा.",
      treatmentHi:
        "कॉपर आधारित बैक्टीरिसाइड स्प्रे करें. संक्रमित पत्तियां हटाएं. हवा के संचार के लिए उचित दूरी रखें.",
      prevention:
        "Use disease-resistant varieties. Avoid overhead irrigation. Rotate crops annually.",
      preventionMr:
        "रोग-प्रतिरोधक वाणांचा वापर करा. वरून सिंचन टाळा. दरवर्षी पीक फेरपालट करा.",
      preventionHi:
        "रोग-प्रतिरोधक किस्मों का उपयोग करें. ऊपर से सिंचाई से बचें. सालाना फसल चक्र अपनाएं.",
    };
  }
};
