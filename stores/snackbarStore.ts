import {defineStore} from 'pinia'
import {Ref} from "vue";

export const useSnackbarStore = defineStore('snackbar', () => {
    const open: Ref<boolean> = ref(false)
    const message: Ref<string> = ref("it's a me luigi")
    const couleur: Ref<string> = ref("success")

    /**
     * Permet d'afficher un message dans le snackbar de App.js
     * @param messageToPut
     * @param couleurOfMessage
     */
    const putSnackBarMessage = (messageToPut: string, couleurOfMessage: string = 'success') => {
        open.value = true
        message.value = messageToPut
        couleur.value = couleurOfMessage
    }

    return {open, message, couleur, putSnackBarMessage}
})