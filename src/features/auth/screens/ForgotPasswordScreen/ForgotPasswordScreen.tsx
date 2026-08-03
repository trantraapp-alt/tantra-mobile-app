// Forgot-password screen: requests a reset OTP for the provided mobile number,
// rendered inside the shared AuthShell for a consistent auth experience.
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { ControlledTextField } from '@/components/inputs';
import { Text } from '@/components/ui';
import { routes } from '@/constants';
import { useGoBack, useThemedStyles, useToastError } from '@/hooks';
import { useTheme } from '@/providers';

import { AuthShell } from '../../components';
import { useForgotPassword } from '../../hooks';
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '../../schemas';
import { createForgotPasswordStyles } from './ForgotPasswordScreen.styles';

// Renders the forgot-password screen.
export function ForgotPasswordScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createForgotPasswordStyles);
  const router = useRouter();
  const goBack = useGoBack(routes.auth.login);
  const { requestReset, isPending, error } = useForgotPassword();

  // Surface reset-request errors as a top toast.
  useToastError(error);

  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { mobileNumber: '' },
  });

  // Requests an OTP then advances to the reset step.
  const onSubmit = useCallback(
    async (values: ForgotPasswordFormValues) => {
      const isSent = await requestReset(values.mobileNumber);
      if (isSent) {
        router.push({
          pathname: routes.auth.resetPassword,
          params: { mobileNumber: values.mobileNumber },
        });
      }
    },
    [requestReset, router],
  );

  return (
    <AuthShell
      onBack={goBack}
      title="Forgot password?"
      subtitle="Enter your mobile number and we will send you a reset code."
    >
      <View style={styles.form}>
        <ControlledTextField
          control={control}
          name="mobileNumber"
          label="Mobile number"
          placeholder="9876543210"
          keyboardType="number-pad"
          autoComplete="tel"
          maxLength={10}
          leftIcon={
            <Phone size={theme.sizing.iconMd} color={theme.colors.textTertiary} />
          }
        />
      </View>

      <Button
        label="Send reset code"
        size="lg"
        loading={isPending}
        onPress={handleSubmit(onSubmit)}
      />

      <View style={styles.footer}>
        <Text variant="body" color="textSecondary">
          Remember your password?{' '}
        </Text>
        <Button
          label="Sign in"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={goBack}
        />
      </View>
    </AuthShell>
  );
}
