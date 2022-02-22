import { renderHook, act } from '@testing-library/react-hooks';
import { useHelloWorld } from './index';

test('should increment counter', () => {
  const { result } = renderHook(() => useHelloWorld());

  expect(result.current).toBe('hello world');
});
