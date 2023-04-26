import { reactive } from 'vue'
import { init } from '@contentful/app-sdk'
import { KnownAppSDK } from '@contentful/app-sdk';


export async function useSDK(): Promise<KnownAppSDK> {
    let data = reactive({ sdk: {} });

    const SDKData = new Promise(async (resolve) => {
        return init((sdk: KnownAppSDK) => {
            data.sdk = sdk;
            resolve(sdk);
        });
    });
    await SDKData;
    return <KnownAppSDK>data.sdk;
}