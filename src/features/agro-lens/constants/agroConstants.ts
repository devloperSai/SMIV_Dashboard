import type { CropOption } from "../types/agro.types";

/**
 * Crop options — 70 crops.
 *
 * `value`            → API payload crop slug (English, snake_case)
 * `label`            → English display label
 * `labelMr`          → Marathi display label (UI only)
 * `labelHi`          → Hindi display label   (UI only)
 * `plantixSupported` → false = Plantix model does NOT support this crop.
 *                      useAgroLens will block the network call and show
 *                      "not yet available" immediately.
 *
 * ── HOW TO MAINTAIN THIS LIST ──────────────────────────────────────────────
 * Watch the browser console for:
 *   [AgroLens] ❌ Crop not supported by Plantix model: "xxx"
 * When you see that for a new crop, add plantixSupported: false here.
 *
 * ── CONFIRMED STATUS (tested in production) ────────────────────────────────
 * ✅ WORKING  : tomato, wheat, rice, cotton, sugarcane, soybean, onion,
 *               pomegranate, mango, chickpea, sorghum, millet, turmeric,
 *               potato, maize, pepper, eggplant
 *
 * ❌ PLANTIX 400 (not in model):
 *               banana  → "Request failed with status code 400"
 *               grape   → "Request failed with status code 400"
 *
 * ❓ UNTESTED : all remaining crops — will be discovered at runtime and
 *               logged to console with the exact server message.
 */
export const CROP_OPTIONS: CropOption[] = [
  // ── Maharashtra priority ──────────────────────────────────────────────────
  { value: "tomato", label: "Tomato", labelMr: "टोमॅटो", labelHi: "टमाटर" },
  { value: "wheat", label: "Wheat", labelMr: "गहू", labelHi: "गेहूं" },
  { value: "rice", label: "Rice", labelMr: "तांदूळ", labelHi: "चावल" },
  { value: "cotton", label: "Cotton", labelMr: "कापूस", labelHi: "कपास" },
  { value: "sugarcane", label: "Sugarcane", labelMr: "ऊस", labelHi: "गन्ना" },
  {
    value: "soybean",
    label: "Soybean",
    labelMr: "सोयाबीन",
    labelHi: "सोयाबीन",
  },
  { value: "onion", label: "Onion", labelMr: "कांदा", labelHi: "प्याज" },
  // ❌ Plantix 400 confirmed
  {
    value: "grape",
    label: "Grape",
    labelMr: "द्राक्षे",
    labelHi: "अंगूर",
    plantixSupported: false,
  },
  {
    value: "pomegranate",
    label: "Pomegranate",
    labelMr: "डाळिंब",
    labelHi: "अनार",
  },
  { value: "mango", label: "Mango", labelMr: "आंबा", labelHi: "आम" },
  // ❌ Plantix 400 confirmed
  {
    value: "banana",
    label: "Banana",
    labelMr: "केळी",
    labelHi: "केला",
    plantixSupported: false,
  },
  { value: "chickpea", label: "Chickpea", labelMr: "हरभरा", labelHi: "चना" },
  { value: "sorghum", label: "Sorghum", labelMr: "ज्वारी", labelHi: "ज्वार" },
  { value: "millet", label: "Millet", labelMr: "बाजरी", labelHi: "बाजरा" },
  { value: "turmeric", label: "Turmeric", labelMr: "हळद", labelHi: "हल्दी" },

  // ── Remaining crops (alphabetical) ───────────────────────────────────────
  { value: "almond", label: "Almond", labelMr: "बदाम", labelHi: "बादाम" },
  {
    value: "aloe_vera",
    label: "Aloe Vera",
    labelMr: "कोरफड",
    labelHi: "घृतकुमारी",
  },
  { value: "apple", label: "Apple", labelMr: "सफरचंद", labelHi: "सेब" },
  { value: "apricot", label: "Apricot", labelMr: "जर्दाळू", labelHi: "खुबानी" },
  {
    value: "avocado",
    label: "Avocado",
    labelMr: "अ‍ॅव्होकॅडो",
    labelHi: "एवोकैडो",
  },
  { value: "bamboo", label: "Bamboo", labelMr: "बांबू", labelHi: "बांस" },
  { value: "barley", label: "Barley", labelMr: "जव", labelHi: "जौ" },
  { value: "bean", label: "Bean", labelMr: "घेवडा", labelHi: "सेम" },
  {
    value: "bitter_gourd",
    label: "Bitter Gourd",
    labelMr: "कारले",
    labelHi: "करेला",
  },
  {
    value: "blackberry",
    label: "Blackberry",
    labelMr: "ब्लॅकबेरी",
    labelHi: "जामुन",
  },
  {
    value: "black_plum",
    label: "Black Plum",
    labelMr: "जांभूळ",
    labelHi: "काला जामुन",
  },
  {
    value: "bottle_gourd",
    label: "Bottle Gourd",
    labelMr: "दुधी भोपळा",
    labelHi: "लौकी",
  },
  {
    value: "cabbage",
    label: "Cabbage",
    labelMr: "कोबी",
    labelHi: "पत्ता गोभी",
  },
  { value: "canola", label: "Canola", labelMr: "कॅनोला", labelHi: "कैनोला" },
  { value: "carrot", label: "Carrot", labelMr: "गाजर", labelHi: "गाजर" },
  { value: "cashew", label: "Cashew", labelMr: "काजू", labelHi: "काजू" },
  {
    value: "cauliflower",
    label: "Cauliflower",
    labelMr: "फ्लॉवर",
    labelHi: "फूल गोभी",
  },
  { value: "cherry", label: "Cherry", labelMr: "चेरी", labelHi: "चेरी" },
  { value: "coconut", label: "Coconut", labelMr: "नारळ", labelHi: "नारियल" },
  { value: "coffee", label: "Coffee", labelMr: "कॉफी", labelHi: "कॉफी" },
  { value: "cucumber", label: "Cucumber", labelMr: "काकडी", labelHi: "खीरा" },
  { value: "date", label: "Date", labelMr: "खजूर", labelHi: "खजूर" },
  { value: "eggplant", label: "Eggplant", labelMr: "वांगे", labelHi: "बैंगन" },
  { value: "fig", label: "Fig", labelMr: "अंजिर", labelHi: "अंजीर" },
  { value: "garlic", label: "Garlic", labelMr: "लसूण", labelHi: "लहसुन" },
  { value: "ginger", label: "Ginger", labelMr: "आले", labelHi: "अदरक" },
  { value: "guava", label: "Guava", labelMr: "पेरू", labelHi: "अमरूद" },
  { value: "jackfruit", label: "Jackfruit", labelMr: "फणस", labelHi: "कटहल" },
  { value: "lentil", label: "Lentil", labelMr: "मसूर डाळ", labelHi: "मसूर" },
  {
    value: "lettuce",
    label: "Lettuce",
    labelMr: "सलाद पत्ता",
    labelHi: "सलाद पत्ता",
  },
  { value: "maize", label: "Maize", labelMr: "मका", labelHi: "मक्का" },
  { value: "melon", label: "Melon", labelMr: "खरबूज", labelHi: "खरबूजा" },
  { value: "mustard", label: "Mustard", labelMr: "मोहरी", labelHi: "सरसों" },
  { value: "okra", label: "Okra", labelMr: "भेंडी", labelHi: "भिंडी" },
  { value: "olive", label: "Olive", labelMr: "ऑलिव्ह", labelHi: "जैतून" },
  { value: "papaya", label: "Papaya", labelMr: "पपई", labelHi: "पपीता" },
  { value: "pea", label: "Pea", labelMr: "मटार", labelHi: "मटर" },
  { value: "peach", label: "Peach", labelMr: "पीच", labelHi: "आडू" },
  { value: "peanut", label: "Peanut", labelMr: "भुईमूग", labelHi: "मूंगफली" },
  { value: "pear", label: "Pear", labelMr: "नाशपाती", labelHi: "नाशपाती" },
  { value: "pepper", label: "Pepper", labelMr: "मिरची", labelHi: "मिर्च" },
  {
    value: "pineapple",
    label: "Pineapple",
    labelMr: "अननस",
    labelHi: "अनानास",
  },
  {
    value: "pistachio",
    label: "Pistachio",
    labelMr: "पिस्ता",
    labelHi: "पिस्ता",
  },
  {
    value: "plum",
    label: "Plum",
    labelMr: "आलू बुखारा",
    labelHi: "आलू बुखारा",
  },
  { value: "potato", label: "Potato", labelMr: "बटाटा", labelHi: "आलू" },
  {
    value: "pumpkin",
    label: "Pumpkin",
    labelMr: "लाल भोपळा",
    labelHi: "कद्दू",
  },
  { value: "radish", label: "Radish", labelMr: "मुळा", labelHi: "मूली" },
  {
    value: "raspberry",
    label: "Raspberry",
    labelMr: "रास्पबेरी",
    labelHi: "रसभरी",
  },
  { value: "rose", label: "Rose", labelMr: "गुलाब", labelHi: "गुलाब" },
  {
    value: "strawberry",
    label: "Strawberry",
    labelMr: "स्ट्रॉबेरी",
    labelHi: "स्ट्रॉबेरी",
  },
  {
    value: "sunflower",
    label: "Sunflower",
    labelMr: "सूर्यफूल",
    labelHi: "सूरजमुखी",
  },
  {
    value: "sweet_potato",
    label: "Sweet Potato",
    labelMr: "रताळे",
    labelHi: "शकरकंद",
  },
  { value: "tobacco", label: "Tobacco", labelMr: "तंबाखू", labelHi: "तंबाकू" },
  { value: "turnip", label: "Turnip", labelMr: "सलगम", labelHi: "शलगम" },
  {
    value: "zucchini",
    label: "Zucchini",
    labelMr: "झुकिनी",
    labelHi: "जुकिनी",
  },
];

export const AGRO_API_BASE = "https://api.smiv-si.instagrp.com/api/v1";
export const AGRO_API_KEY = "SMIV-V1-7xR2p9Qz4L8mN5vW";
