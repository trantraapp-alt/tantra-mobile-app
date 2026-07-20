// Login screen: mobile/password sign-in rendered inside the shared AuthShell.
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, Phone } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { ControlledTextField } from '@/components/inputs';
import { Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useToastError } from '@/hooks';
import { useTheme, useToast } from '@/providers';

import { AuthShell } from '../../components';
import { useLogin } from '../../hooks';
import { type LoginFormValues, loginSchema } from '../../schemas';
import { createLoginStyles } from './LoginScreen.styles';

// Renders the login screen.
export function LoginScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createLoginStyles);
  const router = useRouter();
  const { login, isPending, error } = useLogin();
  const { showSuccess } = useToast();
  // Set when arriving straight from a successful registration.
  const { registeredMobile } = useLocalSearchParams<{
    registeredMobile?: string;
  }>();

  // Surface sign-in errors as a top toast.
  useToastError(error);

  // Confirm a fresh registration with a success toast.
  useEffect(() => {
    if (registeredMobile) {
      showSuccess('Account created successfully. Please sign in to continue.');
    }
  }, [registeredMobile, showSuccess]);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobileNumber: registeredMobile ?? '', password: '' },
  });

  // Submits credentials and navigates to the app only on success.
  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      const isSignedIn = await login(values);
      if (isSignedIn) {
        router.replace(routes.tabs.home);
      }
    },
    [login, router],
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

        <Button
          label="Forgot password?"
          variant="ghost"
          size="sm"
          fullWidth={false}
          style={styles.forgot}
          onPress={() => router.push(routes.auth.forgotPassword)}
        />
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
