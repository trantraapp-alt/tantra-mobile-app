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
import { memo, useCallback, useEffect, useMemo } from 'react';
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
  DateField,
  RadioGroup,
  Select,
  type SelectItem,
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
import { emptyManualSelection, isAddressSelection } from '../../forms/address';
import {
  type ListingField,
  type ListingFieldVisibleWhen,
  type ListingForm,
  type ListingSection,
  localize,
} from '../../forms/listingForm.types';
import {
  buildListingPayload,
  type CreateListingPayload,
  type ListingValues,
} from '../../forms/listingPayload';
import {
  computeDiscountPercent,
  ensureOfferedPriceFields,
  isOfferedPriceField,
  toPriceNumber,
  validateOfferedNotAboveActual,
} from '../../forms/pricing';
import { AddressSelectorField } from '../AddressSelectorField';
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

// Lookup of every field in the form by its key (for cascade parent resolution).
type FieldMap = Map<string, ListingField>;

// Sentinel value for the "Other (please specify)" choice.
const OTHER_VALUE = '__other__';

// Localized {value,label} options for dropdown/radio fields.
function toItems(field: ListingField, language: PreferredLanguage): SelectItem[] {
  return (field.options ?? []).map((option) => ({
    value: option.value,
    label: localize(option.label, language),
  }));
}

// Resolves the options for a choice field, filtering a cascading child's
// options by the selected parent option's id and appending an "Other" choice
// when the field allows it.
function resolveOptions(
  field: ListingField,
  fieldsByKey: FieldMap,
  parentValue: unknown,
  language: PreferredLanguage,
  otherLabel: string,
): SelectItem[] {
  let options = field.options ?? [];
  if (field.parentField) {
    const parentField = fieldsByKey.get(field.parentField);
    const selectedParent = parentField?.options?.find(
      (option) => option.value === parentValue,
    );
    const parentId = selectedParent?.id;
    options =
      parentId == null
        ? []
        : options.filter(
            (option) =>
              option.parent != null &&
              String(option.parent) === String(parentId),
          );
  }

  const items: SelectItem[] = options.map((option) => ({
    value: option.value,
    label: localize(option.label, language),
  }));
  if (field.allowOther) {
    items.push({ value: OTHER_VALUE, label: otherLabel });
  }
  return items;
}

// Whether a watched value satisfies a single equality against a target.
function valueEquals(watched: unknown, target: string | boolean): boolean {
  return typeof target === 'boolean'
    ? Boolean(watched) === target
    : watched === target;
}

// Evaluates a field's `visibleWhen` condition against the watched value.
function matchesVisibleWhen(
  when: ListingFieldVisibleWhen,
  watched: unknown,
): boolean {
  const operator = when.operator ?? 'equals';
  if (operator === 'in' || operator === 'notIn') {
    const targets = Array.isArray(when.value) ? when.value : [when.value];
    const isIn = targets.some((target) => valueEquals(watched, target));
    return operator === 'in' ? isIn : !isIn;
  }
  const target = Array.isArray(when.value) ? when.value[0] : when.value;
  const equal = target !== undefined && valueEquals(watched, target);
  return operator === 'notEquals' ? !equal : equal;
}

// Section title/key patterns hidden when a rental (not a sale) is chosen: a
// rented item is not sold per unit and its lister's seller details are not
// collected the same way. Matches "Seller Details" and "Quantity and Unit".
const RENT_HIDDEN_SECTIONS = /seller|quantity/i;

// Finds the field that selects the sale-vs-rent transaction type: a choice field
// (dropdown/radio) offering a "rent" option. Returns null when the form has no
// such toggle (e.g. a sell-only category), so nothing is hidden.
function findRentField(form: ListingForm): ListingField | null {
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.type !== 'DROPDOWN' && field.type !== 'RADIO') {
        continue;
      }
      const hasRent = (field.options ?? []).some(
        (option) => /rent/i.test(option.value) || /rent/i.test(option.label.en),
      );
      if (hasRent) {
        return field;
      }
    }
  }
  return null;
}

// The value on the transaction-type field that represents "rent".
function rentOptionValue(field: ListingField): string | undefined {
  return (field.options ?? []).find(
    (option) => /rent/i.test(option.value) || /rent/i.test(option.label.en),
  )?.value;
}

// Whether a section is one hidden while a rental is being listed.
function isRentHiddenSection(section: ListingSection): boolean {
  return RENT_HIDDEN_SECTIONS.test(`${section.key} ${section.title.en}`);
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

// Whether a field is a free-text description (rendered as a 4-line textarea).
function isDescriptionField(field: ListingField): boolean {
  return /description/i.test(field.fieldKey);
}

// Text-input props for text-like field types.
function textInputProps(field: ListingField): Partial<TextFieldProps> {
  const maxLength = field.fieldLength ?? field.validation?.maxLength;
  // Textareas and any description field render multi-line (4 rows).
  if (field.type === 'TEXTAREA' || isDescriptionField(field)) {
    return { multiline: true, numberOfLines: 4, maxLength };
  }
  switch (field.type) {
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
    field.type !== 'MULTISELECT' &&
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
  // Named validators, combined so a field can carry more than one rule (e.g. an
  // offered-price field validates both its minimum and that it stays at or below
  // the actual price).
  const validators: Record<
    string,
    (value: unknown, values: ListingValues) => true | string
  > = {};
  if (
    (field.type === 'NUMBER' || field.type === 'DECIMAL') &&
    field.validation?.min != null
  ) {
    const minValue = field.validation.min;
    validators.min = (value) => {
      const text = typeof value === 'string' ? value : '';
      if (text === '') {
        return true;
      }
      return Number(text) >= minValue || `Must be at least ${minValue}`;
    };
  }
  // The offered price must never exceed the actual price — shared across every
  // category form via the pricing util.
  if (isOfferedPriceField(field)) {
    validators.offeredNotAboveActual = (value, values) =>
      validateOfferedNotAboveActual(value, values);
  }
  if (Object.keys(validators).length > 0) {
    rules.validate = validators;
  }
  return rules;
}

// Orders a section's fields by displayOrder, then moves any description field to
// sit right after the primary name field so the description always follows it.
function orderFields(fields: ListingField[]): ListingField[] {
  const sorted = [...fields].sort((a, b) => a.displayOrder - b.displayOrder);
  const descIndex = sorted.findIndex(isDescriptionField);
  if (descIndex < 0) {
    return sorted;
  }
  const [description] = sorted.splice(descIndex, 1);
  if (!description) {
    return sorted;
  }
  const nameIndex = sorted.findIndex((field) =>
    /name|variety|breed|model|title/i.test(field.fieldKey),
  );
  const insertAt = nameIndex < 0 ? descIndex : nameIndex + 1;
  sorted.splice(insertAt, 0, description);
  return sorted;
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
  fieldsByKey: FieldMap;
}

// Renders a single editable field with the control matching its type.
function InputField({ field, control, language, mode, fieldsByKey }: FieldProps) {
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
  const onChange = rhf.onChange;
  const error = fieldState.error?.message;
  const stringValue = typeof rhf.value === 'string' ? rhf.value : '';

  // The value driving a cascading child field (undefined for non-cascades).
  const parentValue = useWatch({
    control,
    name: field.parentField ?? '__no_parent__',
  });
  const otherLabel = t('form.otherOption');
  const options = useMemo(
    () => resolveOptions(field, fieldsByKey, parentValue, language, otherLabel),
    [field, fieldsByKey, parentValue, language, otherLabel],
  );

  // A cascading child (e.g. cropName) stays disabled until its parent (cropType)
  // has a value.
  const hasParentValue =
    typeof parentValue === 'string'
      ? parentValue.trim().length > 0
      : Boolean(parentValue);
  const cascadeLocked = Boolean(field.parentField) && !hasParentValue;

  // When the parent changes, clear a child selection that no longer belongs to
  // the new parent (but keep an explicit "Other" choice).
  useEffect(() => {
    if (
      field.parentField &&
      stringValue &&
      stringValue !== OTHER_VALUE &&
      !options.some((option) => option.value === stringValue)
    ) {
      onChange('');
    }
  }, [field.parentField, stringValue, options, onChange]);

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
        options={options}
        onChange={onChange}
        onBlur={rhf.onBlur}
        error={error}
        disabled={cascadeLocked}
      />
    );
  }

  if (field.type === 'RADIO') {
    return (
      <RadioGroup
        label={label}
        options={options}
        value={stringValue}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (field.type === 'MULTISELECT' || field.type === 'CHECKBOX_GROUP') {
    return (
      <CheckboxGroup
        label={label}
        options={toItems(field, language)}
        value={Array.isArray(rhf.value) ? rhf.value : []}
        onChange={onChange}
        error={error}
      />
    );
  }

  if (field.type === 'DATE') {
    return (
      <DateField
        label={label}
        value={stringValue}
        onChange={onChange}
        placeholder={placeholder ?? t('form.selectDate')}
        helperText={help}
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
      <AddressSelectorField
        label={label}
        value={isAddressSelection(rhf.value) ? rhf.value : emptyManualSelection()}
        onChange={onChange}
        language={language}
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
function ConditionalField({
  field,
  control,
  language,
  mode,
  fieldsByKey,
}: FieldProps) {
  const when = field.visibleWhen;
  const watched = useWatch({ control, name: when?.field ?? field.fieldKey });

  if (!when) {
    return (
      <InputField
        field={field}
        control={control}
        language={language}
        mode={mode}
        fieldsByKey={fieldsByKey}
      />
    );
  }

  return matchesVisibleWhen(when, watched) ? (
    <InputField
      field={field}
      control={control}
      language={language}
      mode={mode}
      fieldsByKey={fieldsByKey}
    />
  ) : null;
}

// Renders a read-only auto-calculated field (currently the discount %).
function ComputedField({ field, control, language }: FieldProps) {
  const styles = useThemedStyles(createDynamicListingFormStyles);
  const label = localize(field.label, language);
  const actual = useWatch({ control, name: 'actualPrice' });
  const offered = useWatch({ control, name: 'offeredPrice' });

  const percent = computeDiscountPercent(
    toPriceNumber(actual),
    toPriceNumber(offered),
  );
  const display = percent != null ? `${percent}%` : '—';

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
  fieldsByKey: FieldMap,
) {
  if (field.type === 'AUTO_CALC') {
    return (
      <ComputedField
        key={field.fieldKey}
        field={field}
        control={control}
        language={language}
        mode={mode}
        fieldsByKey={fieldsByKey}
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
        fieldsByKey={fieldsByKey}
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
      fieldsByKey={fieldsByKey}
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
      } else if (
        field.type === 'IMAGE' ||
        field.type === 'CHECKBOX_GROUP' ||
        field.type === 'MULTISELECT'
      ) {
        values[field.fieldKey] = [];
      } else if (field.type === 'ADDRESS') {
        values[field.fieldKey] = emptyManualSelection();
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
  // The transaction-type toggle (sell vs. rent), if the form has one. A form
  // that offers rent gets the offered-price + discount fields ensured on its
  // pricing section, so a rental is priced like a sale.
  const rentField = useMemo(() => findRentField(form), [form]);
  const resolvedForm = useMemo(
    () => ensureOfferedPriceFields(form, rentField != null),
    [form, rentField],
  );

  const defaultValues = useMemo(
    () => buildDefaults(resolvedForm, initialValues),
    [resolvedForm, initialValues],
  );
  // Every field keyed by fieldKey, so a cascading child can resolve its parent
  // field's selected option id.
  const fieldsByKey = useMemo<FieldMap>(
    () =>
      new Map(
        resolvedForm.sections.flatMap((section) =>
          section.fields.map((field) => [field.fieldKey, field]),
        ),
      ),
    [resolvedForm],
  );
  const { control, handleSubmit, formState } = useForm<ListingValues>({
    defaultValues,
    mode: 'onBlur',
  });

  // The "rent" value on the transaction toggle. Watch only that field so typing
  // elsewhere does not re-render the whole form.
  const rentTarget = useMemo(
    () => (rentField ? rentOptionValue(rentField) : undefined),
    [rentField],
  );
  const rentSelection = useWatch({
    control,
    name: rentField?.fieldKey ?? '__no_rent_field__',
  });
  const isRent = rentTarget != null && rentSelection === rentTarget;

  // While renting, the seller-details and quantity/unit sections are hidden;
  // collect their field keys so a value entered before switching to rent is
  // dropped from the payload rather than silently submitted.
  const hiddenFieldKeys = useMemo(() => {
    const keys = new Set<string>();
    if (!isRent) {
      return keys;
    }
    for (const section of resolvedForm.sections) {
      if (isRentHiddenSection(section)) {
        for (const field of section.fields) {
          keys.add(field.fieldKey);
        }
      }
    }
    return keys;
  }, [resolvedForm, isRent]);

  // Submits the collected values — via the caller's handler (edit) or the
  // default create call.
  const onSubmit = useCallback(
    async (values: ListingValues) => {
      const submitValues =
        hiddenFieldKeys.size > 0
          ? (Object.fromEntries(
              Object.entries(values).filter(
                ([key]) => !hiddenFieldKeys.has(key),
              ),
            ) as ListingValues)
          : values;
      const payload = buildListingPayload(resolvedForm, submitValues);
      if (onSubmitProp) {
        await onSubmitProp(payload, submitValues);
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
    [resolvedForm, hiddenFieldKeys, onSubmitProp, showSuccess, showError, t],
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
            <Text variant="h3">{localize(resolvedForm.title, language)}</Text>
            <Text variant="caption" color="textSecondary">
              {t('form.subtitle')}
            </Text>
          </View>

          {resolvedForm.sections.map((section) => {
            // Hidden for a rental listing (seller details / quantity & unit).
            if (isRent && isRentHiddenSection(section)) {
              return null;
            }
            const fields = orderFields(section.fields);
            return (
              <View key={section.key} style={styles.section}>
                <Text
                  variant="h4"
                  color="textPrimary"
                  style={styles.sectionLegend}
                >
                  {localize(section.title, language)}
                </Text>
                <View style={styles.sectionFields}>
                  {fields.map((field) =>
                    renderField(field, control, language, mode, fieldsByKey),
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
