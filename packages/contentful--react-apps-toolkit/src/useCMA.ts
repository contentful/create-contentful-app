import { createClient } from 'contentful-management';
import { CMAClient } from '@contentful/app-sdk';
import { useMemo } from 'react';
import { useSDK } from './useSDK';

/**
 * React hook returning a CMA plain client instance.
 * Must be used in the `SDKProvider` component. Will throw error, if called outside of `SDKProvider`.
 */
export function useCMA() {
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
    ) as CMAClient;
  }, [sdk]);

  return cma;
}
