// Modal shown after a successful contact reveal: the seller's phone number with
// Call, WhatsApp and Copy actions. Purely presentational — the caller performs
// the reveal request and passes the result in.
import * as Clipboard from 'expo-clipboard';
import { Copy, MessageCircle, Phone } from 'lucide-react-native';
import { memo, useEffect, useState } from 'react';
import { Linking, Modal, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { useTheme } from '@/providers';

import type { ContactRevealResult } from '../../types';
import { createContactModalStyles } from './ContactModal.styles';

// Props for the ContactModal component.
export interface ContactModalProps {
  // Whether the modal is shown.
  visible: boolean;
  // The revealed contact, or null.
  contact: ContactRevealResult | null;
  // Called to dismiss the modal.
  onClose: () => void;
}

// Renders the revealed-contact modal.
function ContactModalComponent({ visible, contact, onClose }: ContactModalProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createContactModalStyles);
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Reset the "copied" affordance whenever the modal reopens.
  useEffect(() => {
    if (!visible) {
      setCopied(false);
    }
  }, [visible]);

  const phone = contact?.phone ?? '';
  const dialDigits = phone.replace(/[^0-9+]/g, '');
  const waDigits = phone.replace(/[^0-9]/g, '');
  const waUrl = contact?.whatsappUrl || `https://wa.me/${waDigits}`;

  const call = () => {
    void Linking.openURL(`tel:${dialDigits}`);
  };
  const whatsapp = () => {
    void Linking.openURL(waUrl);
  };
  const copy = async () => {
    await Clipboard.setStringAsync(phone);
    setCopied(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={() => undefined}>
          <View style={styles.iconCircle}>
            <Phone size={theme.sizing.iconLg} color={theme.colors.success} />
          </View>

          <Text variant="overline" color="textTertiary">
            {t('contact.title')}
          </Text>
          <Text variant="h2" align="center" style={styles.phone}>
            {phone}
          </Text>
          {contact?.alreadyRevealed ? (
            <Text variant="caption" color="textTertiary" align="center">
              {t('contact.already')}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('contact.call')}
              onPress={call}
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
                  <MessageCircle size={theme.sizing.iconSm} color="#FFFFFF" />
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
            onPress={copy}
          >
            {({ pressed }) => (
              <View
                style={[styles.copyButton, pressed ? styles.pressed : null]}
              >
                <Copy
                  size={theme.sizing.iconSm}
                  color={copied ? theme.colors.success : theme.colors.primary}
                />
                <Text
                  variant="label"
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? t('contact.copied') : t('contact.copy')}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            onPress={onClose}
          >
            {({ pressed }) => (
              <View
                style={[styles.closeButton, pressed ? styles.pressed : null]}
              >
                <Text variant="label" color="textSecondary">
                  {t('common.close')}
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Memoized contact-reveal modal.
export const ContactModal = memo(ContactModalComponent);
