// Reset password screen: verifies the OTP and sets a new password.
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Button } from '@/components/buttons';
import {
  ControlledTextField,
  KeyboardAwareScrollView,
} from '@/components/inputs';
import { Header } from '@/components/shared';
import { Screen, Text } from '@/components/ui';
import { appConstants, routes } from '@/constants';
import { useGoBack, useThemedStyles, useToastError } from '@/hooks';

import { useForgotPassword, useResetPassword } from '../../hooks';
import {
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from '../../schemas';
import { createAuthStyles } from '../../styles';

// Renders the reset-password screen.
export function ResetPasswordScreen() {
  const styles = useThemedStyles(createAuthStyles);
  const router = useRouter();
  const goBack = useGoBack(routes.auth.login);
  const { mobileNumber } = useLocalSearchParams<{ mobileNumber: string }>();
  const { resetPassword, isPending, error } = useResetPassword();
  const { requestReset, isPending: isResending } = useForgotPassword();

  // Surface reset errors as a top toast.
  useToastError(error);

  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  });

  // Resets the password then returns the user to sign in.
  const onSubmit = useCallback(
    async (values: ResetPasswordFormValues) => {
      const isReset = await resetPassword({
        mobileNumber: mobileNumber ?? '',
        otp: values.otp,
        newPassword: values.newPassword,
      });
      if (isReset) {
        router.replace({
          pathname: routes.auth.login,
          params: { registeredMobile: mobileNumber ?? '' },
        });
      }
    },
    [resetPassword, mobileNumber, router],
  );

  // Requests a fresh OTP for the same mobile number.
  const onResend = useCallback(() => {
    if (mobileNumber) {
      void requestReset(mobileNumber);
    }
  }, [requestReset, mobileNumber]);

  return (
    <Screen edges={['bottom']}>
      <Header showBack onBack={goBack} title="Reset password" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={false}
        >
          <View style={styles.header}>
            <Text variant="h2">Enter the code</Text>
            <Text variant="body" color="textSecondary">
              We sent a {appConstants.otpLength}-digit code to {mobileNumber}.
              Enter it below with your new password.
            </Text>
          </View>

          <View style={styles.form}>
            <ControlledTextField
              control={control}
              name="otp"
              label="Verification code"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={appConstants.otpLength}
            />
            <ControlledTextField
              control={control}
              name="newPassword"
              label="New password"
              placeholder="Create a new password"
              secure
            />
            <ControlledTextField
              control={control}
              name="confirmPassword"
              label="Confirm new password"
              placeholder="Re-enter your new password"
              secure
            />
          </View>

          <Button
            label="Reset password"
            loading={isPending}
            onPress={handleSubmit(onSubmit)}
          />

          <Button
            label="Resend code"
            variant="ghost"
            loading={isResending}
            onPress={onResend}
          />
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
