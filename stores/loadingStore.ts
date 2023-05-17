import { defineStore } from 'pinia'
import {Ref} from "vue";

export const useLoadingStore = defineStore('loading', () => {
    const isLoading: Ref<boolean> = ref(false)

    return{isLoading}
})