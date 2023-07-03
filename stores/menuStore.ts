import {defineStore} from 'pinia'

export const useMenuStore = defineStore('menu', () => {
    const titleAppBar = ref<string>('Accueil')

    return{titleAppBar}
})