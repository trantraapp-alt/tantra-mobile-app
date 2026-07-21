// Renders a server-driven listing form: iterates the schema's sections and
// fields, picks the control that fits each field type, honors conditional
// visibility (`visibleWhen`), shows computed (auto-calc) values, validates from
// the field rules, and keeps the primary action in a sticky footer. Feeding it
// a different schema renders a different form with no code changes.
//
// The same renderer powers both create and edit: pass `initialValues` to
// pre-fill, `mode="update"` to lock fields the backend marks non-editable, and
// `onSubmit` to override the default create call (e.g. to PUT an update).
import { Lock } from 'lucide-react-native';
import { memo, useCallback, useMemo } from 'react';
import {
  type Control,
  type RegisterOptions,
  useController,
  useForm,
  useWatch,
} from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '@/components/buttons';
import {
  CheckboxGroup,
  RadioGroup,
  Select,
  SwitchRow,
  TextField,
  type TextFieldProps,
} from '@/components/inputs';
import { Text } from '@/components/ui';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useTheme, useToast } from '@/providers';
import type { PreferredLanguage } from '@/types';

import { modulesApi } from '../../api';
import { emptyAddress, isAddressValue } from '../../forms/address';
import {
  type ListingField,
  type ListingForm,
  localize,
} from '../../forms/listingForm.types';
import {
  buildListingPayload,
  type CreateListingPayload,
  type ListingValues,
} from '../../forms/listingPayload';
import { AddressField } from '../AddressField';
import { ImageUploadField } from '../ImageUploadField';
import { createDynamicListingFormStyles } from './DynamicListingForm.styles';

// Whether the form is creating a new listing or editing an existing one.
export type ListingFormMode = 'create' | 'update';

// Props for the DynamicListingForm component.
export interface DynamicListingFormProps {
  // Schema describing the form to render.
  form: ListingForm;
  // Active app language controlling all labels.
  language: PreferredLanguage;
  // Pre-filled values (edit flow); merged over the schema-derived blanks.
  initialValues?: ListingValues;
  // Whether this is a create or an update (controls field locking).
  mode?: ListingFormMode;
  // Label for the primary action button.
  submitLabel?: string;
  // Overrides the default create behavior. Receives the assembled payload and
  // raw values; responsible for its own success/error handling.
  onSubmit?: (
    payload: CreateListingPayload,
    values: ListingValues,
  ) => Promise<void>;
}

// Localized {value,label} options for dropdown/radio fields.
function toItems(field: ListingField, language: PreferredLanguage) {
  return (field.options ?? []).map((option) => ({
    value: option.value,
    label: localize(option.label, language),
  }));
}

// A read-only display of a field value (used for locked fields).
function displayValue(
  field: ListingField,
  value: unknown,
  language: PreferredLanguage,
): string {
  if (field.type === 'BOOLEAN') {
    return value ? 'Yes' : 'No';
  }
  if (
    (field.type === 'DROPDOWN' || field.type === 'RADIO') &&
    typeof value === 'string'
  ) {
    const option = field.options?.find((item) => item.value === value);
    return option ? localize(option.label, language) : value;
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return typeof value === 'string' ? value : String(value ?? '');
}

// Whether a field must be locked (non-editable) in the current mode.
function isLocked(field: ListingField, mode: ListingFormMode): boolean {
  return (
    field.readOnly === true ||
    (mode === 'update' && field.editableOnUpdate === false)
  );
}

// Text-input props for text-like field types.
function textInputProps(field: ListingField): Partial<TextFieldProps> {
  const maxLength = field.fieldLength ?? field.validation?.maxLength;
  switch (field.type) {
    case 'TEXTAREA':
      return { multiline: true, numberOfLines: 4, maxLength };
    case 'ADDRESS':
      return { multiline: true, numberOfLines: 3 };
    case 'NUMBER':
      return { keyboardType: 'number-pad', maxLength };
    case 'DECIMAL':
      return { keyboardType: 'decimal-pad' };
    default:
      return { maxLength };
  }
}

// Validation rules derived from a field's config.
function buildRules(
  field: ListingField,
  label: string,
): RegisterOptions<ListingValues> {
  const rules: RegisterOptions<ListingValues> = {};
  const validatable =
    field.type !== 'IMAGE' &&
    field.type !== 'BOOLEAN' &&
    field.type !== 'CHECKBOX_GROUP' &&
    field.type !== 'ADDRESS' &&
    field.type !== 'AUTO_CALC';

  if (field.required && validatable) {
    rules.required = `${label} is required`;
  }
  const maxLength = field.fieldLength ?? field.validation?.maxLength;
  if (maxLength) {
    rules.maxLength = {
      value: maxLength,
      message: `Use at most ${maxLength} characters`,
    };
  }
  if (
    (field.type === 'NUMBER' || field.type === 'DECIMAL') &&
    field.validation?.min != null
  ) {
    const minValue = field.validation.min;
    rules.validate = (value) => {
      const text = typeof value === 'string' ? value : '';
      if (text === '') {
        return true;
      }
      return Number(text) >= minValue || `Must be at least ${minValue}`;
    };
  }
  return rules;
}

// Human hint for an image field (count + accepted types).
function imageHint(field: ListingField): string {
  const min = field.validation?.min ?? 1;
  const max = field.validation?.max ?? 10;
  const types = field.validation?.acceptedTypes?.join(', ') ?? '';
  return `Add ${min}–${max} photos${types ? ` (${types})` : ''}`;
}

// Shared props passed to every field component.
interface FieldProps {
  field: ListingField;
  control: Control<ListingValues>;
  language: PreferredLanguage;
  mode: ListingFormMode;
}

// Renders a single editable field with the control matching its type.
function InputField({ field, control, language, mode }: FieldProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useThemedStyles(createDynamicListingFormStyles);
  const label = localize(field.label, language);
  const help = localize(field.help, language) || undefined;
  const placeholder = field.placeholder ?? undefined;
  const rules = useMemo(() => buildRules(field, label), [field, label]);
  const { field: rhf, fieldState } = useController({
    control,
    name: field.fieldKey,
    rules,
  });
  const error = fieldState.error?.message;
  const stringValue = typeof rhf.value === 'string' ? rhf.value : '';

  if (isLocked(field, mode)) {
    return (
      <View style={styles.readOnly}>
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
        <View style={styles.lockedBox}>
          <Text variant="body" color="textSecondary">
            {displayValue(field, rhf.value, language) || '—'}
          </Text>
          <Lock size={theme.sizing.iconSm} color={theme.colors.textTertiary} />
        </View>
        <Text variant="caption" color="textTertiary" style={styles.lockedHint}>
          {t('form.locked')}
        </Text>
      </View>
    );
  }

  if (field.type === 'DROPDOWN') {
    return (
      <Select
        label={label}
        description={help ?? t('form.selectDescription', { label: label.toLowerCase() })}
        placeholder={placeholder}
        value={stringValue}
        options={toItems(field, language)}
        onChange={rhf.onChange}
        onBlur={rhf.onBlur}
        error={error}
      />
    );
  }

  if (field.type === 'RADIO') {
    return (
      <RadioGroup
        label={label}
        options={toItems(field, language)}
        value={stringValue}
        onChange={rhf.onChange}
        error={error}
      />
    );
  }

  if (field.type === 'CHECKBOX_GROUP') {
    return (
      <CheckboxGroup
        label={label}
        options={toItems(field, language)}
        value={Array.isArray(rhf.value) ? rhf.value : []}
        onChange={rhf.onChange}
        error={error}
      />
    );
  }

  if (field.type === 'BOOLEAN') {
    return (
      <SwitchRow
        label={label}
        help={help}
        value={typeof rhf.value === 'boolean' ? rhf.value : false}
        onValueChange={rhf.onChange}
      />
    );
  }

  if (field.type === 'IMAGE') {
    return (
      <ImageUploadField
        label={label}
        help={imageHint(field)}
        value={Array.isArray(rhf.value) ? rhf.value : []}
        onChange={rhf.onChange}
        max={field.validation?.max ?? 10}
        error={error}
      />
    );
  }

  if (field.type === 'ADDRESS') {
    return (
      <AddressField
        label={label}
        value={isAddressValue(rhf.value) ? rhf.value : emptyAddress()}
        onChange={rhf.onChange}
        error={error}
      />
    );
  }

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      helperText={help}
      value={stringValue}
      onChangeText={rhf.onChange}
      onBlur={rhf.onBlur}
      error={error}
      size="sm"
      {...textInputProps(field)}
    />
  );
}

// Renders a field only when its `visibleWhen` condition is met.
function ConditionalField({ field, control, language, mode }: FieldProps) {
  const when = field.visibleWhen;
  const watched = useWatch({ control, name: when?.field ?? field.fieldKey });

  if (!when) {
    return (
      <InputField
        field={field}
        control={control}
        language={language}
        mode={mode}
      />
    );
  }

  const visible =
    typeof when.value === 'boolean'
      ? Boolean(watched) === when.value
      : watched === when.value;

  return visible ? (
    <InputField
      field={field}
      control={control}
      language={language}
      mode={mode}
    />
  ) : null;
}

// Renders a read-only auto-calculated field (currently the discount %).
function ComputedField({ field, control, language }: FieldProps) {
  const styles = useThemedStyles(createDynamicListingFormStyles);
  const label = localize(field.label, language);
  const actual = useWatch({ control, name: 'actualPrice' });
  const offered = useWatch({ control, name: 'offeredPrice' });

  const actualNumber = typeof actual === 'string' ? Number(actual) : NaN;
  const offeredNumber = typeof offered === 'string' ? Number(offered) : NaN;
  const hasValues =
    actualNumber > 0 &&
    !Number.isNaN(actualNumber) &&
    !Number.isNaN(offeredNumber);
  const display = hasValues
    ? `${Math.max(0, Math.round(((actualNumber - offeredNumber) / actualNumber) * 100))}%`
    : '—';

  return (
    <View style={styles.readOnly}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
      <View style={styles.readOnlyBox}>
        <Text variant="body">{display}</Text>
      </View>
    </View>
  );
}

// Picks the right wrapper for a field based on its static config.
function renderField(
  field: ListingField,
  control: Control<ListingValues>,
  language: PreferredLanguage,
  mode: ListingFormMode,
) {
  if (field.type === 'AUTO_CALC') {
    return (
      <ComputedField
        key={field.fieldKey}
        field={field}
        control={control}
        language={language}
        mode={mode}
      />
    );
  }
  if (field.visibleWhen) {
    return (
      <ConditionalField
        key={field.fieldKey}
        field={field}
        control={control}
        language={language}
        mode={mode}
      />
    );
  }
  return (
    <InputField
      key={field.fieldKey}
      field={field}
      control={control}
      language={language}
      mode={mode}
    />
  );
}

// Builds initial values for every field in the schema, overlaying any provided
// pre-filled values (edit flow).
function buildDefaults(
  form: ListingForm,
  initialValues?: ListingValues,
): ListingValues {
  const values: ListingValues = {};
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.type === 'AUTO_CALC') {
        continue;
      }
      if (field.type === 'BOOLEAN') {
        values[field.fieldKey] = false;
      } else if (field.type === 'IMAGE' || field.type === 'CHECKBOX_GROUP') {
        values[field.fieldKey] = [];
      } else if (field.type === 'ADDRESS') {
        values[field.fieldKey] = emptyAddress();
      } else {
        values[field.fieldKey] = '';
      }
    }
  }
  if (initialValues) {
    for (const key of Object.keys(values)) {
      if (initialValues[key] !== undefined) {
        values[key] = initialValues[key];
      }
    }
  }
  return values;
}

// Renders the schema-driven listing form.
function DynamicListingFormComponent({
  form,
  language,
  initialValues,
  mode = 'create',
  submitLabel,
  onSubmit: onSubmitProp,
}: DynamicListingFormProps) {
  const styles = useThemedStyles(createDynamicListingFormStyles);
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();
  const defaultValues = useMemo(
    () => buildDefaults(form, initialValues),
    [form, initialValues],
  );
  const { control, handleSubmit, formState } = useForm<ListingValues>({
    defaultValues,
    mode: 'onBlur',
  });

  // Submits the collected values — via the caller's handler (edit) or the
  // default create call.
  const onSubmit = useCallback(
    async (values: ListingValues) => {
      const payload = buildListingPayload(form, values);
      if (onSubmitProp) {
        await onSubmitProp(payload, values);
        return;
      }
      try {
        await modulesApi.createListing(payload);
        showSuccess(t('form.submitSuccess'));
      } catch (error) {
        logger.warn('[Sell] Create listing failed', error);
        showError(t('form.submitError'));
      }
    },
    [form, onSubmitProp, showSuccess, showError, t],
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text variant="h3">{localize(form.title, language)}</Text>
            <Text variant="caption" color="textSecondary">
              {t('form.subtitle')}
            </Text>
          </View>

          {form.sections.map((section) => {
            const fields = [...section.fields].sort(
              (a, b) => a.displayOrder - b.displayOrder,
            );
            return (
              <View key={section.key} style={styles.section}>
                <Text variant="overline" color="textSecondary">
                  {localize(section.title, language).toUpperCase()}
                </Text>
                <View style={styles.sectionFields}>
                  {fields.map((field) =>
                    renderField(field, control, language, mode),
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={submitLabel ?? t('form.submit')}
            size="lg"
            loading={formState.isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Memoized dynamic listing form.
export const DynamicListingForm = memo(DynamicListingFormComponent);
