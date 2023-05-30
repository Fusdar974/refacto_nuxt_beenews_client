import {defineStore} from 'pinia'
import {Ref} from "vue";

export const useAuthenticateStore = defineStore('authenticate', () => {
    const isAuthenticated: Ref<boolean> = ref(false)


    return{isAuthenticated}
})