<template>
    <PrivateRoute>
        <div class="imageFond"></div>
        <v-container class="ma-1">
            <v-row v-if="isAuthenticated">
                <v-col cols="12" class="text-center">
                    <h2>Bonjour {{ user.name }} {{ user.firstname }}, tu as {{ user.wallet }} BN(s) sur ton compte.</h2>
                </v-col>
                <v-col cols="12" class="text-center">
                    <h3 class="texteHumourMylene">
                        {{ messageHumourMylene }}
                    </h3>
                </v-col>
            </v-row>
        </v-container>
    </PrivateRoute>
</template>

<script setup lang="ts">
import PrivateRoute from "~/components/PrivateRoute.vue";
import UserInterface from "~/interfaces/userInterfaces/UserInterface";
import Fetch from "~/services/FetchService";
import {onMounted} from "#imports";
import {storeToRefs} from "pinia";
import {useAuthenticateStore} from "~/stores/authenticateStore";
import {useMenuStore} from "~/stores/menuStore";

const {isAuthenticated} = storeToRefs(useAuthenticateStore())
const {titleAppBar} = storeToRefs(useMenuStore())
titleAppBar.value = 'Accueil'

const messageHumourMylene: Ref<string> = ref('')
const user: Ref<UserInterface> = ref({} as UserInterface)


const majUser = (id: string | null) => {
  if (typeof id !== "undefined" && id !== "" && id) {
    Fetch.requete({ url: `/users/${id}`, method: 'GET' }, (resultUser: UserInterface) => {
      user.value = resultUser
      switch ( Math.trunc(resultUser.wallet/10) ) {
         case 5:
             messageHumourMylene.value = "Pour information le SOUM se trouve au milieu du bâtiment, ne stocke pas les BNs on n'est pas dans une banque.";
             break;
         case 4:
             messageHumourMylene.value = "Purée tu es riche. Pense à payer ton coup pour fêter ça !";
             break;
         case 3:
             messageHumourMylene.value = "Tu consommes c'est bien, continue sur ta lancée.";
             break;
         case 2:
             messageHumourMylene.value = "Tu tiens le ryhtme, tu fais vivre le SOUM je te félicite.";
             break;
         case 1:
             messageHumourMylene.value = "Mangez bougez ... vu ton wallet c'est plus \"buvez mangez\" !";
             break;
         case 0:
             messageHumourMylene.value = "Il faut penser à ramener des sous ou taxer les autres pour consommer. Super PROMO pour une carte achetée = une carte achetée.";
             break;
         default: 
             messageHumourMylene.value = "Il y a urgence, je peux être volontaire désigné pour t'aider à utiliser tes BNs. Signé: little gecko"; 
             break;
      }
    });
  }
}

onMounted(() => {
    majUser(localStorage.getItem('idCompte'))
})


</script>
<style scoped>
.root {
  display: flex;
  height: 100vh;
}

.appBar{
  width: 100%;
}

.texteHumourMylene {
  display: inline-block;
  background-image: linear-gradient(180deg, gold 20%, black 80%);
  font-family: 'Roboto',serif;
  transition: background-color 1s;
  padding-right: 5px;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

</style>