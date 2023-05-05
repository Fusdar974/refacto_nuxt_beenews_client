import { defineStore } from 'pinia'
import {Ref} from "vue";

export const useSnackbarStore = defineStore('snackbar', () => {
    const open: Ref<boolean> = ref(false)
    const message: Ref<string> = ref("it's a me luigi")
    return{open, message}
})