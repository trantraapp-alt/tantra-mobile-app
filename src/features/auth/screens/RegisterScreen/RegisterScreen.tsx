// Registration screen: collects the SignUpRequestDTO fields inside the shared
// AuthShell so it stays visually symmetric with the login screen.
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Lock, Phone } from 'lucide-react-native';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import { ControlledRadioGroup, ControlledTextField } from '@/components/inputs';
import { Text } from '@/components/ui';
import { routes } from '@/constants';
import { useThemedStyles, useToastError } from '@/hooks';
import { useTheme } from '@/providers';
import type { AppUsageRole, PreferredLanguage } from '@/types';

import { AuthShell } from '../../components';
import { languageOptions, roleOptions } from '../../constants';
import { useRegister } from '../../hooks';
import { type RegisterFormValues, registerSchema } from '../../schemas';
import { createRegisterStyles } from './RegisterScreen.styles';

// Renders the registration screen.
export function RegisterScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createRegisterStyles);
  const router = useRouter();
  const { register, isPending, error } = useRegister();

  // Surface registration errors as a top toast.
  useToastError(error);

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      password: '',
      appUsageRole: 'BUYER',
      preferredLanguage: 'EN',
    },
  });

  // Registers the account then sends the user to sign in, since the backend
  // issues no token on sign-up.
  const onSubmit = useCallback(
    async (values: RegisterFormValues) => {
      const isRegistered = await register({
        firstName: values.firstName,
        lastName: values.lastName,
        mobileNumber: values.mobileNumber,
        password: values.password,
        appUsageRole: values.appUsageRole,
        preferredLanguage: values.preferredLanguage,
      });
      if (isRegistered) {
        router.replace({
          pathname: routes.auth.login,
          params: { registeredMobile: values.mobileNumber },
        });
      }
    },
    [register, router],
  );

  return (
    <AuthShell
      compact
      title="Create account"
      subtitle="Join Tantra and start buying and selling."
    >
      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <ControlledTextField
              control={control}
              name="firstName"
              label="First name"
              placeholder="Jane"
              autoCapitalize="words"
              autoComplete="name-given"
            />
          </View>
          <View style={styles.rowItem}>
            <ControlledTextField
              control={control}
              name="lastName"
              label="Last name"
              placeholder="Doe"
              autoCapitalize="words"
              autoComplete="name-family"
            />
          </View>
        </View>

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
        <ControlledTextField
          control={control}
          name="password"
          label="Password"
          placeholder="Create a password"
          secure
          leftIcon={
            <Lock size={theme.sizing.iconMd} color={theme.colors.textTertiary} />
          }
        />

        <ControlledRadioGroup<RegisterFormValues, AppUsageRole>
          control={control}
          name="appUsageRole"
          label="I want to"
          options={roleOptions}
          inline
        />
        <ControlledRadioGroup<RegisterFormValues, PreferredLanguage>
          control={control}
          name="preferredLanguage"
          label="Preferred language"
          options={languageOptions}
          inline
        />
      </View>

      <Button
        label="Create account"
        size="lg"
        loading={isPending}
        onPress={handleSubmit(onSubmit)}
      />

      <View style={styles.footer}>
        <Text variant="body" color="textSecondary">
          Already have an account?{' '}
        </Text>
        <Button
          label="Sign in"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.replace(routes.auth.login)}
        />
      </View>
    </AuthShell>
  );
}
