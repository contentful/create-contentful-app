import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSDK } from './useSDK';

/**
 * Options to specify which value of the current entry should be read and updated.
 */
export interface UseFieldValueOptions {
  /**
   * Id of the field to read and update.
   * Can be omitted when app is rendered in field location. When omitted, the field the app is rendered in is used.
   */
  fieldId?: string;
  /**
   * Locale to read and update.
   * When omitted, default locale is used.
   */
  locale?: string;
}

export type UseFieldValueReturnValue<Value = unknown> = [
  value: Value,
  setValue: (newValue: Value) => Promise<void>
];

/**
 * Returns field value and a function to update it.
 * Must be wrapped by SDKProvider.
 * Can only be used when app is rendered in field, sidebar or entry editor location.
 *
 * @param {UseFieldValueOptions} options Options to specify which value of the current entry should be read and updated.
 * @returns {UseFieldValueReturnValue} Field value, function to update it
 */
export function useFieldValue<Value = unknown>({
  fieldId,
  locale,
}: UseFieldValueOptions = {}): UseFieldValueReturnValue<Value> {
  const sdk = useSDK();
  const entryFieldApi = useMemo(() => {
    if (!('entry' in sdk)) {
      throw new Error(
        '`useFieldValue` can only be used in field, sidebar or entry editor location'
      );
    }

    const fieldIdWithDefault = fieldId ?? ('field' in sdk ? sdk.field.id : undefined);

    if (!fieldIdWithDefault) {
      throw new Error(
        'Missing `fieldId`. The `fieldId` can only be omitted when your app is renderd in field location.'
      );
    }
    const field = sdk.entry.fields[fieldIdWithDefault];
    if (!field) {
      throw new Error(
        `Invalid \`fieldId\`. The current entry does not have a field "${fieldIdWithDefault}".`
      );
    }

    return field;
  }, [sdk, fieldId]);

  const [value, setValue] = useState(entryFieldApi.getValue(locale));

  useEffect(() => {
    if (locale) {
      return entryFieldApi.onValueChanged(locale, setValue);
    } else {
      return entryFieldApi.onValueChanged(setValue);
    }
  }, [entryFieldApi, locale]);

  const updateValue = useCallback(
    async (newValue: Value) => {
      setValue(newValue);
      await entryFieldApi.setValue(newValue, locale);
    },
    [entryFieldApi, locale]
  );

  return [value, updateValue];
}
