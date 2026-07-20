// Bridges React Hook Form control to the ChipSelect component.
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from 'react-hook-form';

import type { SelectOption } from '@/types';

import { ChipSelect } from './ChipSelect';

// Props for the ControlledChipSelect component.
export interface ControlledChipSelectProps<
  TValues extends FieldValues,
  TValue extends string,
> {
  // React Hook Form control instance.
  control: Control<TValues>;
  // Field name within the form values.
  name: FieldPath<TValues>;
  // Optional field label.
  label?: string;
  // Available options.
  options: SelectOption<TValue>[];
}

// Renders a form-connected chip select with validation errors.
export function ControlledChipSelect<
  TValues extends FieldValues,
  TValue extends string,
>({ control, name, label, options }: ControlledChipSelectProps<TValues, TValue>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <ChipSelect<TValue>
      label={label}
      options={options}
      value={field.value as TValue | undefined}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  );
}
