// Image field for the listing form: pick from camera or gallery, upload the
// photos to the server (step 1), and keep the returned URLs as the field value.
// Shows uploaded thumbnails with a remove control and enforces the max count.
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, Images, X } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import {
  ActionSheet,
  type ActionSheetAction,
  type ActionSheetRef,
  Text,
} from '@/components/ui';
import { fileUrl } from '@/config';
import { useThemedStyles } from '@/hooks';
import { logger } from '@/lib';
import { useTheme } from '@/providers';

import { uploadImages } from '../../api';
import { createImageUploadFieldStyles } from './ImageUploadField.styles';

// Props for the ImageUploadField component.
export interface ImageUploadFieldProps {
  // Field label.
  label: string;
  // Optional helper text.
  help?: string;
  // Current uploaded image URLs.
  value: string[];
  // Called with the updated list of URLs.
  onChange: (urls: string[]) => void;
  // Maximum number of images allowed.
  max: number;
  // Error message shown below the field.
  error?: string;
}

// Renders the image picker + uploader field.
export function ImageUploadField({
  label,
  help,
  value,
  onChange,
  max,
  error,
}: ImageUploadFieldProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createImageUploadFieldStyles);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [uploading, setUploading] = useState(false);
  const remaining = Math.max(0, max - value.length);

  // Uploads picked assets and appends the returned URLs to the value.
  const uploadAssets = useCallback(
    async (assets: ImagePicker.ImagePickerAsset[]) => {
      const files = assets.slice(0, remaining).map((asset, index) => ({
        uri: asset.uri,
        name: asset.fileName ?? `photo-${value.length + index + 1}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      }));
      if (files.length === 0) {
        return;
      }
      setUploading(true);
      try {
        const urls = await uploadImages(files);
        onChange([...value, ...urls]);
      } catch (uploadError) {
        logger.warn('[Sell] Image upload failed', uploadError);
        Alert.alert(
          'Upload failed',
          'Could not upload the photos. Please try again.',
        );
      } finally {
        setUploading(false);
      }
    },
    [remaining, value, onChange],
  );

  // Opens the gallery to pick one or more images.
  const pickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (!result.canceled) {
      await uploadAssets(result.assets);
    }
  }, [remaining, uploadAssets]);

  // Opens the camera to capture a photo.
  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      await uploadAssets(result.assets);
    }
  }, [uploadAssets]);

  // Actions shown in the custom photo-source sheet.
  const photoActions = useMemo<ActionSheetAction[]>(
    () => [
      { key: 'camera', label: 'Take Photo', icon: Camera, onPress: takePhoto },
      {
        key: 'gallery',
        label: 'Choose from Gallery',
        icon: Images,
        onPress: pickFromGallery,
      },
    ],
    [takePhoto, pickFromGallery],
  );

  // Opens the custom photo-source bottom sheet.
  const addPhoto = useCallback(() => {
    actionSheetRef.current?.present();
  }, []);

  // Removes an uploaded image from the value.
  const remove = useCallback(
    (url: string) => {
      onChange(value.filter((item) => item !== url));
    },
    [value, onChange],
  );

  return (
    <View style={styles.container}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>

      <View style={styles.grid}>
        {value.map((url) => (
          <View key={url} style={styles.thumbWrap}>
            <Image
              source={{ uri: fileUrl(url) }}
              style={styles.thumb}
              contentFit="cover"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              hitSlop={theme.sizing.hitSlop}
              onPress={() => remove(url)}
              style={styles.removeButton}
            >
              <X size={theme.sizing.iconSm} color={theme.colors.onPrimary} />
            </Pressable>
          </View>
        ))}

        {remaining > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            disabled={uploading}
            onPress={addPhoto}
            style={styles.addTile}
          >
            {uploading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <ImagePlus
                  size={theme.sizing.iconLg}
                  color={theme.colors.textTertiary}
                />
                <Text variant="caption" color="textTertiary">
                  Add
                </Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : help ? (
        <Text variant="caption" color="textTertiary">
          {help}
        </Text>
      ) : null}

      <ActionSheet
        ref={actionSheetRef}
        title={label}
        actions={photoActions}
      />
    </View>
  );
}
