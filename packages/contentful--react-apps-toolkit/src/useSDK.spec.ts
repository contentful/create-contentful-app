import { renderHook, act } from '@testing-library/react-hooks';
import { useSDK } from './index';
import ShallowRenderer from 'react-test-renderer/shallow';
import React from 'react';

let realUseContext: any;
let useContextMock: any;
// Setup mock
beforeEach(() => {
  realUseContext = React.useContext;
  useContextMock = React.useContext = jest.fn().mockReturnValue({ sdk: 'mocked-sdk' });
});
// Cleanup mock
afterEach(() => {
  React.useContext = realUseContext;
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
    useContextMock = React.useContext = jest.fn().mockReturnValue({ sdk: undefined });
    const { result } = renderHook(() => useSDK());

    expect(() => {
      expect(result.current).not.toBe(undefined);
    }).toThrow();
  });
});
