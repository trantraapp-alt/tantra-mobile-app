// User avatar rendering a remote image or initials fallback.
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { createAvatarStyles } from './Avatar.styles';

// Avatar size presets.
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

// Props for the Avatar component.
export interface AvatarProps {
  // Optional remote avatar image URL.
  uri?: string;
  // Display name used to derive initials when no image is present.
  name: string;
  // Size preset.
  size?: AvatarSize;
}

// Derives up to two uppercase initials from a display name.
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

// Maps a size preset to a concrete dimension from the theme.
function resolveSize(theme: ReturnType<typeof useTheme>, size: AvatarSize) {
  const map = {
    sm: theme.sizing.avatarSm,
    md: theme.sizing.avatarMd,
    lg: theme.sizing.avatarLg,
    xl: theme.sizing.avatarXl,
  } as const;
  return map[size];
}

// Renders a circular avatar with an image or initials fallback.
function AvatarComponent({ uri, name, size = 'md' }: AvatarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createAvatarStyles);
  const dimension = resolveSize(theme, size);
  const initials = useMemo(() => getInitials(name), [name]);

  const sizeStyle = { width: dimension, height: dimension, borderRadius: dimension / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, sizeStyle]}
        contentFit="cover"
        transition={theme.animation.normal}
        accessibilityLabel={name}
      />
    );
  }

  return (
    <View style={[styles.fallback, sizeStyle]}>
      <Text variant="label" color="onPrimary">
        {initials}
      </Text>
    </View>
  );
}

// Memoized themed avatar.
export const Avatar = memo(AvatarComponent);
