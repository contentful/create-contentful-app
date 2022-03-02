import React, { FC, ReactElement } from 'react';
import { init, KnownSDK } from '@contentful/app-sdk';

export const SDKContext = React.createContext<{ sdk: KnownSDK | null }>({ sdk: null });

interface SDKProviderProps {
  loading?: ReactElement;
}

/**
 * The Component providing the AppSdk, the useSDK hook can only be used within this Provider
 * @param props
 * @constructor
 */
export const SDKProvider: FC<SDKProviderProps> = (props) => {
  const [sdk, setSDK] = React.useState<KnownSDK | undefined>();

  React.useEffect(() => {
    init(setSDK);
  }, []);

  if (!sdk) {
    if (props.loading) {
      return props.loading;
    }
    return null;
  }

  return <SDKContext.Provider value={{ sdk }}>{props.children}</SDKContext.Provider>;
};
