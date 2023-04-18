import {createVuetify} from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import { aliases, fa } from 'vuetify/iconsets/fa'
import { mdi } from 'vuetify/iconsets/mdi'

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        components,
        directives,
        ssr:true,
        icons: {
            defaultSet: 'fa',
            aliases,
            sets: {
                fa,
                mdi,
            }
        },
    })
    nuxtApp.vueApp.use(vuetify)
})