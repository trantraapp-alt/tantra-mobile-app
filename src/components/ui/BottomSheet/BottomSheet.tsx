// Shared, safe-area-aware bottom sheet modal used across the app so every sheet
// keeps the same background, handle, backdrop and (critically) bottom inset —
// content never overlaps hardware/gesture navigation bars.
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { useBottomInset, useThemedStyles } from '@/hooks';
import { useTheme } from '@/providers';

import { Text } from '../Text';
import { createBottomSheetStyles } from './BottomSheet.styles';

// Imperative handle exposed by every sheet to open and close it.
export interface BottomSheetRef {
  // Opens the sheet.
  present: () => void;
  // Closes the sheet.
  dismiss: () => void;
}

// Props for the shared BottomSheet component.
export interface BottomSheetProps {
  // Content rendered inside the sheet body.
  children: ReactNode;
  // Optional heading shown at the top of the sheet.
  title?: string;
  // Optional supporting line rendered beneath the title.
  subtitle?: string;
  // Explicit snap points; omit to size the sheet to its content.
  snapPoints?: (string | number)[];
  // Additional style applied to the content container.
  contentStyle?: StyleProp<ViewStyle>;
}

// Renders a themed, safe-area-aware bottom sheet modal.
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet(
    { children, title, subtitle, snapPoints, contentStyle },
    ref,
  ) {
    const theme = useTheme();
    const styles = useThemedStyles(createBottomSheetStyles);
    const bottomInset = useBottomInset();
    const modalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(
      ref,
      () => ({
        present: () => modalRef.current?.present(),
        dismiss: () => modalRef.current?.dismiss(),
      }),
      [],
    );

    // Bottom padding always clears the navigation inset plus a base gap so the
    // last row is never hidden behind hardware/software navigation buttons.
    const contentPadding = useMemo<ViewStyle>(
      () => ({ paddingBottom: bottomInset + theme.spacing.xl }),
      [bottomInset, theme.spacing.xl],
    );

    // Renders the dimmed backdrop behind the sheet.
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={modalRef}
        snapPoints={snapPoints}
        enableDynamicSizing={!snapPoints}
        enablePanDownToClose
        // Without these, a text input inside the sheet gets covered by the
        // keyboard on open and the sheet snaps shut instead of just losing
        // focus when the keyboard is dismissed — 'interactive' makes the
        // sheet track the keyboard as it animates, 'restore' returns it to
        // its prior snap point (rather than closing) once the keyboard
        // hides, and adjustResize keeps Android from covering content.
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={[styles.content, contentPadding, contentStyle]}>
          {title ? (
            <View style={styles.header}>
              <Text variant="h3">{title}</Text>
              {subtitle ? (
                <Text variant="body" color="textSecondary">
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
