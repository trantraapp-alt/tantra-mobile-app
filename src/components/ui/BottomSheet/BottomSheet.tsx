// Shared, safe-area-aware bottom sheet modal used across the app so every sheet
// keeps the same background, handle, backdrop and (critically) bottom inset —
// content never overlaps hardware/gesture navigation bars. Sheets whose body has
// text inputs should pass `scrollable` (with `snapPoints`) so the body scrolls
// above the keyboard and a tap outside an input dismisses it; they may also pass
// a sticky `footer` (e.g. an Apply button) that stays pinned above the keyboard.
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
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
  // Renders the body in a scroll view so it can scroll above the keyboard and a
  // tap outside an input dismisses the keyboard. Pair with `snapPoints`.
  scrollable?: boolean;
  // Sticky footer pinned to the bottom of the sheet (stays above the keyboard).
  footer?: ReactNode;
  // Additional style applied to the content container.
  contentStyle?: StyleProp<ViewStyle>;
}

// Renders a themed, safe-area-aware bottom sheet modal.
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet(
    { children, title, subtitle, snapPoints, scrollable, footer, contentStyle },
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

    // Bottom padding always clears the navigation inset plus a base gap; extra
    // room is added when a sticky footer overlays the content.
    const contentPadding = useMemo<ViewStyle>(
      () => ({
        paddingBottom: bottomInset + theme.spacing.xl + (footer ? 64 : 0),
      }),
      [bottomInset, theme.spacing.xl, footer],
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

    // Renders the sticky footer (pinned above the keyboard).
    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={bottomInset}>
          <View style={styles.footer}>{footer}</View>
        </BottomSheetFooter>
      ),
      [footer, bottomInset, styles.footer],
    );

    const header = title ? (
      <View style={styles.header}>
        <Text variant="h3">{title}</Text>
        {subtitle ? (
          <Text variant="body" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
    ) : null;

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
        footerComponent={footer ? renderFooter : undefined}
      >
        {scrollable ? (
          <BottomSheetScrollView
            // Fill the sheet only when it has an explicit height (snap points);
            // with dynamic sizing the sheet hugs the content (no bottom gap).
            style={snapPoints ? styles.flex : undefined}
            contentContainerStyle={[styles.content, contentPadding, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {header}
            {children}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView
            style={[styles.content, contentPadding, contentStyle]}
          >
            {header}
            {children}
          </BottomSheetView>
        )}
      </BottomSheetModal>
    );
  },
);
