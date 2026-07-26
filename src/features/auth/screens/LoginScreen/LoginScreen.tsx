// Login screen: mobile/password sign-in rendered inside the shared AuthShell.
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, Phone } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { Checkbox, ControlledTextField } from '@/components/inputs';
import { Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useToastError } from '@/hooks';
import { logger } from '@/lib';
import { useTheme } from '@/providers';

import { AuthShell } from '../../components';
import { useLogin } from '../../hooks';
import { type LoginFormValues, loginSchema } from '../../schemas';
import { rememberedCredentials } from '../../utils';
import { createLoginStyles } from './LoginScreen.styles';

// Renders the login screen.
export function LoginScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createLoginStyles);
  const router = useRouter();
  const { login, isPending, error } = useLogin();
  // Set when arriving straight from a successful registration — used to pre-fill
  // the mobile field. The success toast is shown by the register screen itself
  // (from the server's bilingual message).
  const { registeredMobile } = useLocalSearchParams<{
    registeredMobile?: string;
  }>();

  // Surface sign-in errors as a top toast.
  useToastError(error);

  const { control, handleSubmit, reset } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobileNumber: registeredMobile ?? '', password: '' },
  });

  // Whether to remember the entered credentials for next time.
  const [rememberMe, setRememberMe] = useState(false);

  // Pre-fill from securely-stored credentials when the user previously chose
  // "Remember me" (skipped right after a fresh registration).
  useEffect(() => {
    if (registeredMobile) {
      return;
    }
    let active = true;
    void rememberedCredentials.load().then((saved) => {
      if (active && saved) {
        reset({ mobileNumber: saved.mobileNumber, password: saved.password });
        setRememberMe(true);
      }
    });
    return () => {
      active = false;
    };
  }, [registeredMobile, reset]);

  // Submits credentials and navigates to the app only on success. Persists or
  // clears the remembered credentials based on the checkbox.
  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      // Diagnostics for the sign-in flow. The password is never logged.
      logger.info('[Auth] Sign in pressed', {
        mobileNumber: values.mobileNumber,
        rememberMe,
      });
      const isSignedIn = await login(values);
      logger.info('[Auth] Sign in result', {
        mobileNumber: values.mobileNumber,
        success: isSignedIn,
      });
      if (isSignedIn) {
        if (rememberMe) {
          await rememberedCredentials.save({
            mobileNumber: values.mobileNumber,
            password: values.password,
          });
        } else {
          await rememberedCredentials.clear();
        }
        router.replace(routes.tabs.home);
      }
    },
    [login, router, rememberMe],
  );

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your mobile number to continue."
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
            <Phone
              size={theme.sizing.iconMd}
              color={theme.colors.textTertiary}
            />
          }
        />
        <ControlledTextField
          control={control}
          name="password"
          label="Password"
          placeholder="Enter your password"
          secure
          leftIcon={
            <Lock size={theme.sizing.iconMd} color={theme.colors.textTertiary} />
          }
        />

        <View style={styles.optionsRow}>
          <Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={setRememberMe}
          />
          <Button
            label="Forgot password?"
            variant="ghost"
            size="sm"
            fullWidth={false}
            style={styles.forgot}
            onPress={() => router.push(routes.auth.forgotPassword)}
          />
        </View>
      </View>

      <Button
        label="Sign in"
        size="lg"
        loading={isPending}
        onPress={handleSubmit(onSubmit)}
      />

      <View style={styles.footer}>
        <Text variant="body" color="textSecondary">
          New to Tantra?{' '}
        </Text>
        <Button
          label="Create account"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.push(routes.auth.register)}
        />
      </View>
    </AuthShell>
  );
}
