// Home screen: personalized greeting, search entry and featured section.
import { useRouter } from 'expo-router';
import { PackageSearch, ShoppingCart } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { EmptyState } from '@/components/empty-state';
import { SearchBar } from '@/components/inputs';
import { LanguageToggle, Logo, SectionHeader } from '@/components/shared';
import { Screen, Text } from '@/components/ui';
import { routes } from '@/constants';
import { useAuth } from '@/features/auth';
import { LocationChip } from '@/features/location';
import { NotificationBell } from '@/features/notifications';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import { createHomeStyles } from './HomeScreen.styles';

// Renders the home screen.
export function HomeScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createHomeStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.firstName ?? 'there';

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Logo size={theme.sizing.avatarMd} />
            <View style={styles.wordmark}>
              <Text variant="h3" color="primary">
                Tantr
              </Text>
              <Text variant="h3" color="secondary">
                a
              </Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <LanguageToggle />
            <IconButton
              icon={ShoppingCart}
              filled
              accessibilityLabel={t('common.cart')}
              onPress={() => router.push(routes.cart)}
            />
            <NotificationBell />
          </View>
        </View>

        <View style={styles.greetingRow}>
          <View style={styles.greeting}>
            <Text variant="caption" color="textSecondary">
              {t('home.greeting', { name: firstName })}
            </Text>
            <Text variant="h2">{t('home.prompt')}</Text>
          </View>
          <LocationChip />
        </View>

        <SearchBar
          value=""
          onChangeText={() => undefined}
          editable={false}
          onPress={() => router.push(routes.search)}
        />

        <View style={styles.section}>
          <SectionHeader
            title={t('home.featured.title')}
            subtitle={t('home.featured.subtitle')}
          />
          <EmptyState
            icon={PackageSearch}
            title={t('home.featured.emptyTitle')}
            description={t('home.featured.emptyDesc')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
