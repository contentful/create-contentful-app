import { onMounted, onUnmounted } from 'vue';
import {
    DialogExtensionSDK,
    FieldExtensionSDK,
    SidebarExtensionSDK,
    WindowAPI,
    KnownAppSDK,
    init as initContentfulApp,
    SidebarAppSDK,
    FieldAppSDK,
    DialogAppSDK
} from '@contentful/app-sdk';


/*
https://learnvue.co/articles/vue-3-plugins-provide-and-inject
https://vuejs.org/guide/components/provide-inject.html

AC:
We will need to return a provider that can be used in a Vue app like so: 
import { useAutoResizer } from '@contentful/vue-apps-sdk
import { createApp } from 'vue';

const app = createApp('#root');

app.provide(useAutoResizer)
*/

export function useAutoResizer(...params: Parameters<WindowAPI['startAutoResizer']>) {

    initContentfulApp((sdk: SidebarAppSDK | FieldAppSDK | DialogAppSDK) => {

        onMounted(() => {
            if (typeof sdk === 'undefined') {
                throw new Error(
                    'useAutoResizer is unavailable at this location, it can only be rendered in field, sidebar and dialog locations.'
                );
            }

            sdk.window.startAutoResizer(...params);
        });

        onUnmounted(() => {
            sdk.window.stopAutoResizer();
        });
    });
}