import type { CropOption } from "../types/agro.types";

export const CROP_OPTIONS: CropOption[] = [
  { value: "karle", label: "Bitter Gourd", labelMr: "कारले", labelHi: "करेला" },
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
  { value: "grapes", label: "Grapes", labelMr: "द्राक्षे", labelHi: "अंगूर" },
  {
    value: "pomegranate",
    label: "Pomegranate",
    labelMr: "डाळिंब",
    labelHi: "अनार",
  },
];

export const AGRO_API_BASE = "https://api.smiv-si.instagrp.com/api/v1";
export const AGRO_API_KEY = "SMIV-V1-7xR2p9Qz4L8mN5vW";
