import { renderHook } from '@testing-library/react-hooks';
import { useCMA } from './useCMA';

const mockedCma: string | undefined = 'mocked-cma';

const mockedSdk = {
  cmaAdapter: 'placholder',
  ids: {
    environment: 'placeholder',
    space: 'placeholder',
  },
};

jest.mock('./useSDK', () => ({
  ...jest.requireActual('./useSDK'),
  useSDK: () => mockedSdk,
}));

jest.mock('./SDKProvider', () => ({
  SDKContext: {},
}));

jest.mock('contentful-management', () => {
  return {
    ...jest.requireActual('contentful-management'),
    createClient: () => mockedCma,
  };
});

describe('useCMA', () => {
  test('should return cma client', () => {
    const { result } = renderHook(() => useCMA());

    expect(result.current).toBe(mockedCma);
  });
});
