import {defineNuxtConfig} from 'nuxt/config'

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
        vue: {
            script: {
                defineModel: true,
                propsDestructure: true,
            },
        }
    },
    modules: [
        '@vite-pwa/nuxt',
        '@pinia/nuxt'
    ],
    pinia: {
        autoImports: [
            // automatically imports `defineStore`
            'defineStore', // import { defineStore } from 'pinia'
            ['defineStore', 'definePiniaStore'], // import { defineStore as definePiniaStore } from 'pinia'
        ]
    },
    pwa: {
        manifest: {
            name: 'Beenews',
            short_name: 'Beenews',
            description: 'Application de l\'association Beenews',
            icons: [
                {
                    src: 'icons/icon_48x48.png',
                    sizes: '48x48',
                    type: 'image/png',
                },
                {
                    src: 'icons/icon_72x72.png',
                    sizes: '72x72',
                    type: 'image/png',
                },
                {
                    src: 'icons/icon_96x96.png',
                    sizes: '96x96',
                    type: 'image/png',
                },
                {
                    src: 'icons/icon_144x144.png',
                    sizes: '144x144',
                    type: 'image/png',
                },
                {
                    src: 'icons/icon_192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: 'icons/icon_512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                }
            ]
        },
        workbox: {
            navigateFallback: '/',
        },
        devOptions: {
            enabled: true,
            type: 'module',
        }
    }
})
