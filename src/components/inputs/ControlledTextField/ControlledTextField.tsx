// Bridges React Hook Form control to the themed TextField / PasswordField.
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from 'react-hook-form';

import { PasswordField } from '../PasswordField';
import { TextField, type TextFieldProps } from '../TextField';

// Props for the ControlledTextField component.
export interface ControlledTextFieldProps<TValues extends FieldValues>
  extends Omit<TextFieldProps, 'value' | 'onChangeText' | 'error'> {
  // React Hook Form control instance.
  control: Control<TValues>;
  // Field name within the form values.
  name: FieldPath<TValues>;
  // Whether to render a masked password field.
  secure?: boolean;
}

// Renders a form-connected text or password field with validation errors.
export function ControlledTextField<TValues extends FieldValues>({
  control,
  name,
  secure = false,
  ...rest
}: ControlledTextFieldProps<TValues>) {
  const { field, fieldState } = useController({ control, name });
  const error = fieldState.error?.message;

  if (secure) {
    return (
      <PasswordField
        value={field.value ?? ''}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        error={error}
        {...rest}
      />
    );
  }

  return (
    <TextField
      value={field.value ?? ''}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={error}
      {...rest}
    />
  );
}
