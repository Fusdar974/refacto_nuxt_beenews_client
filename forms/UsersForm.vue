<template>
  <div>
    <h2> {{ titre }} </h2>
    <v-form v-if="selectedUser" :disabled="mode === SHOW">
      <v-text-field v-model="selectedUser.nom" type="text" label="nom"
                    :error-messages="v$.nom.$errors.map(e => e.$message)"
                    required
                    @input="v$.nom.$touch"
                    @blur="v$.nom.$touch"/>
      <v-text-field type="text" label="prenom" v-model="selectedUser.prenom"
                    :error-messages="v$.prenom.$errors.map(e => e.$message)"
                    required
                    @blur="v$.prenom.$touch"/>
      <v-text-field type="text" label="surnom" v-model="selectedUser.surnom"/>
      <v-text-field type="text" label="mail" v-model="selectedUser.mail" :error="erreurMail.value"
                    :error-messages="v$.mail.$errors.map(e => e.$message)"
                    required
                    @blur="v$.mail.$touch"/>
      <div v-if="mode === EDIT">
        <v-btn @click="demandeConfirmation" variant="outlined" color="primary">Envoyer nouveau mot de passe</v-btn>
        <v-btn @click="demandeConfirmationDefaut" variant="outlined" color="primary">Mot de passe par défaut</v-btn>
      </div>
      <h4>Profils</h4>
      <div v-for="(profil, index) in selectedUser.profils" :key="index">
        <v-checkbox
            :label="profil.nom"
            v-model="profil.isValid"
            color="indigo"
        ></v-checkbox>
      </div>
      <v-checkbox label="Compte désactivé"
                  v-model="selectedUser.isDesactive"
                  color="red"
      ></v-checkbox>
      <div>
        <v-btn v-if="mode === SHOW" color="primary" class="ma-1" variant="outlined" key="edit" @click="retourModifier">
          Modifier
        </v-btn>
        <v-btn v-if="mode === EDIT" color="primary" class="ma-1" variant="outlined" key="edit" @click="v$.$validate && modifier">Valider
        </v-btn>
        <v-btn v-if="mode === CREATE" color="primary" class="ma-1" variant="outlined" key="create" @click="v$.$validate && creer">Créer
        </v-btn>
        <v-btn color="primary" class="ma-1" variant="outlined" key="create" @click="fermer(null)">Fermer</v-btn>
      </div>
    </v-form>

    <historique-client v-if="userId" :user-id="userId" type="SOUM"></historique-client>
    <historique-client v-if="userId" :user-id="userId" type="POT"></historique-client>
    <ModalConfirmation v-model="open"
                       @confirmer="envoyerNouveauPwd"
                       titre="Envoyer nouveau mot de passe"
                       question="Voulez-vous envoyer un mot de passe ?"
    />
    <ModalConfirmation v-model="openDefault"
                       @confirmer="envoyerNouveauPwdDefaut"
                       titre="Remise à zéro du mot de passe"
                       question="Voulez-vous mettre le mot de passe par défaut ?"
    />
    <v-snackbar v-if="openSnack" v-model="openSnack" timeout="4000">
      <v-alert :type="severity">{{ messageSnack }}</v-alert>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">

import UserInterface from "~/interfaces/UserInterface";
import Fetch from "~/services/FetchService";
import PasswordChangeResponseInterface from "~/interfaces/PasswordChangeResponseInterface";
import ProfilInterface from "~/interfaces/ProfilInterface";
import profilInterface from "~/interfaces/ProfilInterface";
import UserResponseInterface from "~/interfaces/UserResponseInterface";
import ProfilsResponseInterface from "~/interfaces/ProfilsResponseInterface";
import {storeToRefs} from "pinia";
import {useSnackbarStore} from "~/stores/snackbarStore";
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import userInterface from "~/interfaces/UserInterface";



const SHOW = 'show'
const EDIT = 'edit';
const CREATE = 'create';
const selectedUser: Ref<UserInterface> = ref({} as userInterface)
const open: Ref<boolean> = ref(false)
const openDefault: Ref<boolean> = ref(false)
const openSnack: Ref<boolean> = ref(false)
const erreurMail: Ref<boolean> = ref(false)
const messageSnack: Ref<string> = ref("")
const mode: Ref<string> = ref("")
const titre: Ref<string> = ref("Aucun titre")
const severity: Ref<string> = ref("")
const profils: Ref<Array<ProfilInterface> | null> = ref(null)

const {open: snackbarStoreOpen, message: snackbarStoreMessage} = storeToRefs(useSnackbarStore())

const props = defineProps({
  userId: {type: String},
  action: {type: String, required: true},
})

const rules = {
  nom: {required}, // Matches state.firstName
  prenom: {required}, // Matches state.lastName
  mail: {required, email} // Matches state.contact.email
}

const v$ = useVuelidate(rules, selectedUser)
const fermer = (messageAfficher: string) => {
  if (messageAfficher) {
    snackbarStoreMessage.value = messageAfficher
    snackbarStoreOpen.value = true
    navigateTo(`/users`)
  }
  else{
    navigateTo('/users')
  }
}

const setUser = (userP: UserInterface, profilsP: ProfilsResponseInterface) => {
  const profilsPossede = userP!.profils || [];
  const profilsAfficher = profilsP.profils.map((item: profilInterface) => {
    item.isValid = typeof profilsPossede.find(item2 => item2._id === item._id) !== 'undefined';
    return item;
  })
  userP!.profils = profilsAfficher;
  selectedUser.value = userP
}

onBeforeMount(() => {
  let title: string;
  switch (props.action) {
    case 'show':
      title = "Informations client"
      mode.value = SHOW;
      break;
    case 'edit':
      title = "Modifier client"
      mode.value = EDIT;
      break;
    case 'add':
      title = "Ajouter client"
      mode.value = CREATE;
      break;
    default:
      title = "Informations client"
      mode.value = SHOW;
      break;
  }
  if (mode.value !== CREATE) {
    Fetch.requete({url: `/users/${props.userId}`, method: 'GET'}, (resultUser: UserResponseInterface) => {
      selectedUser.value = resultUser.user
    })
    Fetch.requete({url: `/users/profils`, method: 'POST'}, (profiles: ProfilsResponseInterface) => {
      if (selectedUser !== null) {
        setUser(selectedUser.value, profiles)
      }
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
    Fetch.requete({url: `/users/profils`, method: 'POST'}, (profiles: ProfilsResponseInterface) => {
      if (selectedUser !== null) {
        setUser(selectedUser.value, profiles)
      }
    })
  }
  titre.value = title
})

const retourModifier = () => {
  mode.value = EDIT
}

const handleClose = () => {
  open.value = false
}

const handleCloseDefaut = () => {
  openDefault.value = false
}

const handleCloseSnack = () => {
  openSnack.value = false
}

const demandeConfirmation = () => {
  open.value = true
}

const demandeConfirmationDefaut = () => {
  openDefault.value = true
  open.value = false
}

const creer = () => {
  if (selectedUser !== null) {
    const user = selectedUser.value;
    user!.profils = selectedUser.value!.profils.filter(item => item.isValid)
    Fetch.requete({url: '/users/create', method: 'POST', data: {user}}, () => {
      fermer('Création OK')

    });
  }
}

const modifier = () => {
  if (selectedUser !== null) {
    const user = selectedUser.value
    user!.profils = selectedUser.value!.profils.filter(item => item.isValid) /* ! ou ? */
    Fetch.requete({url: `/users/${selectedUser.value!._id}`, data: {user: user}, method: 'PUT'}, () => {
      fermer('Modification OK');
    });
  }

}

const envoyerNouveauPwdDefaut = () => {
  Fetch.requete({
    url: `/users/passwordDefault/${selectedUser.value!._id}`,
    method: 'POST',
  }, (reussite: PasswordChangeResponseInterface) => {

    if (reussite.data === 'ok') {
      severity.value = "success"
      open.value = false
      openDefault.value = false
      openSnack.value = true
      messageSnack.value = 'Mot de passe remis à zéro'
    }
  });
}

const envoyerNouveauPwd = () => {
  Fetch.requete({
    url: `/users/genererNewPwd/${selectedUser.value!._id}`,
    method: 'POST',
    data: {
      mail: selectedUser.value!.mail
    }
  }, (reussite: PasswordChangeResponseInterface) => {

    if (reussite.data === 'ok') {
      severity.value = "success"
      open.value = false
      openSnack.value = true
      messageSnack.value = 'Mot de passe remis à zéro'
    } else {
      severity.value = "error"
      erreurMail.value = true
      open.value = false
      openSnack.value = true
      messageSnack.value = 'Veuillez saisir une bonne adresse email'
    }
  });
}

</script>

<style scoped>

</style>