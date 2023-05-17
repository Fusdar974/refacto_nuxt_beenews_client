import { defineStore } from 'pinia'
import {Ref} from "vue";

export const useMenuStore = defineStore('menu', () => {
    const titleAppBar: Ref<string> = ref('Accueil')

    return{titleAppBar}
})