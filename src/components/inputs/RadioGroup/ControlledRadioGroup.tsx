// Bridges React Hook Form control to the RadioGroup component.
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from 'react-hook-form';

import type { SelectOption } from '@/types';

import { RadioGroup } from './RadioGroup';

// Props for the ControlledRadioGroup component.
export interface ControlledRadioGroupProps<
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
  // Places the label on the same row as the options to save vertical space.
  inline?: boolean;
}

// Renders a form-connected radio group with validation errors.
export function ControlledRadioGroup<
  TValues extends FieldValues,
  TValue extends string,
>({ control, name, label, options, inline }: ControlledRadioGroupProps<TValues, TValue>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <RadioGroup<TValue>
      label={label}
      options={options}
      value={field.value as TValue | undefined}
      onChange={field.onChange}
      error={fieldState.error?.message}
      inline={inline}
    />
  );
}
