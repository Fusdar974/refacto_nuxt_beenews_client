<template>
  <div>
      <v-btn size="small"
             v-if="!enCoursDeConnexion"
             color="primary"
             prepend-icon="mdi:mdi-login"
             @click="saisirIdentifiant"
      >Se connecter</v-btn>
      <div v-else>Connexion en cours </div>
    <v-dialog v-model="openDialog"
              @close="handleClose"
              max-width="500px">
      <v-card>
        <v-card-title id="max-width-dialog-title"
                      class="text-center">
          Connexion à l'application
        </v-card-title>
        <v-divider/>
        <v-card-text>
          <v-form @submit="handleSubmit">
            <v-container>
              <v-row align="center"
                     justify="center">
                <v-col>
                  <v-text-field
                      v-model="email"
                      variant="outlined"
                      density="compact"
                      type="text"
                      label="email"
                      name="email"
                      @change="handleChange"
                      @keydown="keyPress"/>
                </v-col>
              </v-row>
              <v-row align="center"
                     justify="center">
                <v-col>
                  <v-text-field
                      v-model="password"
                      variant="outlined"
                      density="compact"
                      type="password"
                      label="Password"
                      name="password"
                      @change="handleChange"
                      @keydown="keyPress"/>
                </v-col>
              </v-row>
              <v-row v-if="message"
                     align="center"
                     justify="center">
                <v-col>
                  <v-alert color="error">{{ message }}</v-alert>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-divider/>
        <v-card-actions class="justify-center">
          <v-btn-group>
            <v-btn @click="handleSubmit"
                   color="secondary"
                   class="mt-2">Consommer</v-btn>
            <v-btn @click="handleClose"
                   variant="outlined"
                   color="primary"
                   class="mt-2 ma-0">Annuler</v-btn>
          </v-btn-group>

        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import IdentificationInterface from "~/interfaces/userInterfaces/IdentificationInterface";
import Fetch from "~/services/FetchService";
import {useAuthenticateStore} from "~/stores/authenticateStore";
import LoginResponseInterface from "~/interfaces/LoginResponseInterface";
import {useRouter} from "#app";
import {Ref} from "vue";

const email: Ref<string> = ref('')
const password: Ref<string> = ref('')
const enCoursDeConnexion: Ref<boolean> = ref(false)
const openDialog: Ref<boolean> = ref(false)
const message: Ref<string> = ref('')

const {login: submit} = useAuthenticateStore()

const connexionServeur = () =>{
  const identification: IdentificationInterface = {
    email: email.value,
    password: password.value,
  }
  const reussite = (retour: LoginResponseInterface) => {
    enCoursDeConnexion.value = false
    if (retour) {
      localStorage.setItem("token", retour.bearer)
      localStorage.setItem("rights", JSON.stringify(retour.rights))
      useRouter().push('/')
      submit()
    } else message.value = "Email/Password incorrect"
  }
  const echec = (e: Error) => {
      message.value = "Email/Password incorrect"
  }
  Fetch.requete({url: "/auth/login", data: identification}, reussite, echec)
}

interface TextField {
  name: string,
  value: string,
}

const handleChange = (e: Event) => {
  const textField: TextField = <Object> e.target as TextField
  if(textField.name === 'email'){
    email.value = textField.value
  }else password.value = textField.value
  message.value = ''
}

const handleSubmit = (e: Event) => {
  e.preventDefault()
  enCoursDeConnexion.value = true
  connexionServeur()
}

const handleClose = () => {
  openDialog.value = false
}

const saisirIdentifiant = () => {
  openDialog.value = true
}

const keyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSubmit(e);
  }
}

</script>

<style scoped>
.couleur-or{
  background-color: rgba(255, 206, 28, 0.8);
  color: black;
}

.couleur-or:hover {
  background-color: rgba(255,206,28,1)
}

.image {
  position: relative;
  height: 200px;
  width: 200px;
  /*background-image: url(v-bind(imageAbeille));*/
  background-size: 200px 200px;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.2;
}

</style>