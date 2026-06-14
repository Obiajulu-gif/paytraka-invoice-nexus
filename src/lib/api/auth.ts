import apiClient, { publicApiClient } from "./client";
import { ApiResponse, AuthTokens, AuthUser, LoginRequest, RegisterRequest, RegisterResponse, ResendOtpRequest, VerifyOtpRequest } from "@/types/api";

async function saveSession(tokens: AuthTokens) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens),
  });
}

export async function register(data: RegisterRequest) {
  const response = await publicApiClient.post<ApiResponse<RegisterResponse>>("/auth/register", data);
  return response.data;
}

export function getRegisteredUserId(data: RegisterResponse) {
  return data.userId ?? data.user_id ?? data.user?.id ?? "";
}

export async function verifyOtp(userId: string, otp: string) {
  const payload: VerifyOtpRequest = { user_id: userId, otp };
  const response = await publicApiClient.post<ApiResponse<AuthTokens>>("/auth/verify-otp", payload);
  await saveSession(response.data.data);
  return response.data;
}

export async function resendOtp(userId: string) {
  const payload: ResendOtpRequest = { user_id: userId };
  const response = await publicApiClient.post<ApiResponse<null>>("/auth/resend-otp", payload);
  return response.data;
}

export async function login(email: string, password: string) {
  const payload: LoginRequest = { email, password };
  const response = await publicApiClient.post<ApiResponse<AuthTokens>>("/auth/login", payload);
  await saveSession(response.data.data);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return response.data;
}

export async function logout() {
  try {
    await apiClient.post<ApiResponse<null>>("/auth/logout");
  } catch {
    // Session cleanup must still happen if the API session is already expired.
  } finally {
    await fetch("/api/auth/session", { method: "DELETE" });
  }
}
