// Dispatches the two password-reset thunks and exposes their Redux-held state.
import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectForgotPasswordOperation,
  selectResetPasswordOperation,
} from '@/store/selectors';
import { requestPasswordResetThunk, resetPasswordThunk } from '@/store/slices';
import type { ResetPasswordPayload } from '@/types';

// Requests a password-reset OTP; resolves true when the OTP was sent.
export function useForgotPassword() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(selectForgotPasswordOperation);

  // Triggers the OTP request for the provided mobile number.
  const requestReset = useCallback(
    async (mobileNumber: string): Promise<boolean> => {
      const result = await dispatch(requestPasswordResetThunk(mobileNumber));
      return requestPasswordResetThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  return {
    requestReset,
    isPending: status === 'loading',
    isSuccess: status === 'success',
    error,
  };
}

// Completes a password reset; resolves true when the password was changed.
export function useResetPassword() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(selectResetPasswordOperation);

  // Triggers the password reset with the provided payload.
  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload): Promise<boolean> => {
      const result = await dispatch(resetPasswordThunk(payload));
      return resetPasswordThunk.fulfilled.match(result);
    },
    [dispatch],
  );

  return {
    resetPassword,
    isPending: status === 'loading',
    isSuccess: status === 'success',
    error,
  };
}
