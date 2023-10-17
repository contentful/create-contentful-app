import { renderHook } from '@testing-library/react-hooks/native';
import { useSDK } from './index';

let mockedSdk: string | undefined = 'mocked-sdk';

jest.mock('react', () => {
  return {
    ...jest.requireActual('react'),
    useContext: () => ({ sdk: mockedSdk }),
  };
});

jest.mock('./SDKProvider', () => ({
  SDKContext: {},
}));
describe('useSDK', () => {
  test('should return the sdk from the context', () => {
    const { result } = renderHook(() => useSDK());

    expect(result.current).toBe('mocked-sdk');
  });

  test('should throw when the sdk is not in context', () => {
    mockedSdk = undefined;
    const { result } = renderHook(() => useSDK());

    expect(() => {
      expect(result.current).not.toBe(undefined);
    }).toThrow();
  });
});
