import { renderHook } from '@testing-library/react-hooks';
import { useCMAClient } from './useCMAClient';

const mockedCma: string | undefined = "mocked-cma";

const mockedSdk = {
  cmaAdapter: "placholder",
  ids: {
    environment: "placeholder",
    space: "placeholder"
  }
}

jest.mock('./useSDK', () => ({
  ...jest.requireActual('./useSDK'),
  useSDK: () => mockedSdk
}));

jest.mock('./SDKProvider', () => ({
  SDKContext: {},
}));

jest.mock('contentful-management', () => {
  return {
    ...jest.requireActual('contentful-management'),
    createClient: () => mockedCma
  }
})

describe('useCMAClient', () => {
  test('should return cma client', () => {

    const { result } = renderHook(() => useCMAClient());

    expect(result.current).toBe(mockedCma);
  })
})
