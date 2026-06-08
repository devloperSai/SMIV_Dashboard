import { BASE_URL, API_KEY } from "../constants/mahaConstants";
import { AuthUser } from "../types/maha.types";
import { Message } from "../types/maha.types";

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

// ─── Chat (text) ──────────────────────────────────────────────────────────────

interface ChatPayload {
  userId: string;
  // null     → new session: server creates one and returns a UUID
  // "<uuid>" → continue existing session: server loads context
  sessionId: string | null;
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
    body: JSON.stringify({
      userId: payload.userId,
      sessionId: payload.sessionId,
      prompt: payload.prompt,
      lat: payload.lat,
      lon: payload.lon,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Chat API error ${res.status}: ${res.statusText}`,
    );
  }

  return data;
};

// ─── Chat (voice) ─────────────────────────────────────────────────────────────

interface VoiceChatPayload {
  userId: string;
  // null     → new session: server creates one and returns a UUID
  // "<uuid>" → continue existing session: server loads context
  sessionId: string | null;
  audioBlob: Blob;
  mimeType: string;
  lat: number;
  lon: number;
}

export const sendVoiceChatMessage = async (
  token: string,
  payload: VoiceChatPayload,
  lang: string = "mr",
): Promise<ChatResponse> => {
  const formData = new FormData();

  const ext = payload.mimeType.includes("mp4")
    ? "mp4"
    : payload.mimeType.includes("ogg")
      ? "ogg"
      : payload.mimeType.includes("wav")
        ? "wav"
        : "webm";

  formData.append("audio", payload.audioBlob, `recording.${ext}`);
  formData.append("userId", payload.userId);
  // Only append sessionId when it's a real UUID.
  // For new sessions sessionId is null — omitting it from FormData is correct
  // because the server treats a missing/null sessionId as "start new session".
  if (payload.sessionId) {
    formData.append("sessionId", payload.sessionId);
  }
  formData.append("lat", String(payload.lat));
  formData.append("lon", String(payload.lon));

  const res = await fetch(`${BASE_URL}/maahi/chat/`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Accept-Language": lang,
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Voice chat API error ${res.status}: ${res.statusText}`,
    );
  }

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

// ─── Chat Sessions (history list) ────────────────────────────────────────────

export interface ApiChatSession {
  sessionId: string;
  title: string;
  message_count: string; // API returns this as a string
  createdAt: string;
}

/**
 * GET /maahi/sessions?userId=...
 * Returns the list of all past sessions for a user from the server.
 */
export const fetchChatSessions = async (
  token: string,
  userId: string,
  lang: string = "mr",
): Promise<ApiChatSession[]> => {
  try {
    const res = await fetch(
      `${BASE_URL}/maahi/sessions?userId=${encodeURIComponent(userId)}`,
      {
        headers: {
          "x-api-key": API_KEY,
          "Accept-Language": lang,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    return data?.data ?? [];
  } catch {
    return [];
  }
};

// ─── Session Messages (restore a session) ────────────────────────────────────

export interface ApiSessionMessage {
  id: number;
  userId: string;
  sessionId: string;
  title: string;
  role: "user" | "assistant";
  content: string;
  useCaseId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /maahi/sessions/:sessionId
 * Returns every message in a specific session so it can be restored in the UI.
 * Maps API role "assistant" → our "ai" role and builds proper Message objects.
 */
export const fetchSessionMessages = async (
  token: string,
  sessionId: string,
  lang: string = "mr",
): Promise<Message[]> => {
  try {
    const res = await fetch(`${BASE_URL}/maahi/sessions/${sessionId}`, {
      headers: {
        "x-api-key": API_KEY,
        "Accept-Language": lang,
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    const raw: ApiSessionMessage[] = data?.data ?? [];

    // API returns newest-first; sort ascending by id so conversation order is correct
    const sorted = [...raw].sort((a, b) => a.id - b.id);

    return sorted.map((m) => ({
      id: String(m.id),
      role: m.role === "assistant" ? "ai" : "user",
      text: m.content,
      timestamp: new Date(m.createdAt),
    }));
  } catch {
    return [];
  }
};
