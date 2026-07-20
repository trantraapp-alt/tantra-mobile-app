// Shared regular expressions used for validation across features.
export const regex = {
  // RFC 5322 inspired, pragmatic email pattern.
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // At least one lowercase, one uppercase, one digit and 8+ characters.
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  // E.164 style phone number (with optional leading +).
  phone: /^\+?[1-9]\d{7,14}$/,
  // Indian 10-digit mobile number (starts 6-9).
  mobile: /^[6-9]\d{9}$/,
  // 4 to 6 digit numeric OTP.
  otp: /^\d{4,6}$/,
  // Basic postal / ZIP code.
  postalCode: /^[A-Za-z0-9\s-]{3,10}$/,
} as const;
