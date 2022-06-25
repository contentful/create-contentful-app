import {
  DialogExtensionSDK,
  FieldExtensionSDK,
  SidebarExtensionSDK,
  WindowAPI,
} from '@contentful/app-sdk';
import { useEffect } from 'react';
import { useSDK } from './useSDK';

/**
 * Starts/stops the auto resizer when the component is mounted/unmounted.
 * Must be wrapped by SDKProvider.
 * Can only be used when app is rendered in field, sidebar or dialog locations.
 * @param {Object} params - Options to be passed to auto resizer
 * @param {Boolean} params.absoluteElements - Defines if auto resizer should consider absolute elements
 */
export function useAutoResizer(...params: Parameters<WindowAPI['startAutoResizer']>): void {
  const sdk = useSDK<DialogExtensionSDK | FieldExtensionSDK | SidebarExtensionSDK>();

  useEffect(() => {
    if (typeof sdk.window === 'undefined') {
      throw new Error(
        'useAutoResizer is unavailable at this location, it can only be rendered in field, sidebar and dialog locations.'
      );
    }

    sdk.window.startAutoResizer(...params);
    return sdk.window.stopAutoResizer;
  }, [sdk.window]);
}
