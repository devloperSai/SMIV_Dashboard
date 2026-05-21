export interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_picture?: string;
}

export type Screen = "login" | "onboarding" | "chat";
