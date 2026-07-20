// Renders a server-driven listing form: iterates the schema's sections and
// fields, picks the control that fits each field type, honors conditional
// visibility (`visibleWhen`), shows computed (auto-calc) values, validates from
// the field rules, and keeps the primary action in a sticky footer. Feeding it
// a different schema renders a different form with no code changes.
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
import { useToast } from '@/providers';
import type { PreferredLanguage } from '@/types';

import { modulesApi } from '../../api';
import {
  type AddressValue,
  emptyAddress,
  isAddressValue,
} from '../../forms/address';
import {
  type ListingField,
  type ListingForm,
  localize,
} from '../../forms/listingForm.types';
import { buildListingPayload } from '../../forms/listingPayload';
import { AddressField } from '../AddressField';
import { ImageUploadField } from '../ImageUploadField';
import { createDynamicListingFormStyles } from './DynamicListingForm.styles';

// Form values keyed by field key; strings, booleans, image lists or an address.
type ListingValues = Record<
  string,
  string | boolean | string[] | AddressValue
>;

// Props for the DynamicListingForm component.
export interface DynamicListingFormProps {
  // Schema describing the form to render.
  form: ListingForm;
  // Active app language controlling all labels.
  language: PreferredLanguage;
}

// Localized {value,label} options for dropdown/radio fields.
function toItems(field: ListingField, language: PreferredLanguage) {
  return (field.options ?? []).map((option) => ({
    value: option.value,
    label: localize(option.label, language),
  }));
}

// Text-input props for text-like field types.
function textInputProps(field: ListingField): Partial<TextFieldProps> {
  switch (field.type) {
    case 'TEXTAREA':
      return {
        multiline: true,
        numberOfLines: 4,
        maxLength: field.validation?.maxLength,
      };
    case 'ADDRESS':
      return { multiline: true, numberOfLines: 3 };
    case 'NUMBER':
      return {
        keyboardType: 'number-pad',
        maxLength: field.validation?.maxLength,
      };
    case 'DECIMAL':
      return { keyboardType: 'decimal-pad' };
    default:
      return { maxLength: field.validation?.maxLength };
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
  if (field.validation?.maxLength) {
    rules.maxLength = {
      value: field.validation.maxLength,
      message: `Use at most ${field.validation.maxLength} characters`,
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
}

// Renders a single editable field with the control matching its type.
function InputField({ field, control, language }: FieldProps) {
  const { t } = useTranslation();
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
function ConditionalField({ field, control, language }: FieldProps) {
  const when = field.visibleWhen;
  const watched = useWatch({ control, name: when?.field ?? field.fieldKey });

  if (!when) {
    return <InputField field={field} control={control} language={language} />;
  }

  const visible =
    typeof when.value === 'boolean'
      ? Boolean(watched) === when.value
      : watched === when.value;

  return visible ? (
    <InputField field={field} control={control} language={language} />
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
) {
  if (field.type === 'AUTO_CALC') {
    return (
      <ComputedField
        key={field.fieldKey}
        field={field}
        control={control}
        language={language}
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
      />
    );
  }
  return (
    <InputField
      key={field.fieldKey}
      field={field}
      control={control}
      language={language}
    />
  );
}

// Builds initial values for every field in the schema.
function buildDefaults(form: ListingForm): ListingValues {
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
  return values;
}

// Renders the schema-driven listing form.
function DynamicListingFormComponent({
  form,
  language,
}: DynamicListingFormProps) {
  const styles = useThemedStyles(createDynamicListingFormStyles);
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();
  const defaultValues = useMemo(() => buildDefaults(form), [form]);
  const { control, handleSubmit, formState } = useForm<ListingValues>({
    defaultValues,
    mode: 'onBlur',
  });

  // Submits the collected values to the create-listing API.
  const onSubmit = useCallback(
    async (values: ListingValues) => {
      try {
        await modulesApi.createListing(buildListingPayload(form, values));
        showSuccess(t('form.submitSuccess'));
      } catch (error) {
        logger.warn('[Sell] Create listing failed', error);
        showError(t('form.submitError'));
      }
    },
    [form, showSuccess, showError, t],
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
                  {fields.map((field) => renderField(field, control, language))}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={t('form.submit')}
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
