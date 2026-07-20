// Bridges React Hook Form control to the SegmentedControl component.
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from 'react-hook-form';

import type { SelectOption } from '@/types';

import { SegmentedControl } from './SegmentedControl';

// Props for the ControlledSegmentedControl component.
export interface ControlledSegmentedControlProps<
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

// Renders a form-connected segmented control with validation errors.
export function ControlledSegmentedControl<
  TValues extends FieldValues,
  TValue extends string,
>({
  control,
  name,
  label,
  options,
}: ControlledSegmentedControlProps<TValues, TValue>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <SegmentedControl<TValue>
      label={label}
      options={options}
      value={field.value as TValue | undefined}
      onChange={field.onChange}
      error={fieldState.error?.message}
    />
  );
}
