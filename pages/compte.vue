<template>
  <private-route>
    <div class="imageFond"></div>
    <v-container v-if="user" class="ma-1">
      <v-row v-if="isAuthenticated">
        <v-col cols="12" class="text-center">
          <h3>Il te reste {{ user.wallet }} BN(s) sur ton compte.</h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-container v-if="changerMotDePasse" class="ma-1">
            <v-col sm="12" md="7">
              <v-text-field v-model="password"
                            density="compact"
                            type="password"
                            label="Ancien mot de passe"
                            name="password"/>
            </v-col>
            <v-col sm="12" md="7">
              <v-text-field v-model="newpassword"
                            density="compact"
                            type="password"
                            :error="errorpassword as boolean"
                            label="Nouveau mot de passe"
                            name="newpassword"/>
            </v-col>
            <v-col sm="12" md="7">
              <v-text-field v-model="confirmpassword"
                            density="compact"
                            type="password"
                            :error="errorpassword as boolean"
                            label="Confirmer nouveau mot de passe"
                            name="confirmpassword"/>
            </v-col>
            <v-col sm="12" md="7">
              <v-btn-group density="compact">
                <v-btn density="compact" class="couleur-or" @click="valider">Valider</v-btn>
                <v-btn density="compact" variant="outlined" color="primary"
                       @click="changerMotDePasse = !changerMotDePasse">Annuler
                </v-btn>
              </v-btn-group>
            </v-col>
            <v-col v-if="message" sm="12" md="7">
              <v-alert icon="mdi:mdi-alert-circle-outline" type="error"> {{ message }}</v-alert>
            </v-col>
          </v-container>
          <v-btn v-if="!changerMotDePasse"
                 color="primary"
                 @click="changerMotDePasse = !changerMotDePasse">Changer mot de passe
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <historique-client v-if="user" :userId="user._id"/>
  </private-route>
</template>

<script setup lang="ts">

import Fetch from "~/services/FetchService";
import UserInterface from "~/interfaces/userInterfaces/UserInterface";
import {onMounted} from "#imports";
import PrivateRoute from "~/components/PrivateRoute.vue";
import PasswordChangeResponseInterface from "~/interfaces/userInterfaces/PasswordChangeResponseInterface";
import HistoriqueClient from "~/components/HistoriqueClient.vue";
import {storeToRefs} from "pinia";
import {useMenuStore} from "~/stores/menuStore";
import {useAuthenticateStore} from "~/stores/authenticateStore";

const {isAuthenticated} = storeToRefs(useAuthenticateStore())
const user: Ref<UserInterface> = ref({} as UserInterface)
const changerMotDePasse: Ref<boolean> = ref(false)
const password: Ref<string> = ref('')
const newpassword: Ref<string> = ref('')
const confirmpassword: Ref<string> = ref('')
const errorpassword: Ref<boolean> = ref(false)
const message: Ref<string> = ref('')

const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = 'Mon Compte'

const majUser = (id: string | null) => {
    if (typeof id !== "undefined" && id !== "" && id) {
        Fetch.requete(
            {
                url: `/users/${id}`,
                method: 'GET'
            },
            (resultUser: UserInterface ) => {
                user.value = resultUser
            })
    }
}

onMounted(() => {
  majUser(localStorage.getItem('idCompte'))
})

// modification? v-model?

const valider = () => {
  const correctPassword = password.value !== newpassword.value && newpassword.value === confirmpassword.value && newpassword.value !== ""
  if (user.value && correctPassword) {
    Fetch.requete({
      url: `/users/changepwd/${user.value._id}`, method: 'POST', data: {
        password: password.value,
        newpassword: newpassword.value
      }
    }, (reponse: PasswordChangeResponseInterface) => {
      if (reponse.data === 'nok') {
        changerMotDePasse.value = true
        errorpassword.value = false
        message.value = reponse.err || ''
      } else {
        password.value = ''
        newpassword.value = ''
        confirmpassword.value = ''
        changerMotDePasse.value = false
        errorpassword.value = false
      }
    })
  } else {
    changerMotDePasse.value = true
    errorpassword.value = false
    message.value = password.value === "" && "Veuillez renseigner votre mot de passe actuel"
        || newpassword.value === "" && "Veuillez renseigner votre nouveau mot de passe"
        || confirmpassword.value === "" && "Veuillez renseigner la confirmation de votre nouveau mot de passe"
        || newpassword.value !== confirmpassword.value && "Les mots de passe ne sont pas identiques."
        || newpassword.value === password.value && "Votre nouveau mot de passe doit être différent de l'ancien."
        || ''
  }
}

</script>

<style scoped>
.couleur-or {
  background-color: rgba(255, 206, 28, 0.8);
  color: black;
}

.couleur-or:hover {
  background-color: rgba(255, 206, 28, 1)
}

</style>
