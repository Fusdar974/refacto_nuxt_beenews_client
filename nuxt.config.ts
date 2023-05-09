import { defineNuxtConfig } from 'nuxt/config'
import vuetify from 'vite-plugin-vuetify'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
// @ts-ignore
export default defineNuxtConfig({
    // @ts-ignore
    css: [
        'vuetify/styles',
        '@mdi/font/css/materialdesignicons.min.css',
        '@fortawesome/fontawesome-free/css/all.css',
        '@/assets/css/main.scss',], // vuetify ships precompiled css, no need to import sass
    build: {
        transpile: ['vuetify'],
    },
    vite: {
        // @ts-ignore
        // curently this will lead to a type error, but hopefully will be fixed soon #justBetaThings
        ssr: {
            noExternal: ['vuetify'], // add the vuetify vite plugin
        },
    },
    modules: [
        '@pinia/nuxt',
        // @ts-ignore
        // this adds the vuetify vite plugin
        // also produces type errors in the current beta release
        async (options, nuxt) => { nuxt.hooks.hook('vite:extendConfig', config => config.plugins.push(vuetify()))}
    ],
    buildModules: [
        '@nuxtjs/composition-api/module',
        ['@pinia/nuxt'],
    ],
    pinia:{
        autoImports:[
            // automatically imports `defineStore`
            'defineStore', // import { defineStore } from 'pinia'
            ['defineStore', 'definePiniaStore'], // import { defineStore as definePiniaStore } from 'pinia'
        ]
    }
})