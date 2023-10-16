import { PageExtensionSDK, SerializedJSONValue } from '@contentful/app-sdk';
import { act, renderHook, RenderResult } from '@testing-library/react-hooks/native';
import { useFieldValue, UseFieldValueReturnValue } from './useFieldValue';
import { useSDK } from './useSDK';

const mockSDK = {
  field: {
    id: 'fieldId',
  },
  locales: {
    default: 'defaultLocale',
  },
  entry: {
    fields: {
      fieldId: {
        getValue: (locale: string) => `fieldId ${locale} value`,
        onValueChanged: jest.fn(),
        setValue: jest.fn(),
      },
      otherFieldId: {
        getValue: (locale: string) => `otherFieldId ${locale} value`,
        onValueChanged: jest.fn(),
        setValue: jest.fn(),
      },
    },
  },
};

jest.mock('./useSDK', () => ({
  ...jest.requireActual('./useSDK'),
  useSDK: jest.fn(),
}));

const useSDKMock = useSDK as jest.MockedFn<typeof useSDK>;

beforeEach(() => {
  jest.resetAllMocks();
  mockSDK.entry.fields.fieldId.onValueChanged.mockImplementation(() => () => {});
  mockSDK.entry.fields.fieldId.setValue.mockImplementation(() => Promise.resolve('return value'));

  mockSDK.entry.fields.otherFieldId.onValueChanged.mockImplementation(() => () => {});
  mockSDK.entry.fields.otherFieldId.setValue.mockImplementation(() =>
    Promise.resolve('other return value')
  );
});

describe('useFieldValue', () => {
  describe('throws error', () => {
    it('when rendered in wrong location', () => {
      useSDKMock.mockImplementation(() => ({} as PageExtensionSDK));

      const { result } = renderHook(() => useFieldValue());

      expect(() => {
        expect(result.current).not.toBe(undefined);
      }).toThrowErrorMatchingInlineSnapshot(
        `"\`useFieldValue\` can only be used in field, sidebar or entry editor location."`
      );
    });

    it('when rendered omitting `fieldId` outside of field location', () => {
      // @ts-expect-error
      useSDKMock.mockImplementation(() => ({
        entry: mockSDK.entry,
      }));

      const { result } = renderHook(() => useFieldValue());

      expect(() => {
        expect(result.current).not.toBe(undefined);
      }).toThrowErrorMatchingInlineSnapshot(
        `"Missing \`fieldId\`. The \`fieldId\` can only be omitted when your app is renderd in field location."`
      );
    });

    it('when providing unknown `fieldId`', () => {
      // @ts-expect-error
      useSDKMock.mockImplementation(() => mockSDK);

      const { result } = renderHook(() => useFieldValue('unknownFieldId'));

      expect(() => {
        expect(result.current).not.toBe(undefined);
      }).toThrowErrorMatchingInlineSnapshot(
        `"Invalid \`fieldId\`. The current entry does not have a field \\"unknownFieldId\\"."`
      );
    });
  });

  describe('with no params', () => {
    let result: RenderResult<UseFieldValueReturnValue>;

    beforeEach(() => {
      // @ts-expect-error
      useSDKMock.mockImplementation(() => mockSDK);
      result = renderHook(() => useFieldValue()).result;
    });

    it('returns initial value', () => {
      expect(result.current[0]).toBe('fieldId defaultLocale value');
    });

    it('updates value', async () => {
      await act(async () => {
        await result.current[1]('new value');
      });
      expect(result.current[0]).toBe('new value');
      expect(mockSDK.entry.fields['fieldId'].setValue).toHaveBeenCalledWith(
        'new value',
        'defaultLocale'
      );
    });

    it('updates value when `onValueChanged` is called', () => {
      const calls = mockSDK.entry.fields.fieldId.onValueChanged.mock.calls;
      expect(calls[0][0]).toBe('defaultLocale');

      act(() => calls[0][1]('new value'));
      expect(result.current[0]).toBe('new value');
    });

    it('returns the updated value', async () => {
      let returnedValue: SerializedJSONValue | undefined;
      await act(async () => {
        returnedValue = await result.current[1]('new value');
      });

      expect(returnedValue).toBe('return value');
    });
  });

  describe('with `fieldId`', () => {
    let result: RenderResult<UseFieldValueReturnValue>;

    beforeEach(() => {
      // @ts-expect-error
      useSDKMock.mockImplementation(() => mockSDK);
      result = renderHook(() => useFieldValue('otherFieldId')).result;
    });

    it('returns initial value', () => {
      expect(result.current[0]).toBe('otherFieldId defaultLocale value');
    });

    it('updates value', async () => {
      await act(async () => {
        await result.current[1]('new value');
      });
      expect(result.current[0]).toBe('new value');
      expect(mockSDK.entry.fields['otherFieldId'].setValue).toHaveBeenCalledWith(
        'new value',
        'defaultLocale'
      );
    });

    it('updates value when `onValueChanged` is called', () => {
      const calls = mockSDK.entry.fields.otherFieldId.onValueChanged.mock.calls;
      expect(calls[0][0]).toBe('defaultLocale');

      act(() => calls[0][1]('new value'));
      expect(result.current[0]).toBe('new value');
    });
  });

  describe('with `locale`', () => {
    let result: RenderResult<UseFieldValueReturnValue>;

    beforeEach(() => {
      // @ts-expect-error
      useSDKMock.mockImplementation(() => mockSDK);
      result = renderHook(() => useFieldValue('fieldId', 'locale')).result;
    });

    it('returns initial value', () => {
      expect(result.current[0]).toBe('fieldId locale value');
    });

    it('updates value', async () => {
      await act(async () => {
        await result.current[1]('new value');
      });
      expect(result.current[0]).toBe('new value');
      expect(mockSDK.entry.fields['fieldId'].setValue).toHaveBeenCalledWith('new value', 'locale');
    });

    it('updates value when `onValueChanged` is called', () => {
      const calls = mockSDK.entry.fields.fieldId.onValueChanged.mock.calls;
      expect(calls[0][0]).toBe('locale');

      act(() => calls[0][1]('new value'));
      expect(result.current[0]).toBe('new value');
    });
  });
});
