<template>
    <div>
        <v-form v-if="selectedUser" :disabled="mode === SHOW" class="ma-3">
            <v-text-field v-model="selectedUser.nom" type="text" label="nom"
                          :error-messages="v$.nom.$errors.map(e => e.$message) as string[]"
                          required
                          @input="v$.nom.$touch"
                          @blur="v$.nom.$touch"/>
            <v-text-field v-model="selectedUser.prenom" type="text" label="prenom"
                          :error-messages="v$.prenom.$errors.map(e => e.$message) as string[]"
                          required
                          @blur="v$.prenom.$touch"/>
            <v-text-field v-model="selectedUser.surnom" type="text" label="surnom"/>
            <v-text-field v-model="selectedUser.mail" type="text" label="mail" :error="erreurMail.value"
                          :error-messages="v$.mail.$errors.map(e => e.$message) as string[]"
                          required
                          @blur="v$.mail.$touch"/>
            <div v-if="mode === EDIT">
                <v-btn @click="openConfirmationDialog = true" variant="outlined" color="primary">Envoyer nouveau mot de
                    passe
                </v-btn>
                <v-btn @click="handleDemandeConfirmationDefaut" variant="outlined" color="primary">Mot de passe par
                    défaut
                </v-btn>
            </div>
            <h4>Profils</h4>
            <div v-for="(profil, index) in profils" :key="index">
                <v-checkbox
                        v-model="selectedUser.profils"
                        :label="profil.nom"
                        :value="profil"
                        color="indigo"
                ></v-checkbox>
            </div>
            <v-checkbox label="Compte désactivé"
                        v-model="selectedUser.isDesactive"
                        color="red"
            ></v-checkbox>
            <div>
                <v-btn v-if="mode === SHOW" color="primary" class="ma-1" variant="outlined" key="edit"
                       @click="mode = EDIT">
                    Modifier
                </v-btn>
                <v-btn v-if="mode === EDIT" color="primary" class="ma-1" variant="outlined" key="edit"
                       @click="modifier">Valider
                </v-btn>
                <v-btn v-if="mode === CREATE" color="primary" class="ma-1" variant="outlined" key="create"
                       @click="creer">Créer
                </v-btn>
                <v-btn color="primary" class="ma-1" variant="outlined" key="create" @click="navigateTo('/users')">
                    Fermer
                </v-btn>
            </div>
        </v-form>

        <historique-client v-if="userId" :user-id="userId" type="SOUM"></historique-client>
        <historique-client v-if="userId" :user-id="userId" type="POT"></historique-client>
        <ModalConfirmation v-model="openConfirmationDialog"
                           @confirmer="envoyerNouveauPwd"
                           titre="Envoyer nouveau mot de passe"
                           question="Voulez-vous envoyer un mot de passe ?"
        />
        <ModalConfirmation v-model="openConfirmationDefaultDialog"
                           @confirmer="envoyerNouveauPwdDefaut"
                           titre="Remise à zéro du mot de passe"
                           question="Voulez-vous mettre le mot de passe par défaut ?"
        />
    </div>
</template>

<script setup lang="ts">

import UserInterface from "~/interfaces/UserInterface"
import Fetch from "~/services/FetchService"
import PasswordChangeResponseInterface from "~/interfaces/PasswordChangeResponseInterface"
import ProfilInterface from "~/interfaces/ProfilInterface"
import UserResponseInterface from "~/interfaces/UserResponseInterface"
import ProfilsResponseInterface from "~/interfaces/ProfilsResponseInterface"
import {storeToRefs} from "pinia"
import {useSnackbarStore} from "~/stores/snackbarStore"
import {useVuelidate} from '@vuelidate/core'
import {email, required} from '@vuelidate/validators'
import {useMenuStore} from "~/stores/menuStore";

const SHOW = 'show'
const EDIT = 'edit'
const CREATE = 'create'

/**
 * userId : l'id de l'utilisateur à consulter/modifier
 * action : string qui détermine le mode du UserForm
 */
const props = defineProps({
    userId: {type: String},
    action: {type: String, required: true},
})

const selectedUser: Ref<UserInterface> = ref({} as UserInterface)
const openConfirmationDialog: Ref<boolean> = ref(false)
const openConfirmationDefaultDialog: Ref<boolean> = ref(false)
const erreurMail: Ref<boolean> = ref(false)
const mode: Ref<string> = ref(props.action)
const profils: Ref<Array<ProfilInterface>> = ref([] as Array<ProfilInterface>)

const {putSnackBarMessage} = useSnackbarStore()
const {titleAppBar} = storeToRefs(useMenuStore())

const rules = {
    nom: {required}, // champs nom obligatoire
    prenom: {required}, // champs prenom obligatoire
    mail: {required, email} // champs mail obligatoire et de format email
}

const v$ = useVuelidate(rules, selectedUser)//valide si les propriétées de selectedUser respectent les règles

// détermine le titre à afficher dans le appBar
titleAppBar.value = props.action === 'edit' && "Modification du client"
    || props.action === 'add' && "Ajout d'un client"
    || "Informations du client"

/**
 * avant que la page soit montée dans le DOM
 * si le mode n'est pas en création, charge l'utilisateur sélectionné
 * sinon, créé un utilisateur vide
 */
onBeforeMount(() => {
    if (mode.value !== CREATE) {
        Fetch.requete({url: `/users/${props.userId}`, method: 'GET'}, (resultUser: UserResponseInterface) => {
            selectedUser.value = resultUser.user
        })
    } else {
        selectedUser.value = {
            isDesactive: false,
            nom: "",
            prenom: "",
            surnom: "",
            profils: [],
            mail: "",
            compte: 0,
            password: "",
            supprimable: true,
        }
    }
    Fetch.requete({url: `/users/profils`, method: 'POST'}, (resultProfils: ProfilsResponseInterface) => {
        if (selectedUser !== null) {
            profils.value = resultProfils.profils.map(profil => ({...profil, isValid: true}))
        }
    },)
})

/**
 * ferme le formulaire et renvoie sur la page des clients, si un message est passé en paramètre
 * celui-ci est stocké dans le store ainsi qu'un booléen qui permet d'activer le snackbar de la page principale est afficher le message
 * @param messageAfficher message à afficher
 */
const fermer = (messageAfficher: string | undefined) => {
    if (messageAfficher) {
        putSnackBarMessage(messageAfficher)
    }
    navigateTo('/users')
}

/**
 * Ouvre le dialog de confirmation de mot de passe
 */
const handleDemandeConfirmationDefaut = () => {
    openConfirmationDefaultDialog.value = true
    openConfirmationDialog.value = false
}

/**
 * Après vérification du formulaire
 * Envoie une requete de création d'utilisateur dans le back
 * et ferme le formulaire en cas de réussite
 */
const creer = () => {
    v$.value.$validate()
        .then(result => {
                if (result && selectedUser.value !== null) {
                    Fetch.requete({url: '/users/create', method: 'POST', data: {user: selectedUser.value}}, () => {
                        fermer('Création OK')
                    })
                }
            }
        )
}

/**
 * Après vérification du formulaire
 * Envoie une requete de modification d'utilisateur dans le back
 * et ferme le formulaire en cas de réussite
 */
const modifier = () => {
    v$.value.$validate()
        .then(result => {
            if (result && selectedUser.value !== null) {
                Fetch.requete({
                    url: `/users/${selectedUser.value._id}`,
                    data: {user: selectedUser.value},
                    method: 'PUT'
                }, () => {
                    fermer('Modification OK')
                })
            }
        })
}

/**
 * Envoie une requete de modification de mot de passe avec celui par défaut dans le back,
 * ferme le dialog et active le snackbar du form en cas de réussite
 */
const envoyerNouveauPwdDefaut = () => {
    Fetch.requete({
        url: `/users/passwordDefault/${selectedUser.value!._id}`,
        method: 'POST',
    }, (reussite: PasswordChangeResponseInterface) => {

        if (reussite.data === 'ok') {
            openConfirmationDialog.value = false
            openConfirmationDefaultDialog.value = false
            putSnackBarMessage('Mot de passe remis à zéro')
        }
    })
}

/**
 * Envoie une requete de modification de mot de passe dans le back,
 * ferme le dialog et active le snackbar du form
 */
const envoyerNouveauPwd = () => {
    Fetch.requete({
        url: `/users/genererNewPwd/${selectedUser.value!._id}`,
        method: 'POST',
        data: {
            mail: selectedUser.value!.mail
        }
    }, (reussite: PasswordChangeResponseInterface) => {

        if (reussite.data === 'ok') {
            openConfirmationDialog.value = false
            putSnackBarMessage('Mot de passe remis à zéro')
        } else {
            erreurMail.value = true
            openConfirmationDialog.value = false
            putSnackBarMessage(
                'Veuillez saisir une bonne adresse email',
                'error')
        }
    })
}

</script>

<style scoped>

</style>