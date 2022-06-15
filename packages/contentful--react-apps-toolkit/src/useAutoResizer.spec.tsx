import { renderHook } from '@testing-library/react-hooks';
import { useAutoResizer } from './useAutoResizer';
import { useSDK } from './useSDK';

const mockSDK = {
  window: {
    startAutoResizer: jest.fn(),
    stopAutoResizer: jest.fn(),
  },
};

jest.mock('./useSDK', () => ({
  ...jest.requireActual('./useSDK'),
  useSDK: jest.fn(),
}));

const useSDKMock = useSDK as jest.MockedFn<typeof useSDK>;

beforeEach(() => {
  jest.resetAllMocks();
  mockSDK.window.startAutoResizer.mockImplementationOnce(() => () => {});
  mockSDK.window.stopAutoResizer.mockImplementationOnce(() => () => {});
});

describe('useAutoResizer', () => {
  beforeEach(() => {
    // @ts-expect-error
    useSDKMock.mockImplementation(() => mockSDK);
  });

  it('should invoke the field SDK autoResizer start and stop methods', () => {
    const hook = renderHook(useAutoResizer);

    expect(mockSDK.window.startAutoResizer).toBeCalledTimes(1);
    expect(mockSDK.window.stopAutoResizer).toBeCalledTimes(0);

    hook.unmount();

    expect(mockSDK.window.startAutoResizer).toBeCalledTimes(1);
    expect(mockSDK.window.stopAutoResizer).toBeCalledTimes(1);
  });
});
