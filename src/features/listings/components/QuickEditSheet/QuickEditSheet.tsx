// Metadata-driven inline editor. Renders only the fields the backend marks
// `inlineEditable` for a listing's category, pre-filled from the listing, and
// PATCHes just the changed field(s) — no full form, no rebuild.
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons';
import {
  CheckboxGroup,
  RadioGroup,
  Select,
  SwitchRow,
  TextField,
  type TextFieldProps,
} from '@/components/inputs';
import { Spinner } from '@/components/loaders';
import { BottomSheet, type BottomSheetRef, Text } from '@/components/ui';
import {
  type ListingField,
  type ListingForm,
  type ListingValues,
  localize,
} from '@/features/sell';
import { useThemedStyles, useTranslation } from '@/hooks';
import { logger } from '@/lib';
import { useToast } from '@/providers';
import type { PreferredLanguage } from '@/types';

import { listingsApi } from '../../api';
import {
  buildInlinePatch,
  inlineEditableFields,
  listingToFormValues,
} from '../../forms/listingValues';
import type { MyListing } from '../../types';
import { getListingId } from '../../utils/listingDisplay';
import { createQuickEditSheetStyles } from './QuickEditSheet.styles';

// Props for the QuickEditSheet component.
export interface QuickEditSheetProps {
  // The listing being edited (null when none is selected yet).
  listing: MyListing | null;
  // The listing's category form schema.
  form: ListingForm | null;
  // Whether the form schema is still loading.
  loading?: boolean;
  // Active language for labels.
  language: PreferredLanguage;
  // Called after a successful save with the fields to merge into the list.
  onSaved: (listingId: string, updated: Partial<MyListing>) => void;
}

// Imperative handle to open/close the sheet.
export type QuickEditSheetRef = BottomSheetRef;

// Localized options for choice fields.
function toItems(field: ListingField, language: PreferredLanguage) {
  return (field.options ?? []).map((option) => ({
    value: option.value,
    label: localize(option.label, language),
  }));
}

// Keyboard/length props for text-like inline fields.
function inlineTextProps(field: ListingField): Partial<TextFieldProps> {
  const maxLength = field.fieldLength ?? field.validation?.maxLength;
  if (field.type === 'TEXTAREA') {
    return { multiline: true, numberOfLines: 3, maxLength };
  }
  if (field.type === 'NUMBER') {
    return { keyboardType: 'number-pad', maxLength };
  }
  if (field.type === 'DECIMAL') {
    return { keyboardType: 'decimal-pad' };
  }
  return { maxLength };
}

// Props for a single inline field control.
interface InlineFieldProps {
  field: ListingField;
  value: ListingValues[string] | undefined;
  language: PreferredLanguage;
  onChange: (value: ListingValues[string]) => void;
}

// Renders one inline-editable field with the control that fits its type.
function InlineField({ field, value, language, onChange }: InlineFieldProps) {
  const label = localize(field.label, language);
  const stringValue = typeof value === 'string' ? value : '';

  if (field.type === 'DROPDOWN') {
    return (
      <Select
        label={label}
        value={stringValue}
        options={toItems(field, language)}
        onChange={onChange}
      />
    );
  }
  if (field.type === 'RADIO') {
    return (
      <RadioGroup
        label={label}
        value={stringValue}
        options={toItems(field, language)}
        onChange={onChange}
        inline
      />
    );
  }
  if (field.type === 'CHECKBOX_GROUP') {
    return (
      <CheckboxGroup
        label={label}
        value={Array.isArray(value) ? value : []}
        options={toItems(field, language)}
        onChange={onChange}
      />
    );
  }
  if (field.type === 'BOOLEAN') {
    return (
      <SwitchRow
        label={label}
        value={typeof value === 'boolean' ? value : false}
        onValueChange={onChange}
      />
    );
  }
  return (
    <TextField
      label={label}
      value={stringValue}
      onChangeText={onChange}
      size="sm"
      {...inlineTextProps(field)}
    />
  );
}

// Renders the inline quick-edit bottom sheet.
export const QuickEditSheet = forwardRef<QuickEditSheetRef, QuickEditSheetProps>(
  function QuickEditSheet({ listing, form, loading, language, onSaved }, ref) {
    const styles = useThemedStyles(createQuickEditSheetStyles);
    const { t } = useTranslation();
    const { showSuccess, showError } = useToast();
    const sheetRef = useRef<BottomSheetRef>(null);
    const [values, setValues] = useState<ListingValues>({});
    const [saving, setSaving] = useState(false);
    const initialRef = useRef<ListingValues>({});

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [],
    );

    const fields = useMemo(
      () => (form ? inlineEditableFields(form) : []),
      [form],
    );
    const listingId = listing ? getListingId(listing) : '';

    // Re-seed values whenever the target listing or its form changes.
    useEffect(() => {
      if (!form || !listing) {
        setValues({});
        initialRef.current = {};
        return;
      }
      const seeded = listingToFormValues(form, listing);
      setValues(seeded);
      initialRef.current = seeded;
    }, [form, listing, listingId]);

    const setValue = useCallback(
      (key: string, value: ListingValues[string]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
      },
      [],
    );

    const handleSave = useCallback(async () => {
      if (!form || !listing) {
        return;
      }
      const changedKeys = fields
        .map((field) => field.fieldKey)
        .filter(
          (key) =>
            JSON.stringify(values[key]) !==
            JSON.stringify(initialRef.current[key]),
        );

      if (changedKeys.length === 0) {
        sheetRef.current?.dismiss();
        return;
      }

      const patch = buildInlinePatch(form, changedKeys, values);
      setSaving(true);
      try {
        const res = await listingsApi.patchListing(listingId, patch);
        // Merge the change into a partial listing for instant UI feedback.
        const updated: Partial<MyListing> = {};
        Object.entries(patch).forEach(([key, value]) => {
          if (key === 'attributes') {
            updated.attributes = {
              ...(listing.attributes ?? {}),
              ...(value as Record<string, unknown>),
            };
          } else {
            (updated as Record<string, unknown>)[key] = value;
          }
        });
        onSaved(listingId, updated);
        showSuccess(
          res.message ? localize(res.message, language) : t('listing.updateSuccess'),
        );
        sheetRef.current?.dismiss();
      } catch (error) {
        logger.warn('[Listings] Inline update failed', error);
        showError(t('listing.updateError'));
      } finally {
        setSaving(false);
      }
    }, [
      fields,
      form,
      listing,
      listingId,
      values,
      onSaved,
      showSuccess,
      showError,
      language,
      t,
    ]);

    return (
      <BottomSheet
        ref={sheetRef}
        title={t('listing.quickEditTitle')}
        subtitle={t('listing.quickEditSubtitle')}
      >
        {loading ? (
          <View style={styles.empty}>
            <Spinner />
          </View>
        ) : fields.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="body" color="textSecondary">
              {t('listing.noInlineFields')}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.fields}>
              {fields.map((field) => (
                <InlineField
                  key={field.fieldKey}
                  field={field}
                  value={values[field.fieldKey]}
                  language={language}
                  onChange={(value) => setValue(field.fieldKey, value)}
                />
              ))}
            </View>
            <View style={styles.actions}>
              <Button
                label={t('listing.saveChanges')}
                size="lg"
                loading={saving}
                onPress={handleSave}
              />
            </View>
          </>
        )}
      </BottomSheet>
    );
  },
);
