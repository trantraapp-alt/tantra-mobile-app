// Authentication and user domain types aligned with the Tantra auth backend.
import type { ID } from './common.types';

// Role the user intends to use the app for (matches SignUpRequestDTO).
export type AppUsageRole = 'BUYER' | 'SELLER' | 'BOTH';

// Preferred content language (matches SignUpRequestDTO).
export type PreferredLanguage = 'HI' | 'EN';

// Authenticated user profile.
// The backend only returns userId + role on sign-in, so name fields are
// optional and are populated locally from the sign-up form when available.
export interface User {
  // Backend user identifier (e.g. "TEST-45678").
  id: ID;
  // Registered mobile number (also the JWT subject).
  mobileNumber: string;
  // Role the user operates as within the marketplace.
  appUsageRole: AppUsageRole;
  // First name, known only when captured locally at sign-up.
  firstName?: string;
  // Last name, known only when captured locally at sign-up.
  lastName?: string;
  // Preferred language for content and communications.
  preferredLanguage?: PreferredLanguage;
  // Optional avatar image URL.
  avatarUrl?: string;
}

// Auth token held by the client. The backend issues a single long-lived JWT
// and exposes no refresh endpoint, so there is no refresh token.
export interface AuthTokens {
  // Bearer access token.
  accessToken: string;
}

// Successful authentication payload assembled by the auth service.
export interface AuthSession {
  // Authenticated user.
  user: User;
  // Issued token.
  tokens: AuthTokens;
}

// Credentials for mobile / password sign-in.
export interface LoginCredentials {
  // Registered mobile number.
  mobileNumber: string;
  // Account password.
  password: string;
}

// Payload for registration (mirrors the backend SignUpRequestDTO).
export interface RegisterPayload {
  // User first name.
  firstName: string;
  // User last name.
  lastName: string;
  // Mobile number to register with.
  mobileNumber: string;
  // Chosen password.
  password: string;
  // Role the user intends to use the app for.
  appUsageRole: AppUsageRole;
  // Preferred content language.
  preferredLanguage: PreferredLanguage;
}

// Raw sign-in response returned by POST /auth/signin.
export interface SignInResponse {
  // Spring security role, e.g. "ROLE_BUYER".
  role: string;
  // Human-readable status message.
  message: string;
  // Backend user identifier.
  userId: string;
  // Issued JWT.
  token: string;
}

// Raw session-verification response returned by GET /auth/verify-session.
export interface VerifySessionResponse {
  // Whether the presented JWT is still valid.
  authenticated: boolean;
  // Human-readable status message.
  message: string;
}

// Raw sign-up response returned by POST /auth/signup.
export interface SignUpResponse {
  // Human-readable status message.
  message: string;
  // Newly created user identifier.
  userId: string;
}

// Raw profile response returned by GET /auth/profile.
export interface ProfileResponse {
  // Backend user identifier.
  userId: string;
  // User first name.
  firstName: string;
  // User last name.
  lastName: string;
  // Registered mobile number.
  mobileNumber: string;
  // Spring security role, e.g. "ROLE_BUYER".
  appUsageRole: string;
  // Preferred content language.
  preferredLanguage: PreferredLanguage;
  // Session expiry timestamp (ISO 8601, no timezone offset).
  sessionExpiry: string;
  // Currently active session token.
  sessionToken: string;
}

// Payload for requesting a password reset via mobile.
export interface ForgotPasswordPayload {
  // Mobile number to send the reset code to.
  mobileNumber: string;
}

// Payload for completing a password reset with the emailed/SMS OTP.
export interface ResetPasswordPayload {
  // Mobile number the OTP was sent to.
  mobileNumber: string;
  // The one-time password code.
  otp: string;
  // The new password to set.
  newPassword: string;
}

// Payload for verifying a one-time password.
export interface VerifyOtpPayload {
  // Mobile number the OTP was sent to.
  mobileNumber: string;
  // The one-time password code.
  code: string;
}
