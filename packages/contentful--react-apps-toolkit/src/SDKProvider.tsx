import { init, KnownSDK } from '@contentful/app-sdk';
import { createContext, FC, PropsWithChildren, ReactElement, useEffect, useState } from 'react';

export const SDKContext = createContext<{ sdk: KnownSDK | null }>({ sdk: null });

interface SDKProviderProps {
  loading?: ReactElement;
}

const DELAY_TIMEOUT = 4 * 1000;

/**
 * The Component providing the AppSdk, the useSDK hook can only be used within this Provider
 * @param props.loading an optional loading element that gets rendered while initializing the app
 */
export const SDKProvider: FC<PropsWithChildren<SDKProviderProps>> = (props) => {
  const [sdk, setSDK] = useState<KnownSDK | undefined>();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      console.warn(
        "Your app is taking longer than expected to initialize. If you think this is an error with Contentful's App SDK, let us know: https://github.com/contentful/ui-extensions-sdk/issues"
      );
    }, DELAY_TIMEOUT);
    init((sdk: KnownSDK) => {
      setSDK(sdk);
      window.clearTimeout(timeout);
    });
    return () => window.clearTimeout(timeout);
  }, []);

  if (!sdk) {
    if (props.loading) {
      return props.loading;
    }
    return null;
  }

  return <SDKContext.Provider value={{ sdk }}>{props.children}</SDKContext.Provider>;
};
