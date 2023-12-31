import {createVuetify} from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import {aliases, fa} from 'vuetify/iconsets/fa'
import {mdi} from 'vuetify/iconsets/mdi'

const BeeNewsLightTheme = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: '#3f51b5',
        'primary-darken-1': '#3700B3',
        secondary: '#ffce1c',
        'secondary-darken-1': '#CE9e0c',
        error: '#B00020',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
    }
}

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        components,
        directives,
        ssr:true,
        theme:{
            defaultTheme: 'BeeNewsLightTheme',
            themes: {
                BeeNewsLightTheme,
            }
        },
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