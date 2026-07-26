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
import { useThemedStyles, useToastError, useTranslation } from '@/hooks';
import { useTheme, useToast } from '@/providers';
import type { PreferredLanguage } from '@/types';

import { AuthShell } from '../../components';
import { languageOptions } from '../../constants';
import { useRegister } from '../../hooks';
import { type RegisterFormValues, registerSchema } from '../../schemas';
import { resolveAuthMessage } from '../../utils';
import { createRegisterStyles } from './RegisterScreen.styles';

// Renders the registration screen.
export function RegisterScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createRegisterStyles);
  const router = useRouter();
  const { t, language } = useTranslation();
  const { showSuccess } = useToast();
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
      preferredLanguage: 'EN',
    },
  });

  // Registers the account (always as USER), shows the server's (bilingual)
  // message, then sends the user to sign in — sign-up issues no token.
  const onSubmit = useCallback(
    async (values: RegisterFormValues) => {
      const response = await register({
        firstName: values.firstName,
        lastName: values.lastName,
        mobileNumber: values.mobileNumber,
        password: values.password,
        appUsageRole: 'USER',
        preferredLanguage: values.preferredLanguage,
      });
      if (response) {
        showSuccess(
          resolveAuthMessage(response.message, language) ||
            t('auth.register.success'),
        );
        router.replace({
          pathname: routes.auth.login,
          params: { registeredMobile: values.mobileNumber },
        });
      }
    },
    [register, router, showSuccess, language, t],
  );

  return (
    <AuthShell
      compact
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
    >
      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <ControlledTextField
              control={control}
              name="firstName"
              label={t('auth.firstName')}
              placeholder={t('auth.register.firstNamePlaceholder')}
              autoCapitalize="words"
              autoComplete="name-given"
            />
          </View>
          <View style={styles.rowItem}>
            <ControlledTextField
              control={control}
              name="lastName"
              label={t('auth.lastName')}
              placeholder={t('auth.register.lastNamePlaceholder')}
              autoCapitalize="words"
              autoComplete="name-family"
            />
          </View>
        </View>

        <ControlledTextField
          control={control}
          name="mobileNumber"
          label={t('auth.mobileNumber')}
          placeholder={t('auth.register.mobilePlaceholder')}
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
          label={t('auth.password')}
          placeholder={t('auth.register.passwordPlaceholder')}
          secure
          leftIcon={
            <Lock size={theme.sizing.iconMd} color={theme.colors.textTertiary} />
          }
        />

        <ControlledRadioGroup<RegisterFormValues, PreferredLanguage>
          control={control}
          name="preferredLanguage"
          label={t('auth.register.languageLabel')}
          options={languageOptions}
          inline
        />
      </View>

      <Button
        label={t('auth.register.submit')}
        size="lg"
        loading={isPending}
        onPress={handleSubmit(onSubmit)}
      />

      <View style={styles.footer}>
        <Text variant="body" color="textSecondary">
          {t('auth.register.haveAccount')}{' '}
        </Text>
        <Button
          label={t('auth.signIn')}
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.replace(routes.auth.login)}
        />
      </View>
    </AuthShell>
  );
}
