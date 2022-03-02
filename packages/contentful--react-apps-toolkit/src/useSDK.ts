import { KnownSDK } from '@contentful/app-sdk';
import { useContext } from 'react';
import { SDKContext } from './SDKProvider';

/**
 * A react hook providing the AppSdk.
 *  - The type of sdk varies depending on the location where it is used.
 *  - As it is depending on the context providing the sdk, the hook can only be used within the SDKProvider
 */
export function useSDK<SDK extends KnownSDK = KnownSDK>(): SDK {
  const { sdk } = useContext(SDKContext);

  if (!sdk) {
    throw new Error(
      'SDKContext not found. Make sure the useSDK hook is used inside the SDKProvider'
    );
  }

  return sdk as SDK;
}
