import { FieldExtensionSDK } from '@contentful/app-sdk';
import { useEffect } from 'react';
import { useSDK } from './useSDK';

/**
 * Invokes the FieldExtensionSDK autoResizer.
 * Must be wrapped by SDKProvider.
 * Can only be used when app is rendered in field, sidebar or entry editor location.
 */
export function useAutoResizer(): void {
  const sdk = useSDK<FieldExtensionSDK>();

  useEffect(() => {
    sdk.window.startAutoResizer();
    return sdk.window.stopAutoResizer;
  }, [sdk.window]);
}
