import {defineStore} from 'pinia'

export const useSnackbarStore = defineStore('snackbar', () => {
    const open = ref<boolean>(false)
    const message = ref<string>("it's a me luigi")
    const couleur = ref<string>("success")

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