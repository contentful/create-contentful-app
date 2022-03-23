import { createClient, PlainClientAPI } from 'contentful-management';
import { useMemo } from 'react';
import { useSDK } from './useSDK';

/**
 * React hook returning a CMA plain client instance.
 * Must be used in the `SDKProvider` component. Will throw error, if called outside of `SDKProvider`.
 */
export function useCMA(): PlainClientAPI {
  const sdk = useSDK();

  const cma = useMemo(() => {
    return createClient(
      { apiAdapter: sdk.cmaAdapter },
      {
        type: 'plain',
        defaults: {
          environmentId: sdk.ids.environment,
          spaceId: sdk.ids.space,
        },
      }
    );
  }, [sdk]);

  return cma;
}
