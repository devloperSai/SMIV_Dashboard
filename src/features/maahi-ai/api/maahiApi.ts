import { BASE_URL, API_KEY } from "../constants/maahiConstants";
import { AuthUser } from "../types/maahi.types";

// ─── Auth ─────────────────────────────────────────────────────────────────────

interface LoginPayload {
  identifier: string;
  password: string;
}

interface LoginResponse {
  data: {
    token: string;
    user: AuthUser;
  };
  message?: string;
}

export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data?.data?.token) {
    throw new Error(
      data?.message || "लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
    );
  }

  return data;
};

// ─── Register ─────────────────────────────────────────────────────────────────

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  villageId: string;
  profile_picture?: File | null;
}

interface RegisterResponse {
  data: AuthUser;
  message?: string;
  code?: number;
}

export const registerUser = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("password", payload.password);
  formData.append("villageId", payload.villageId);

  if (payload.profile_picture) {
    formData.append("profile_picture", payload.profile_picture);
  }

  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.message || "नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
    );
  }

  return data;
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

interface ForgotPasswordResponse {
  message: string;
  code: number;
}

export const forgotPassword = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.message || "ईमेल पाठवणे अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
    );
  }

  return data;
};

// ─── Villages ────────────────────────────────────────────────────────────────

export interface Village {
  id: string;
  name: string;
  gramPanchayat: string;
}

interface VillagesResponse {
  data: Village[];
  message?: string;
}

export const fetchVillages = async (): Promise<Village[]> => {
  try {
    const res = await fetch(`${BASE_URL}/demographic/villages`, {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    const data: VillagesResponse = await res.json();

    return data?.data || [];
  } catch {
    return [];
  }
};

// ─── Chat ─────────────────────────────────────────────────────────────────────

interface ChatPayload {
  userId: string;
  sessionId: string;
  prompt: string;
  lat: number;
  lon: number;
}

interface ChatResponse {
  data: {
    reply: string;
    sessionId?: string;
  };
}

export const sendChatMessage = async (
  token: string,
  payload: ChatPayload,
  lang: string = "mr",
): Promise<ChatResponse> => {
  const res = await fetch(`${BASE_URL}/maahi/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "Accept-Language": lang,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  return data;
};

// ─── Delete Chat Session ─────────────────────────────────────────────────────

export const deleteChatSession = async (
  token: string,
  sessionId: string,
): Promise<void> => {
  try {
    await fetch(`${BASE_URL}/maahi/chat/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // ignore API failures — local cleanup still works
  }
};
