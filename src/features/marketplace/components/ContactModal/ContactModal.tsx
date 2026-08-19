// Bottom sheet shown after a successful contact reveal.
//
// The reveal response always carries the seller's number plus a server-built
// WhatsApp deep link, so the sheet offers three actions per number:
//   Call     → tel:+91XXXXXXXXXX
//   WhatsApp → opens `whatsappUrl` verbatim (never rebuilt client-side)
//   Copy     → puts +91XXXXXXXXXX on the clipboard
//
// An alternate number, when the seller listed one, gets its own Call and Copy.
// It deliberately has no WhatsApp button: the response carries a single
// `whatsappUrl` built for the primary number, and reusing it there would open a
// chat with the wrong line while showing the alternate one.
//
// Purely presentational — the caller performs the reveal request and passes the
// result in.
import * as Clipboard from 'expo-clipboard';
import { Copy, MessageCircle, Phone } from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';

import { BottomSheet, type BottomSheetRef, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { ContactRevealResult } from '../../types';
import { createContactModalStyles } from './ContactModal.styles';

// Props for the ContactModal component.
export interface ContactModalProps {
  // The revealed contact, or null. Setting a non-null value opens the sheet —
  // the caller does not present it manually.
  contact: ContactRevealResult | null;
  // Called once the sheet has finished closing (button, swipe-down or backdrop
  // tap). Clear the contact here so the next reveal re-opens the sheet.
  onClose: () => void;
}

// Normalizes a revealed number to the +91XXXXXXXXXX form used for dialling and
// copying. Numbers arrive as bare 10 digits, but tolerate separators or a
// country code already being present.
function toDialNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return `+91${digits.length > 10 ? digits.slice(-10) : digits}`;
}

// Spaces a dial number out for display: +91 98765 43210.
function toDisplayNumber(dial: string): string {
  const local = dial.slice(3);
  return local.length === 10
    ? `+91 ${local.slice(0, 5)} ${local.slice(5)}`
    : dial;
}

// Renders the revealed-contact bottom sheet.
function ContactModalComponent({ contact, onClose }: ContactModalProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createContactModalStyles);
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheetRef>(null);
  // The number last copied — keyed by dial string so the primary and alternate
  // rows each show their own confirmation.
  const [copied, setCopied] = useState<string | null>(null);

  // Present when a contact arrives. Keying the effect on `contact` (rather than
  // on a separate `visible` flag set by the caller) guarantees the number is
  // already committed to the tree before the sheet opens — the sheet sizes
  // itself to its content, so presenting it while the body was still empty
  // would open it collapsed.
  useEffect(() => {
    if (contact) {
      setCopied(null);
      sheetRef.current?.present();
    }
  }, [contact]);

  const primary = contact?.mobileNumber?.trim()
    ? toDialNumber(contact.mobileNumber)
    : '';
  const alternate = contact?.altMobileNumber?.trim()
    ? toDialNumber(contact.altMobileNumber)
    : '';

  const call = useCallback((dial: string) => {
    void Linking.openURL(`tel:${dial}`);
  }, []);

  const copy = useCallback(async (dial: string) => {
    await Clipboard.setStringAsync(dial);
    setCopied(dial);
  }, []);

  // The link always arrives prefilled — open it as-is, never rebuild it.
  const whatsapp = useCallback(() => {
    if (contact?.whatsappUrl) {
      void Linking.openURL(contact.whatsappUrl);
    }
  }, [contact?.whatsappUrl]);

  const callPrimary = useCallback(() => call(primary), [call, primary]);
  const copyPrimary = useCallback(() => void copy(primary), [copy, primary]);
  const callAlternate = useCallback(() => call(alternate), [call, alternate]);
  const copyAlternate = useCallback(
    () => void copy(alternate),
    [copy, alternate],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      title={t('contact.title')}
      subtitle={contact?.listingTitle ?? undefined}
      onDismiss={onClose}
      contentStyle={styles.sheet}
    >
      {/* ── Primary number ───────────────────────────────── */}
      {primary ? (
        <View style={styles.numberBlock}>
          <Text variant="overline" color="textTertiary">
            {t('contact.primary')}
          </Text>
          <Text variant="h2" style={styles.phone}>
            {toDisplayNumber(primary)}
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.actionSlot}
              accessibilityRole="button"
              accessibilityLabel={t('contact.call')}
              onPress={callPrimary}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.actionButton,
                    styles.callButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Phone
                    size={theme.sizing.iconSm}
                    color={theme.colors.onPrimary}
                  />
                  <Text variant="label" color="onPrimary">
                    {t('contact.call')}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.actionSlot}
              accessibilityRole="button"
              accessibilityLabel="WhatsApp"
              onPress={whatsapp}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.actionButton,
                    styles.waButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <MessageCircle
                    size={theme.sizing.iconSm}
                    color={theme.colors.onPrimary}
                  />
                  <Text variant="label" color="onPrimary">
                    WhatsApp
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('contact.copy')}
            onPress={copyPrimary}
          >
            {({ pressed }) => (
              <View style={[styles.copyButton, pressed ? styles.pressed : null]}>
                <Copy
                  size={theme.sizing.iconSm}
                  color={
                    copied === primary
                      ? theme.colors.success
                      : theme.colors.primary
                  }
                />
                <Text
                  variant="label"
                  color={copied === primary ? 'success' : 'primary'}
                >
                  {copied === primary ? t('contact.copied') : t('contact.copy')}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      ) : null}

      {/* ── Alternate number — Call + Copy only (see file header) ── */}
      {alternate ? (
        <View style={styles.numberBlock}>
          <Text variant="overline" color="textTertiary">
            {t('contact.alt')}
          </Text>
          <Text variant="h4" style={styles.altNumber}>
            {toDisplayNumber(alternate)}
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.actionSlot}
              accessibilityRole="button"
              accessibilityLabel={t('contact.call')}
              onPress={callAlternate}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.actionButton,
                    styles.callButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Phone
                    size={theme.sizing.iconSm}
                    color={theme.colors.onPrimary}
                  />
                  <Text variant="label" color="onPrimary">
                    {t('contact.call')}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.actionSlot}
              accessibilityRole="button"
              accessibilityLabel={t('contact.copy')}
              onPress={copyAlternate}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.actionButton,
                    styles.outlineButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Copy
                    size={theme.sizing.iconSm}
                    color={
                      copied === alternate
                        ? theme.colors.success
                        : theme.colors.primary
                    }
                  />
                  <Text
                    variant="label"
                    color={copied === alternate ? 'success' : 'primary'}
                  >
                    {copied === alternate
                      ? t('contact.copied')
                      : t('contact.copy')}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}

// Memoized contact-reveal sheet.
export const ContactModal = memo(ContactModalComponent);
