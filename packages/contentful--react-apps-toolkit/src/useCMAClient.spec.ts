import { renderHook } from '@testing-library/react-hooks';
import { useCMAClient } from './index';

const mockedCma: string | undefined = "mocked-cma";

// Parameters needed for function to run (wouldn't need these if mock implementation was working)
const mockedSdk = {
  cmaAdapter: "placholder",
  ids: {
    environment: "placeholder",
    space: "placeholder"
  }
}

jest.mock('./index', () => ({
  ...jest.requireActual('./index'),
  useSDK: () => mockedSdk
}));

// Throws "Cannot use import statement outside a module" when removed
jest.mock('./SDKProvider', () => ({
  SDKContext: {},
}));

jest.mock('contentful-management', () => {
  return {
    ...jest.requireActual('contentful-management'),
    createClient: () => mockedCma //calls the original function when I use mock implementation
  }
})

describe('useCMAClient', () => {
  test('should return cma client', () => {

    const { result } = renderHook(() => useCMAClient());

    expect(result.current).toBe(mockedCma);
  })
})
