import { createClient, PlainClientAPI } from 'contentful-management';
// @ts-ignore
import type { CMAClient } from '@contentful/app-sdk';
import { useMemo } from 'react';
import { useSDK } from './useSDK';

// `CMAClient` is only available from App SDK v4.14.0, but we want to keep compatible with old versions
// If `CMAClient` is available, `useCMA` should return `CMAClient`
// If `CMAClient` is not available, `useCMA` should return `PlainClientAPI`
// Source: https://stackoverflow.com/a/61625831/17270873
// This can be removed once we bump the peer dependency to a later version
type UseCMAReturnValue = (CMAClient extends never ? true : false) extends false
  ? CMAClient
  : PlainClientAPI;


/** 
 * @deprecated if on App SDK v4.17 or greater, use `sdk.cma` insead
 * 
 * React hook returning a CMA plain client instance.
 * Must be used in the `SDKProvider` component. Will throw error, if called outside of `SDKProvider`.
 */
export function useCMA(): UseCMAReturnValue {
  const sdk = useSDK();

  const cma = useMemo(() => {
    return createClient(
      { apiAdapter: sdk.cmaAdapter },
      {
        type: 'plain',
        defaults: {
          environmentId: sdk.ids.environmentAlias ?? sdk.ids.environment,
          spaceId: sdk.ids.space,
          organizationId: sdk.ids.organization,
        },
      }
    );
  }, [sdk]);

  return cma;
}
