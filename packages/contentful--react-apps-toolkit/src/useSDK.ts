import { KnownSDK } from '@contentful/app-sdk';
import { useContext } from 'react';
import { SDKContext } from './SDKProvider';

export function useSDK<SDK extends KnownSDK = KnownSDK>(): SDK {
  const { sdk } = useContext(SDKContext);

  if (!sdk) {
    throw new Error(
      'SDKContext not found. Make sure the useSDK hook is used inside the SDKProvider'
    );
  }

  return sdk as SDK;
}
