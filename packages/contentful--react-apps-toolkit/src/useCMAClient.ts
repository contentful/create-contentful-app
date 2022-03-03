import { createClient, PlainClientAPI } from "contentful-management";
import { useEffect, useState } from "react";
import { useSDK } from "./index";

/**
 * A react hook returning the plain client CMA.
 *  - Depends on Apps SDK.
 *  - Must be called in the SDKProvider component (./SDKProvider). If called outside the provider, will throw error. useSDK hook called on line 12 handles error.
 */

export function useCMAClient(): PlainClientAPI | undefined {
  const sdk = useSDK();
  const [cma, setCMA] = useState<PlainClientAPI | undefined>(undefined);

  useEffect(() => {
    // Do we need this if? useSDK will either throw an error when not wrapped in the provider, or be defined.
    // if (!sdk) {
    //   return;
    // }

    const client = createClient(
      { apiAdapter: sdk.cmaAdapter },
      {
        type: "plain",
        defaults: {
          environmentId: sdk.ids.environment,
          spaceId: sdk.ids.space,
        },
      }
    );

    setCMA(client);
  }, [sdk]);

  return cma;
}
