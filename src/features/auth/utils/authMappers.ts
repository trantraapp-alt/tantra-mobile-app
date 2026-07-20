// Maps raw auth API payloads into the app's domain models.
import type {
  AppUsageRole,
  ProfileResponse,
  SignInResponse,
  User,
} from '@/types';

// Spring security role names returned by the backend, mapped to domain roles.
const ROLE_MAP: Record<string, AppUsageRole> = {
  ROLE_BUYER: 'BUYER',
  ROLE_SELLER: 'SELLER',
  ROLE_BOTH: 'BOTH',
};

// Converts a Spring security role (e.g. "ROLE_BUYER") to an app usage role.
export function mapRoleToAppUsageRole(role: string): AppUsageRole {
  return ROLE_MAP[role.toUpperCase()] ?? 'BUYER';
}

// Builds the domain user from a sign-in response and the submitted mobile
// number. Sign-in returns no name fields; those arrive from the profile call.
export function mapSignInResponseToUser(
  response: SignInResponse,
  mobileNumber: string,
): User {
  return {
    id: response.userId,
    mobileNumber,
    appUsageRole: mapRoleToAppUsageRole(response.role),
  };
}

// Builds the domain user from the full profile response.
export function mapProfileResponseToUser(response: ProfileResponse): User {
  return {
    id: response.userId,
    mobileNumber: response.mobileNumber,
    appUsageRole: mapRoleToAppUsageRole(response.appUsageRole),
    firstName: response.firstName,
    lastName: response.lastName,
    preferredLanguage: response.preferredLanguage,
  };
}
