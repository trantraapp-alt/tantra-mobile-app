// Shared, safe-area-aware bottom sheet modal used across the app so every sheet
// keeps the same background, handle, backdrop and (critically) bottom inset —
// content never overlaps hardware/gesture navigation bars. Sheets whose body has
// text inputs should pass `scrollable` (with `snapPoints`) so the body scrolls
// above the keyboard and a tap outside an input dismisses it; they may also pass
// a sticky `footer` (e.g. an Apply button) that stays pinned above the keyboard.
// Every sheet also closes on the Android hardware back button (see below).
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
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { BackHandler, Platform, View } from 'react-native';

import { useBottomInset, useThemedStyles } from '@/hooks';

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
  // Whether dragging the sheet body pans / closes the sheet (gorhom default
  // true). Set false when the body has its own drag control (e.g. a slider) that
  // would otherwise fight the sheet's pan gesture and close it mid-drag.
  enableContentPanningGesture?: boolean;
  // Whether the scrollable body can scroll. Set false while a child (e.g. a
  // slider) is being dragged so the drag doesn't scroll the sheet content.
  scrollEnabled?: boolean;
}

// Renders a themed, safe-area-aware bottom sheet modal.
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet(
    {
      children,
      title,
      subtitle,
      snapPoints,
      scrollable,
      footer,
      contentStyle,
      enableContentPanningGesture = true,
      scrollEnabled = true,
    },
    ref,
  ) {
    const styles = useThemedStyles(createBottomSheetStyles);
    const bottomInset = useBottomInset();
    const modalRef = useRef<BottomSheetModal>(null);
    // Whether the sheet is currently presented. Drives the Android back
    // handler below; `index >= 0` means at least the first snap point is open.
    const [isOpen, setIsOpen] = useState(false);
    // Measured height of the sticky footer, so the content reserves exactly
    // enough bottom padding to clear it. A fixed guess left the last row (e.g.
    // the Crop Type filter) hidden behind a taller Reset / Apply footer.
    const [footerHeight, setFooterHeight] = useState(0);

    useImperativeHandle(
      ref,
      () => ({
        present: () => modalRef.current?.present(),
        dismiss: () => modalRef.current?.dismiss(),
      }),
      [],
    );

    // Tracks presented/dismissed so the back handler is only registered while
    // the sheet is actually on screen.
    const handleChange = useCallback((index: number) => {
      setIsOpen(index >= 0);
    }, []);

    const handleDismiss = useCallback(() => {
      setIsOpen(false);
    }, []);

    // Android hardware back closes the sheet instead of navigating away.
    // `@gorhom/bottom-sheet` ships no back-button integration of its own, so
    // without this a back press pops the screen *behind* the open sheet — the
    // user loses the whole screen when they meant to dismiss a filter panel.
    //
    // The listener is added only while open, and RN invokes handlers in reverse
    // registration order, so with sheets stacked the topmost one closes first.
    useEffect(() => {
      if (Platform.OS !== 'android' || !isOpen) {
        return;
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          modalRef.current?.dismiss();
          // Consume the press so navigation does not also pop the screen.
          return true;
        },
      );
      return () => subscription.remove();
    }, [isOpen]);

    // Bottom padding is just the system navigation inset — 0 on iOS and on
    // Android devices without a system nav bar, so the content (e.g. the Apply
    // row) sits right near the bezel; extra room is added only when a sticky
    // footer overlays the content.
    const contentPadding = useMemo<ViewStyle>(
      () => ({
        paddingBottom: bottomInset + (footer ? footerHeight : 0),
      }),
      [bottomInset, footer, footerHeight],
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
          <View
            style={styles.footer}
            onLayout={(event) =>
              setFooterHeight(event.nativeEvent.layout.height)
            }
          >
            {footer}
          </View>
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
        onChange={handleChange}
        onDismiss={handleDismiss}
        enableContentPanningGesture={enableContentPanningGesture}
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
            scrollEnabled={scrollEnabled}
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
