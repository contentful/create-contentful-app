import React, { FC, ReactElement, useRef } from 'react';
import { init, KnownSDK } from '@contentful/app-sdk';

export const SDKContext = React.createContext<{ sdk: KnownSDK | null }>({ sdk: null });

interface SDKProviderProps {
  loading?: ReactElement;
}

const DELAY_TIMEOUT = 4 * 1000;

/**
 * The Component providing the AppSdk, the useSDK hook can only be used within this Provider
 * @param props.loading an optional loading element that gets rendered while initializing the app
 */
export const SDKProvider: FC<SDKProviderProps> = (props) => {
  const [sdk, setSDK] = React.useState<KnownSDK | undefined>();
  const timeout = useRef<number | undefined>();

  const clearPossibleTimeout = () => {
    if (timeout.current !== undefined) {
      window.clearTimeout(timeout.current);
    }
  };

  const onInitSuccess = (sdk: KnownSDK) => {
    setSDK(sdk);
    clearPossibleTimeout();
  };

  React.useEffect(() => {
    timeout.current = window.setTimeout(() => {
      console.warn(
        'Your app is taking longer than expected to initialize. If this is not fixed, let us know: https://github.com/contentful/ui-extensions-sdk/issues'
      );
    }, DELAY_TIMEOUT);
    init(onInitSuccess);
    return () => clearPossibleTimeout();
  }, []);

  if (!sdk) {
    if (props.loading) {
      return props.loading;
    }
    return null;
  }

  return <SDKContext.Provider value={{ sdk }}>{props.children}</SDKContext.Provider>;
};
