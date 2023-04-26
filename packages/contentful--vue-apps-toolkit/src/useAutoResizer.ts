import vue from 'vue'
import {
    DialogExtensionSDK,
    FieldExtensionSDK,
    SidebarExtensionSDK,
    WindowAPI,
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

export function useAutoResizer() {
    console.log('yes')
}