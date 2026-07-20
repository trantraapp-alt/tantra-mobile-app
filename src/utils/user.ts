// User-related presentation helpers.
import type { User } from '@/types';

// Returns the user's full display name from first and last name.
export function getUserFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
