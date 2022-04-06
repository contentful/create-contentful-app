import { EntryFieldAPI, KnownSDK, SerializedJSONValue } from '@contentful/app-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSDK } from './useSDK';

export type UseFieldValueReturnValue<Value = unknown> = [
  value: Value | undefined,
  setValue: (newValue: Value | undefined) => Promise<SerializedJSONValue | undefined>
];

/**
 * Returns field value and a function to update it.
 * Must be wrapped by SDKProvider.
 * Can only be used when app is rendered in field, sidebar or entry editor location.
 *
 * @param {string=} fieldId Id of the field to read and update. Can be omitted when app is rendered in field location.
 * @param {string=} locale Locale to read and update. When omitted, default locale is used.
 * @returns {UseFieldValueReturnValue} Field value, function to update it
 */
export function useFieldValue<Value = unknown>(
  fieldId?: string,
  locale?: string
): UseFieldValueReturnValue<Value> {
  const sdk = useSDK();
  const entryFieldApi = useMemo(() => getEntryFieldApi(sdk, fieldId), [sdk, fieldId]);

  const localeWithDefault = locale ?? sdk.locales.default;
  const [value, setValue] = useState(entryFieldApi.getValue(localeWithDefault));

  useEffect(
    () => entryFieldApi.onValueChanged(localeWithDefault, setValue),
    [entryFieldApi, localeWithDefault]
  );

  const updateValue = useCallback(
    async (newValue: Value | undefined) => {
      setValue(newValue);
      return await entryFieldApi.setValue(newValue, localeWithDefault);
    },
    [entryFieldApi, localeWithDefault]
  );

  return [value, updateValue];
}

function getEntryFieldApi(sdk: KnownSDK, fieldId: string | undefined): EntryFieldAPI {
  if (!('entry' in sdk)) {
    throw new Error('`useFieldValue` can only be used in field, sidebar or entry editor location.');
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
}
