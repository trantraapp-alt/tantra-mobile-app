// Password input built on TextField with a show/hide visibility toggle.
import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useCallback, useState } from 'react';
import { Pressable, type TextInput } from 'react-native';

import { useTheme } from '@/providers';

import { TextField, type TextFieldProps } from '../TextField';

// Props for the PasswordField component.
export type PasswordFieldProps = Omit<
  TextFieldProps,
  'secureTextEntry' | 'rightIcon'
>;

// Renders a password field with a toggle to reveal or mask the value.
export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const theme = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    // Toggles the masked state of the password value.
    const toggleVisibility = useCallback(() => {
      setIsVisible((previous) => !previous);
    }, []);

    return (
      <TextField
        ref={ref}
        secureTextEntry={!isVisible}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        rightIcon={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isVisible ? 'Hide password' : 'Show password'
            }
            hitSlop={theme.sizing.hitSlop}
            onPress={toggleVisibility}
          >
            {isVisible ? (
              <EyeOff size={theme.sizing.iconMd} color={theme.colors.textSecondary} />
            ) : (
              <Eye size={theme.sizing.iconMd} color={theme.colors.textSecondary} />
            )}
          </Pressable>
        }
        {...props}
      />
    );
  },
);
