// Bottom sheet shown after a successful contact reveal.
//
// It leads with WHO the buyer is about to ring — the seller's avatar, their
// name and the listing the reveal was for — and then the number itself on a
// tinted card, because the number is the one thing on the sheet the buyer came
// for. Below it, the three things they can do with it:
//   Call     → tel:+91XXXXXXXXXX
//   WhatsApp → opens `whatsappUrl` verbatim (never rebuilt client-side)
//   Copy     → puts +91XXXXXXXXXX on the clipboard
//
// An alternate number, when the seller listed one, gets its own Call and Copy.
// It deliberately has no WhatsApp button: the response carries a single
// `whatsappUrl` built for the primary number, and reusing it there would open a
// chat with the wrong line while showing the alternate one.
//
// The seller has no avatar image anywhere in the API, so the Avatar's initials
// stand in — the app's own default profile picture.
//
// Purely presentational — the caller performs the reveal request, supplies the
// seller identity it already holds, and handles the support hand-off.
import * as Clipboard from 'expo-clipboard';
import {
  BadgeCheck,
  ChevronRight,
  Copy,
  Headphones,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, BottomSheet, type BottomSheetRef, Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { ContactRevealResult } from '../../types';
import { createContactModalStyles } from './ContactModal.styles';

// Props for the ContactModal component.
export interface ContactModalProps {
  // The revealed contact, or null. Setting a non-null value opens the sheet —
  // the caller does not present it manually.
  contact: ContactRevealResult | null;
  // The seller's display name, from the seller card the screen already loaded.
  sellerName?: string | null;
  // Whether an admin has verified the seller; drives the badge and the note
  // under the number.
  sellerVerified?: boolean;
  // Called once the sheet has finished closing (button, swipe-down or backdrop
  // tap). Clear the contact here so the next reveal re-opens the sheet.
  onClose: () => void;
  // Opens support. The help card is hidden when this is not supplied.
  onSupport?: () => void;
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
function ContactModalComponent({
  contact,
  sellerName,
  sellerVerified = false,
  onClose,
  onSupport,
}: ContactModalProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createContactModalStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetRef>(null);
  // The number last copied — keyed by dial string so the primary and alternate
  // rows each show their own confirmation.
  const [copied, setCopied] = useState<string | null>(null);

  // The shared sheet pads its content by the Android navigation inset only — on
  // iOS it deliberately keeps content close to the edge — so the last card
  // would sit against the home indicator there. Give that inset back.
  const footerInset = Platform.OS === 'ios' ? insets.bottom : 0;

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
  const displayName = sellerName?.trim() || t('detail.sellerFallback');

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

  const dismiss = useCallback(() => sheetRef.current?.dismiss(), []);
  // Close before handing off, so the sheet is not left open over the screen
  // support opens on; `onDismiss` clears the caller's contact state for us.
  const handleSupport = useCallback(() => {
    sheetRef.current?.dismiss();
    onSupport?.();
  }, [onSupport]);
  const callPrimary = useCallback(() => call(primary), [call, primary]);
  const copyPrimary = useCallback(() => void copy(primary), [copy, primary]);
  const callAlternate = useCallback(() => call(alternate), [call, alternate]);
  const copyAlternate = useCallback(
    () => void copy(alternate),
    [copy, alternate],
  );

  return (
    <BottomSheet ref={sheetRef} onDismiss={onClose} contentStyle={styles.sheet}>
      {/* ── Who: avatar, name, and the listing this reveal was for ── */}
      <View style={styles.header}>
        <Avatar name={displayName} size="md" />

        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text variant="h4" numberOfLines={1} style={styles.name}>
              {displayName}
            </Text>
            {sellerVerified ? (
              <BadgeCheck
                size={theme.sizing.iconSm}
                color={theme.colors.primary}
              />
            ) : null}
          </View>
          {contact?.listingTitle ? (
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {contact.listingTitle}
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={dismiss}
          hitSlop={theme.sizing.hitSlop}
        >
          {({ pressed }) => (
            <View style={[styles.close, pressed ? styles.pressed : null]}>
              <X size={theme.sizing.iconSm} color={theme.colors.textSecondary} />
            </View>
          )}
        </Pressable>
      </View>

      {/* ── The number, and the three things to do with it ── */}
      {primary ? (
        <>
          <View style={styles.numberCard}>
            <View style={styles.numberInfo}>
              <View style={styles.numberLabelRow}>
                <Text variant="label" color="textSecondary">
                  {t('contact.primary')}
                </Text>
                <View style={styles.preferredPill}>
                  <Text variant="overline" style={styles.preferredText}>
                    {t('contact.preferred')}
                  </Text>
                </View>
              </View>

              <Text variant="h2" style={styles.phone}>
                {toDisplayNumber(primary)}
              </Text>

              {sellerVerified ? (
                <View style={styles.verifiedRow}>
                  <ShieldCheck
                    size={theme.sizing.iconXs}
                    color={theme.colors.primary}
                  />
                  <Text variant="caption" style={styles.verifiedText}>
                    {t('contact.verifiedNumber')}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.shieldTile}>
              <ShieldCheck
                size={theme.sizing.iconLg}
                color={theme.colors.onPrimary}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.actionSlot}
              accessibilityRole="button"
              accessibilityLabel={t('contact.callSeller')}
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
                    {t('contact.callSeller')}
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
        </>
      ) : null}

      {/* ── Alternate number — Call + Copy only (see file header) ── */}
      {alternate ? (
        <View style={styles.altBlock}>
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

      {/* ── Safety note ── */}
      <View style={styles.noteCard}>
        <View style={styles.noteIcon}>
          <Lock
            size={theme.sizing.iconSm}
            color={theme.accents.success.strong}
          />
        </View>
        <View style={styles.noteText}>
          <Text variant="label" style={styles.noteTitle}>
            {t('contact.safeTitle')}
          </Text>
          <Text variant="caption" color="textSecondary">
            {t('contact.safeDesc')}
          </Text>
        </View>
      </View>

      {/* ── Support hand-off, carrying the sheet's bottom inset ── */}
      <View style={{ paddingBottom: footerInset }}>
        {onSupport ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('contact.helpAction')}
            onPress={handleSupport}
          >
            {({ pressed }) => (
              <View style={[styles.helpCard, pressed ? styles.pressed : null]}>
                <View style={styles.helpIcon}>
                  <Headphones
                    size={theme.sizing.iconSm}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.noteText}>
                  <Text variant="label">{t('contact.helpTitle')}</Text>
                  <Text variant="caption" color="textSecondary">
                    {t('contact.helpDesc')}
                  </Text>
                </View>
                <View style={styles.helpAction}>
                  <Text variant="label" color="primary" numberOfLines={1}>
                    {t('contact.helpAction')}
                  </Text>
                  <ChevronRight
                    size={theme.sizing.iconSm}
                    color={theme.colors.primary}
                  />
                </View>
              </View>
            )}
          </Pressable>
        ) : null}
      </View>
    </BottomSheet>
  );
}

// Memoized contact-reveal sheet.
export const ContactModal = memo(ContactModalComponent);
