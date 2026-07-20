// Service layer orchestrating auth API calls with secure token persistence.
import { logger, tokenStore } from '@/lib';
import type {
  AuthSession,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
  SignUpResponse,
  User,
} from '@/types';

import { authApi } from '../api';
import { mapProfileResponseToUser, mapSignInResponseToUser } from '../utils';

// Signs the user in, persists the JWT and hydrates the full profile.
async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await authApi.signIn(credentials);
  await tokenStore.setAccessToken(response.token);

  // Sign-in omits the user's name, so enrich the session from the profile
  // endpoint. A profile failure must not block an otherwise valid login.
  let user: User = mapSignInResponseToUser(response, credentials.mobileNumber);
  try {
    user = mapProfileResponseToUser(await authApi.getProfile());
  } catch (error) {
    logger.warn('Profile fetch after login failed; using sign-in data', error);
  }

  // Note: the app display language is a user-controlled UI setting (defaults to
  // English) and is intentionally not derived from the profile here.
  return { user, tokens: { accessToken: response.token } };
}

// Registers a new account. The backend returns only a userId, so no session is
// established here; the caller should send the user on to sign in.
async function register(payload: RegisterPayload): Promise<SignUpResponse> {
  return authApi.signUp(payload);
}

// Fetches the authenticated user's profile.
async function getProfile(): Promise<User> {
  return mapProfileResponseToUser(await authApi.getProfile());
}

// Requests a password-reset OTP for the given mobile number.
function requestPasswordReset(mobileNumber: string): Promise<string> {
  return authApi.requestPasswordReset(mobileNumber);
}

// Completes a password reset using the OTP.
function resetPassword(payload: ResetPasswordPayload): Promise<string> {
  return authApi.resetPassword(payload);
}

// Signs the user out. The backend exposes no logout endpoint, so this simply
// clears the locally stored token.
async function logout(): Promise<void> {
  await tokenStore.clearTokens();
}

// Restores the session on app start: reloads the token from secure storage and
// validates it. Bootstrap requests opt out of the global 401 handler so a flaky
// verify-session response can't wrongly end an otherwise valid session — the
// profile endpoint (reliable bearer auth) is the source of truth. Returns null
// when the token is genuinely no longer accepted.
async function bootstrap(): Promise<User | null> {
  const token = await tokenStore.bootstrap();
  if (!token) {
    return null;
  }

  // These requests handle their own 401s (see below); they must not clear the
  // token via the global session-expiry handler.
  const options = { skipSessionExpiry: true };

  try {
    const session = await authApi.verifySession(options);
    if (session.authenticated) {
      return mapProfileResponseToUser(await authApi.getProfile(options));
    }
    logger.warn('verify-session reported not authenticated; checking profile');
  } catch (error) {
    logger.warn('verify-session failed; falling back to profile', error);
  }

  // The bearer token may still be valid for real endpoints even when
  // verify-session rejects it, so the profile call decides the outcome.
  try {
    return mapProfileResponseToUser(await authApi.getProfile(options));
  } catch (error) {
    logger.warn('Session bootstrap failed; clearing token', error);
    await tokenStore.clearTokens();
    return null;
  }
}

// Authentication service consumed by feature hooks.
export const authService = {
  login,
  register,
  getProfile,
  requestPasswordReset,
  resetPassword,
  logout,
  bootstrap,
} as const;
