// Zod validation schemas and inferred form value types for auth forms.
import { z } from 'zod';

import { appConstants, regex } from '@/constants';

// Reusable mobile number field validator.
const mobileField = z
  .string()
  .min(1, 'Mobile number is required')
  .regex(regex.mobile, 'Enter a valid 10-digit mobile number');

// Login form validation schema (mobile + password).
export const loginSchema = z.object({
  mobileNumber: mobileField,
  password: z.string().min(1, 'Password is required'),
});

// Registration form validation schema mirroring the backend SignUpRequestDTO.
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(40, 'First name is too long'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(40, 'Last name is too long'),
    mobileNumber: mobileField,
    password: z
      .string()
      .regex(
        regex.password,
        'Use 8+ characters with upper, lower and a number',
      ),
    // Role is no longer chosen by the user — the public app always signs up as
    // USER (see AUTH guide), so it is not part of the form.
    preferredLanguage: z.enum(['HI', 'EN'], {
      required_error: 'Select a preferred language',
    }),
  });

// Forgot-password form validation schema (mobile).
export const forgotPasswordSchema = z.object({
  mobileNumber: mobileField,
});

// Password reset form validation schema (OTP + new password).
export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(
        appConstants.otpLength,
        `Enter the ${appConstants.otpLength}-digit code`,
      )
      .regex(regex.otp, 'Enter a valid code'),
    newPassword: z
      .string()
      .regex(
        regex.password,
        'Use 8+ characters with upper, lower and a number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Inferred login form values.
export type LoginFormValues = z.infer<typeof loginSchema>;
// Inferred registration form values.
export type RegisterFormValues = z.infer<typeof registerSchema>;
// Inferred forgot-password form values.
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
// Inferred password reset form values.
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
