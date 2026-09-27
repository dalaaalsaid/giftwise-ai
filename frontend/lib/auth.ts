export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: "customer" | "admin";
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

const TOKEN_KEY = "giftwise_access_token";
const USER_KEY = "giftwise_user";

export function saveAuth(data: LoginResponse) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(
    TOKEN_KEY,
    data.access_token
  );

  sessionStorage.setItem(
    USER_KEY,
    JSON.stringify(data.user)
  );
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = sessionStorage.getItem(
      USER_KEY
    );

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}