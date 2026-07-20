// Repository layer: raw authentication API calls with no side effects.
import type { AxiosRequestConfig } from 'axios';

import { endpoints } from '@/config';
import { apiClient } from '@/lib';
import type {
  LoginCredentials,
  ProfileResponse,
  RegisterPayload,
  ResetPasswordPayload,
  SignInResponse,
  SignUpResponse,
  VerifySessionResponse,
} from '@/types';

// Signs in with mobile number and password, returning the issued JWT.
function signIn(credentials: LoginCredentials): Promise<SignInResponse> {
  return apiClient.post<SignInResponse, LoginCredentials>(
    endpoints.auth.signIn,
    credentials,
  );
}

// Registers a new account; the backend returns a userId, not a session.
function signUp(payload: RegisterPayload): Promise<SignUpResponse> {
  return apiClient.post<SignUpResponse, RegisterPayload>(
    endpoints.auth.signUp,
    payload,
  );
}

// Fetches the authenticated user's profile using the stored bearer token.
function getProfile(config?: AxiosRequestConfig): Promise<ProfileResponse> {
  return apiClient.get<ProfileResponse>(endpoints.auth.profile, config);
}

// Validates the stored bearer token; the backend replies 401 when it is invalid.
function verifySession(
  config?: AxiosRequestConfig,
): Promise<VerifySessionResponse> {
  return apiClient.get<VerifySessionResponse>(
    endpoints.auth.verifySession,
    config,
  );
}

// Requests a password-reset OTP. This endpoint expects `mobileNumber` as a
// query parameter rather than a JSON body, and replies with a plain string.
function requestPasswordReset(mobileNumber: string): Promise<string> {
  return apiClient.post<string, undefined>(
    endpoints.auth.forgotPasswordRequest,
    undefined,
    { params: { mobileNumber } },
  );
}

// Completes a password reset with the OTP; replies with a plain string.
function resetPassword(payload: ResetPasswordPayload): Promise<string> {
  return apiClient.post<string, ResetPasswordPayload>(
    endpoints.auth.forgotPasswordReset,
    payload,
  );
}

// Authentication repository exposing the raw auth endpoints.
export const authApi = {
  signIn,
  signUp,
  getProfile,
  verifySession,
  requestPasswordReset,
  resetPassword,
} as const;
